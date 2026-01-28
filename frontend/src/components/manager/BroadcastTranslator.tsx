import { useState } from 'react';
import { useBatchTranslate } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Loader2, Mic, Languages } from 'lucide-react';
import { toast } from 'sonner';

export function BroadcastTranslator() {
  const [instructions, setInstructions] = useState('');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['ar', 'am', 'ru']);
  const { mutateAsync: translateAsync, isPending, data } = useBatchTranslate();

  const handleBroadcast = async () => {
    if (!instructions.trim()) {
      toast.error("Please enter instructions first");
      return;
    }

    try {
        toast.info(`Broadcasting to ${targetLanguages.length} teams...`);
        
        const promises = targetLanguages.map(lang => 
            translateAsync({
                texts: [instructions],
                targetLanguage: lang,
                context: { domain: 'instruction' }
            }).then(res => {
                toast.success(`Sent to ${lang.toUpperCase()} team: ${res.translations[0].substring(0, 20)}...`);
                return res;
            })
        );

        await Promise.all(promises);
    } catch (error) {
        toast.error("Some broadcasts failed. Check console.");
    }
  };

  const toggleLanguage = (lang: string) => {
    setTargetLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  return (
    <Card className="border-cocoa-100 bg-white">
      <CardHeader className="pb-3 border-b border-cocoa-50">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-cocoa-900">
          <Languages className="h-5 w-5 text-gold-600" />
          Broadcast Shift Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="relative">
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write instructions in Hebrew or English (e.g., 'Check cocoa powder inventory')..."
            className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none text-sm"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-2 bottom-2 text-slate-400 hover:text-gold-600"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Broadcast To:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { code: 'ar', label: '🇸🇦 Arabic' },
              { code: 'he', label: '🇮🇱 Hebrew' },
              { code: 'am', label: '🇪🇹 Amharic' },
              { code: 'ru', label: '🇷🇺 Russian' },
              { code: 'uk', label: '🇺🇦 Ukrainian' }
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  targetLanguages.includes(lang.code)
                    ? 'bg-gold-50 border-gold-200 text-gold-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang.label} {targetLanguages.includes(lang.code) && '✓'}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleBroadcast} 
          disabled={isPending || !instructions.trim() || targetLanguages.length === 0}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 me-2 animate-spin" /> Translating & Sending...
            </>
          ) : (
            '📢 Broadcast to All Workers'
          )}
        </Button>

        {data && targetLanguages.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 animate-fade-in">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Live Preview ({targetLanguages[0].toUpperCase()}):
            </p>
            <p dir="auto" className="text-sm font-medium text-slate-800">
              {data.translations[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
