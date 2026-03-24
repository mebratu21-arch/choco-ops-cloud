import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, language = 'en', history = [], context = {} } = req.body;

    if (!message) {
      return errorResponse(res, 'Message is required', 400);
    }

    const response = await aiService.generateChatResponse(message, language, history, context);
    return successResponse(res, { message: response, response, language });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const translate = async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      console.warn('aiController: translate - Missing text or targetLanguage', { text, targetLanguage });
      return errorResponse(res, 'Text and targetLanguage are required', 400);
    }

    console.log('aiController: translate - Request received', { text, targetLanguage });
    const translation = await aiService.translateText(text, targetLanguage);
    console.log('aiController: translate - Success', { translation });
    return successResponse(res, { translation });
  } catch (error: any) {
    return errorResponse(res, error.message);
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
    // Mock history for demo or retrieve from DB if implemented
    const history = [
        { content: "How do I reset the tempering machine?", isUser: true, timestamp: new Date() },
        { content: "To reset the tempering machine, press the red button for 3 seconds.", isUser: false, timestamp: new Date() }
    ];
    return successResponse(res, history);
};

export const getRecommendations = async (req: Request, res: Response) => {
    // Mock recommendations
    const reco = {
        title: "Optimization Suggestion",
        message: "Based on current stock, you should schedule 'Dark Chocolate Batch #5' production tomorrow."
    };
    return successResponse(res, reco);
};

export const getStatus = async (req: Request, res: Response) => {
    const provider = aiService.getProvider();
    return successResponse(res, { provider });
};

export const clearChatHistory = async (req: Request, res: Response) => {
    // In production, clear from database based on user session
    return successResponse(res, { cleared: true }, 'Chat history cleared');
};
