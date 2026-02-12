import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import {
    Search,
    ChefHat,
    Scale,
    Clock,
    Plus,
    Utensils,
    Star
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '../../types';
import { fetchRecipes } from '../../services/recipeService';
import RecipeModal from '../../components/recipes/RecipeModal';

const RecipeList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
        queryKey: ['recipes'],
        queryFn: fetchRecipes,
    });

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to render difficulty stars
    const renderDifficulty = (level: string) => {
        const count = level === 'hard' ? 3 : level === 'medium' ? 2 : 1;
        return (
            <div className="flex gap-0.5" title={`Difficulty: ${level}`}>
                {[...Array(3)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < count ? 'fill-gold-500 text-gold-500' : 'text-chocolate-200'}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-12 animate-fade-in relative">
             {/* Decorative Background Elements */}
             <div className="fixed top-20 right-0 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                   <div className="items-center gap-2 mb-2 hidden md:flex">
                        <span className="h-px w-8 bg-gold-500/50"></span>
                        <span className="text-[10px] font-black tracking-[0.3em] text-gold-600 uppercase">Production Standards</span>
                   </div>
                    <h1 className="text-3xl md:text-4xl font-black text-chocolate-950 tracking-tight leading-tight">
                        The Chocolatier's <span className="text-chocolate-600/20 block md:inline">Ledger</span>
                    </h1>
                    <p className="text-chocolate-900/40 font-medium mt-3 max-w-xl">
                        Master collection of couverture formulas, ganache fillings, and production methodologies.
                    </p>
                </div>
                
                <Button 
                    className="h-12 px-6 bg-chocolate-900 text-white hover:bg-chocolate-800 shadow-lg shadow-chocolate-900/20 rounded-xl font-bold tracking-wide transition-all hover:scale-105 active:scale-95"
                    onClick={() => navigate('/recipes/new')}
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Formula
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border border-white/20"></div>
                <div className="relative flex items-center px-4 h-14">
                    <Search className="h-5 w-5 text-chocolate-400 mr-3" />
                    <input 
                        type="text"
                        placeholder="Search formulas by name, code, or ingredients..."
                        className="w-full bg-transparent border-none outline-none text-chocolate-900 placeholder:text-chocolate-900/30 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Recipe Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {[1,2,3].map(i => (
                         <div key={i} className="h-80 rounded-2xl bg-chocolate-100 animate-pulse border border-chocolate-200" />
                     ))}
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-20 bg-white/30 rounded-3xl border border-white/40 backdrop-blur-sm">
                    <div className="h-20 w-20 bg-chocolate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-chocolate-400">
                        <Utensils className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-chocolate-900 mb-2">No Formulas Found</h3>
                    <p className="text-chocolate-600/60 mb-8 max-w-md mx-auto">
                        Your ledger is currently empty. Start by creating a new formula to standardize your production.
                    </p>
                    <Button 
                        variant="outline" 
                        className="border-chocolate-200 text-chocolate-700 hover:bg-chocolate-50"
                        onClick={() => navigate('/recipes/new')}
                    >
                        Create First Formula
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl hover:shadow-chocolate-900/10 transition-all duration-300 cursor-pointer border border-chocolate-200 hover:-translate-y-1"
                            onClick={() => setSelectedRecipe(recipe)}
                        >
                            {/* Card Header / Image Area */}
                            <div className="h-40 bg-gradient-to-br from-chocolate-50 to-chocolate-100 relative overflow-hidden rounded-t-2xl">
                                {recipe.image_url ? (
                                    <img
                                        src={recipe.image_url}
                                        alt={recipe.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                         <ChefHat className="h-14 w-14 text-chocolate-300" />
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                        recipe.is_active
                                        ? 'bg-vibrant-green/10 text-vibrant-green border border-vibrant-green/30'
                                        : 'bg-chocolate-900/80 text-white'
                                    }`}>
                                        {recipe.is_active ? 'Active' : 'Draft'}
                                    </span>
                                </div>

                                {/* Recipe Code Badge */}
                                <div className="absolute top-3 left-3">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-gold-700 bg-gold-100/90 backdrop-blur-sm uppercase tracking-wide">
                                        {recipe.code ?? 'REC-___'}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-5">
                                <div className="flex justify-between items-start gap-2 mb-3">
                                    <h3 className="text-lg font-bold text-chocolate-950 group-hover:text-gold-600 transition-colors leading-tight">
                                        {recipe.name}
                                    </h3>
                                    {renderDifficulty(recipe.difficulty_level)}
                                </div>

                                <p className="text-sm text-chocolate-600 mb-4 leading-relaxed">
                                    {recipe.description ?? 'No description provided.'}
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-chocolate-100">
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-chocolate-50 flex items-center justify-center">
                                            <Scale className="w-4 h-4 text-chocolate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-chocolate-900">{recipe.yield_quantity} {recipe.yield_unit}</p>
                                            <p className="text-chocolate-400 text-[10px] uppercase">Yield</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="w-8 h-8 rounded-lg bg-chocolate-50 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-chocolate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-chocolate-900">{recipe.duration_minutes} min</p>
                                            <p className="text-chocolate-400 text-[10px] uppercase">Duration</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RecipeModal 
                recipe={selectedRecipe} 
                isOpen={!!selectedRecipe} 
                onClose={() => setSelectedRecipe(null)} 
            />
        </div>
    );
};

export default RecipeList;
