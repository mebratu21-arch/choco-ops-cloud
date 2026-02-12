import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiService } from '../services/aiService';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language?: string;
  context?: string;
}

interface SendMessageParams {
  message: string;
  language: string;
  context: string;
}

export const useAIChat = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history on mount
  const { data: chatHistory } = useQuery({
    queryKey: ['ai', 'history'],
    queryFn: () => aiService.getChatHistory(),
    staleTime: 5 * 60 * 1000,
  });

  // Initialize messages from history
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0 && messages.length === 0) {
      setMessages(chatHistory.map((msg: ChatMessage, index: number) => ({
        id: `history-${index}`,
        content: msg.content,
        isUser: msg.isUser,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
      })));
    }
  }, [chatHistory, messages.length]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, language, context }: SendMessageParams) => {
      return aiService.sendChatMessage({
        message,
        language,
        context,
      });
    },
  });

  // Send message function
  const sendMessage = useCallback(async (
    message: string,
    language = 'en',
    context = 'general'
  ) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date(),
      language,
      context,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message,
        language,
        context,
      });

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.response ?? 'I apologize, but I could not process your request.',
        isUser: false,
        timestamp: new Date(response.timestamp ?? Date.now()),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Please try again.';
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: `I'm sorry, I encountered an error: ${message}`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sendMessageMutation]);

  // Clear history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: () => aiService.clearChatHistory(),
    onSuccess: () => {
      setMessages([]);
      void queryClient.invalidateQueries({ queryKey: ['ai', 'history'] });
    },
  });

  const clearHistory = useCallback(() => {
    clearHistoryMutation.mutate();
  }, [clearHistoryMutation]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearHistory,
    error: sendMessageMutation.error,
  };
};

export default useAIChat;
