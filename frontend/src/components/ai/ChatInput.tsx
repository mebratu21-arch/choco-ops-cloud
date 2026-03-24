import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

// Define Speech Recognition types locally since they aren't standard yet
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface ChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  language: string;
  context: string;
  onContextChange: (context: string) => void;
}

// Placeholder translations
const placeholders: Record<string, string> = {
  en: 'Ask me anything about inventory, production, QC...',
  ar: 'اسألني أي شيء عن المخزون، الإنتاج، مراقبة الجودة...',
  he: 'שאל אותי משהו על מלאי, ייצור, בקרת איכות...',
  am: 'ስለ ክምችት፣ ምርት፣ QC... ማንኛውንም ነገር ጠይቀኝ',
  ru: 'Спросите меня о складе, производстве, контроле качества...',
  uk: 'Запитайте мене про склад, виробництво, контроль якості...',
};

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  loading,
  language,
  context,
  onContextChange,
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition ?? window.SpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        // Map language codes to speech recognition language codes
        const langMap: Record<string, string> = {
          en: 'en-US',
          ar: 'ar-SA',
          he: 'he-IL',
          am: 'am-ET',
          ru: 'ru-RU',
          uk: 'uk-UA',
        };
        recognitionRef.current.lang = langMap[language] ?? 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('');
          setMessage(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const handleSubmit = () => {
    if (!message.trim() || loading) return;
    onSend(message.trim());
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const placeholder = placeholders[language] ?? placeholders.en;

  return (
    <div className="space-y-3">
      {/* Context selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['general', 'inventory', 'production', 'qc'] as const).map((ctx) => (
          <button
            key={ctx}
            onClick={() => onContextChange(ctx)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              context === ctx
                ? "bg-cocoa-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {ctx === 'general' && '💡 General'}
            {ctx === 'inventory' && '📦 Inventory'}
            {ctx === 'production' && '🏭 Production'}
            {ctx === 'qc' && '✅ QC'}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Voice input button */}
        {(typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) && (
          <Button
            type="button"
            variant={isListening ? 'default' : 'outline'}
            size="sm"
            onClick={toggleVoiceInput}
            className={cn(
              "flex-shrink-0",
              isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
            )}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            rows={1}
            className={cn(
              "w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl resize-none",
              "focus:outline-none focus:border-cocoa-500 transition-colors",
              "placeholder:text-slate-400 text-slate-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isListening && "border-red-300 bg-red-50"
            )}
            style={{ maxHeight: '150px' }}
            dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}
          />
          {/* Character count */}
          {message.length > 0 && (
            <span className="absolute bottom-1 right-14 text-xs text-slate-400">
              {message.length}
            </span>
          )}
        </div>

        {/* Send button */}
        <Button
          type="button"
          aria-label="Send message"
          onClick={handleSubmit}
          disabled={!message.trim() || loading}
          className="flex-shrink-0 bg-cocoa-600 hover:bg-cocoa-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-xs text-slate-400 text-center">
        Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">Enter</kbd> to send,{' '}
        <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default ChatInput;
