import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  ChefHat, 
  Scale, 
  Clock, 
  Globe, 
  Bot, 
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '../../types';
import { toast } from 'sonner';

// Mock data fetcher
const fetchRecipeDetails = async (id: string): Promise<Recipe> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
        id,
        name: 'Dark Chocolate 70%',
        code: 'REC-DC70',
        description: 'Standard dark chocolate formulation with 70% cocoa solids.',
        batch_size: 1000,
        batch_unit: 'kg',
        instructions: `1. Melange the cocoa nibs for 48 hours.
2. Add sugar and cocoa butter.
3. Conche for 24 hours at 60°C.
4. Temper and mold.`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
};

const RecipeDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [translatedInstructions, setTranslatedInstructions] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    const { data: recipe, isLoading } = useQuery({
        queryKey: ['recipe', id],
        queryFn: () => fetchRecipeDetails(id || ''),
        enabled: !!id
    });

    const handleTranslate = async (lang: string) => {
        if (!recipe?.instructions) return;
        
        setIsTranslating(true);
        try {
            // Simulate AI Translation
            await new Promise(resolve => setTimeout(resolve, 1500));
            setTranslatedInstructions(`(Translated to ${lang})\n${recipe.instructions}`); // Mock translation
            toast.success(`Translated to ${lang}`);
        } catch (error) {
            toast.error("Translation failed");
        } finally {
            setIsTranslating(false);
        }
    };

    if (isLoading) return <div className="text-center py-12">Loading recipe...</div>;
    if (!recipe) return <div className="text-center py-12">Recipe not found</div>;

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            <Button 
                variant="ghost" 
                onClick={() => navigate('/recipes')}
                className="text-slate-500 hover:text-cocoa-600 gap-2 pl-0"
            >
                <ArrowLeft className="h-4 w-4" /> Back to Recipe Book
            </Button>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-gold-100 rounded-lg">
                            <ChefHat className="h-8 w-8 text-gold-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-cocoa-900">{recipe.name}</h1>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{recipe.code}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 45 mins</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button variant="outline" className="border-cocoa-200">Edit Recipe</Button>
                    <Button className="bg-cocoa-600 hover:bg-cocoa-700 text-white">Start Production</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-cocoa-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-purple-600" />
                                Smart Instructions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                {translatedInstructions || recipe.instructions}
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider py-1.5">Translate to:</span>
                                <Button size="sm" variant="outline" onClick={() => handleTranslate('Spanish')} disabled={isTranslating} className="h-7 text-xs gap-1">
                                    <Globe className="h-3 w-3" /> Spanish
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleTranslate('French')} disabled={isTranslating} className="h-7 text-xs gap-1">
                                    <Globe className="h-3 w-3" /> French
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleTranslate('German')} disabled={isTranslating} className="h-7 text-xs gap-1">
                                    <Globe className="h-3 w-3" /> German
                                </Button>
                                {translatedInstructions && (
                                    <Button size="sm" variant="ghost" onClick={() => setTranslatedInstructions(null)} className="h-7 text-xs ml-auto">
                                        Show Original
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-cocoa-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>Ingredients configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium text-cocoa-900">Cocoa Nibs (Ghana)</span>
                                    </div>
                                    <span className="font-mono text-slate-600">650 kg</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium text-cocoa-900">Cane Sugar</span>
                                    </div>
                                    <span className="font-mono text-slate-600">250 kg</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span className="font-medium text-cocoa-900">Cocoa Butter</span>
                                    </div>
                                    <span className="font-mono text-slate-600">100 kg</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-gold-50 border-gold-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-gold-900 text-lg">Batch Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gold-800 text-sm">Standard Size</span>
                                <span className="font-bold text-gold-900 flex items-center gap-1">
                                    <Scale className="h-4 w-4" /> {recipe.batch_size} {recipe.batch_unit}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gold-800 text-sm">Est. Cost</span>
                                <span className="font-bold text-gold-900">$4,250.00</span>
                            </div>
                            <div className="pt-4 border-t border-gold-200/50">
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-gold-900">Validated for Production</p>
                                        <p className="text-xs text-gold-700">Last run: 2 days ago</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetails;
