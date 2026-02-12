import { useState, useRef, useEffect } from 'react';
import { useSendAIMessage, useClearChatHistory } from '../../services/aiService';
import { detectLanguage, MULTILINGUAL_PHRASES } from '../../services/aiService';
import { AIChatMessage } from '../../types';
import { RotateCcw } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

type SupportedLanguage = 'en' | 'am' | 'ru' | 'he' | 'ar';

const LANGUAGE_CONFIG: Record<SupportedLanguage, { name: string; native: string; dir: 'ltr' | 'rtl' }> = {
    en: { name: 'English', native: 'English', dir: 'ltr' },
    am: { name: 'Amharic', native: 'አማርኛ', dir: 'ltr' },
    ru: { name: 'Russian', native: 'Русский', dir: 'ltr' },
    he: { name: 'Hebrew', native: 'עברית', dir: 'rtl' },
    ar: { name: 'Arabic', native: 'العربية', dir: 'rtl' },
};

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
    en: "Hello! I'm your CocoaFlow Companion. How can I help you optimize the factory floor today? I support English, አማርኛ, Русский, עברית, and العربية.",
    am: "ሰላም! እኔ የእርስዎ የኮኮአፍሎው ረዳት ነኝ። ዛሬ የፋብሪካውን ስራ ለማሻሻል እንዴት ልረዳዎ እችላለሁ? እንግሊዝኛ፣ አማርኛ፣ ሩሲያኛ፣ ዕብራይስጥ እና አረብኛ እደግፋለሁ።",
    ru: "Привет! Я ваш помощник CocoaFlow. Как я могу помочь вам оптимизировать работу фабрики сегодня? Я поддерживаю английский, አማርኛ, Русский, уברית и العربية.",
    he: "שלום! אני השותף שלך ל-CocoaFlow. איך אוכל לעזור לך לייעל את רצפת המפעל היום? אני תומך באנגלית, አማርኛ, Русский, עברית וערבית.",
    ar: "مرحباً! أنا رفيق CocoaFlow الخاص بك. كيف يمكنني مساعدتك في تحسين أرضية المصنع اليوم؟ أنا أدعم الإنجليزية و አማርኛ و Русский و עברית و العربية.",
};

const PLACEHOLDER_TEXT: Record<SupportedLanguage, string> = {
    en: "Ask anything / ማንኛውንም ይጠይቁ...",
    am: "ማንኛውንም ይጠይቁ / Ask anything...",
    ru: "Спрашивайте о чем угодно / ማንኛውንም ይጠይቁ...",
    he: "שאל כל דבר / ማንኛውንም ይጠይቁ...",
    ar: "اسأل عن أي شيء / ማንኛውንም ይጠይቁ...",
};

const AIChat = () => {
    const [language, setLanguage] = useState<SupportedLanguage>('en');
    const [messages, setMessages] = useState<AIChatMessage[]>([{
        id: '1',
        role: 'assistant',
        content: WELCOME_MESSAGES.en,
        timestamp: new Date().toISOString(),
        language: 'en'
    }]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { mutate: sendMessage, isPending } = useSendAIMessage();
    const { mutate: clearHistory } = useClearChatHistory();

    // Auto-scroll to bottom
    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const handleReset = () => {
        clearHistory(undefined, {
            onSuccess: () => {
                setMessages([{
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: WELCOME_MESSAGES[language],
                    timestamp: new Date().toISOString(),
                    language: language
                }]);
            },
            onError: () => {
                // Fallback to UI reset if backend fails
                setMessages([{
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: WELCOME_MESSAGES[language],
                    timestamp: new Date().toISOString(),
                    language: language
                }]);
            }
        });
    };

    const handleSend = () => {
        if (!input.trim() || isPending) return;

        const detectedLang = detectLanguage(input) as SupportedLanguage;
        const userMessage: AIChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
            language: detectedLang
        };

        setMessages((prev: AIChatMessage[]) => [...prev, userMessage]);
        const userInput = input;
        setInput('');

        sendMessage(
            {
                message: userInput,
                language: language,
                context: {
                    user_role: 'OPERATOR',
                }
            },
            {
                onSuccess: (response) => {
                    const assistantMessage: AIChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: response.response ?? 'Response received.',
                        timestamp: new Date().toISOString(),
                        language: language
                    };
                    setMessages((prev: AIChatMessage[]) => [...prev, assistantMessage]);
                },
                onError: () => {
                    const errorMessage: AIChatMessage = {
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        content: MULTILINGUAL_PHRASES[language]?.error ?? MULTILINGUAL_PHRASES.en.error,
                        timestamp: new Date().toISOString(),
                        language: language
                    };
                    setMessages((prev: AIChatMessage[]) => [...prev, errorMessage]);
                }
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isRTL = LANGUAGE_CONFIG[language].dir === 'rtl';

    return (
        <div className="h-full flex flex-col bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header - Solid Brown */}
            <div className="bg-[#7c2d12] px-6 py-5 flex items-center justify-between text-white shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-3 relative z-10">
                     <span className="text-sm font-medium tracking-tight">CocoaFlow Companion</span>
                     <LanguageSelector 
                        value={language} 
                        onChange={(lang) => setLanguage(lang as SupportedLanguage)} 
                     />
                </div>
                <button 
                   onClick={handleReset}
                   className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                   title="Reset Conversation"
                >
                    <RotateCcw className="h-4 w-4" />
                </button>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`relative max-w-[85%] px-6 py-4 rounded-[2.5rem] shadow-sm transition-all duration-300 hover:shadow-md ${
                                message.role === 'user'
                                    ? 'bg-[#7c2d12] text-white rounded-br-lg border-transparent'
                                    : 'bg-white text-slate-800 border-slate-100 rounded-bl-lg border'
                            }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className={`text-[10px] mt-1 block ${message.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isPending && (
                    <div className="flex justify-start animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-slate-50 border border-slate-100 rounded-full px-6 py-3 flex items-center gap-3 shadow-inner">
                             <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-[#7c2d12]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-[#7c2d12]/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-[#7c2d12]/40 rounded-full animate-bounce" />
                             </div>
                             <span className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Companion Thinking</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-6 bg-white border-t border-slate-50">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="flex-1 relative flex items-center bg-[#f3f4f6] rounded-[2rem] px-6 py-3 border border-transparent focus-within:border-slate-200 transition-all">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={PLACEHOLDER_TEXT[language]}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isPending}
                            className="w-full bg-transparent border-none outline-none text-sm text-slate-700 placeholder-slate-400 font-medium"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isPending}
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-md ${
                            input.trim() && !isPending
                                ? 'bg-[#e2d1c3] text-[#7c2d12] hover:bg-[#d4c1b2] active:scale-95'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
