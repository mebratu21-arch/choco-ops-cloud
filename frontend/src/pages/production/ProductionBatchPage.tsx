import { useState } from 'react';
import { useRecipes, useRecipeWithIngredients, useCreateBatch } from '../../services/productionService';
import { useIngredients } from '../../services/inventoryService';
import { useTranslate } from '../../services/aiService';
import { Recipe, RecipeIngredient } from '../../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ChefHat, 
  Play, 
  Package, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Sparkles,
  ArrowLeft,
  Languages,
  Loader2
} from 'lucide-react';

// Inline Translation Component for Production Instructions
const ProductionInstructionsWithTranslation = ({ instructions }: { instructions: string }) => {
    const [selectedLang, setSelectedLang] = useState<string>('');
    const { mutate: translate, isPending, data: translation } = useTranslate();

    const languages = [
        { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
        { code: 'am', name: 'Amharic', flag: '🇪🇹' },
        { code: 'ru', name: 'Russian', flag: '🇷🇺' },
        { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
    ];

    const handleTranslate = (langCode: string) => {
        setSelectedLang(langCode);
        translate({
            text: instructions,
            targetLanguage: langCode,
            context: { domain: 'instruction' }
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-cocoa-900">
                    Production Instructions
                </label>
                <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-gold-600" />
                    <span className="text-xs text-slate-600">Translate:</span>
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleTranslate(lang.code)}
                            disabled={isPending}
                            className={`px-2 py-1 text-xs rounded border transition-all ${
                                selectedLang === lang.code
                                    ? 'border-gold-500 bg-gold-50 text-gold-900'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-gold-400'
                            }`}
                            title={`Translate to ${lang.name}`}
                        >
                            {lang.flag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Original Instructions */}
            <div className="bg-cocoa-50 border border-cocoa-100 rounded-md p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Original</span>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap" dir="auto">
                    {instructions}
                </p>
            </div>

            {/* Translated Instructions */}
            {isPending && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-900">Translating with Gemini AI...</span>
                </div>
            )}

            {translation && selectedLang && !isPending && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-900 uppercase">
                            {languages.find(l => l.code === selectedLang)?.flag} {languages.find(l => l.code === selectedLang)?.name}
                        </span>
                    </div>
                    <p className="text-sm text-green-900 whitespace-pre-wrap font-medium" dir="auto">
                        {translation}
                    </p>
                </div>
            )}
        </div>
    );
};

type ProductionStep = 'select-recipe' | 'configure-batch' | 'confirm-ingredients';

const ProductionBatchPage = () => {
    const [currentStep, setCurrentStep] = useState<ProductionStep>('select-recipe');
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [batchQuantity, setBatchQuantity] = useState<number>(1);
    
    // React Query hooks
    const { data: recipes = [], isLoading: loadingRecipes } = useRecipes();
    const { data: recipeDetails, isLoading: loadingDetails } = useRecipeWithIngredients(selectedRecipeId || '');
    const { data: inventory = [] } = useIngredients();
    const { mutate: createBatch, isPending: isCreating } = useCreateBatch();

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipeId(recipe.id);
        setBatchQuantity(1);
        setCurrentStep('configure-batch');
    };

    const handleBack = () => {
        if (currentStep === 'configure-batch') {
            setCurrentStep('select-recipe');
            setSelectedRecipeId(null);
        } else if (currentStep === 'confirm-ingredients') {
            setCurrentStep('configure-batch');
        }
    };

    const handleContinue = () => {
        setCurrentStep('confirm-ingredients');
    };

    const handleStartBatch = () => {
        if (!selectedRecipeId) return;

        createBatch(
            {
                recipe_id: selectedRecipeId,
                quantity_produced: batchQuantity,
                notes: `Batch started via production dashboard`
            },
            {
                onSuccess: () => {
                    // Reset workflow
                    setCurrentStep('select-recipe');
                    setSelectedRecipeId(null);
                    setBatchQuantity(1);
                    alert('Batch created successfully!');
                },
                onError: (error) => {
                    alert(`Failed to create batch: ${error.message}`);
                },
            }
        );
    };

    // Calculate required ingredients
    const calculateRequirements = () => {
        if (!recipeDetails) return [];

        return recipeDetails.ingredients.map(ing => {
            const required = ing.quantity * batchQuantity;
            const available = inventory.find(i => i.id === ing.ingredient_id)?.current_stock || 0;
            const sufficient = available >= required;

            return {
                ...ing,
                required,
                available,
                sufficient
            };
        });
    };

    const requirements = calculateRequirements();
    const allIngredientsSufficient = requirements.every(r => r.sufficient);

    // Render recipe selection grid
    const renderRecipeSelection = () => (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Production Dashboard</h1>
                <p className="text-muted-foreground">Select a recipe to start a new batch</p>
            </div>

            {loadingRecipes ? (
                <div className="text-center py-12 text-muted-foreground">
                    Loading recipes...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recipes.map(recipe => (
                        <Card 
                            key={recipe.id} 
                            className="border-cocoa-100 hover:border-gold-500 hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => handleSelectRecipe(recipe)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <ChefHat className="h-8 w-8 text-gold-600" />
                                    {recipe.is_active && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                            Active
                                        </span>
                                    )}
                                </div>
                                <CardTitle className="text-cocoa-900 mt-2">{recipe.name}</CardTitle>
                                {recipe.code && (
                                    <p className="text-xs font-mono text-slate-500">{recipe.code}</p>
                                )}
                                <CardDescription className="line-clamp-2">
                                    {recipe.description || 'No description available'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Batch Size</span>
                                    <span className="font-semibold text-cocoa-900">
                                        {recipe.batch_size} {recipe.batch_unit}
                                    </span>
                                </div>
                                <Button 
                                    className="w-full mt-4 bg-gold-500 hover:bg-gold-600 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectRecipe(recipe);
                                    }}
                                >
                                    <Play className="h-4 w-4 me-2" />
                                    Start Batch
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );

    // Render batch configuration
    const renderBatchConfiguration = () => {
        const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
        if (!selectedRecipe) return null;

        return (
            <div className="max-w-2xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="mb-4 -ms-2 text-cocoa-700"
                >
                    <ArrowLeft className="h-4 w-4 me-2" />
                    Back to recipes
                </Button>

                <Card className="border-cocoa-100">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gold-100 flex items-center justify-center">
                                <ChefHat className="h-6 w-6 text-gold-600" />
                            </div>
                            <div>
                                <CardTitle className="text-cocoa-900">{selectedRecipe.name}</CardTitle>
                                <CardDescription>Configure batch parameters</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Batch Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-cocoa-900 mb-2">
                                Batch Quantity
                            </label>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBatchQuantity(Math.max(1, batchQuantity - 1))}
                                    className="border-cocoa-200"
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    min="1"
                                    value={batchQuantity}
                                    onChange={(e) => setBatchQuantity(Math.max(1, Number(e.target.value)))}
                                    className="w-24 text-center border-cocoa-200"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setBatchQuantity(batchQuantity + 1)}
                                    className="border-cocoa-200"
                                >
                                    +
                                </Button>
                                <span className="text-sm text-slate-600">
                                    × {selectedRecipe.batch_size} {selectedRecipe.batch_unit} = {batchQuantity * selectedRecipe.batch_size} {selectedRecipe.batch_unit}
                                </span>
                            </div>
                        </div>


                        {/* Production Instructions with Translation */}
                        {selectedRecipe.instructions && (
                            <ProductionInstructionsWithTranslation instructions={selectedRecipe.instructions} />
                        )}

                        {/* Required Ingredients Preview */}
                        {loadingDetails ? (
                            <div className="text-center py-4 text-muted-foreground">
                                Loading ingredient requirements...
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-cocoa-900 mb-2">
                                    Required Ingredients ({recipeDetails?.ingredients.length || 0})
                                </label>
                                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                                    {recipeDetails?.ingredients.map(ing => (
                                        <div key={ing.id} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-700">{ing.ingredient_name || `Ingredient ${ing.ingredient_id}`}</span>
                                            <span className="font-medium text-cocoa-900">
                                                {ing.quantity * batchQuantity} {ing.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-cocoa-700 hover:bg-cocoa-800 text-white"
                            onClick={handleContinue}
                            disabled={loadingDetails}
                        >
                            Continue to Ingredient Check
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Render ingredient confirmation
    const renderIngredientConfirmation = () => {
        const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
        if (!selectedRecipe) return null;

        return (
            <div className="max-w-3xl mx-auto">
                <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="mb-4 -ms-2 text-cocoa-700"
                >
                    <ArrowLeft className="h-4 w-4 me-2" />
                    Back to configuration
                </Button>

                <Card className="border-cocoa-100">
                    <CardHeader>
                        <CardTitle className="text-cocoa-900">Confirm Ingredient Availability</CardTitle>
                        <CardDescription>
                            Review ingredient requirements vs. current stock
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Status Banner */}
                        {allIngredientsSufficient ? (
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-md p-4">
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-green-900">All ingredients available</p>
                                    <p className="text-sm text-green-700">You can proceed with batch creation</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-md p-4">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-amber-900">Insufficient ingredients</p>
                                    <p className="text-sm text-amber-700">Some ingredients have insufficient stock</p>
                                </div>
                            </div>
                        )}

                        {/* Ingredient List */}
                        <div className="space-y-3">
                            {requirements.map((req, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex items-center justify-between p-4 rounded-md border ${
                                        req.sufficient 
                                            ? 'bg-white border-slate-200' 
                                            : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Package className={`h-5 w-5 ${req.sufficient ? 'text-slate-400' : 'text-red-500'}`} />
                                        <div>
                                            <p className="font-medium text-cocoa-900">
                                                {req.ingredient_name || `Ingredient ${req.ingredient_id}`}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                Required: {req.required} {req.unit}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${req.sufficient ? 'text-green-600' : 'text-red-600'}`}>
                                            {req.available} {req.unit}
                                        </p>
                                        <p className="text-xs text-slate-500">Available</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 border-cocoa-200"
                                onClick={handleBack}
                            >
                                Adjust Quantity
                            </Button>
                            <Button
                                className={`flex-1 ${
                                    allIngredientsSufficient 
                                        ? 'bg-green-600 hover:bg-green-700' 
                                        : 'bg-amber-600 hover:bg-amber-700'
                                } text-white`}
                                onClick={handleStartBatch}
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <>
                                        <Clock className="h-4 w-4 me-2 animate-spin" />
                                        Creating Batch...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 me-2" />
                                        Start Production
                                    </>
                                )}
                            </Button>
                        </div>

                        {!allIngredientsSufficient && (
                            <p className="text-sm text-amber-700 text-center">
                                ⚠️ Warning: Starting with insufficient ingredients may cause production issues
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {currentStep === 'select-recipe' && renderRecipeSelection()}
            {currentStep === 'configure-batch' && renderBatchConfiguration()}
            {currentStep === 'confirm-ingredients' && renderIngredientConfirmation()}
        </div>
    );
};

export default ProductionBatchPage;
