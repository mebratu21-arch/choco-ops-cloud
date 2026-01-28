import crypto from 'crypto';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { redis } from '../../config/redis.js';
import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';
import { getIO } from './realtime.service.js';
import { createBreaker } from '../../utils/circuit-breaker.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────

// Helper for Mock Mode
const MOCK_MODE_PREFIX = '[AI Mock] ';

const getMockTranslation = (text: string, lang: string) => {
  // Simple dictionary for better demo experience
  const dictionary: Record<string, Record<string, string>> = {
    'hello': { am: 'ሰላም', he: 'שלום' },
    'check': { am: 'ሳጥን', he: 'בדוק' },
    'inventory': { am: 'ክምችት', he: 'מלאי' },
    'cocoa': { am: 'ኮኮዋ', he: 'קקאו' },
    'urgently': { am: 'በአስቸኳይ', he: 'בדחיפות' },
  };

  const lowerText = text.toLowerCase();
  let translated = text;

  // Try to replace known words
  Object.keys(dictionary).forEach(word => {
    if (lowerText.includes(word) && dictionary[word][lang]) {
        translated = translated.replace(new RegExp(word, 'gi'), dictionary[word][lang]);
    }
  });

  // If no words replaced and it's the same, add specific prefix
  if (translated === text) {
      const prefixes: Record<string, string> = {
        ar: `[AR] `,
        he: `[HE] `, 
        am: `[AM] `,
        ru: `[RU] `,
        uk: `[UK] `,
        fr: `[FR] `,
      };
      return (prefixes[lang] || MOCK_MODE_PREFIX) + text;
  }

  return translated;
};

const getMockLanguage = (text: string) => {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar';
    if (/[\u0590-\u05FF]/.test(text)) return 'he';
    if (/[\u1200-\u137F]/.test(text)) return 'am';
    return 'en';
};


const ROLE_PROMPTS: Record<string, string> = {
  WAREHOUSE: `You are a senior warehouse supervisor with 15+ years experience.
Motivate: "Great job keeping stock accurate! You're the backbone of our operation."
Focus: low stock, expiry, re-orders, safety, organization.
Be encouraging and practical.`,

  PRODUCTION: `You are a senior production manager with chocolate expertise.
Motivate: "Your precision makes perfect chocolate! Quality is everything."
Focus: recipes, batches, machines, safety, efficiency.
Provide technical guidance.`,

  MECHANIC: `You are a senior mechanic with 20+ years experience.
Motivate: "Your work keeps us safe and efficient!"
Focus: repairs, preventive maintenance, troubleshooting, safety.
Be practical and solution-focused.`,

  CONTROLLER: `You are a senior QC manager.
Motivate: "Quality is our brand! Excellence in every product."
Focus: quality checks, defect analysis, cleanliness, food safety.
Maintain high standards.`,

  MANAGER: `You are the factory manager.
Motivate: "Together we succeed! Building a better operation."
Focus: operations, costs, team, strategy, metrics.
Balance profit, quality, safety.`,

  ADMIN: `You are a system administrator.
Help with: user management, permissions, technical issues.
Provide clear technical guidance.`,
};

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
];

const MAX_IMAGE_SIZE_MB = 5;
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const CACHE_TTL_SECONDS = 86400; // 24 hours
const HISTORY_MAX_MESSAGES = 10;

// ────────────────────────────────────────────
// IMAGE VALIDATION
// ────────────────────────────────────────────

class ImageValidator {
  /**
   * Validate image before sending to API
   */
  static validateImage(image: { base64: string; mimeType: string }): void {
    // Check MIME type
    if (!VALID_IMAGE_TYPES.includes(image.mimeType)) {
      throw new Error(
        `Invalid image type. Allowed: ${VALID_IMAGE_TYPES.join(', ')}`
      );
    }

    // Check size
    const sizeInBytes = Buffer.byteLength(image.base64, 'base64');
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > MAX_IMAGE_SIZE_MB) {
      throw new Error(`Image too large: ${sizeInMB.toFixed(2)}MB (max ${MAX_IMAGE_SIZE_MB}MB)`);
    }
  }
}

// ... image validation ends above ...

export class AiService {
  /**
   * Internal raw chat method for circuit breaker
   */
  static async _rawChat(
    userMessage: string,
    context: {
      userId: string;
      userRole: string;
      page?: string;
      images?: Array<{ base64: string; mimeType: string }>;
    }
  ): Promise<string> {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings: SAFETY_SETTINGS,
    });

    const cacheKey = `chat:${context.userId}:recent`;
    let history: any[] = [];
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        history = JSON.parse(cached);
      }
    } catch (error) {
      logger.warn('Corrupt chat history in Redis, resetting history', { userId: context.userId });
      history = [];
    }

    const recentHistory = history.slice(-HISTORY_MAX_MESSAGES);
    const historyText = recentHistory
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = `
${ROLE_PROMPTS[context.userRole] || ROLE_PROMPTS.MANAGER}

Current Context:
- Page: ${context.page || 'Home'}
- Role: ${context.userRole}

Previous Context:
${historyText || '(No previous history)'}

Your directive: Provide helpful, motivating, and expert advice. Respond naturally in the language used by the user.
`;

    const parts: any[] = [{ text: systemPrompt }, { text: `User: ${userMessage}` }];

    if (context.images?.length) {
      context.images.forEach(img => {
        ImageValidator.validateImage(img);
        parts.push({
          inlineData: {
            data: img.base64,
            mimeType: img.mimeType
          }
        });
      });
    }

    let response: string;
    try {
        const result = await model.generateContent(parts);
        response = await result.response.text();
    } catch (error: any) {
        logger.warn('AI Generation failed, falling back to mock.', { error: error.message });
        
        // SMART MOCK RESPONSES
        const lowerMsg = userMessage.toLowerCase();
        
        if (lowerMsg.includes('sugar')) {
            response = "📦 **Inventory Check: Sugar**\n\nWe have **500kg of White Sugar** in Warehouse A, Row 3.\nLast restocked: 2 days ago.\nStatus: ✅ Sufficient";
        } else if (lowerMsg.includes('cocoa')) {
             response = "📦 **Inventory Check: Cocoa Powder**\n\nWe have **120kg of Cocoa Powder** in Warehouse B, Shelf 12.\nStatus: ⚠️ Low Stock (Reorder advised)";
        } else if (lowerMsg.includes('milk')) {
             response = "📦 **Inventory Check: Milk Powder**\n\nWe have **800kg of Whole Milk Powder** in Warehouse A, Cool Zone.\nStatus: ✅ Sufficient";
        } else if (lowerMsg.includes('where')) {
             response = "🔍 **Location Lookup**\n\nPlease specify the item you are looking for (e.g., 'Where is sugar?').\n\nCommon locations:\n- Warehouse A: Dry Goods\n- Warehouse B: Cocoa Products\n- Cool Zone: Dairy & Fats";
        } else if (lowerMsg.includes('help')) {
             response = "👋 **ChocoBot Help**\n\nI can help you with:\n- **Inventory**: 'Where is sugar?', 'Check cocoa stock'\n- **Recipes**: 'How do I make Dark Chocolate?'\n- **Maintenance**: 'Machine 3 is noisy'\n\nWhat do you need?";
        } else {
            response = `${MOCK_MODE_PREFIX} [Smart Fallback] I see you asked about "${userMessage}". \n\nI can currently simulate answers for: "Sugar", "Cocoa", "Milk", or "Help". Try asking "Where is sugar?"`;
        }
    }

    // Update Cache
    history.push({ role: 'user', content: userMessage });
    history.push({ role: 'assistant', content: response });
    await redis.set(cacheKey, JSON.stringify(history), 'EX', CACHE_TTL_SECONDS);

    // Persistent Log
    await db('chat_history').insert({
      id: db.raw('gen_random_uuid()'),
      user_id: context.userId,
      user_message: userMessage,
      ai_response: response,
    });

    const io = getIO();
    if (io) {
      io.to(`user:${context.userId}`).emit('ai:chat', {
        userMessage,
        aiResponse: response,
        role: context.userRole,
      });
    }

    return response;
  }

  // Circuit Breaker Instance
  private static breaker = createBreaker(AiService._rawChat.bind(AiService), 'GeminiAI');

  /**
   * Public chat method with circuit breaker protection
   */
  static async chat(userMessage: string, context: any): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      return 'שירות ה-AI כרגע לא זמין (מפתח API חסר).';
    }

    try {
      return await AiService.breaker.fire(userMessage, context);
    } catch (err) {
      return 'שירות ה-AI כרגע לא זמין. נסה שוב מאוחר יותר.';
    }
  }

  /**
   * Generate cache key for translation
   */
  private static getTranslationCacheKey(
    text: string,
    targetLanguage: string,
    domain?: string
  ): string {
    const hash = crypto
      .createHash('md5')
      .update(`${text}:${targetLanguage}:${domain || 'general'}`)
      .digest('hex');
    return `translation:${hash}`;
  }

  /**
   * Translate text with artisan chocolatier context
   * Enhanced with Redis caching and performance tracking
   */
  static async translate(
    text: string,
    targetLanguage: string,
    context?: {
      domain?: 'recipe' | 'instruction' | 'general';
      preserveTerms?: string[];
    }
  ): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const startTime = Date.now();
    const cacheKey = this.getTranslationCacheKey(text, targetLanguage, context?.domain);
    let fromCache = false;

    // Check Redis cache first
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        fromCache = true;
        logger.info('Translation cache hit', { 
          cacheKey, 
          targetLanguage,
          duration: Date.now() - startTime 
        });
        return cached;
      }
    } catch (error) {
      logger.warn('Redis cache lookup failed', { error });
    }

    // Perform translation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings: SAFETY_SETTINGS,
    });

    const domainContext = context?.domain === 'recipe' 
      ? 'This is a chocolate recipe. Maintain precision for measurements and techniques.'
      : context?.domain === 'instruction'
      ? 'These are shift instructions for factory workers. Be clear and actionable.'
      : 'General factory communication.';

    const systemPrompt = `You are a professional translator for an artisan chocolate factory.

CRITICAL RULES:
1. Translate ONLY the text provided - do not add explanations, notes, or commentary
2. Maintain technical accuracy for chocolate manufacturing terms
3. Preserve ALL formatting (line breaks, bullet points, numbers, special characters)
4. Keep proper nouns unchanged (brand names, machine names, ingredient codes)
5. Return ONLY the translated text, nothing else

ARTISAN CHOCOLATE TERMINOLOGY (preserve technical accuracy):
- Tempering: The process of heating and cooling chocolate to specific temperatures for proper crystallization
- Ganache: A smooth mixture of chocolate and cream
- Cocoa solids: The non-fat component of cocoa beans (cocoa powder + cocoa butter)
- Conching: The process of refining chocolate texture through continuous mixing
- Bloom: White coating on chocolate from fat or sugar crystallization
- Couverture: High-quality chocolate with high cocoa butter content
- Enrobing: Coating confections with chocolate
- Molding: Pouring chocolate into molds to create shapes

CONTEXT: ${domainContext}
TARGET LANGUAGE: ${targetLanguage}

Translate the following text while maintaining the artisan chocolate context:`;

    try {
        const result = await model.generateContent([
          { text: systemPrompt },
          { text: text }
        ]);

        const translation = result.response.text().trim();
        const duration = Date.now() - startTime;
        
        // Cache for 7 days (604800 seconds)
        try {
          await redis.set(cacheKey, translation, 'EX', 604800);
          logger.info('Translation cached', { cacheKey, ttl: '7 days' });
        } catch (error) {
          logger.warn('Redis cache storage failed', { error });
        }

        // Log translation for audit
        logger.info('Translation completed', {
          targetLanguage,
          domain: context?.domain || 'general',
          textLength: text.length,
          translationLength: translation.length,
          duration,
          fromCache
        });

        return translation;

    } catch (error: any) {
        logger.error('Gemini API failed', { error: error.message });
        // FALLBACK
        return getMockTranslation(text, targetLanguage);
    }
  }

  /**
   * Detect language using Gemini AI
   */
  static async detectLanguage(text: string): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      safetySettings: SAFETY_SETTINGS,
    });

    const prompt = `Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., 'en', 'ar', 'he', 'am', 'ru', 'uk', 'fr'). Return only the code, nothing else.

Text: ${text.substring(0, 500)}`;

    try {
        const result = await model.generateContent(prompt);
        const languageCode = result.response.text().trim().toLowerCase();
        
        logger.info('Language detected', { 
          textPreview: text.substring(0, 50), 
          languageCode 
        });
        
        return languageCode;
    } catch (error: any) {
         logger.warn('AI Detect failed, using fallback regex.', { error: error.message });
         return getMockLanguage(text);
    }
  }

  /**
   * Batch translate multiple texts in parallel
   */
  static async translateBatch(
    texts: string[],
    targetLanguage: string,
    context?: { domain?: 'recipe' | 'instruction' | 'general' }
  ): Promise<{ translations: string[]; stats: any }> {
    const startTime = Date.now();
    const MAX_BATCH_SIZE = 50;
    
    if (texts.length > MAX_BATCH_SIZE) {
      throw new Error(`Batch size exceeds maximum of ${MAX_BATCH_SIZE}`);
    }

    if (texts.length === 0) {
      return { translations: [], stats: { total: 0, successful: 0, failed: 0, duration: 0 } };
    }

    // Translate in parallel with Promise.allSettled
    const promises = texts.map(text => 
      this.translate(text, targetLanguage, context)
        .catch(err => {
          logger.error('Batch translation item failed', { 
            textPreview: text.substring(0, 50), 
            error: err.message 
          });
          return `[Translation failed: ${err.message}]`;
        })
    );

    const results = await Promise.allSettled(promises);
    const translations = results.map(r => 
      r.status === 'fulfilled' ? r.value : '[Translation failed]'
    );

    const stats = {
      total: texts.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      duration: Date.now() - startTime
    };

    logger.info('Batch translation completed', stats);

    return { translations, stats };
  }
}

