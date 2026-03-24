import { useState, useEffect } from 'react';
import { useTranslate, MULTILINGUAL_PHRASES } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Modal } from '../common/Modal'; // Using common Modal component
import { Loader2, Languages, Volume2, Check } from 'lucide-react';

interface InstructionClarifierProps {
  instruction: string;
  stepNumber: number;
}

export function InstructionClarifier({ instruction, stepNumber }: InstructionClarifierProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [workerLanguage, setWorkerLanguage] = useState('am'); // Default to Amharic for demo
  const { mutate: translate, isPending, data } = useTranslate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Effect to clean up speech synthesis when component unmounts or modal closes
  useEffect(() => {
    if (!showTranslation) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [showTranslation]);

  const handleExplain = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    console.log('InstructionClarifier: handleExplain clicked', { instruction, stepNumber });
    setShowTranslation(true);
    
    // Initial translation if not already done or if language changed
    if (!data) {
        console.log('InstructionClarifier: requesting initial translation', { workerLanguage });
        requestTranslation(workerLanguage);
    }
  };

  const requestTranslation = (lang: string) => {
    console.log('InstructionClarifier: requestTranslation called', { lang, instruction });
    translate({
        text: instruction,
        targetLanguage: lang,
        context: { domain: 'recipe' }
      });
  };

  const handleLanguageChange = (lang: string) => {
    setWorkerLanguage(lang);
    requestTranslation(lang);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
    }

    const textToSpeak = data ?? instruction;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice/lang based on workerLanguage if possible
    // Note: Browser support for specific voices varies
    utterance.lang = workerLanguage === 'am' ? 'am-ET' : 
                     workerLanguage === 'ar' ? 'ar-SA' : 
                     workerLanguage === 'ru' ? 'ru-RU' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <Button 
        onClick={handleExplain} 
        variant="ghost" 
        size="sm"
        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 h-auto"
        title="Explain in my language"
      >
        <Languages className="h-3 w-3 mr-1" /> Explain
      </Button>

      <Modal 
        isOpen={showTranslation} 
        onClose={() => setShowTranslation(false)}
        title={`Step ${stepNumber} Translation`}
      >
        <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Original (English)</p>
                <p className="text-slate-800">{instruction}</p>
            </div>
            
            <div className="flex justify-center">
                <div className="bg-blue-50 text-blue-600 rounded-full p-2">
                    <Languages className="h-5 w-5" />
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                        {workerLanguage === 'am' ? '🇪🇹 Amharic' : 
                         workerLanguage === 'ar' ? '🇸🇦 Arabic' :
                         workerLanguage === 'ru' ? '🇷🇺 Russian' : 'Translated'}
                    </p>
                    <div className="flex gap-1">
                        <button onClick={() => handleLanguageChange('am')} className={`text-xs px-2 py-1 rounded transition-all ${workerLanguage === 'am' ? 'bg-white shadow-sm scale-110 font-bold' : 'opacity-50 hover:opacity-100'}`}>🇪🇹</button>
                        <button onClick={() => handleLanguageChange('ar')} className={`text-xs px-2 py-1 rounded transition-all ${workerLanguage === 'ar' ? 'bg-white shadow-sm scale-110 font-bold' : 'opacity-50 hover:opacity-100'}`}>🇸🇦</button>
                        <button onClick={() => handleLanguageChange('ru')} className={`text-xs px-2 py-1 rounded transition-all ${workerLanguage === 'ru' ? 'bg-white shadow-sm scale-110 font-bold' : 'opacity-50 hover:opacity-100'}`}>🇷🇺</button>
                    </div>
                </div>
                
                {isPending ? (
                    <div className="flex items-center justify-center py-4 text-blue-600">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" /> 
                        {MULTILINGUAL_PHRASES[workerLanguage]?.thinking || 'Translating...'}
                    </div>
                ) : (
                    <p className="text-lg font-medium text-slate-900 leading-relaxed" dir={workerLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {data ?? "Translation unavailable."}
                    </p>
                )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button 
                    variant={isSpeaking ? "default" : "outline"} 
                    size="sm" 
                    onClick={handleSpeak} 
                    disabled={isPending || !data}
                    className={isSpeaking ? "bg-blue-100 text-blue-700 border-blue-200 animate-pulse" : ""}
                >
                    <Volume2 className={`h-4 w-4 mr-1 ${isSpeaking ? "animate-bounce" : ""}`} /> 
                    {isSpeaking ? "Speaking..." : "Read Aloud"}
                </Button>
                <Button size="sm" onClick={() => setShowTranslation(false)} className="bg-green-600 hover:bg-green-700">
                    <Check className="h-4 w-4 mr-1" /> Got it
                </Button>
            </div>
        </div>
      </Modal>
    </>
  );
}
