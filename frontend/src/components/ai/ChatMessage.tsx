import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType } from '../../hooks/useAIChat';
import { cn } from '../../lib/utils';

export interface ChatMessageProps {
  message: ChatMessageType;
  onCopy?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.isUser;

  const handleCopy = () => {
    void navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      "flex gap-3 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser
          ? "bg-cocoa-600"
          : "bg-gradient-to-br from-cocoa-500 to-chocolate-600"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className={cn(
        "relative max-w-[80%] rounded-2xl px-4 py-3",
        isUser
          ? "bg-cocoa-700 text-white rounded-tr-none"
          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm"
      )}>
        {/* Message content */}
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser && "prose-invert"
        )}>
          {isUser ? (
            <p className="m-0 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-2 pl-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 pl-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ className, children }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-cocoa-700 text-sm">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-sm my-2">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre className="m-0">{children}</pre>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-cocoa-600 hover:underline">
                    {children}
                  </a>
                ),
                h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mt-2 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-cocoa-300 pl-3 my-2 italic text-slate-600">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2">
                    <table className="min-w-full border border-slate-200 rounded">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-slate-100 px-3 py-1 text-left text-sm font-semibold border-b">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-1 text-sm border-b border-slate-100">
                    {children}
                  </td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        <div className={cn(
          "text-xs mt-1",
          isUser ? "text-cocoa-200" : "text-slate-400"
        )}>
          {formatTime(message.timestamp)}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            "absolute -right-2 -top-2 p-1.5 rounded-full transition-all",
            "opacity-0 group-hover:opacity-100",
            isUser
              ? "bg-cocoa-800 text-cocoa-200 hover:text-white"
              : "bg-white border shadow-sm text-slate-400 hover:text-slate-600"
          )}
          title="Copy message"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatMessage;
