import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, ChefHat, ArrowLeft, Play, 
  AlertTriangle, Scale, Info 
} from 'lucide-react';
import { useProduction } from '../../hooks/useProduction';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import StartBatchModal from '../../components/production/StartBatchModal';
import { InstructionClarifier } from '../../components/production/InstructionClarifier';
import { RecipeIngredient } from '../../types';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useRecipe } = useProduction();
  
  const { data: recipe, isLoading, error } = useRecipe(id ?? '');
  const [isStartBatchModalOpen, setIsStartBatchModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Recipe not found</h3>
        <Button variant="ghost" onClick={() => navigate('/production/recipes')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-chocolate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-4 relative z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate('/production/recipes')} className="text-chocolate-500 hover:text-chocolate-800 hover:bg-chocolate-50 rounded-xl">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-black text-chocolate-900 tracking-tight uppercase">{recipe.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-chocolate-600/80 font-medium">
              <span className="flex items-center gap-1.5 bg-chocolate-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <Clock className="w-3 h-3 text-gold-600" /> {recipe.duration_minutes} mins
              </span>
              <span className="flex items-center gap-1.5 bg-chocolate-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                <Scale className="w-3 h-3 text-gold-600" /> {recipe.yield_quantity} {recipe.yield_unit}
              </span>
              <Badge variant={recipe.difficulty_level === 'easy' ? 'success' : recipe.difficulty_level === 'medium' ? 'warning' : 'error'} className="shadow-sm uppercase">
                {recipe.difficulty_level}
              </Badge>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => setIsStartBatchModalOpen(true)} 
          className="relative z-10 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-500/20 px-8 py-6 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <Play className="w-5 h-5 mr-2 fill-current" />
          Initiate Production Run
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-chocolate-100 overflow-hidden shadow-sm">
            <CardHeader className="bg-chocolate-50/50 border-b border-chocolate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-chocolate-900 uppercase tracking-wide">
                <Info className="w-5 h-5 text-gold-500" />
                Formulation Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-chocolate-600 leading-relaxed font-medium">{recipe.description}</p>
            </CardContent>
          </Card>

          <Card className="border-chocolate-100 overflow-hidden shadow-sm">
            <CardHeader className="bg-chocolate-50/50 border-b border-chocolate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-chocolate-900 uppercase tracking-wide">
                <ChefHat className="w-5 h-5 text-gold-500" />
                Production Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {(Array.isArray(recipe.instructions) ? recipe.instructions : (typeof recipe.instructions === 'string' ? recipe.instructions.split('\n') : [])).map((step, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-chocolate-100 text-chocolate-800 flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-gold-500 group-hover:text-white transition-colors duration-300">
                      {index + 1}
                    </div>
                    <div className="flex-grow flex justify-between items-start gap-4">
                      <p className="text-chocolate-700 mt-1 font-medium leading-relaxed">{step}</p>
                      <InstructionClarifier instruction={step} stepNumber={index + 1} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Ingredients */}
        <div className="space-y-6">
          <Card className="h-full border-chocolate-100 overflow-hidden shadow-sm">
            <CardHeader className="bg-chocolate-50/50 border-b border-chocolate-100/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-chocolate-900 uppercase tracking-wide">
                <Scale className="w-5 h-5 text-gold-500" />
                Bill of Materials
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recipe.ingredients?.map((ingredient: RecipeIngredient, index: number) => (
                  <div key={ingredient.ingredient_id ?? index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-chocolate-100 shadow-sm hover:border-gold-300 transition-colors">
                    <div>
                      <p className="font-bold text-chocolate-900">{ingredient.ingredient_name ?? ingredient.custom_name ?? 'Unnamed Ingredient'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-chocolate-800">
                        {ingredient.quantity} <span className="text-[10px] uppercase text-chocolate-400 font-bold">{ingredient.unit}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-br from-gold-50 to-white rounded-2xl border border-gold-200/50 shadow-inner">
                <h4 className="text-xs font-black text-gold-700 mb-2 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" /> Master Chocolatier Tip
                </h4>
                <p className="text-xs text-chocolate-600/80 font-medium italic leading-relaxed">
                  "Maintain ingredient acclimation at 22°C ambient temperature for optimal crystallization phases."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Start Batch Modal */}
      {recipe && (
        <StartBatchModal
          isOpen={isStartBatchModalOpen}
          onClose={() => setIsStartBatchModalOpen(false)}
          recipe={recipe}
        />
      )}
    </div>
  );
};

export default RecipeDetailPage;
