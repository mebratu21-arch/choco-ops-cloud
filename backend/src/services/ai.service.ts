import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { redis } from '../config/redis.js';
import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { getIO } from './realtime.service.js';
import { createBreaker } from '../utils/circuit-breaker.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────

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
      model: 'gemini-1.5-flash',
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

    const result = await model.generateContent(parts);
    const response = await result.response.text();

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
}
