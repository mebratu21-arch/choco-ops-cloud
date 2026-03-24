import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { 
  Bot, 
  Sparkles, 
  Save,
  Loader2,
  Plus,
  Trash2,
  ChefHat,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { useProduction } from '../../hooks/useProduction';
import { useInventory } from '../../hooks/useInventory';

// Types for form state
interface RecipeFormState {
  name: string;
  description: string;
  yield_quantity: number;
  yield_unit: string;
  duration_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: string;
  instructions: string;
}

interface IngredientEntry {
  tempId: string; // for key
  ingredient_id: string | null; // from inventory
  name: string; // display name
  amount: string; // string mainly for input, parsed to number
  unit: string;
  notes: string;
}

const RecipeEditor = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { useCreateRecipe, useUpdateRecipe, useRecipe } = useProduction();
    
    const createRecipe = useCreateRecipe();
    const updateRecipe = useUpdateRecipe();
    const { data: existingRecipe, isLoading: isLoadingRecipe } = useRecipe(id ?? '');
    
    // Inventory Data for dropdown
    const { useInventoryItems } = useInventory();
    const { data: inventoryData } = useInventoryItems({ limit: 100 });
    const inventoryItems = inventoryData?.items ?? [];

    // AI State
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Form State
    const [formData, setFormData] = useState<RecipeFormState>({
      name: '',
      description: '',
      yield_quantity: 100,
      yield_unit: 'kg',
      duration_minutes: 60,
      difficulty_level: 'medium',
      category: 'bars',
      instructions: ''
    });

    const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);

    // Populate form if in edit mode
    useEffect(() => {
      if (isEditMode && existingRecipe) {
        setFormData({
          name: existingRecipe.name,
          description: existingRecipe.description || '',
          yield_quantity: Number(existingRecipe.yield_quantity),
          yield_unit: existingRecipe.yield_unit,
          duration_minutes: existingRecipe.duration_minutes || 60,
          difficulty_level: (existingRecipe.difficulty_level as any) || 'medium',
          category: existingRecipe.category || 'bars',
          instructions: existingRecipe.instructions || ''
        });

        if (existingRecipe.ingredients) {
            const mappedIngredients = (existingRecipe.ingredients as any[]).map((ing: any) => ({
                tempId: crypto.randomUUID(),
                ingredient_id: ing.inventory_item_id,
                name: ing.custom_name || ing.inventory_item?.name || 'Unknown',
                amount: String(ing.quantity),
                unit: ing.unit,
                notes: ing.notes || ''
            }));
            setIngredients(mappedIngredients);
        }
      }
    }, [isEditMode, existingRecipe]);

    // New Ingredient State
    const [newIngredient, setNewIngredient] = useState<IngredientEntry>({
      tempId: '',
      ingredient_id: '',
      name: '',
      amount: '',
      unit: 'kg',
      notes: ''
    });

    // --- AI Handler ---
    const handleGenerate = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            const generatedName = 'AI Generated: ' + prompt.split(' ').slice(0, 3).join(' ') + '...';
            const generatedDesc = `Optimized formulation for ${prompt}. Focused on cost-efficiency and texture stability.`;
            
            setFormData(prev => ({
              ...prev,
              name: generatedName,
              description: generatedDesc,
              instructions: `1. Melt cocoa mass at 50°C.\n2. Mix in sugar and emulsifiers.\n3. Refine to 20 microns.\n4. Conche for 12 hours.\n5. Temper and mold.`
            }));

            const mockIngredients: IngredientEntry[] = [
                { tempId: crypto.randomUUID(), ingredient_id: null, name: 'Cocoa Mass', amount: '50', unit: 'kg', notes: 'Fino de Aroma' },
                { tempId: crypto.randomUUID(), ingredient_id: null, name: 'Sugar', amount: '35', unit: 'kg', notes: 'Fine white' },
                { tempId: crypto.randomUUID(), ingredient_id: null, name: 'Cocoa Butter', amount: '15', unit: 'kg', notes: 'Deodorized' }
            ];
            setIngredients(mockIngredients);

            toast.success("Recipe generated by AI! Review and edit details below.");
        } catch {
            toast.error("Generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Ingredient Handlers ---
    const handleAddIngredient = () => {
      if (!newIngredient.name && !newIngredient.ingredient_id) {
        toast.error("Please select an ingredient or enter a name");
        return;
      }
      if (!newIngredient.amount || isNaN(parseFloat(newIngredient.amount))) {
        toast.error("Please enter a valid amount");
        return;
      }

      setIngredients([...ingredients, { ...newIngredient, tempId: crypto.randomUUID() }]);
      
      setNewIngredient({
        tempId: '',
        ingredient_id: '',
        name: '', 
        amount: '',
        unit: 'kg',
        notes: ''
      });
      toast.success("Ingredient added");
    };

    const handleRemoveIngredient = (tempId: string) => {
      setIngredients(ingredients.filter(i => i.tempId !== tempId));
    };

    const handleInventorySelect = (itemId: string) => {
      const item = inventoryItems.find((i: any) => i.id === itemId);
      if (item) {
        setNewIngredient(prev => ({
          ...prev,
          ingredient_id: item.id,
          name: item.name,
          unit: item.unit 
        }));
      } else {
         setNewIngredient(prev => ({ ...prev, ingredient_id: itemId, name: '' }));
      }
    };

    // --- Save Handler ---
    const handleSave = () => {
        if (!formData.name) {
          toast.error("Recipe name is required");
          return;
        }

        const recipePayload = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          yield_quantity: formData.yield_quantity,
          yield_unit: formData.yield_unit,
          duration_minutes: formData.duration_minutes,
          difficulty_level: formData.difficulty_level,
          instructions: formData.instructions,
          is_active: true,
          ingredients: ingredients.map(ing => ({
            inventory_item_id: ing.ingredient_id || null,
            custom_name: ing.ingredient_id ? null : ing.name,
            quantity: parseFloat(ing.amount),
            unit: ing.unit,
            notes: ing.notes
          }))
        };

        if (isEditMode && id) {
            updateRecipe.mutate({ id, data: recipePayload as any }, {
                onSuccess: () => {
                    toast.success("Recipe updated successfully!");
                    navigate('/production/recipes');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("Failed to update recipe");
                }
            });
        } else {
            createRecipe.mutate(recipePayload as any, {
                onSuccess: () => {
                    toast.success("Recipe saved successfully!");
                    navigate('/production/recipes');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("Failed to save recipe");
                }
            });
        }
    };

    if (isEditMode && isLoadingRecipe) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-gold-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in px-4">
            {/* Header / AI Prompt */}
            <div className="flex justify-between items-center pt-8">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-cocoa-600 hover:text-cocoa-900">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                {isEditMode && (
                    <Badge variant="outline" className="border-gold-300 text-gold-700 bg-gold-50 px-3 py-1">
                        Editing Mode
                    </Badge>
                )}
            </div>

            <div className="text-center space-y-4">
                <div className="bg-gold-100 p-4 rounded-full w-fit mx-auto animate-bounce-slow">
                    <Sparkles className="h-8 w-8 text-gold-600" />
                </div>
                <h1 className="text-4xl font-bold font-serif text-cocoa-900">
                    {isEditMode ? "Formulation Upgrade" : "Formulation Architect"}
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto italic font-serif">
                   {isEditMode 
                    ? "\"Refining the precision of chocolate, perfecting the legacy.\""
                    : "\"Mastering the alchemy of chocolate, one ingredient at a time.\""}
                </p>
            </div>

            <Card className="border-gold-200 shadow-xl border-2 bg-gradient-to-br from-white to-gold-50/30 overflow-hidden">
                <div className="h-2 bg-gold-400 w-full" />
                <CardContent className="pt-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input 
                            placeholder="Describe a chocolate creation for AI optimization..." 
                            className="flex-1 h-14 text-lg border-gold-200 focus:ring-gold-500 bg-white"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && void handleGenerate()}
                        />
                        <Button 
                            className="h-14 px-8 bg-gold-600 hover:bg-gold-700 text-white text-lg font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                            onClick={() => void handleGenerate()}
                            disabled={isGenerating || !prompt}
                        >
                            {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Bot className="h-6 w-6" />}
                            {isGenerating ? "Optimizing..." : "AI Optimize"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-cocoa-100 shadow-md">
                        <CardHeader className="bg-cocoa-50/30 border-b border-cocoa-100">
                            <CardTitle className="text-xl text-cocoa-900 flex items-center gap-2">
                                <ChefHat className="w-6 h-6 text-gold-600" />
                                Blueprint Specifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <Input 
                                label="Product Name"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g., Mountain Peak Dark Truffle"
                                required
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select 
                                    label="Collection"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    options={[
                                        { label: "Bars", value: "bars" },
                                        { label: "Truffles", value: "truffles" },
                                        { label: "Bonbons", value: "bonbons" },
                                        { label: "Gift Boxes", value: "gift_boxes" },
                                        { label: "Pralines", value: "pralines" }
                                    ]}
                                />
                                <Select 
                                    label="Expertise Level"
                                    value={formData.difficulty_level}
                                    onChange={(e) => setFormData({...formData, difficulty_level: e.target.value as any})}
                                    options={[
                                        { label: "Easy - Apprentice", value: "easy" },
                                        { label: "Medium - Artisan", value: "medium" },
                                        { label: "Hard - Master", value: "hard" }
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <Input 
                                    label="Yield Specification"
                                    type="number"
                                    value={formData.yield_quantity}
                                    onChange={(e) => setFormData({...formData, yield_quantity: parseFloat(e.target.value)})}
                                />
                                <Select 
                                    label="Unit"
                                    value={formData.yield_unit}
                                    onChange={(e) => setFormData({...formData, yield_unit: e.target.value})}
                                    options={[
                                        { label: "kg", value: "kg" },
                                        { label: "g", value: "g" },
                                        { label: "pcs", value: "pcs" },
                                        { label: "units", value: "units" }
                                    ]}
                                />
                                <Input 
                                    label="Cycle Duration (min)"
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({...formData, duration_minutes: parseFloat(e.target.value)})}
                                />
                            </div>

                            <Textarea 
                                label="Premium Sensory Profile"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Describe the aroma, texture, and flavor profile..."
                            />

                            <Textarea 
                                label="Production Workflow"
                                className="min-h-[200px] font-mono text-sm leading-relaxed"
                                value={formData.instructions}
                                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                                placeholder="Step 1: Temper at 31°C..."
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-cocoa-100 shadow-md">
                        <CardHeader className="bg-cocoa-50/30 border-b border-cocoa-100">
                             <CardTitle className="text-lg text-cocoa-900 flex items-center justify-between">
                                <span>Bill of Materials</span>
                                <Badge className="bg-gold-600">{ingredients.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-6">
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {ingredients.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 text-sm italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                        No materials selected.
                                    </div>
                                ) : (
                                    ingredients.map((ing) => (
                                        <div key={ing.tempId} className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm group hover:border-gold-300 transition-all">
                                            <div>
                                                <div className="font-bold text-cocoa-900">{ing.name}</div>
                                                <div className="text-xs text-cocoa-600 flex items-center gap-2">
                                                    <span className="font-mono bg-gold-50 text-gold-700 px-1.5 py-0.5 rounded">{ing.amount}{ing.unit}</span>
                                                    {ing.notes && <span className="truncate max-w-[120px]">• {ing.notes}</span>}
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleRemoveIngredient(ing.tempId)}
                                                className="h-8 w-8 p-0 text-slate-300 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 rounded-xl border-2 border-dashed border-gold-300 bg-gold-50/20 space-y-4 shadow-inner relative">
                                <Select 
                                    label="Industrial Feedstock"
                                    value={newIngredient.ingredient_id || ''}
                                    onChange={(e) => handleInventorySelect(e.target.value)}
                                    options={[
                                        { label: "Select from Inventory...", value: "" },
                                        ...inventoryItems.map((item: any) => ({ 
                                            label: `${item.name} (${item.quantity} ${item.unit})`, 
                                            value: item.id 
                                        }))
                                    ]}
                                />

                                {!newIngredient.ingredient_id && (
                                    <Input 
                                        label="Manual Designation"
                                        placeholder="Enter name..."
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({...newIngredient, name: e.target.value, ingredient_id: null})}
                                    />
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Input 
                                        label="Quantity" 
                                        type="number" 
                                        value={newIngredient.amount}
                                        onChange={(e) => setNewIngredient({...newIngredient, amount: e.target.value})}
                                    />
                                    <Select 
                                        label="Unit"
                                        value={newIngredient.unit}
                                        onChange={(e) => setNewIngredient({...newIngredient, unit: e.target.value})}
                                        options={[
                                            { label: "kg", value: "kg" },
                                            { label: "g", value: "g" },
                                            { label: "L", value: "L" },
                                            { label: "pcs", value: "pcs" }
                                        ]}
                                    />
                                </div>

                                <Button 
                                    onClick={handleAddIngredient} 
                                    className="w-full bg-cocoa-900 hover:bg-black text-gold-100 h-10 font-bold"
                                    disabled={!newIngredient.name && !newIngredient.ingredient_id}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Append Material
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Button 
                        onClick={handleSave} 
                        className="w-full h-14 bg-green-600 hover:bg-green-700 text-white text-xl font-bold shadow-xl flex items-center justify-center gap-3 transition-all"
                        disabled={createRecipe.isPending || updateRecipe.isPending}
                    >
                        {(createRecipe.isPending || updateRecipe.isPending) ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        {isEditMode ? "Authorize Revision" : "Finalize Formulation"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RecipeEditor;
