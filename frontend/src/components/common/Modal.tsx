import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className={cn(
          "bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]", 
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold font-serif text-cocoa-900 dark:text-cocoa-100">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
