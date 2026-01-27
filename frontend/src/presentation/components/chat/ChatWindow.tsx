import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import Button from '@/presentation/components/ui/Button';
import Input from '@/presentation/components/ui/Input';
import { cn } from '@/presentation/lib/utils';

export default function ChatWindow() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
      { role: 'assistant', content: 'שלום! אני העוזר האישי שלך. איך אני יכול לעזור לך היום?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
      if (!input.trim()) return;
      setMessages([...messages, { role: 'user', content: input }]);
      setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: 'אני עדיין לומד... בקרוב אוכל לענות על שאלות אלו!' }]);
      }, 1000);
      setInput('');
  };

  return (
    <div className="flex flex-col h-[400px] border border-secondary-200 rounded-lg overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50/50">
            {messages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'assistant' ? "bg-primary-100 text-primary-600" : "bg-secondary-200 text-secondary-600")}>
                        {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={cn("p-3 rounded-lg max-w-[80%] text-sm", msg.role === 'assistant' ? "bg-white border border-secondary-100 shadow-sm" : "bg-primary-600 text-white")}>
                        {msg.content}
                    </div>
                </div>
            ))}
        </div>
        <div className="p-3 bg-white border-t border-secondary-200 flex gap-2">
            <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="שאל אותי משהו..." 
                className="text-right"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} className="shrink-0 p-2 h-10 w-10 flex items-center justify-center">
                <Send size={18} />
            </Button>
        </div>
    </div>
  );
}
