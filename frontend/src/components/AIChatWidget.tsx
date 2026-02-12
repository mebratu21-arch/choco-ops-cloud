import { useState } from 'react';
import { Button } from './ui/Button';
import { useSendAIMessage, useGetAIStatus } from '../services/aiService';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { X, Send } from 'lucide-react';
import { cn } from '../lib/utils'; // Fixed path
import { useAuthStore } from '../store/authStore';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Hello! I am your ChocoOps AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const user = useAuthStore((state) => state.user);

  const { mutate: sendMessageFn, isPending } = useSendAIMessage();
  const { data: aiStatus } = useGetAIStatus();
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');

    // Build history for the backend from previous messages
    const historyForBackend = chatHistory.map(h => ({ role: h.role, content: h.content }));

    sendMessageFn({ 
        message: userText,
        language: 'en',
        context: { 
          user_role: user?.role ?? 'manager',
          history: historyForBackend
        } 
    }, {
        onSuccess: (response: { response?: string; message?: string }) => {
            const botReply = response.message ?? response.response ?? 'No response received.';
            setMessages(prev => [...prev, { role: 'assistant', text: botReply }]);
            // Update history for next turn
            setChatHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: botReply }]);
        },
        onError: (error) => {
            console.error('AI Chat Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting right now. Please try again later or check if the AI service is configured." }]);
        }
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        {isOpen && (
            <Card className="w-96 h-[500px] mb-4 flex flex-col shadow-2xl border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
                <CardHeader className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white p-4 rounded-t-lg flex flex-row items-center justify-between">
                    <span className="font-bold flex items-center gap-2 text-lg">
                        🍫 ChocoBot AI
                        {aiStatus && (
                            <span className="flex items-center gap-1 text-[10px] font-normal bg-black/20 px-2 py-0.5 rounded-full ml-2">
                                <div className={`w-2 h-2 rounded-full ${aiStatus.provider === 'mock' ? 'bg-amber-400' : 'bg-green-400'} animate-pulse`} />
                                {aiStatus.provider === 'anthropic' ? 'Claude' : aiStatus.provider === 'gemini' ? 'Gemini' : aiStatus.provider === 'deepseek' ? 'DeepSeek' : 'Sim Mode'}
                            </span>
                        )}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-amber-800 rounded-full" onClick={toggleChat}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50/30 to-white">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "max-w-[85%] rounded-2xl p-3 text-sm shadow-sm animate-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user'
                                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white ml-auto shadow-amber-200"
                                : "bg-white text-slate-700 mr-auto border border-amber-100 shadow-amber-100"
                        )}>
                            {msg.role === 'assistant' && <span className="text-amber-600 font-semibold text-xs">🤖 ChocoBot:</span>}
                            <p className={msg.role === 'assistant' ? 'mt-1' : ''}>{msg.text}</p>
                        </div>
                    ))}
                    {isPending && (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                            </div>
                            <span>Thinking...</span>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-3 border-t border-amber-100 bg-white">
                    <div className="flex w-full gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isPending && sendMessage()}
                            placeholder="Ask about inventory, recipes, or production..."
                            className="flex-1 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                            disabled={isPending}
                        />
                        <Button
                            size="icon"
                            onClick={sendMessage}
                            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-200"
                            disabled={isPending || !input.trim()}
                        >
                            {isPending ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

      {/* Toggle Button */}
      <Button
        onClick={toggleChat}
        className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:via-amber-800 hover:to-amber-900 shadow-2xl shadow-amber-300 flex items-center justify-center transition-all duration-300 hover:scale-110 border-2 border-amber-400"
      >
        {isOpen ? <X className="h-7 w-7 text-white" /> : <span className="text-3xl">🍫</span>}
      </Button>
    </div>
  );
};

export default AIChatWidget;
