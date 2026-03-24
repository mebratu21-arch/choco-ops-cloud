export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
  context?: string; // Additional context like "Inventory items: ..."
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string; // 'es', 'fr', 'de', etc.
}

export interface AIResponse {
  response: string;
}
