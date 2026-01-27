import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../../services/productionService';
import { qcService } from '../../services/qcService';
import { useAuthStore } from '../../store/authStore';
import { RecipeCard } from '../../components/production/RecipeCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loader2, CheckCircle2, AlertCircle, Clock, Factory } from 'lucide-react';
import { toast } from 'sonner';
import { Batch, QCStatus } from '../../types';

const ProductionPage = () => {
    const queryClient = useQueryClient();
    const { hasRole } = useAuthStore();
    
    // QC Modal State
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [qcNotes, setQcNotes] = useState('');
    const [qcStatus, setQcStatus] = useState<QCStatus>('APPROVED');

    // Data Fetching with TanStack Query
    const { data: recipes, isLoading: isLoadingRecipes } = useQuery({
        queryKey: ['recipes'],
        queryFn: productionService.getAllRecipes
    });

    // Note: Backend doesn't have GET /api/production endpoint yet
    // For now, we'll just show active batches from cache or local state
    // In production, you'd implement this endpoint in the backend
    const activeBatches: Batch[] = [];

    // QC Mutation
    const qcMutation = useMutation({
        mutationFn: async (vars: { id: string; status: QCStatus; notes: string }) => {
            return qcService.updateQualityStatus(vars.id, {
                batch_id: vars.id,
                status: vars.status,
                notes: vars.notes
            });
        },
        onSuccess: () => {
            toast.success("Quality Control recorded successfully.");
            setSelectedBatch(null);
            setQcNotes('');
            setQcStatus('APPROVED');
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
        onError: (error) => {
            toast.error("Failed to submit QC report.");
            console.error(error);
        }
    });

    const handleOpenQC = (batch: Batch) => {
        if (!hasRole(['ADMIN', 'MANAGER', 'QC'])) {
            toast.error("Unauthorized: Only Admin, Manager, or QC staff can perform checks.");
            return;
        }
        setSelectedBatch(batch);
    };

    const handleSubmitQC = () => {
        if (!selectedBatch) return;
        qcMutation.mutate({
            id: selectedBatch.id,
            status: qcStatus,
            notes: qcNotes
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold font-serif text-cocoa-900 dark:text-cocoa-100">
                    Production Floor
                </h1>
                <p className="text-cocoa-600 dark:text-cocoa-300">
                    Manage recipes, monitor active batches, and ensure artisan quality.
                </p>
            </div>

            {/* Active Batch Tracker */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400">
                    <Factory className="h-5 w-5" />
                    <h2 className="text-2xl font-bold font-serif">Active Batch Tracker</h2>
                </div>
                
                {activeBatches.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-cocoa-200 rounded-xl bg-cocoa-50/50">
                        <p className="text-cocoa-500 font-medium">No batches currently in production.</p>
                        <p className="text-sm text-cocoa-400">Select a recipe below to start cooking.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {activeBatches.map(batch => (
                            <div key={batch.id} className="bg-white dark:bg-slate-900 rounded-lg p-5 border-l-4 border-gold-500 shadow-sm flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold tracking-wider text-gold-600 uppercase">
                                            Batch #{batch.batch_number || batch.id.slice(0, 8)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            <Loader2 className="h-3 w-3 animate-spin" /> Cooking
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                                        {batch.recipe_name || 'Unknown Recipe'}
                                    </h3>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
                                        <Clock className="h-3 w-3" />
                                        Started: {batch.started_at ? new Date(batch.started_at).toLocaleTimeString() : 'N/A'}
                                    </div>
                                    
                                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md mb-4 text-sm">
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                            <span>Target Output:</span>
                                            <span className="font-medium">{batch.quantity_produced} Units</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600 dark:text-slate-300 mt-1">
                                            <span>Producer:</span>
                                            <span className="font-medium">User #{batch.produced_by.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => handleOpenQC(batch)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
                                >
                                    <CheckCircle2 className="h-4 w-4" /> Complete & QC
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recipe Grid */}
            <section className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 text-cocoa-700">
                    <h2 className="text-2xl font-bold font-serif">Recipe Catalog</h2>
                </div>

                {isLoadingRecipes ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-slate-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {recipes?.map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                        ))}
                    </div>
                )}
            </section>

            {/* QC Modal */}
            <Modal
                isOpen={!!selectedBatch}
                onClose={() => setSelectedBatch(null)}
                title="Quality Control Check"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                        You are validating <strong>Batch #{selectedBatch?.batch_number || selectedBatch?.id.slice(0, 8)}</strong>.
                        Ensure the final product meets the "Artisan" standard.
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 block">Quality Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setQcStatus('APPROVED')}
                                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                                    qcStatus === 'APPROVED' 
                                    ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200' 
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <CheckCircle2 className="h-5 w-5" /> APPROVE
                            </button>
                            <button
                                type="button"
                                onClick={() => setQcStatus('REJECTED')}
                                className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${
                                    qcStatus === 'REJECTED' 
                                    ? 'bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200' 
                                    : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <AlertCircle className="h-5 w-5" /> REJECT
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700 block">Inspector Notes</label>
                         <Input 
                            value={qcNotes}
                            onChange={(e) => setQcNotes(e.target.value)}
                            placeholder="e.g. Texture is perfect, temper is glossy..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setSelectedBatch(null)}>Cancel</Button>
                        <Button 
                            onClick={handleSubmitQC}
                            disabled={qcMutation.isPending}
                            className={`${
                                qcStatus === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            } text-white min-w-[120px]`}
                        >
                            {qcMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Result'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProductionPage;
