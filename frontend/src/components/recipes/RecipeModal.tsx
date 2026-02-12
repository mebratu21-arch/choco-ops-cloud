import React, { useState } from 'react';
import { X, Scale, ChefHat, Clock } from 'lucide-react';
import { Recipe, RecipeIngredient } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useProduction } from '../../hooks/useProduction';
import { toast } from 'sonner';

interface RecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ recipe: initialRecipe, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [isStarting, setIsStarting] = useState(false);
  const { useCreateBatch, useRecipe } = useProduction();
  const createBatchMutation = useCreateBatch();

  const { data: fullRecipe, isLoading: isRecipeLoading } = useRecipe(initialRecipe?.id ?? '');
  const recipe = fullRecipe ?? initialRecipe;

  if (!isOpen || !initialRecipe) return null;

  const handleStartProduction = async () => {
    if (!recipe) return;

    setIsStarting(true);
    try {
      await createBatchMutation.mutateAsync({
        recipeId: recipe.id,
        targetQuantity: recipe.batch_size ?? recipe.yield_quantity ?? 1,
        notes: `Started from recipe: ${recipe.name}`
      });
      toast.success('Production batch started successfully!');
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string; error?: { message?: string } };
      console.error(' [DEBUG] Batch start mutation failed:', err);
      // Extract the most meaningful error message from the structured response
      const errorMessage = err?.message ?? err?.error?.message ?? (typeof error === 'string' ? error : 'Failed to start batch. Please check ingredient availability.');
      console.log(' [DEBUG] Resolved error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsStarting(false);
    }
  };

  const ingredients = recipe?.ingredients ?? [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 pb-2 relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-3xl font-bold font-serif text-[#5d200b] mb-1">{recipe?.name}</h2>
              <p className="text-[#a16207]/80 text-sm font-medium">
                {recipe?.description ?? 'Cat tongues dipped in chocolate, toasted coconut and pistachio'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#fde68a] px-6">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`py-4 px-8 font-bold text-sm tracking-wider transition-colors relative ${
                  activeTab === 'ingredients' 
                    ? 'text-[#78350f]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                INGREDIENTS
                {activeTab === 'ingredients' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#d97706] rounded-t-full" 
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`py-4 px-8 font-bold text-sm tracking-wider transition-colors relative ${
                  activeTab === 'instructions' 
                    ? 'text-[#78350f]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                INSTRUCTIONS
                {activeTab === 'instructions' && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#d97706] rounded-t-full" 
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#fffbeb]/30">
              {activeTab === 'ingredients' ? (
                <div className="space-y-3">
                  {isRecipeLoading ? (
                    <div className="flex flex-col gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full animate-pulse bg-white/50 rounded-xl border border-[#fef3c7]" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {ingredients.map((ing: RecipeIngredient, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between p-4 bg-white border border-[#fef3c7] rounded-xl shadow-sm hover:border-[#fcd34d] transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-[#5d200b]">{ing.ingredient_name}</span>
                            <span className="text-[10px] text-[#92400e]/60 font-mono italic">
                              {ing.ingredient_id ? 'Warehouse Material' : 'Custom Entry'}
                            </span>
                          </div>
                          <span className="bg-[#fef3c7] text-[#92400e] px-3 py-1 rounded-lg text-sm font-bold font-mono">
                            {ing.quantity} {ing.unit}
                          </span>
                        </motion.div>
                      ))}
                      {ingredients.length === 0 && (
                        <div className="text-center py-12 text-gray-400 italic text-sm">
                          No ingredients discovered in this formulation.
                        </div>
                      )}
                    </>
                  )}
                  {ingredients.length > 0 && !isRecipeLoading && (
                    <div className="mt-8 p-4 bg-[#fff7ed] rounded-xl border border-[#fed7aa] flex items-center gap-3 text-[#9a3412]">
                       <Scale className="w-5 h-5" />
                       <p className="text-sm font-medium">Standard Formulation Load: <span className="font-bold">{ingredients.reduce((acc: number, ing: RecipeIngredient) => acc + (ing.quantity ?? 0), 0).toFixed(4)} {ingredients[0]?.unit ?? ''}</span></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {recipe?.instructions ? (
                     (Array.isArray(recipe.instructions) ? recipe.instructions : recipe.instructions.split('\n')).map((step, idx) => (
                        <motion.div 
                           key={idx}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: idx * 0.1 }}
                           className="flex gap-4"
                        >
                           <div className="w-8 h-8 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-bold text-sm shrink-0 border border-[#fde68a]">
                              {idx + 1}
                           </div>
                           <p className="pt-1 text-[#4b5563] leading-relaxed font-medium">
                              {step.replace(/^\d+\.\s*/, '')}
                           </p>
                        </motion.div>
                     ))
                  ) : (
                     <div className="text-center py-12 text-gray-400">
                        <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No instructions available for this recipe.</p>
                     </div>
                  )}
                  
                  <div className="mt-8 flex items-center gap-2 text-sm text-[#d97706] font-medium p-4 bg-white rounded-xl border border-[#fde68a]">
                     <Clock className="w-4 h-4" />
                     <span>Estimated Time: {recipe?.duration_minutes ?? 45} mins</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            <div className="p-4 border-t border-[#fde68a] bg-[#fffbeb] flex justify-end gap-3">
               <button
                 onClick={onClose}
                 disabled={isStarting}
                 className="px-6 py-2.5 font-bold text-[#92400e] hover:bg-[#fef3c7] rounded-xl transition-colors disabled:opacity-50"
               >
                  Cancel
               </button>
               <button
                 onClick={() => { void handleStartProduction(); }}
                 disabled={isStarting}
                 className="px-6 py-2.5 font-bold text-white bg-[#d97706] hover:bg-[#b45309] rounded-xl shadow-sm transition-colors shadow-[#fbbf24]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Production'
                  )}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RecipeModal;
