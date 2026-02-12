import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  ChefHat, 
  Clock, 
  Bot, 
  CheckCircle2,
  Trash2,
  Edit,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '../../types';
import { fetchRecipeById } from '../../services/recipeService';
import { toast } from 'sonner';
import StartBatchModal from '../../components/production/StartBatchModal';

const RecipeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [translatedInstructions, setTranslatedInstructions] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

    const { data: recipe, isLoading } = useQuery<Recipe>({
        queryKey: ['recipe', id],
        queryFn: () => fetchRecipeById(id ?? ''),
        enabled: !!id
    });

    const handleTranslate = async (lang: string) => {
        if (!recipe?.instructions) return;
        
        setIsTranslating(true);
        try {
            const baseInstructions = Array.isArray(recipe.instructions) ? recipe.instructions.join('\n') : recipe.instructions;
            const token = localStorage.getItem('token');
            const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:5000/api';
            const res = await fetch(`${API_BASE}/ai/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    text: baseInstructions,
                    targetLanguage: lang,
                    context: { domain: 'recipe' }
                })
            });

            if (!res.ok) throw new Error(`Translation API returned ${res.status}`);
            const data = await res.json() as { data?: { translation?: string }, translation?: string };
            const translated = data?.data?.translation ?? data?.translation ?? baseInstructions;
            setTranslatedInstructions(translated);
            toast.success(`Instructions translated to ${lang.toUpperCase()}`);
        } catch (err: unknown) {
            console.error('Translation failed:', err);
            const message = err instanceof Error ? err.message : 'Translation service unavailable';
            toast.error(message);
        } finally {
            setIsTranslating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-gold-500 border-t-transparent rounded-full" />
                <span className="ml-4 font-bold text-chocolate-900/40 uppercase tracking-widest text-xs">Accessing Formulation...</span>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center py-20 bg-white/30 rounded-3xl border border-white/40 backdrop-blur-sm">
                <AlertCircle className="h-12 w-12 text-chocolate-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-chocolate-900">Formulation Not Found</h2>
                <Button 
                    onClick={() => navigate('/recipes')}
                    className="mt-6 bg-chocolate-900 text-white"
                >
                    Return to Library
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-fade-in max-w-6xl mx-auto">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <button 
                    onClick={() => navigate('/recipes')}
                    className="group flex items-center gap-2 text-sm font-bold text-chocolate-900/40 hover:text-chocolate-900 transition-colors uppercase tracking-[0.2em]"
                >
                    <div className="p-1.5 rounded-full bg-white border border-chocolate-900/10 group-hover:border-chocolate-900/30 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> 
                    </div>
                    Back to Library
                </button>

                <div className="flex items-center gap-3">
                    <button className="p-3 text-chocolate-900/40 hover:text-vibrant-red hover:bg-vibrant-red/10 rounded-2xl transition-all">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-chocolate-100 text-chocolate-900 font-bold rounded-2xl hover:bg-chocolate-50 shadow-sm transition-all">
                        <Edit className="w-4 h-4" />
                        Modify
                    </button>
                    <button 
                        onClick={() => setIsBatchModalOpen(true)}
                        className="flex items-center gap-2 px-8 py-3 bg-chocolate-900 text-white font-bold rounded-2xl hover:bg-chocolate-800 shadow-xl shadow-chocolate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <PlayCircle className="w-5 h-5" />
                        Execute Batch
                    </button>
                </div>
            </div>

            {/* Hero Section - Magazine Style */}
            <div className="relative group rounded-[3rem] overflow-hidden bg-white border border-chocolate-100/50 shadow-2xl shadow-chocolate-950/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    {/* Left side: Metadata & Title */}
                    <div className="p-12 md:p-16 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="h-px w-10 bg-gold-500/50"></span>
                            <span className="text-[10px] font-black tracking-[0.4em] text-gold-600 uppercase">Production Protocol 04</span>
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-black text-chocolate-950 tracking-tight leading-[1.1] mb-6">
                            {recipe.name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center gap-6 mb-8 pt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-chocolate-900/30 uppercase tracking-widest mb-1">Recipe SKU</span>
                                <span className="text-sm font-bold text-chocolate-900 font-mono italic">{recipe.code ?? 'UNASSIGNED'}</span>
                            </div>
                            <div className="w-px h-8 bg-chocolate-100/50" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-chocolate-900/30 uppercase tracking-widest mb-1">Standard Duration</span>
                                <span className="text-sm font-bold text-chocolate-900 flex items-center gap-1.5 leading-none">
                                    <Clock className="w-4 h-4 text-gold-500" /> {recipe.duration_minutes} Minutes
                                </span>
                            </div>
                             <div className="w-px h-8 bg-chocolate-100/50" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-chocolate-900/30 uppercase tracking-widest mb-1">Difficulty</span>
                                <span className="text-sm font-bold text-chocolate-900 uppercase tracking-wider leading-none">
                                    {recipe.difficulty_level ?? 'ADVANCED'}
                                </span>
                            </div>
                        </div>

                        <p className="text-lg text-chocolate-900/60 font-medium leading-relaxed italic max-w-md">
                            "{recipe.description ?? 'A masterpiece of balanced bitterness and velvety texture, engineered for precision tempering and artisanal finish.'}"
                        </p>
                    </div>

                    {/* Right side: Image Hero */}
                    <div className="h-[400px] md:h-auto relative bg-chocolate-50 overflow-hidden">
                        {recipe.image_url ? (
                            <img 
                                src={recipe.image_url} 
                                alt={recipe.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <ChefHat className="w-64 h-64 text-chocolate-900" />
                            </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent md:hidden" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {/* Protocol / Instructions (8/12) */}
                <div className="md:col-span-8 space-y-10">
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-chocolate-950 uppercase tracking-tight">Technical Formulation</h2>
                                <p className="text-xs font-bold text-chocolate-900/30 uppercase tracking-[0.2em] mt-1">Step-by-step production methodology</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-chocolate-900/40 uppercase mr-2 tracking-widest">Translate:</span>
                                {[
                                    { code: 'am', label: 'አማ' },
                                    { code: 'ru', label: 'РУС' },
                                    { code: 'ar', label: 'عرب' },
                                    { code: 'he', label: 'עבר' },
                                    { code: 'es', label: 'ESP' },
                                ].map(lang => (
                                    <button 
                                        key={lang.code}
                                        onClick={() => { void handleTranslate(lang.code); }}
                                        disabled={isTranslating}
                                        className="h-8 px-3 rounded-lg bg-chocolate-50 text-[10px] font-black text-chocolate-900/60 hover:bg-gold-500 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-chocolate-100/50 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 h-32 w-32 opacity-5 pointer-events-none">
                                <Bot className="w-full h-full text-chocolate-900" />
                             </div>
                             
                             <div className="relative z-10 font-medium text-chocolate-900/80 leading-loose text-lg whitespace-pre-wrap">
                                {isTranslating ? (
                                    <div className="flex flex-col gap-4 animate-pulse">
                                        <div className="h-6 w-3/4 bg-chocolate-100 rounded-full" />
                                        <div className="h-6 w-1/2 bg-chocolate-100 rounded-full" />
                                        <div className="h-6 w-2/3 bg-chocolate-100 rounded-full" />
                                    </div>
                                ) : (
                                    translatedInstructions ?? (Array.isArray(recipe.instructions) ? recipe.instructions.join('\n\n') : recipe.instructions)
                                )}
                             </div>
                             
                             {translatedInstructions && (
                                 <button 
                                    onClick={() => setTranslatedInstructions(null)}
                                    className="mt-8 text-xs font-black text-gold-600 uppercase tracking-widest hover:text-gold-700 underline underline-offset-4"
                                 >
                                    Revert to Original
                                 </button>
                             )}
                        </div>
                    </div>
                </div>

                {/* Ingredients & Logic (4/12) */}
                <div className="md:col-span-4 space-y-10">
                    {/* Batch Settings Sidebar */}
                    <div className="bg-[#1A0C06] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-[40px] pointer-events-none" />
                        
                        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 relative z-10">Standard Metrics</h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center group">
                                <span className="text-white/40 font-bold text-xs uppercase tracking-wide">Standard Yield</span>
                                <div className="flex flex-col items-end">
                                    <span className="font-black text-gold-400 text-lg leading-none">{recipe.yield_quantity}</span>
                                    <span className="text-[10px] text-white/20 font-mono mt-0.5">{recipe.yield_unit}</span>
                                </div>
                            </div>
                            
                            <div className="h-px bg-white/5" />
                            
                            <div className="flex justify-between items-center group">
                                <span className="text-white/40 font-bold text-xs uppercase tracking-wide">Target QC Score</span>
                                <span className="font-black text-white text-lg">9.8<span className="text-[10px] text-white/20 ml-1">/ 10</span></span>
                            </div>

                            <div className="h-px bg-white/5" />

                            <div className="pt-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="p-2 bg-vibrant-green/20 rounded-xl text-vibrant-green">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-wider">Production Ready</p>
                                        <p className="text-[9px] text-white/30 font-mono mt-1 uppercase">Validated by Lab A-12</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Composition Panel */}
                    <div>
                        <h3 className="text-[10px] font-black text-chocolate-900/30 uppercase tracking-[0.3em] mb-6 px-4">Core Composition</h3>
                        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 p-6 space-y-2">
                            {recipe.ingredients?.map((ing) => (
                                <div key={String(ing.ingredient_id ?? ing.custom_name ?? Math.random())} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/60 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-gold-400 group-hover:scale-125 transition-transform" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-chocolate-950">{ing.ingredient_name}</span>
                                            <span className="text-[10px] text-chocolate-900/40 font-mono italic">
                                                {ing.quantity} {ing.unit} {ing.notes && `• ${ing.notes}`}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-chocolate-900/30 uppercase font-mono tracking-tighter">
                                        {'inventory_item_id' in ing && ing.inventory_item_id ? 'Warehouse' : 'Custom'}
                                    </span>
                                </div>
                            ))}
                            {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                                <div className="text-center py-8 text-chocolate-900/20 text-xs italic">
                                    No formulation components defined.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <StartBatchModal 
                isOpen={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
                recipe={recipe}
            />
        </div>
    );
};

export default RecipeDetails;
