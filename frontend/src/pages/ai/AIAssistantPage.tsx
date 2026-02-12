import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  Bot,
  RefreshCw,
  Zap,
  Brain,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { aiService, MULTILINGUAL_PHRASES, detectLanguage, useGetAIStatus } from '../../services/aiService';

type SupportedLanguage = 'en' | 'am' | 'ru' | 'he' | 'ar';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language?: string;
}

const languages = [
  { code: 'en', label: 'EN', fullLabel: 'ENGLISH' },
  { code: 'am', label: 'AM', fullLabel: 'አማርኛ' },
  { code: 'ru', label: 'RU', fullLabel: 'РУССКИЙ' },
  { code: 'he', label: 'HE', fullLabel: 'עברית' },
  { code: 'ar', label: 'AR', fullLabel: 'العربية' },
];

const quickActions = [
  { icon: TrendingUp, label: 'Production Status', query: 'What is the current production status?' },
  { icon: AlertCircle, label: 'Low Stock Alerts', query: 'Show me low stock inventory items' },
  { icon: Brain, label: 'AI Recommendations', query: 'Give me optimization recommendations' },
  { icon: MessageSquare, label: 'Quality Report', query: 'Generate a quality control summary' },
];

const AIAssistantPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get AI provider status
  const { data: aiStatus } = useGetAIStatus();
  const provider = aiStatus?.provider ?? 'demo';
  const isOnline = provider !== 'demo' && provider !== 'offline' && provider !== 'mock';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const text = messageText ?? inputValue.trim();
    if (!text || isLoading) return;

    const detectedLang = detectLanguage(text) as SupportedLanguage;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: text,
      isUser: true,
      timestamp: new Date(),
      language: detectedLang
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Use auto-detected language from user input for natural conversation
    const responseLanguage = detectedLang ?? selectedLang;

    try {
      const response = await aiService.sendChatMessage({
        message: text,
        language: responseLanguage,
        context: { user_role: 'OPERATOR' }
      });

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response.response ?? 'Response received.',
        isUser: false,
        timestamp: new Date(response.timestamp),
        language: responseLanguage
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: unknown) {
      console.error('AI Chat Error:', err);
      // Error handled by UI messages

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: MULTILINGUAL_PHRASES[responseLanguage]?.error ?? MULTILINGUAL_PHRASES.en.error,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, selectedLang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleClearHistory = useCallback(async () => {
    try {
      await aiService.clearChatHistory();
    } catch {
      // Continue even if backend clear fails
    }
    setMessages([]);
  }, []);

  const handleQuickAction = (query: string) => {
    void handleSendMessage(query);
  };

  return (
    <div className="min-h-screen bg-chocolate-950 text-chocolate-50 p-4 md:p-8 font-inter overflow-hidden relative">
      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-chocolate-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Left Sidebar - Information & Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          {/* Brand Card */}
          <div className="glass-panel p-6 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 blur-2xl group-hover:bg-gold-500/20 transition-all duration-700" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gold-500/20 rounded-2xl flex items-center justify-center border border-gold-500/30 shadow-[0_0_20px_rgba(217,119,6,0.2)]">
                <Sparkles className="w-7 h-7 text-gold-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white leading-tight">CocoaFlow</h2>
                <span className="text-gold-500 text-[10px] font-black tracking-[0.2em] uppercase">Enterprise AI</span>
              </div>
            </div>
            <p className="text-chocolate-200/60 text-sm leading-relaxed font-medium">
              Real-time industrial intelligence for the modern confectionery factory.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel flex-1 p-6 rounded-[2rem] border-white/5 flex flex-col gap-4 overflow-hidden">
            <h3 className="text-xs font-black text-gold-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Intelligence Tasks
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-premium">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => void handleQuickAction(action.query)}
                  disabled={isLoading}
                  className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-gold-500/30 transition-all duration-300 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-xl bg-chocolate-900 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="w-5 h-5 text-chocolate-200 group-hover:text-gold-400 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-chocolate-100 group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="glass-panel p-6 rounded-[2rem] border-white/5">
            <h3 className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest mb-4">Select Interface Language</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code as SupportedLanguage)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all border",
                    selectedLang === lang.code
                      ? "bg-gold-500 text-chocolate-950 border-gold-400 shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                      : "bg-white/5 text-chocolate-300 border-white/5 hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3 flex flex-col h-full gap-6">
          <div className="glass-panel flex-1 rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center border border-gold-500/30">
                    <Brain className="w-6 h-6 text-gold-400" />
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-chocolate-950",
                    isOnline ? "bg-green-500" : "bg-amber-500"
                  )} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">AI Command Center</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-chocolate-400 uppercase tracking-widest">
                      {isOnline ? 'Active Connection' : 'Demo Environment'}
                    </span>
                    <span className="w-1 h-1 bg-chocolate-600 rounded-full" />
                    <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">{provider} Engine</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleClearHistory()}
                  disabled={isLoading || messages.length === 0}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-chocolate-300 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/5"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-premium">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center mb-6">
                    <Bot className="w-10 h-10 text-chocolate-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-3 tracking-tight">System Ready</h3>
                  <p className="text-chocolate-200/60 max-w-sm font-medium">
                    Transmit your query via text or voice. I am synchronized with all factory sub-systems.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.isUser ? "justify-end" : "justify-start animate-in fade-in slide-in-from-bottom-4 duration-500")}>
                  {msg.isUser ? (
                    <div className="max-w-[80%]">
                      <div className="bg-gold-500 text-chocolate-950 p-5 rounded-[2rem] rounded-tr-lg shadow-xl shadow-gold-500/10 font-medium leading-relaxed">
                        {msg.content}
                      </div>
                      <div className="flex justify-end mt-2 px-2">
                         <span className="text-[10px] font-black text-chocolate-500 uppercase tracking-widest">
                           {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-5 h-5 text-gold-500" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-white/5 border border-white/5 backdrop-blur-md p-6 rounded-[2rem] rounded-tl-lg shadow-2xl relative">
                          <div className="absolute -left-1 top-0 w-1 h-3 bg-gold-500 rounded-full" />
                          <div className="text-chocolate-100 text-base leading-relaxed whitespace-pre-wrap font-medium">
                            {msg.content}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 px-2">
                          <span className="text-[10px] font-black text-chocolate-500 uppercase tracking-widest">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="w-1 h-1 bg-chocolate-700 rounded-full" />
                          <span className="text-[10px] font-black text-gold-500/50 uppercase tracking-widest">Processed locally</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start w-full animate-pulse">
                   <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shrink-0 mt-1">
                      <Zap className="w-5 h-5 text-gold-500 opacity-50" />
                    </div>
                    <div className="bg-white/5 border border-white/5 backdrop-blur-md px-6 py-4 rounded-[2rem] rounded-tl-lg flex items-center gap-4">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">Syncing Data...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Terminal */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-4 relative">
                <div className="flex-1 relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter command or natural language query..."
                    className="w-full bg-chocolate-900/50 border-2 border-white/5 focus:border-gold-500/30 hover:border-white/10 rounded-[1.5rem] py-5 pl-8 pr-16 text-white placeholder:text-chocolate-500 focus:outline-none transition-all duration-300 text-base font-medium shadow-inner"
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-chocolate-500 hover:text-gold-400 transition-colors rounded-xl hover:bg-white/5 group-hover:scale-105"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl relative overflow-hidden group/btn",
                    inputValue.trim() && !isLoading
                      ? "bg-gold-500 text-chocolate-950 scale-100 hover:scale-105 active:scale-95 shadow-gold-500/20"
                      : "bg-white/5 text-chocolate-700 cursor-not-allowed scale-95"
                  )}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                  <Send className="w-6 h-6 relative z-10" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
