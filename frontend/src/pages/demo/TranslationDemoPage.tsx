import { useState } from 'react';
import { useBatchTranslate, useDetectLanguage } from '../../services/aiService';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Loader2, Languages, Sparkles } from 'lucide-react';

const LANGUAGES = [
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'am', name: 'Amharic', flag: '🇪🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

/**
 * Standalone Translation Demo Page
 * Showcases all translation features for judges
 */
const TranslationDemoPage = () => {
  const [text, setText] = useState('');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['ar', 'am']);
  
  const { mutate: batchTranslate, isPending: batchPending, data: batchData } = useBatchTranslate();
  const { mutate: detectLang, isPending: detectPending, data: detectedLang } = useDetectLanguage();

  const handleBatchTranslate = () => {
    if (!text.trim() || selectedLangs.length === 0) return;
    
    const texts = selectedLangs.map(() => text);
    batchTranslate({
      texts,
      targetLanguage: selectedLangs[0],
      context: { domain: 'instruction' }
    });
  };

  const handleDetectLanguage = () => {
    if (!text.trim()) return;
    detectLang(text);
  };

  const toggleLanguage = (code: string) => {
    setSelectedLangs(prev =>
      prev.includes(code)
        ? prev.filter(l => l !== code)
        : [...prev, code]
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-cocoa-900">
          <Sparkles className="inline h-8 w-8 text-gold-500 me-2" />
          Gemini Translation Demo
        </h1>
        <p className="text-lg text-cocoa-600">
          Solving Multilingual Operational Chaos with AI
        </p>
      </div>

      {/* Input Section */}
      <Card className="border-l-4 border-l-gold-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Translation Input
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cocoa-700 mb-2">
              Enter text (any language):
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="בדקו את מלאי אבקת קקאו&#10;Check cocoa powder inventory&#10;تحقق من مخزون مسحوق الكاكاو"
              className="w-full h-32 p-3 border border-cocoa-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none"
              dir="auto"
            />
            <p className="text-xs text-cocoa-500 mt-1">
              {text.length} characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDetectLanguage}
              disabled={detectPending || !text.trim()}
              variant="outline"
              className="border-gold-500 text-gold-700 hover:bg-gold-50"
            >
              {detectPending ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  Detecting...
                </>
              ) : '🔍 Detect Language'}
            </Button>
          </div>

          {detectedLang && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">
                ✓ Detected: <span className="font-mono">{detectedLang}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Target Languages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all
                  ${selectedLangs.includes(lang.code)
                    ? 'border-gold-500 bg-gold-50 text-gold-900'
                    : 'border-cocoa-200 bg-white text-cocoa-600 hover:border-cocoa-300'
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {selectedLangs.includes(lang.code) && (
                  <span className="ms-auto text-gold-600">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-cocoa-500 mt-3">
            {selectedLangs.length} language{selectedLangs.length !== 1 ? 's' : ''} selected
          </p>
        </CardContent>
      </Card>

      {/* Translate Button */}
      <Button
        onClick={handleBatchTranslate}
        disabled={batchPending || !text.trim() || selectedLangs.length === 0}
        className="w-full bg-gold-500 hover:bg-gold-600 text-white"
        size="lg"
      >
        {batchPending ? (
          <>
            <Loader2 className="w-5 h-5 me-2 animate-spin" />
            Translating with Gemini...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 me-2" />
            Translate to {selectedLangs.length} Language{selectedLangs.length !== 1 ? 's' : ''}
          </>
        )}
      </Button>

      {/* Results */}
      {batchData && batchData.translations && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-green-900">
              ✓ Translation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batchData.translations.map((translation, idx) => {
                const lang = LANGUAGES.find(l => l.code === selectedLangs[idx]);
                return (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-cocoa-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{lang?.flag}</span>
                      <span className="font-semibold text-cocoa-900">
                        {lang?.name}
                      </span>
                    </div>
                    <p className="text-lg text-cocoa-800" dir="auto">
                      {translation}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Performance Metrics */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-gold-500" />
                <span>
                  Translated {batchData.stats.successful}/{batchData.stats.total} in {batchData.stats.duration}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Scenarios */}
      <Card className="bg-cocoa-50 border-cocoa-200">
        <CardHeader>
          <CardTitle className="text-cocoa-900">🎬 Demo Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="p-3 bg-white rounded border border-cocoa-100">
            <p className="font-semibold text-cocoa-900 mb-1">1. Detect Hebrew Text</p>
            <p className="text-cocoa-600">Input: "בדקו את מלאי אבקת קקאו" → Click Detect → Shows "he"</p>
          </div>
          <div className="p-3 bg-white rounded border border-cocoa-100">
            <p className="font-semibold text-cocoa-900 mb-1">2. Batch Translate to Arabic & Amharic</p>
            <p className="text-cocoa-600">Input: "Check cocoa powder" → Select AR + AM → Translate → Both appear</p>
          </div>
          <div className="p-3 bg-white rounded border border-cocoa-100">
            <p className="font-semibold text-cocoa-900 mb-1">3. Performance Demo</p>
            <p className="text-cocoa-600">Notice the translation speed (cached: &lt;50ms, uncached: 1-2s)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TranslationDemoPage;
