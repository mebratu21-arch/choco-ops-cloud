import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AIChatMessage,
  AIChatRequest,
  AIChatResponse,
  ApiResponse,
  UserRole
} from '../types';

// ============ AI SERVICE ============

export const aiService = {
  /**
   * Send message to  AI chat
   * POST /api/ai/chat
   */
  async sendMessage(request: AIChatRequest): Promise<AIChatResponse> {
    const { data } = await apiClient.post<ApiResponse<AIChatResponse>>('/ai/chat', request);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to get AI response');
  },

  /**
   * Get chat history (if backend supports it)
   * GET /api/ai/history
   */
  async getChatHistory(): Promise<AIChatMessage[]> {
    try {
      const { data } = await apiClient.get<ApiResponse<AIChatMessage[]>>('/ai/history');
      
      if (data.success && data.data) {
        return data.data;
      }
      
      return [];
    } catch (error) {
      // If endpoint doesn't exist, return empty array
      return [];
    }
  },

  /**
   * Translate text using Gemini AI with artisan chocolatier context
   * POST /api/ai/translate
   */
  async translate(
    text: string,
    targetLanguage: string,
    context?: {
      domain?: 'recipe' | 'instruction' | 'general';
    }
  ): Promise<string> {
    const { data } = await apiClient.post<ApiResponse<{ translation: string }>>(
      '/ai/translate',
      { text, targetLanguage, context }
    );
    
    if (data.success && data.data) {
      return data.data.translation;
    }
    
    throw new Error(data.error || 'Translation failed');
  },

  /**
   * Detect language of text using Gemini AI
   * POST /api/ai/detect-language
   */
  async detectLanguage(text: string): Promise<string> {
    const { data } = await apiClient.post<ApiResponse<{ languageCode: string }>>(
      '/ai/detect-language',
      { text }
    );
    
    if (data.success && data.data) {
      return data.data.languageCode;
    }
    
    throw new Error(data.error || 'Language detection failed');
  },

  /**
   * Batch translate multiple texts
   * POST /api/ai/translate/batch
   */
  async translateBatch(
    texts: string[],
    targetLanguage: string,
    context?: { domain?: 'recipe' | 'instruction' | 'general' }
  ): Promise<{ translations: string[]; stats: any }> {
    const { data } = await apiClient.post<ApiResponse<{ translations: string[]; stats: any }>>(
      '/ai/translate/batch',
      { texts, targetLanguage, context }
    );
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Batch translation failed');
  },
};

// ============ REACT QUERY HOOKS ============

/**
 * Hook to send AI chat messages
 * Usage: 
 * ```ts
 * const { mutate, isPending } = useSendAIMessage();
 * mutate({ message: "Where is cocoa powder?", context: { user_role: "WAREHOUSE" } });
 * ```
 */
export const useSendAIMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: AIChatRequest) => aiService.sendMessage(request),
    onSuccess: () => {
      // Invalidate chat history if it exists
      queryClient.invalidateQueries({ queryKey: ['ai', 'chat-history'] });
    },
  });
};

/**
 * Hook to get chat history
 * Usage:
 * ```ts
 * const { data: history } = useAIChatHistory();
 * ```
 */
export const useAIChatHistory = () => {
  return useQuery({
    queryKey: ['ai', 'chat-history'],
    queryFn: () => aiService.getChatHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to translate text using Gemini AI
 * Usage:
 * ```ts
 * const { mutate: translate, isPending } = useTranslate();
 * translate({ 
 *   text: "Temper the chocolate at 31°C", 
 *   targetLanguage: "ar",
 *   context: { domain: 'recipe' }
 * });
 * ```
 */
export const useTranslate = () => {
  return useMutation({
    mutationFn: (params: {
      text: string;
      targetLanguage: string;
      context?: { domain?: 'recipe' | 'instruction' | 'general' };
    }) => aiService.translate(params.text, params.targetLanguage, params.context),
  });
};

/**
 * Hook to detect language of text
 * Usage:
 * ```ts
 * const { mutate: detectLang, isPending } = useDetectLanguage();
 * detectLang("مرحبا بك"); // Returns 'ar'
 * ```
 */
export const useDetectLanguage = () => {
  return useMutation({
    mutationFn: (text: string) => aiService.detectLanguage(text),
  });
};

/**
 * Hook to batch translate multiple texts
 * Usage:
 * ```ts
 * const { mutate: batchTranslate, isPending } = useBatchTranslate();
 * batchTranslate({ 
 *   texts: ["Hello", "World"], 
 *   targetLanguage: "ar" 
 * });
 * ```
 */
export const useBatchTranslate = () => {
  return useMutation({
    mutationFn: (params: {
      texts: string[];
      targetLanguage: string;
      context?: { domain?: 'recipe' | 'instruction' | 'general' };
    }) => aiService.translateBatch(params.texts, params.targetLanguage, params.context),
  });
};

// ============ AI PROMPT HELPERS ============

/**
 * Generate context-aware AI prompts based on user role
 */
export const AI_PROMPTS = {
  WAREHOUSE: [
    "Where is {ingredient}?",
    "How much {ingredient} remains?",
    "What is expired or expiring soon?",
    "Show me low stock items",
  ],
  PRODUCTION: [
    "How much do I need for {recipe}?",
    "Explain step {number} of {recipe}",
    "What can I produce with {quantity} {ingredient}?",
    "Show batch status for {batch_number}",
  ],
  QC: [
    "What defects should I check for?",
    "What is the acceptable range for {parameter}?",
    "Show recent QC failures",
    "Explain quality standards for chocolate",
  ],
  MECHANIC: [
    "Machine is making noise — what do I do?",
    "How do I maintain {machine}?",
    "Show troubleshooting steps for {machine}",
    "What are common issues with {machine}?",
  ],
  MANAGER: [
    "Summarize today's operations",
    "Show critical alerts",
    "What batches need attention?",
    "Production vs target today",
  ],
  ADMIN: [
    "Show system health",
    "User activity summary",
    "Recent security events",
  ],
  CONTROLLER: [
    "Financial summary",
    "Cost analysis for {batch}",
    "Inventory value",
  ],
} as Record<UserRole, string[]>;

/**
 * Get suggested prompts based on current context
 */
export const getSuggestedPrompts = (
  role: UserRole,
  context?: {
    currentPage?: string;
    selectedItem?: string;
  }
): string[] => {
  const basePrompts = AI_PROMPTS[role] || [];
  
  // Add context-specific prompts
  if (context?.currentPage === 'inventory' && role === 'WAREHOUSE') {
    return [
      ...basePrompts,
      "Update stock for selected item",
      "Move item to different location",
    ];
  }
  
  if (context?.currentPage === 'production' && role === 'PRODUCTION') {
    return [
      ...basePrompts,
      "Calculate ingredient requirements",
      "Check if enough stock for batch",
    ];
  }
  
  return basePrompts;
};

// ============ INVENTORY ADVISOR PROMPTS (Multilingual) ============

/**
 * Inventory-specific prompts in multiple languages
 */
export const INVENTORY_ADVISOR_PROMPTS = {
  en: [
    "Where is {ingredient} located?",
    "How much {ingredient} do we have?",
    "What items are expiring this week?",
    "Show me all low stock items",
    "When was {ingredient} last restocked?",
    "What's the shelf life of {ingredient}?",
  ],
  ar: [
    "أين يقع {ingredient}؟",
    "كم لدينا من {ingredient}؟",
    "ما هي العناصر التي ستنتهي صلاحيتها هذا الأسبوع؟",
    "أظهر لي جميع العناصر منخفضة المخزون",
    "متى تم إعادة تخزين {ingredient} آخر مرة؟",
    "ما هي مدة صلاحية {ingredient}؟",
  ],
  he: [
    "איפה נמצא {ingredient}?",
    "כמה {ingredient} יש לנו?",
    "אילו פריטים יפוגו השבוע?",
    "הראה לי את כל הפריטים במלאי נמוך",
    "מתי {ingredient} חודש לאחרונה?",
    "מה תוקף {ingredient}?",
  ],
  am: [
    "{ingredient} የት ይገኛል?",
    "ስንት {ingredient} አለን?",
    "በዚህ ሳምንት የሚያልቁ ዕቃዎች ምንድናቸው?",
    "ዝቅተኛ ክምችት ያላቸውን ሁሉንም ዕቃዎች አሳየኝ",
    "{ingredient} መጨረሻ መቼ እንደገና ተሞልቷል?",
    "የ{ingredient} የመቆያ ጊዜ ምን ያህል ነው?",
  ],
  ru: [
    "Где находится {ingredient}?",
    "Сколько у нас {ingredient}?",
    "Какие товары истекают на этой неделе?",
    "Покажите мне все товары с низким запасом",
    "Когда {ingredient} последний раз пополнялся?",
    "Каков срок годности {ingredient}?",
  ],
  uk: [
    "Де знаходиться {ingredient}?",
    "Скільки у нас {ingredient}?",
    "Які товари закінчуються цього тижня?",
    "Покажіть мені всі товари з низьким запасом",
    "Коли {ingredient} востаннє поповнювався?",
    "Який термін придатності {ingredient}?",
  ],
  fr: [
    "Où se trouve {ingredient}?",
    "Combien de {ingredient} avons-nous?",
    "Quels articles expirent cette semaine?",
    "Montrez-moi tous les articles en rupture de stock",
    "Quand {ingredient} a-t-il été réapprovisionné pour la dernière fois?",
    "Quelle est la durée de conservation de {ingredient}?",
  ],
} as Record<'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr', string[]>;

/**
 * Get inventory-specific prompts based on language and context
 */
export const getInventoryPrompts = (
  language: 'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr',
  context?: {
    selectedItem?: string;
    lowStockCount?: number;
    expiringCount?: number;
  }
): string[] => {
  const basePrompts = INVENTORY_ADVISOR_PROMPTS[language] || INVENTORY_ADVISOR_PROMPTS.en;
  
  // Add context-specific prompts
  const contextPrompts: string[] = [];
  
  if (context?.lowStockCount && context.lowStockCount > 0) {
    const lowStockPrompt = basePrompts.find(p => p.includes('low stock') || p.includes('منخفضة المخزون') || p.includes('מלאי נמוך'));
    if (lowStockPrompt) contextPrompts.push(lowStockPrompt);
  }
  
  if (context?.expiringCount && context.expiringCount > 0) {
    const expiringPrompt = basePrompts.find(p => p.includes('expiring') || p.includes('ستنتهي') || p.includes('יפוגו'));
    if (expiringPrompt) contextPrompts.push(expiringPrompt);
  }
  
  if (context?.selectedItem) {
    const locationPrompt = basePrompts[0].replace('{ingredient}', context.selectedItem);
    const quantityPrompt = basePrompts[1].replace('{ingredient}', context.selectedItem);
    contextPrompts.push(locationPrompt, quantityPrompt);
  }
  
  // Return context prompts first, then fill with base prompts
  const uniquePrompts = [...new Set([...contextPrompts, ...basePrompts])];
  return uniquePrompts.slice(0, 6);
};

/**
 * Multilingual support - translate common phrases
 * Note: This is a basic implementation. For production, integrate with Google Translate API
 */
export const MULTILINGUAL_PHRASES = {
  en: {
    greeting: "Hello! How can I help you today?",
    thinking: "Let me check that for you...",
    error: "I'm sorry, I couldn't process that request.",
  },
  ar: {
    greeting: "مرحبا! كيف يمكنني مساعدتك اليوم؟",
    thinking: "دعني أتحقق من ذلك من أجلك...",
    error: "أنا آسف، لم أتمكن من معالجة هذا الطلب.",
  },
  he: {
    greeting: "שלום! איך אני יכול לעזור לך היום?",
    thinking: "תן לי לבדוק את זה בשבילך...",
    error: "אני מצטער, לא הצלחתי לעבד את הבקשה.",
  },
  am: {
    greeting: "ሰላም! ዛሬ እንዴት ልርዳዎት እችላለሁ?",
    thinking: "ይህንን ለእርስዎ አረጋግጣለው...",
    error: "ይቅርታ፣ ይህን ጥያቄ ማስኬድ አልቻልኩም።",
  },
  ru: {
    greeting: "Здравствуйте! Как я могу вам помочь сегодня?",
    thinking: "Позвольте мне проверить это для вас...",
    error: "Извините, я не смог обработать этот запрос.",
  },
  uk: {
    greeting: "Привіт! Як я можу вам допомогти сьогодні?",
    thinking: "Дозвольте мені перевірити це для вас...",
    error: "Вибачте, я не зміг обробити цей запит.",
  },
  fr: {
    greeting: "Bonjour! Comment puis-je vous aider aujourd'hui?",
    thinking: "Laissez-moi vérifier cela pour vous...",
    error: "Désolé, je n'ai pas pu traiter cette demande.",
  },
};

/**
 * Detect language from message (basic implementation)
 * For production, integrate with language detection library
 */
export const detectLanguage = (message: string): 'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr' => {
  // Arabic characters
  if (/[\u0600-\u06FF]/.test(message)) return 'ar';
  // Hebrew characters
  if (/[\u0590-\u05FF]/.test(message)) return 'he';
  // Amharic characters
  if (/[\u1200-\u137F]/.test(message)) return 'am';
  // Cyrillic characters
  if (/[\u0400-\u04FF]/.test(message)) return 'ru'; // Could be Russian or Ukrainian
  // French special characters
  if (/[àâäéèêëïîôùûüÿ]/i.test(message)) return 'fr';
  
  // Default to English
  return 'en';
};
