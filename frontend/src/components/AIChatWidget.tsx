import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import { cn } from '../lib/utils'; // Fixed path

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: 'Hello! I am your ChocoOps AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const userInput = input;
    setInput('');

    // Simulate AI response
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: `I received your request: "${userInput}". I'm just a demo AI for now, but I will be connected to the backend soon!` }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat Window */}
        {isOpen && (
            <Card className="w-80 h-96 mb-4 flex flex-col shadow-xl border-amber-500/20">
                <CardHeader className="bg-amber-600 text-white p-4 rounded-t-lg flex flex-row items-center justify-between">
                    <span className="font-semibold flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> ChocoBot
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-amber-700" onClick={toggleChat}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn(
                            "max-w-[80%] rounded-lg p-3 text-sm",
                            msg.role === 'user' 
                                ? "bg-amber-100 text-amber-900 ml-auto" 
                                : "bg-slate-100 text-slate-800 mr-auto"
                        )}>
                            {msg.text}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="p-3 border-t">
                    <div className="flex w-full gap-2">
                        <Input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask me anything..."
                            className="flex-1"
                        />
                         <Button size="icon" variant="ghost" className="text-slate-500">
                             <Mic className="h-4 w-4" />
                         </Button>
                        <Button size="icon" onClick={sendMessage} className="bg-amber-600 hover:bg-amber-700">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        )}

      {/* Toggle Button */}
      <Button 
        onClick={toggleChat}
        className="h-14 w-14 rounded-full bg-amber-600 hover:bg-amber-700 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default AIChatWidget;
