import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Recipe } from '../../types';
import { IngredientCheckItem } from '../../services/productionService';
import { useProduction } from '../../hooks/useProduction';
import { toast } from 'sonner';
import { Modal } from '../common/Modal';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StartBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

const StartBatchModal: React.FC<StartBatchModalProps> = ({ isOpen, onClose, recipe }) => {
  const { useCreateBatch, useCheckIngredients } = useProduction();
  const createBatchMutation = useCreateBatch();
  const checkIngredientsMutation = useCheckIngredients();

  // Use batch_size if available, otherwise fall back to yield_quantity
  const defaultQuantity = recipe.batch_size ?? recipe.yield_quantity ?? 1;
  const defaultUnit = recipe.batch_unit ?? recipe.yield_unit ?? 'kg';
  const [quantity, setQuantity] = useState<string>(defaultQuantity.toString());
  const [notes, setNotes] = useState('');
  const [ingredientsStatus, setIngredientsStatus] = useState<'idle' | 'checking' | 'available' | 'missing'>('idle');
  const [missingIngredients, setMissingIngredients] = useState<IngredientCheckItem[]>([]);

  const handleQuantityChange = async (val: string) => {
    setQuantity(val);
    if (!val || parseFloat(val) <= 0) {
      setIngredientsStatus('idle');
      return;
    }
    
    // Debounce check ingredients
    setIngredientsStatus('checking');
    try {
      const result = await checkIngredientsMutation.mutateAsync({
        recipeId: recipe.id,
        quantity: parseFloat(val)
      });
      
      if (result.available) {
        setIngredientsStatus('available');
        setMissingIngredients([]);
      } else {
        setIngredientsStatus('missing');
        setMissingIngredients(result.missing ?? []);
      }
    } catch (error: unknown) {
      console.error('Failed to check ingredients', error);
      setIngredientsStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyValue = parseFloat(quantity);
    if (!quantity || isNaN(qtyValue) || qtyValue <= 0) {
      toast.error('Invalid quantity');
      return;
    }

    if (ingredientsStatus === 'missing') {
      toast.error('Cannot start batch: missing ingredients');
      return;
    }

    try {
      await createBatchMutation.mutateAsync({
        recipeId: recipe.id,
        targetQuantity: qtyValue,
        notes: notes
      });
      toast.success('Production batch started successfully');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start batch';
      toast.error(errorMessage);
      console.error('[StartBatchModal] Submit error:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Production Batch`}
      description={`Recipe: ${recipe.name}`}
      size="md"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-chocolate-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <form 
        onSubmit={(e) => { void handleSubmit(e); }} 
        className="space-y-6 relative z-10"
      >
        <div className="bg-chocolate-50/50 p-4 rounded-2xl border border-chocolate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.2em] mb-1">Standard Batch Size</p>
            <p className="text-lg font-black text-chocolate-900">{defaultQuantity} <span className="text-sm text-chocolate-500 uppercase">{defaultUnit}</span></p>
          </div>
          <div className="h-10 w-[1px] bg-chocolate-200" />
          <div className="text-right">
            <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-[0.2em] mb-1">Estimated Yield</p>
            <p className="text-lg font-black text-gold-600">{quantity || '0'} <span className="text-sm uppercase">{defaultUnit}</span></p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-chocolate-900 uppercase tracking-[0.2em] mb-2 pl-1">
            Batch Quantity
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => { void handleQuantityChange(e.target.value); }}
              className="w-full bg-white border-2 border-chocolate-100 rounded-xl px-4 py-3 font-bold text-chocolate-900 focus:outline-none focus:border-gold-500 transition-all"
              placeholder="Enter quantity..."
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-chocolate-100 rounded text-[10px] font-black text-chocolate-600 uppercase">
              {defaultUnit}
            </div>
          </div>
        </div>

        {/* Ingredient Status */}
        <AnimatePresence>
          {quantity && parseFloat(quantity) > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all duration-300 ${
                ingredientsStatus === 'checking' ? 'bg-white border-chocolate-100 shadow-sm' :
                ingredientsStatus === 'available' ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100/20 shadow-lg' :
                ingredientsStatus === 'missing' ? 'bg-red-50 border-red-200 shadow-red-100/20 shadow-lg' :
                'bg-white border-chocolate-100 shadow-sm'
              }`}
            >
              <div className="mt-1">
                {ingredientsStatus === 'checking' && <div className="h-5 w-5 border-2 border-chocolate-300 border-t-chocolate-600 rounded-full animate-spin" />}
                {ingredientsStatus === 'available' && <div className="p-1 bg-emerald-500 rounded-full"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
                {ingredientsStatus === 'missing' && <div className="p-1 bg-red-500 rounded-full"><XCircle className="w-4 h-4 text-white" /></div>}
                {ingredientsStatus === 'idle' && <AlertCircle className="w-6 h-6 text-chocolate-300" />}
              </div>

              <div className="flex-1">
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  ingredientsStatus === 'available' ? 'text-emerald-700' :
                  ingredientsStatus === 'missing' ? 'text-red-700' :
                  'text-chocolate-600'
                }`}>
                  {ingredientsStatus === 'checking' ? 'Validating Stock...' :
                   ingredientsStatus === 'available' ? 'Inventory Clearance Verified' :
                   ingredientsStatus === 'missing' ? 'Stock Level Critical' :
                   'Stock Validation Required'}
                </h4>
                
                <p className="text-[11px] font-bold text-chocolate-400 mt-1">
                  {ingredientsStatus === 'checking' ? 'Analyzing ingredient requirements against real-time warehouse data.' :
                   ingredientsStatus === 'available' ? 'All required ingredients are present in the central boutique inventory.' :
                   ingredientsStatus === 'missing' ? 'Additional resources are required to proceed with this batch volume.' :
                   'Adjust quantity to trigger automatic ingredient availability check.'}
                </p>
                
                {ingredientsStatus === 'missing' && missingIngredients.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {missingIngredients.map((ing, i) => (
                      <span key={i} className="px-2 py-1 bg-white/50 border border-red-100 rounded-lg text-[10px] font-bold text-red-600 uppercase tracking-tighter">
                        Missing: {ing.name} ({Math.ceil(ing.required - (ing.available ?? 0))} {ing.unit ?? 'units'} short)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-[11px] font-black text-chocolate-900 uppercase tracking-[0.2em] mb-2 pl-1">
            Production Notes
          </label>
          <textarea
            className="w-full bg-white border-2 border-chocolate-100 rounded-xl px-4 py-3 font-bold text-chocolate-900 focus:outline-none focus:border-gold-500 transition-all resize-none"
            placeholder="Assign shift ID, machine number, or special tempering notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-chocolate-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-chocolate-400 hover:text-chocolate-600 transition-colors"
          >
            Abort
          </button>
          <button 
            type="submit" 
            disabled={ingredientsStatus === 'missing' || ingredientsStatus === 'checking' || createBatchMutation.isPending}
            className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
              ingredientsStatus === 'available' 
              ? 'bg-chocolate-900 text-white shadow-chocolate-950/20 hover:scale-[1.02] active:scale-95' 
              : 'bg-chocolate-100 text-chocolate-400 cursor-not-allowed'
            }`}
          >
            {createBatchMutation.isPending ? 'Processing...' : 'Initiate Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StartBatchModal;
