import { useState, useRef, useEffect } from 'react';
import { useSendAIMessage } from '../../services/aiService';
import { getSuggestedPrompts, detectLanguage, MULTILINGUAL_PHRASES } from '../../services/aiService';
import { AIChatMessage } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Send, Sparkles, Loader2, Globe, User, Bot } from 'lucide-react';

const AIChat = () => {
    const [messages, setMessages] = useState<AIChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your ChocoOps AI assistant. I can help you with inventory locations, recipe instructions, quality standards, and troubleshooting. How can I help you today?',
            timestamp: new Date().toISOString(),
            language: 'en'
        }
    ]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState<'en' | 'ar' | 'he' | 'am' | 'ru' | 'uk' | 'fr'>('en');
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
                    user_role: 'WAREHOUSE', // TODO: Get from auth context
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

    const suggestedPrompts = getSuggestedPrompts('WAREHOUSE'); // TODO: Get role from auth

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900 flex items-center gap-2">
                            <Sparkles className="h-8 w-8 text-gold-600" />
                            AI Assistant
                        </h1>
                        <p className="text-muted-foreground">Your intelligent factory companion</p>
                    </div>
                    
                    {/* Language Selector */}
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-500" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="px-3 py-1.5 border border-cocoa-200 rounded-md text-sm focus:ring-gold-500 focus:border-gold-500"
                        >
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                            <option value="he">עברית</option>
                            <option value="am">አማርኛ</option>
                            <option value="ru">Русский</option>
                            <option value="uk">Українська</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Chat Container */}
            <Card className="flex-1 border-cocoa-100 flex flex-col overflow-hidden">
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
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
                                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'bg-cocoa-700 text-white rounded-br-sm'
                                            : 'bg-slate-100 text-slate-900 rounded-bl-sm'
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
                            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
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
                {messages.length <= 2 && (
                    <div className="px-4 pb-3 border-t border-cocoa-100">
                        <p className="text-xs text-slate-600 mb-2 mt-3">Suggested questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.slice(0, 4).map((prompt, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSuggestedPrompt(prompt)}
                                    className="text-xs border-cocoa-200 text-cocoa-700 hover:bg-cocoa-50"
                                >
                                    {prompt.replace(/{[^}]+}/g, '...')}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-cocoa-100 bg-slate-50">
                    <div className="flex gap-2">
                        <Input
                            placeholder={`Ask me anything... (${language})`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isPending}
                            className="flex-1 border-cocoa-200 focus:ring-gold-500 bg-white"
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
                    <p className="text-xs text-slate-500 mt-2">
                        💡 Tip: Ask about ingredient locations, recipe steps, quality standards, or troubleshooting
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default AIChat;
