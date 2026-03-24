import React, { useState, FormEvent } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { useQC } from '../../hooks/useQC';
import { useProduction } from '../../hooks/useProduction';
import { QCResult, ProductionBatch } from '../../types';

interface QCInspectionFormProps {
  onSuccess?: () => void;
}

const DEFECT_TYPES = [
  'Discoloration',
  'Cracks',
  'Air bubbles',
  'Uneven coating',
  'Wrong size',
  'Contamination',
  'Melting',
  'Blooming',
  'Surface Scuffs',
  'Misshapen',
  'Other',
];

const QCInspectionForm: React.FC<QCInspectionFormProps> = ({ onSuccess }) => {
  const { useCreateQCCheck } = useQC();
  const { useBatches } = useProduction();
  const createQCMutation = useCreateQCCheck();
  
  // Fetch all batches regardless of status for exhaustive selection
  const { data: batchesData } = useBatches({}); 
  const batches: ProductionBatch[] = batchesData?.batches ?? [];

  const [formData, setFormData] = useState<{
    batchId: string;
    appearanceScore: number;
    textureScore: number;
    tasteScore: number;
    temperature: string;
    humidity: string;
    defectCount: string;
    defectTypes: string[];
    result: QCResult;
    notes: string;
  }>({
    batchId: '',
    appearanceScore: 3,
    textureScore: 3,
    tasteScore: 3,
    temperature: '',
    humidity: '',
    defectCount: '0',
    defectTypes: [],
    result: 'approved',
    notes: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.batchId.trim()) {
      setValidationError('Batch selection is required');
      return;
    }

    if (
      formData.appearanceScore < 1 ||
      formData.appearanceScore > 3 ||
      formData.textureScore < 1 ||
      formData.textureScore > 3 ||
      formData.tasteScore < 1 ||
      formData.tasteScore > 3
    ) {
      setValidationError('All scores must be between 1 and 3');
      return;
    }

    const defectCount = parseInt(formData.defectCount, 10);
    if (isNaN(defectCount) || defectCount < 0) {
      setValidationError('Defect count must be a positive number');
      return;
    }

    createQCMutation.mutate(
      {
        batchId: formData.batchId,
        appearance_score: formData.appearanceScore,
        texture_score: formData.textureScore,
        taste_score: formData.tasteScore,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        humidity: formData.humidity ? parseFloat(formData.humidity) : undefined,
        defect_count: defectCount,
        defects: formData.defectTypes.map(t => ({ 
          defect_type: t, 
          severity: 'minor',
          quantity: 1
        })),
        result: formData.result,
        notes: formData.notes,
      },
      {
        onSuccess: () => {
          setFormData({
            batchId: '',
            appearanceScore: 3,
            textureScore: 3,
            tasteScore: 3,
            temperature: '',
            humidity: '',
            defectCount: '0',
            defectTypes: [],
            result: 'approved',
            notes: '',
          });
          onSuccess?.();
        },
      }
    );
  };

  const handleScoreChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDefectType = (defectType: string) => {
    setFormData((prev) => ({
      ...prev,
      defectTypes: prev.defectTypes.includes(defectType)
        ? prev.defectTypes.filter((d) => d !== defectType)
        : [...prev.defectTypes, defectType],
    }));
  };

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="space-y-4">
      <label className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform active:scale-90"
            disabled={createQCMutation.isPending}
          >
            <Star
              className={`w-6 h-6 transition-all duration-300 ${
                star <= value
                  ? 'text-cyan-500 fill-cyan-500'
                  : 'text-cyan-100 fill-cyan-50/50 hover:text-cyan-200'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xl font-black text-cyan-900 font-mono">
          {value}/3
        </span>
      </div>
    </div>
  );

  return (
    <div className="text-black">
      {createQCMutation.isSuccess && (
        <Alert variant="success" className="mb-6 bg-green-50 border-green-200 text-green-800">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-1">Audit Logged</h4>
          <p className="text-sm">The inspection result has been officially recorded in the ledger.</p>
        </Alert>
      )}

      {(createQCMutation.error ?? validationError) && (
        <Alert variant="error" className="mb-6 bg-red-50 border-red-200 text-red-800">
          <h4 className="font-bold uppercase text-xs tracking-widest mb-1">System Exception</h4>
          <p className="text-sm">{validationError ?? (createQCMutation.error instanceof Error ? createQCMutation.error.message : 'Failed to process audit data')}</p>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label
              htmlFor="batchId"
              className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest"
            >
              Production Batch Reference *
            </label>
            <select
              id="batchId"
              value={formData.batchId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, batchId: e.target.value }))
              }
              className="w-full h-12 px-4 bg-cyan-50/50 border-2 border-cyan-100 rounded-xl focus:border-cyan-400 focus:outline-none text-cyan-900 font-bold appearance-none transition-colors"
              disabled={createQCMutation.isPending}
            >
              <option value="">Select a batch...</option>
              {batches.map((batch: ProductionBatch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_number || batch.id.slice(0, 8)} | {batch.recipe_name} | {batch.target_quantity} units | Status: {batch.status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
             <label
              htmlFor="defectCount"
              className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest"
            >
              Quantified Defects
            </label>
             <Input
              id="defectCount"
              type="number"
              min="0"
              placeholder="0"
              value={formData.defectCount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, defectCount: e.target.value }))
              }
              className="bg-cyan-50/50 border-2 border-cyan-100 text-cyan-900 font-bold focus:border-cyan-400 rounded-xl h-12"
              disabled={createQCMutation.isPending}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-cyan-50/30 rounded-2xl border-2 border-cyan-50">
          <StarRating
            label="Visual Integrity"
            value={formData.appearanceScore}
            onChange={(value) => handleScoreChange('appearanceScore', value)}
          />
          <StarRating
            label="Structural Texture"
            value={formData.textureScore}
            onChange={(value) => handleScoreChange('textureScore', value)}
          />
          <StarRating
            label="Sensory Profile"
            value={formData.tasteScore}
            onChange={(value) => handleScoreChange('tasteScore', value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">Temperature Reference (°C)</label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              placeholder="00.0"
              value={formData.temperature}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, temperature: e.target.value }))
              }
              className="bg-cyan-50/50 border-2 border-cyan-100 text-cyan-900 font-bold focus:border-cyan-400 rounded-xl h-12"
              disabled={createQCMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">Relative Humidity (%)</label>
            <Input
              id="humidity"
              type="number"
              step="0.1"
              placeholder="00.0"
              value={formData.humidity}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, humidity: e.target.value }))
              }
              className="bg-cyan-50/50 border-2 border-cyan-100 text-cyan-900 font-bold focus:border-cyan-400 rounded-xl h-12"
              disabled={createQCMutation.isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest mb-4">
            Defect Classification
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFECT_TYPES.map((defectType) => (
              <button
                key={defectType}
                type="button"
                onClick={() => toggleDefectType(defectType)}
                className={`px-4 py-2 rounded-lg border-2 text-[11px] font-bold transition-all ${
                  formData.defectTypes.includes(defectType)
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-cyan-100 text-cyan-700 hover:border-cyan-200'
                }`}
                disabled={createQCMutation.isPending}
              >
                {defectType}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest mb-6">
            Official Quality Verdict *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { value: 'approved', label: 'Approved', color: 'green' },
              { value: 'rejected', label: 'Rejected', color: 'red' },
              { value: 'quarantine', label: 'Quarantine', color: 'amber' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, result: option.value as QCResult }))
                }
                className={`h-24 rounded-2xl border-2 transition-all flex items-center justify-center font-black uppercase tracking-widest text-xs ${
                  formData.result === option.value
                    ? `bg-${option.color}-50 border-${option.color}-200 text-${option.color}-700 shadow-sm scale-[1.02]`
                    : 'bg-white border-cyan-50 text-cyan-900 opacity-40 hover:opacity-100'
                }`}
                disabled={createQCMutation.isPending}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="notes"
            className="block text-[10px] font-black text-cyan-800/40 uppercase tracking-widest"
          >
            Inspector Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            placeholder="Analytical observations..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-4 py-3 bg-cyan-50/50 border-2 border-cyan-100 rounded-xl focus:border-cyan-400 focus:outline-none text-cyan-900 font-bold transition-all resize-none"
            disabled={createQCMutation.isPending}
          />
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            variant="default"
            size="lg"
            isLoading={createQCMutation.isPending}
            disabled={createQCMutation.isPending}
            className="w-full h-16 text-lg font-black tracking-widest uppercase bg-cyan-900 text-white hover:bg-black transition-all rounded-2xl shadow-md active:scale-[0.98]"
          >
            {createQCMutation.isPending ? 'Processing Audit...' : 'Commit Audit to Registry'}
          </Button>
          <p className="text-center text-[9px] font-black text-cyan-950/20 uppercase tracking-[0.4em] mt-4">
            Institutional Quality Protocol • Authorized Personnel Only
          </p>
        </div>
      </form>
    </div>
  );
};

export default QCInspectionForm;
