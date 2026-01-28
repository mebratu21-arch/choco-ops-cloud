import { useState } from 'react';
import { Recipe, CreateBatchRequest } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../common/Modal';
import { InstructionClarifier } from './InstructionClarifier';
import { AlertCircle, Factory } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../../services/productionService';
import { toast } from 'sonner';

interface RecipeCardProps {
    recipe: Recipe;
}

export const RecipeCard = ({ recipe }: RecipeCardProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(recipe.batch_size);
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const produceMutation = useMutation({
        mutationFn: (request: CreateBatchRequest) => productionService.createBatch(request),
        onSuccess: (data) => {
            toast.success(`Batch #${data.batch_number || data.id.slice(0, 8)} started successfully!`);
            setIsModalOpen(false);
            setQuantity(recipe.batch_size);
            setNotes('');
            queryClient.invalidateQueries({ queryKey: ['batches'] });
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
        onError: (error) => {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start batch';
            toast.error(errorMessage);
            console.error(error);
        }
    });

    const handleProduce = () => {
        produceMutation.mutate({
            recipe_id: recipe.id,
            quantity_produced: quantity,
            notes: notes || undefined
        });
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow border-cocoa-100">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-cocoa-900">{recipe.name}</CardTitle>
                    {recipe.code && (
                        <div className="text-xs text-muted-foreground">
                            Code: {recipe.code}
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="text-sm text-slate-600">
                        <span className="font-medium">Batch Size:</span> {recipe.batch_size} {recipe.batch_unit}
                    </div>
                    {recipe.description && (
                        <div className="text-xs text-slate-500 mb-2">{recipe.description}</div>
                    )}
                    
                    {/* Instructions Preview */}
                    {recipe.instructions && recipe.instructions.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-slate-100 pt-2">
                             <p className="text-xs font-semibold text-cocoa-800 uppercase">Key Steps:</p>
                             <ul className="space-y-1">
                                {recipe.instructions.slice(0, 3).map((step, idx) => (
                                    <li key={idx} className="text-xs text-slate-600 flex justify-between items-start gap-2">
                                        <span>{idx + 1}. {step}</span>
                                        <InstructionClarifier instruction={step} stepNumber={idx + 1} />
                                    </li>
                                ))}
                                {recipe.instructions.length > 3 && (
                                    <li className="text-xs text-slate-400 italic pl-1">
                                        + {recipe.instructions.length - 3} more steps...
                                    </li>
                                )}
                             </ul>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full bg-gold-500 hover:bg-gold-600 text-white gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Factory className="h-4 w-4" /> Produce
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
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h3 className="font-medium mb-3 text-cocoa-800">Production Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Recipe:</span>
                                <span className="font-medium">{recipe.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Standard Batch Size:</span>
                                <span className="font-medium">{recipe.batch_size} {recipe.batch_unit}</span>
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
                            min={1}
                            max={10000}
                            placeholder="Enter quantity"
                        />
                        <p className="text-xs text-slate-500">
                            This will automatically deduct ingredients from inventory.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 block">
                            Notes (Optional)
                        </label>
                        <Input 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g. Special customer order, testing new process..."
                            maxLength={500}
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
                            disabled={produceMutation.isPending || quantity < 1}
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
