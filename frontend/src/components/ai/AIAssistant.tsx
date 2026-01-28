import { useState, useRef, useEffect } from 'react';
import { useSendAIMessage } from '../../services/aiService';
import { getInventoryPrompts, detectLanguage, MULTILINGUAL_PHRASES } from '../../services/aiService';
import { AIChatMessage, UserRole } from '../../types';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Send, Sparkles, Loader2, Globe, User, Bot, Minimize2 } from 'lucide-react';

type Language = 'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr';

interface InventoryContext {
  selectedItem?: string;
  lowStockCount?: number;
  expiringCount?: number;
}

interface AIAssistantProps {
  role?: UserRole;
  defaultLanguage?: Language;
  context?: InventoryContext;
  compact?: boolean;
}

const AIAssistant = ({ 
  role = 'WAREHOUSE',
  defaultLanguage = 'en',
  context,
  compact = false
}: AIAssistantProps) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: MULTILINGUAL_PHRASES[defaultLanguage].greeting,
      timestamp: new Date().toISOString(),
      language: defaultLanguage
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, isPending } = useSendAIMessage();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isPending) return;

    const userMessage: AIChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      language: detectLanguage(input)
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');

    // Send to AI
    sendMessage(
      {
        message: userInput,
        context: {
          user_role: role,
          language: language
        }
      },
      {
        onSuccess: (response) => {
          const assistantMessage: AIChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date().toISOString(),
            language: language
          };
          setMessages(prev => [...prev, assistantMessage]);
        },
        onError: () => {
          const errorMessage: AIChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: MULTILINGUAL_PHRASES[language].error,
            timestamp: new Date().toISOString(),
            language: language
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // Get inventory-specific prompts
  const suggestedPrompts = getInventoryPrompts(language, context);

  if (!isExpanded && compact) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`${compact ? 'fixed bottom-6 right-6 z-50 w-96' : 'h-full'}`}>
      <Card className="border-cocoa-100 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-semibold">Inventory Advisor</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-white/20 rounded-md px-2 py-1">
                <Globe className="h-3 w-3" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="en">EN</option>
                  <option value="ar">AR</option>
                  <option value="he">HE</option>
                  <option value="am">AM</option>
                  <option value="ru">RU</option>
                  <option value="uk">UK</option>
                  <option value="fr">FR</option>
                </select>
              </div>
              {compact && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="hover:bg-white/20 rounded p-1 transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-cocoa-700 text-white'
                  : 'bg-gold-100 text-gold-700'
              }`}>
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-cocoa-700 text-white rounded-br-sm'
                      : 'bg-white text-slate-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-slate-500 mt-1 px-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isPending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                  <span className="text-sm text-slate-600">{MULTILINGUAL_PHRASES[language].thinking}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Prompts */}
        {messages.length <= 2 && suggestedPrompts.length > 0 && (
          <div className="px-4 py-3 border-t border-cocoa-100 bg-white">
            <p className="text-xs text-slate-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.slice(0, 3).map((prompt: string, idx: number) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs border-cocoa-200 text-cocoa-700 hover:bg-cocoa-50"
                >
                  {prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-cocoa-100 bg-white">
          <div className="flex gap-2">
            <Input
              placeholder={`Ask me anything... (${language.toUpperCase()})`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isPending}
              className="flex-1 border-cocoa-200 focus:ring-gold-500 bg-white text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isPending}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
