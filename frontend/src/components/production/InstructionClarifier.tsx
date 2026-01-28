import { useState } from 'react';
import { useTranslate } from '../../services/aiService';
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

  const handleExplain = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!data && !isPending) {
      translate({
        text: instruction,
        targetLanguage: workerLanguage,
        context: { domain: 'recipe' }
      }, {
        onSuccess: () => setShowTranslation(true)
      });
    } else {
        setShowTranslation(true);
    }
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
                        {workerLanguage === 'am' ? '🇪🇹 Amharic' : 'Translated'}
                    </p>
                    <div className="flex gap-1">
                        <button onClick={() => setWorkerLanguage('am')} className={`text-xs px-2 py-1 rounded ${workerLanguage === 'am' ? 'bg-white shadow-sm' : 'opacity-50'}`}>🇪🇹</button>
                        <button onClick={() => setWorkerLanguage('ar')} className={`text-xs px-2 py-1 rounded ${workerLanguage === 'ar' ? 'bg-white shadow-sm' : 'opacity-50'}`}>🇸🇦</button>
                        <button onClick={() => setWorkerLanguage('ru')} className={`text-xs px-2 py-1 rounded ${workerLanguage === 'ru' ? 'bg-white shadow-sm' : 'opacity-50'}`}>🇷🇺</button>
                    </div>
                </div>
                
                {isPending ? (
                    <div className="flex items-center justify-center py-4 text-blue-600">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Translating...
                    </div>
                ) : (
                    <p className="text-lg font-medium text-slate-900 leading-relaxed">
                        {data || "Translation unavailable."}
                    </p>
                )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowTranslation(false)} disabled={isPending}>
                    <Volume2 className="h-4 w-4 mr-1" /> Read Aloud
                </Button>
                <Button size="sm" onClick={() => setShowTranslation(false)} className="bg-green-600 hover:bg-green-700" disabled={isPending}>
                    <Check className="h-4 w-4 mr-1" /> Got it
                </Button>
            </div>
        </div>
      </Modal>
    </>
  );
}
