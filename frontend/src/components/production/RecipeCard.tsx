import { useState } from 'react';
import { Recipe } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../common/Modal';
import { InstructionClarifier } from './InstructionClarifier';
import { AlertCircle, Factory } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../../services/productionService';
import { toast } from 'sonner';

import { Eye, Edit2 } from 'lucide-react';

interface RecipeCardProps {
    recipe: Recipe;
    onClick?: () => void;
    onEdit?: () => void;
}

const RecipeCard = ({ recipe, onClick, onEdit }: RecipeCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(recipe.batch_size ?? recipe.yield_quantity ?? 1);
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const produceMutation = useMutation({
        mutationFn: (request: { recipeId: string; targetQuantity: number; notes?: string }) => productionService.createBatch(request),
        onSuccess: (data) => {
            toast.success(`Batch #${data.batch_number ?? data.id.slice(0, 8)} started successfully!`);
            setIsModalOpen(false);
            setQuantity(recipe.batch_size ?? 1);
            setNotes('');
            void queryClient.invalidateQueries({ queryKey: ['batches'] });
            void queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
        onError: (error: unknown) => {
            const errorMessage = (error as Error)?.message ?? 'Failed to start batch';
            toast.error(errorMessage);
            console.error('[RecipeCard] Mutation error:', error);
        }
    });

    const handleProduce = (e: React.MouseEvent) => {
        e.stopPropagation();
        produceMutation.mutate({
            recipeId: recipe.id,
            targetQuantity: quantity,
            notes: notes || undefined
        });
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    const handleProduceModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsModalOpen(true);
    };

    return (
        <>
            <Card 
                className="hover:shadow-xl transition-all cursor-pointer border-cocoa-100 group relative overflow-hidden"
                onClick={onClick}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-400/10 transition-colors" />
                
                <CardHeader className="pb-3 relative z-10">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-black text-chocolate-900 leading-tight pr-4 uppercase tracking-tight">
                            {recipe.name}
                        </CardTitle>
                        {onEdit && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleEdit}
                                className="h-8 w-8 rounded-lg text-chocolate-400 hover:text-gold-600 hover:bg-gold-50 transition-colors"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {recipe.code && (
                        <div className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest mt-1">
                            Ref: {recipe.code}
                        </div>
                    )}
                </CardHeader>
                
                <CardContent className="space-y-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-chocolate-50 px-3 py-1.5 rounded-lg">
                            <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-wide">Standard Size</p>
                            <p className="text-sm font-bold text-chocolate-900">{recipe.yield_quantity || recipe.batch_size} {recipe.yield_unit || recipe.batch_unit}</p>
                        </div>
                        {(recipe.difficulty_level || (recipe as any).difficulty) && (
                            <div className="bg-chocolate-50 px-3 py-1.5 rounded-lg">
                                <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-wide">Difficulty</p>
                                <p className="text-sm font-bold text-chocolate-900 capitalize">{recipe.difficulty_level || (recipe as any).difficulty}</p>
                            </div>
                        )}
                    </div>

                    {recipe.description && (
                        <div className="text-xs text-chocolate-500 line-clamp-2 italic font-medium leading-relaxed">
                            {recipe.description}
                        </div>
                    )}
                    
                    {/* Instructions Preview */}
                    {recipe.instructions && (
                        <div className="mt-4 space-y-2 border-t border-chocolate-100/50 pt-4">
                             <p className="text-[10px] font-black text-chocolate-400 uppercase tracking-widest">Recipe Workflow</p>
                             <ul className="space-y-2">
                                {(Array.isArray(recipe.instructions) ? recipe.instructions : (recipe.instructions?.split('\n') ?? [])).slice(0, 2).map((step: string, idx: number) => (
                                    <li key={idx} className="text-xs text-chocolate-600/90 flex justify-between items-start gap-2 font-medium">
                                        <span className="line-clamp-1 flex-1">{idx + 1}. {step}</span>
                                        <InstructionClarifier instruction={step} stepNumber={idx + 1} />
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}
                </CardContent>
                
                <CardFooter className="pt-2 gap-2 relative z-10 flex border-t border-chocolate-100/30">
                    <Button 
                        variant="ghost"
                        className="flex-1 rounded-xl text-chocolate-600 font-bold text-xs hover:bg-chocolate-50 hover:text-chocolate-900 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                        }}
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                    </Button>
                    <Button 
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-500/20 rounded-xl font-bold text-xs transition-all active:scale-95 py-6"
                        onClick={handleProduceModal}
                    >
                        <Factory className="h-4 w-4 mr-2" /> 
                        Produce
                    </Button>
                </CardFooter>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Produce: ${recipe.name}`}
                className="max-w-xl"
            >
                <div className="space-y-6">
                    <div className="bg-chocolate-50/30 p-4 rounded-xl border border-chocolate-100/50">
                        <h3 className="font-black text-sm text-chocolate-900 mb-3 uppercase tracking-wider">Production Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-chocolate-600 font-medium">Recipe Variant</span>
                                <span className="font-bold text-chocolate-900">{recipe.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-chocolate-600 font-medium">Standard Output</span>
                                <span className="font-bold text-chocolate-900">{recipe.batch_size} {recipe.batch_unit}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">
                            Quantity to Produce
                        </label>
                        <Input 
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            min={0.01}
                            step={0.01}
                            max={10000}
                            placeholder="Enter quantity"
                        />
                        <p className="text-xs text-slate-500">
                            This will automatically deduct ingredients from inventory.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-chocolate-800 block">
                            Production Notes
                        </label>
                        <Input 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Special customer order, testing new process..."
                            maxLength={500}
                            className="border-chocolate-200 focus:border-gold-500"
                        />
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Important:</p>
                            <p>Starting this batch will automatically deduct the required ingredients from your inventory. Make sure you have sufficient stock.</p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={handleProduce} 
                            disabled={produceMutation.isPending || quantity <= 0}
                            className="bg-gold-600 hover:bg-gold-700 text-white min-w-[120px]"
                        >
                            {produceMutation.isPending ? 'Starting...' : 'Start Batch'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default RecipeCard;
