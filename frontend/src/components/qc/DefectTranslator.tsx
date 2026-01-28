import { useState } from 'react';
import { useTranslate } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Loader2, Copy, FileText } from 'lucide-react';

interface DefectTranslatorProps {
  defectDescription: string;
  defectId: string;
  managerLanguage?: string;
}

const LANGUAGE_INFO: Record<string, { name: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  he: { name: 'Hebrew', flag: '🇮🇱', dir: 'rtl' },
  ar: { name: 'Arabic', flag: '🇸🇦', dir: 'rtl' },
  en: { name: 'English', flag: '🇬🇧', dir: 'ltr' },
  ru: { name: 'Russian', flag: '🇷🇺', dir: 'ltr' },
  fr: { name: 'French', flag: '🇫🇷', dir: 'ltr' },
};

export function DefectTranslator({ 
  defectDescription, 
  defectId,
  managerLanguage = 'he' // Default to Hebrew for Israeli managers
}: DefectTranslatorProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const { mutate: translate, isPending, data } = useTranslate();

  const langInfo = LANGUAGE_INFO[managerLanguage] || LANGUAGE_INFO.en;

  const handleTranslate = () => {
    if (!showTranslation) {
      translate({
        text: defectDescription,
        targetLanguage: managerLanguage,
        context: { domain: 'general' }
      }, {
        onSuccess: () => setShowTranslation(true)
      });
    } else {
      setShowTranslation(false);
    }
  };

  const handleCopy = () => {
    if (data) {
      navigator.clipboard.writeText(data);
      alert('Translation copied to clipboard!');
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      {/* Defect ID */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500">
          Defect #{defectId}
        </span>
        <Button
          onClick={handleTranslate}
          variant="outline"
          size="sm"
          disabled={isPending}
          className="gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Translating...
            </>
          ) : showTranslation ? (
            <>
              <span>🔄</span>
              Show Original
            </>
          ) : (
            <>
              <span>🌐</span>
              Translate to {langInfo.name}
            </>
          )}
        </Button>
      </div>

      {/* Original Description */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-600 mb-1">
          Original (EN):
        </p>
        <p className="text-sm text-slate-800 leading-relaxed">
          {defectDescription}
        </p>
      </div>

      {/* Translated Description */}
      {showTranslation && data && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-blue-600">
              {langInfo.flag} {langInfo.name}: ✓ Translated
            </p>
            <div className="flex gap-1">
              <button
                onClick={handleCopy}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Copy translation"
              >
                <Copy className="w-3 h-3 text-blue-600" />
              </button>
              <button
                onClick={() => alert('Export coming soon!')}
                className="p-1 hover:bg-blue-100 rounded transition-colors"
                title="Export report"
              >
                <FileText className="w-3 h-3 text-blue-600" />
              </button>
            </div>
          </div>
          <p 
            className="text-base text-slate-800 leading-relaxed font-medium" 
            dir={langInfo.dir}
          >
            {data}
          </p>
        </div>
      )}

      {/* Severity Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded">
          HIGH PRIORITY
        </span>
        <span className="text-xs text-slate-500">
          Requires immediate attention
        </span>
      </div>
    </div>
  );
}
