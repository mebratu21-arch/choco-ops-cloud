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
    <div className="min-h-screen bg-cyan-400 text-black p-6 md:p-12 pt-32 md:pt-40 font-inter relative">
      {/* Background Ambient Effects - Layered for depth */}
      <div className="absolute top-0 left-0 w-full h-full bg-cyan-400 z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/40 rounded-full blur-[160px] pointer-events-none animate-pulse z-0" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left Sidebar - Information & Quick Actions */}
        <div className="lg:col-span-3 flex flex-col gap-8 h-full">
          {/* Brand Card */}
          <div className="p-10 rounded-[2.5rem] border-4 border-black shadow-[0_15px_40px_rgba(0,0,0,0.2)] relative overflow-hidden bg-white text-black">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center border-2 border-cyan-900 shadow-xl">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-black leading-tight">CocoaFlow</h2>
                <span className="text-black/80 text-[10px] font-black tracking-[0.2em] uppercase">Enterprise AI</span>
              </div>
            </div>
            <p className="text-black/90 text-sm leading-relaxed font-bold">
              Real-time industrial intelligence. Synchronized for maximum throughput.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-[2.5rem] border-4 border-cyan-400 flex flex-col gap-4 overflow-hidden bg-white text-black shadow-xl">
            <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              Intelligence Nexus
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-premium">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => void handleQuickAction(action.query)}
                  disabled={isLoading}
                  className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl bg-cyan-50 hover:bg-cyan-400 border-2 border-cyan-400 transition-all duration-300 disabled:opacity-50 text-black font-bold"
                >
                  <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                    <action.icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="glass-panel p-6 rounded-[2rem] border-white/5">
            <h3 className="text-[10px] font-black text-black uppercase tracking-widest mb-4">Select Interface Language</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code as SupportedLanguage)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2",
                    selectedLang === lang.code
                      ? "bg-black text-cyan-400 border-black shadow-lg"
                      : "bg-white text-black border-black hover:bg-cyan-100"
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-9 flex flex-col h-full gap-8">
          <div className="flex-1 rounded-[3rem] border-4 border-black overflow-hidden flex flex-col relative bg-white shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="h-28 border-b-4 border-black px-10 flex items-center justify-between bg-white">
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
                  <h1 className="text-2xl font-black text-black tracking-tight uppercase">AI Command Center</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                      {isOnline ? 'System Online' : 'Simulation Mode'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => void handleClearHistory()}
                  disabled={isLoading || messages.length === 0}
                  className="p-3 bg-black text-cyan-400 hover:bg-black/90 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border-2 border-black"
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
                      <div className="bg-black text-cyan-400 p-6 rounded-[2.5rem] rounded-tr-lg shadow-2xl font-black text-lg leading-relaxed border-4 border-black">
                        {msg.content}
                      </div>
                      <div className="flex justify-end mt-2 px-4">
                         <span className="text-[10px] font-black text-black uppercase tracking-widest">
                           {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%] flex items-start gap-4">
                      <div className="w-12 h-12 bg-black border-4 border-black rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg">
                        <Bot className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex flex-col gap-2">
                          <div className="bg-cyan-400 border-2 border-cyan-900 p-6 rounded-[2.2rem] rounded-tl-lg shadow-xl relative group/msg">
                            <div className="absolute -left-2 top-0 w-1.5 h-6 bg-black rounded-full shadow-lg" />
                            <div className="text-black text-base leading-relaxed whitespace-pre-wrap font-bold tracking-tight">
                              {msg.content}
                            </div>
                          </div>
                        <div className="flex items-center gap-3 px-2">
                          <span className="text-[10px] font-black text-black/60 uppercase tracking-widest">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="w-1 h-1 bg-black/20 rounded-full" />
                          <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">Real-time Node</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start w-full animate-pulse">
                   <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black border-4 border-black rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-lg">
                      <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="bg-cyan-50 border-4 border-black px-8 py-5 rounded-[2.5rem] rounded-tl-lg flex items-center gap-4 shadow-xl">
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs font-black text-black uppercase tracking-widest">Tracking...</span>
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
                    placeholder="Enter command..."
                    className="w-full bg-white border-4 border-black focus:ring-4 focus:ring-cyan-200 rounded-[2.5rem] py-8 pl-12 pr-20 text-black placeholder:text-black/30 focus:outline-none transition-all duration-300 text-xl font-black shadow-xl"
                    disabled={isLoading}
                  />
                  <button
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 text-black hover:text-cyan-600 transition-colors rounded-2xl hover:bg-cyan-50"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => void handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={cn(
                    "w-24 h-24 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-2xl relative overflow-hidden",
                    inputValue.trim() && !isLoading
                      ? "bg-black text-cyan-400 scale-100 hover:scale-105 active:scale-95"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed scale-95"
                  )}
                >
                  <Send className="w-10 h-10 relative z-10" />
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
