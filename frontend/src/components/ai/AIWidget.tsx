import { useState } from 'react';
import AIChat from './AIChat';
import { X, MessageCircle } from 'lucide-react';

const AIWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] transition-all duration-300 ease-in-out">
            {isOpen ? (
                <div className="relative animate-scaleIn origin-bottom-right">
                    {/* Chat Container */}
                    <div className="w-[400px] h-[600px] max-h-[80vh] flex flex-col rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] bg-white border border-slate-100">
                         <AIChat />
                    </div>
                    
                    {/* Circular Close Button (X) */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute -bottom-2 -right-2 h-14 w-14 rounded-full bg-black text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-10"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="h-16 w-16 rounded-full bg-[#7c2d12] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
                >
                    <MessageCircle className="h-7 w-7 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}
        </div>
    );
};

export default AIWidget;
