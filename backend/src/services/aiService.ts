import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from '../types/ai.types.js';

const API_KEY = process.env.GEMINI_API_KEY;

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    } else {
      console.warn('Gemini API Key not found. AI Service operating in MOCK mode.');
    }
  }

  async generateChatResponse(message: string, history: ChatMessage[] = [], systemContext: string = ''): Promise<string> {
    if (!this.model) {
      return this.mockResponse(message);
    }

    try {
      // transform history to gemini format if needed, but simple prompt is often easier for stateless
      // For now, let's construct a prompt with history
      let prompt = "";
      if (systemContext) prompt += `System: ${systemContext}\n`;
      
      history.forEach(msg => {
        prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
      prompt += `User: ${message}\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.model) {
      return `[MOCK TRANSLATION to ${targetLanguage}]: ${text}`;
    }

    try {
      const prompt = `Translate the following text to ${targetLanguage}:\n\n"${text}"`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('AI Translation Error:', error);
      return text; // Fallback to original
    }
  }

  private mockResponse(message: string): string {
    return `[MOCK AI]: I received your message: "${message}". Configure GEMINI_API_KEY to get real intelligence!`;
  }
}

export const aiService = new AIService();
