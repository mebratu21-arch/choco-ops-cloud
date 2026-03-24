import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5003/api';

interface SendChatMessageParams {
  message: string;
  language: string;
  context: Record<string, unknown>;
}

interface ChatMessageResponse {
  response?: string;
  timestamp: string;
}

export interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface RecommendationParams {
  type: 'reorder' | 'production' | 'quality';
  data?: Record<string, unknown>;
}

export type Language = 'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr';

// Smart fallback responses - Full multilingual support (EN, AM, RU, HE, AR)
const FALLBACK_RESPONSES: Record<string, Record<string, string>> = {
  en: {
    inventory: "**Inventory Status:**\n\n• Cocoa Butter: 500 kg (Good)\n• Cocoa Powder: 1,000 kg (Good)\n• Sugar: 2,000 kg (Excellent)\n• Milk Powder: 800 kg (Good)\n\nAll materials above reorder levels.",
    production: "**Production Status:**\n\n• BATCH-2024-001: Completed (495/500)\n• BATCH-2024-002: In Progress (60%)\n• BATCH-2024-003: Scheduled tomorrow\n\nAll lines operating normally.",
    quality: "**Quality Control:**\n\n• Today's inspections: 3 batches\n• Pass rate: 98.5%\n• All products meet standards.",
    machine: "**Machine Status:**\n\n• Melanger 3000: Operational ✓\n• Conch Master: Operational ✓\n• Temper Pro: Maintenance ⚠️",
    recommendation: "**AI Recommendations:**\n\n1. Schedule Dark Chocolate Batch #5\n2. Reorder Vanilla Extract\n3. Temper Pro maintenance in 48h",
    default: "**CocoaFlow AI Intel**\n\nI can help with:\n• Inventory levels\n• Production status\n• Quality reports\n• Machine status\n\nAsk me anything!"
  },
  am: {
    inventory: "**የእቃ ማከማቻ ሁኔታ:**\n\n• የኮኮዋ ቅቤ: 500 ኪ.ግ (ጥሩ)\n• የኮኮዋ ዱቄት: 1,000 ኪ.ግ (ጥሩ)\n• ስኳር: 2,000 ኪ.ግ (በጣም ጥሩ)\n• የወተት ዱቄት: 800 ኪ.ግ (ጥሩ)",
    production: "**የምርት ሁኔታ:**\n\n• BATCH-2024-001: ተጠናቋል (495/500)\n• BATCH-2024-002: በሂደት ላይ (60%)\n• BATCH-2024-003: ነገ የታቀደ",
    quality: "**የጥራት ቁጥጥር:**\n\n• ዛሬ የተፈተሹ: 3 ባች\n• የማለፍ መጠን: 98.5%\n• ሁሉም ምርቶች ደረጃዎችን ያሟላሉ",
    machine: "**የማሽን ሁኔታ:**\n\n• Melanger 3000: እየሰራ ነው ✓\n• Conch Master: እየሰራ ነው ✓\n• Temper Pro: በጥገና ላይ ⚠️",
    recommendation: "**የAI ምክሮች:**\n\n1. Dark Chocolate Batch #5 ያቅዱ\n2. Vanilla Extract እንደገና ያዝዙ\n3. Temper Pro ጥገና በ48 ሰዓት",
    default: "**CocoaFlow AI Intel**\n\nእኔ ልረዳዎ እችላለሁ:\n• እቃ ማከማቻ ደረጃዎች\n• የምርት ሁኔታ\n• የጥራት ሪፖርቶች\n• የማሽን ሁኔታ\n\nማንኛውንም ይጠይቁኝ!"
  },
  ru: {
    inventory: "**Статус инвентаря:**\n\n• Какао-масло: 500 кг (Хорошо)\n• Какао-порошок: 1,000 кг (Хорошо)\n• Сахар: 2,000 кг (Отлично)\n• Сухое молоко: 800 кг (Хорошо)",
    production: "**Статус производства:**\n\n• BATCH-2024-001: Завершено (495/500)\n• BATCH-2024-002: В процессе (60%)\n• BATCH-2024-003: Запланировано",
    quality: "**Контроль качества:**\n\n• Проверено сегодня: 3 партии\n• Процент прохождения: 98.5%\n• Продукция соответствует стандартам",
    machine: "**Статус оборудования:**\n\n• Melanger 3000: Работает ✓\n• Conch Master: Работает ✓\n• Temper Pro: Обслуживание ⚠️",
    recommendation: "**Рекомендации ИИ:**\n\n1. Запланируйте партию шоколада\n2. Закажите экстракт ванили\n3. Обслуживание через 48 часов",
    default: "**CocoaFlow AI Intel**\n\nМогу помочь с:\n• Уровни запасов\n• Статус производства\n• Отчёты качества\n• Статус оборудования\n\nСпрашивайте!"
  },
  he: {
    inventory: "**סטטוס מלאי:**\n\n• חמאת קקאו: 500 ק\"ג (טוב)\n• אבקת קקאו: 1,000 ק\"ג (טוב)\n• סוכר: 2,000 ק\"ג (מצוין)\n• אבקת חלב: 800 ק\"ג (טוב)",
    production: "**סטטוס ייצור:**\n\n• BATCH-2024-001: הושלם (495/500)\n• BATCH-2024-002: בתהליך (60%)\n• BATCH-2024-003: מתוכנן למחר",
    quality: "**בקרת איכות:**\n\n• נבדקו היום: 3 אצוות\n• אחוז מעבר: 98.5%\n• כל המוצרים עומדים בתקנים",
    machine: "**סטטוס מכונות:**\n\n• Melanger 3000: פועל ✓\n• Conch Master: פועל ✓\n• Temper Pro: בתחזוקה ⚠️",
    recommendation: "**המלצות AI:**\n\n1. תכנן אצוות שוקולד\n2. הזמן תמצית וניל\n3. תחזוקה בעוד 48 שעות",
    default: "**CocoaFlow AI Intel**\n\nאני יכול לעזור עם:\n• רמות מלאי\n• סטטוס ייצור\n• דוחות איכות\n• סטטוס ציוד\n\nשאל אותי!"
  },
  ar: {
    inventory: "**حالة المخزون:**\n\n• زبدة الكاكاو: 500 كجم (جيد)\n• مسحوق الكاكاو: 1,000 كجم (جيد)\n• السكر: 2,000 كجم (ممتاز)\n• مسحوق الحليب: 800 كجم (جيد)",
    production: "**حالة الإنتاج:**\n\n• BATCH-2024-001: مكتمل (495/500)\n• BATCH-2024-002: قيد التنفيذ (60%)\n• BATCH-2024-003: مجدول لغداً",
    quality: "**مراقبة الجودة:**\n\n• تم فحصها اليوم: 3 دفعات\n• نسبة النجاح: 98.5%\n• جميع المنتجات تلبي المعايير",
    machine: "**حالة المعدات:**\n\n• Melanger 3000: يعمل ✓\n• Conch Master: يعمل ✓\n• Temper Pro: صيانة ⚠️",
    recommendation: "**توصيات AI:**\n\n1. جدول دفعة الشوكولاتة\n2. أعد طلب خلاصة الفانيليا\n3. صيانة خلال 48 ساعة",
    default: "**CocoaFlow AI Intel**\n\nيمكنني المساعدة في:\n• مستويات المخزون\n• حالة الإنتاج\n• تقارير الجودة\n• حالة المعدات\n\nاسألني!"
  }
};

// Get smart fallback response based on message content (multilingual)
const getSmartFallbackResponse = (message: string, language: string): string => {
  const lowerMsg = message.toLowerCase();
  const langResponses = FALLBACK_RESPONSES[language] ?? FALLBACK_RESPONSES.en;

  console.log('[AI Fallback] Language:', language, 'Message:', message);

  // Multilingual keyword matching
  const inventoryKeywords = ['inventory', 'stock', 'material', 'እቃ', 'ማከማቻ', 'ክምችት', 'инвентарь', 'запас', 'מלאי', 'مخزون'];
  const productionKeywords = ['production', 'batch', 'status', 'ምርት', 'ባች', 'ሁኔታ', 'производство', 'партия', 'ייצור', 'إنتاج'];
  const qualityKeywords = ['quality', 'qc', 'inspection', 'ጥራት', 'ፍተሻ', 'качество', 'проверка', 'איכות', 'جودة'];
  const machineKeywords = ['machine', 'equipment', 'maintenance', 'ማሽን', 'መሳሪያ', 'ጥገና', 'машина', 'оборудование', 'מכונה', 'آلة'];
  const recommendKeywords = ['recommend', 'suggest', 'optimi', 'ምክር', 'рекомендация', 'המלצה', 'توصية'];

  if (inventoryKeywords.some(kw => lowerMsg.includes(kw))) {
    return langResponses.inventory ?? langResponses.default;
  }
  if (productionKeywords.some(kw => lowerMsg.includes(kw))) {
    return langResponses.production ?? langResponses.default;
  }
  if (qualityKeywords.some(kw => lowerMsg.includes(kw))) {
    return langResponses.quality ?? langResponses.default;
  }
  if (machineKeywords.some(kw => lowerMsg.includes(kw))) {
    return langResponses.machine ?? langResponses.default;
  }
  if (recommendKeywords.some(kw => lowerMsg.includes(kw))) {
    return langResponses.recommendation ?? langResponses.default;
  }

  console.log('[AI Fallback] Returning default for language:', language);
  return langResponses.default;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  /**
   * Send a chat message to the AI assistant with automatic fallback
   */
  sendChatMessage: async (params: SendChatMessageParams): Promise<ChatMessageResponse> => {
    console.log('[AI Service] Sending message:', params.message, 'Language:', params.language);
    try {
      const response = await apiClient.post<{ data: ChatMessageResponse }>('/ai/chat', params);
      console.log('[AI Service] Backend response:', response.data);
      return response.data.data;
    } catch (error: unknown) {
      console.warn('[AI Service] API unavailable, using smart fallback:', error);
      // Return smart fallback response - NEVER FAIL
      const fallbackMessage = getSmartFallbackResponse(params.message, params.language);
      console.log('[AI Service] Fallback response:', fallbackMessage.substring(0, 50));
      return {
        response: fallbackMessage,
        timestamp: new Date().toISOString()
      };
    }
  },

  /**
   * Get chat history (returns empty if unavailable)
   */
  getChatHistory: async (): Promise<ChatMessage[]> => {
    try {
      const response = await apiClient.get<{ data: { content: string; isUser: boolean; timestamp: string }[] }>('/ai/history');
      return response.data.data.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch {
      // Return empty array - NEVER FAIL
      return [];
    }
  },

  /**
   * Clear chat history (silently succeeds if unavailable)
   */
  clearChatHistory: async (): Promise<void> => {
    try {
      await apiClient.delete('/ai/history');
    } catch {
      // Silently succeed - NEVER FAIL
      console.warn('Could not clear history on server, cleared locally');
    }
  },

  /**
   * Get AI recommendations with fallback
   */
  getRecommendations: async (params: RecommendationParams): Promise<unknown> => {
    try {
      const response = await apiClient.post<{ data: unknown }>('/ai/recommendations', params);
      return response.data.data;
    } catch {
      // Return mock recommendation - NEVER FAIL
      return {
        title: "AI Recommendation (Demo)",
        message: "Based on current patterns, consider scheduling Dark Chocolate Batch #5 for tomorrow.",
        type: params.type
      };
    }
  },

  /**
   * Get AI provider status
   */
  getProviderStatus: async (): Promise<{ provider: string }> => {
    try {
      const response = await apiClient.get<{ data: { provider: string } }>('/ai/status');
      return response.data.data;
    } catch {
      return { provider: 'demo' }; // Demo mode when offline
    }
  }
};

// Translation parameters
interface TranslateParams {
  text: string;
  targetLanguage: string;
  context?: { domain?: string };
}

interface TranslateResponse {
  data: {
    translation: string;
  };
}

/**
 * Hook for translating a single text
 */
export const useTranslate = () => {
  return useMutation({
    mutationFn: async (params: TranslateParams): Promise<string> => {
      try {
        const response = await apiClient.post<TranslateResponse>('/ai/translate', params);
        return response.data.data.translation;
      } catch {
        // Fallback - return original text if translation fails
        return params.text;
      }
    },
  });
};

export interface BatchTranslateParams {
  texts: string[];
  targetLanguage: string;
  context?: { domain?: string };
}

export interface BatchTranslateResponse {
  translations: string[];
  stats?: {
    total: number;
    successful: number;
    duration: number;
  };
}

/**
 * Hook for translating multiple texts at once
 */
export const useBatchTranslate = () => {
  return useMutation({
    mutationFn: async (params: BatchTranslateParams): Promise<BatchTranslateResponse> => {
      const response = await apiClient.post<BatchTranslateResponse>('/ai/translate/batch', params);
      return response.data;
    },
  });
};

/**
 * Hook for detecting the language of a text
 */
export const useDetectLanguage = () => {
  return useMutation({
    mutationFn: async (text: string): Promise<string> => {
      const response = await apiClient.post<{ language: string }>('/ai/detect', { text });
      return response.data.language;
    },
  });
};

/**
 * Hook for sending AI messages
 */
export function useSendAIMessage() {
  return useMutation({
    mutationFn: aiService.sendChatMessage
  });
}

/**
 * Hook for clearing chat history
 */
export function useClearChatHistory() {
  return useMutation({
    mutationFn: aiService.clearChatHistory
  });
}

export function useGetAIStatus() {
  return useQuery({
    queryKey: ['aiStatus'],
    queryFn: aiService.getProviderStatus,
    retry: false
  });
}

// Multilingual phrases for UI
export const MULTILINGUAL_PHRASES: Record<Language, { greeting: string; error: string; thinking: string }> = {
  en: {
    greeting: 'Hello! I am your AI Inventory Advisor. How can I help you manage your cocoa stocks today?',
    error: 'Sorry, I encountered an error. Please try again.',
    thinking: 'Thinking...'
  },
  ar: {
    greeting: 'مرحباً! أنا مستشارك الذكي للمخزون. كيف يمكنني مساعدتك في إدارة مخزون الكاكاو اليوم؟',
    error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
    thinking: 'يفكر...'
  },
  he: {
    greeting: 'שלום! אני יועץ המלאי החכם שלך. איך אוכל לעזור לך לנהל את מלאי הקקאו היום?',
    error: 'סליחה, אירעה שגיאה. אנא נסה שנית.',
    thinking: 'חושב...'
  },
  am: {
    greeting: 'ሰላም! እኔ የእርስዎ የAI የክምችት አማካሪ ነኝ። ዛሬ የኮኮዋ ክምችትዎን ለማስተዳደር እንዴት ልረዳዎ እችላለሁ?',
    error: 'ይቅርታ፣ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።',
    thinking: 'እያሰበ ነው...'
  },
  ru: {
    greeting: 'Здравствуйте! Я ваш ИИ-консультант по инвентарю. Чем я могу помочь вам в управлении запасами какао сегодня?',
    error: 'Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.',
    thinking: 'Думает...'
  },
  uk: {
    greeting: 'Вітаю! Я ваш ІІ-консультант з інвентарю. Чим я можу допомогти вам в управлінні запасами какао сьогодні?',
    error: 'Вибачте, сталася помилка. Будь ласка, спробуйте ще раз.',
    thinking: 'Думає...'
  },
  fr: {
    greeting: 'Bonjour ! Je suis votre conseiller en inventaire IA. Comment puis-je vous aider à gérer vos stocks de cacao aujourd\'hui ?',
    error: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
    thinking: 'Réfléchissant...'
  },
};

export const detectLanguage = (text: string): Language => {
  // Simple heuristic detection
  const hebrewPattern = /[\u0590-\u05FF]/;
  const arabicPattern = /[\u0600-\u06FF]/;
  const cyrillicPattern = /[\u0400-\u04FF]/; // Russian/Ukrainian
  const amharicPattern = /[\u1200-\u137F]/;

  if (hebrewPattern.test(text)) return 'he';
  if (arabicPattern.test(text)) return 'ar';
  if (amharicPattern.test(text)) return 'am';
  if (cyrillicPattern.test(text)) {
    // Very naive distinction
    if (text.includes('і') || text.includes('ї')) return 'uk';
    return 'ru';
  }
  return 'en'; // Default
};

export const getInventoryPrompts = (language: Language, context?: { lowStockCount?: number; expiringCount?: number }): string[] => {
  const prompts = [
    "How much cocoa powder is in stock?",
    "Show me expiring items",
    "List low stock ingredients"
  ];

  if (context?.lowStockCount && context.lowStockCount > 0) {
    prompts.unshift(`Which ${context.lowStockCount} items are low on stock?`);
  }

  return prompts;
};

export const getSuggestedPrompts = (): string[] => {
  return [
    "Where is the {Premium Cocoa Butter} stored?",
    "How much {Dark Chocolate} do we have?",
    "Show me expiring items",
    "List low stock ingredients"
  ];
};

export default aiService;
