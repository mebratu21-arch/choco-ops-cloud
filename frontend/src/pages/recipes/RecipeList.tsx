import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Search,
    ChefHat,
    Scale,
    MoreVertical,
    BookOpen,
    PlusCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '../../types';

import { fetchRecipes } from '../../services/recipeService';

const RecipeList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
        queryKey: ['recipes'],
        queryFn: fetchRecipes,
    });

    const filteredRecipes = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">
                        Recipe Library
                    </h1>
                    <p className="text-muted-foreground">
                        Browse and manage production recipes
                    </p>
                </div>
                <Button 
                    className="gap-2 bg-cocoa-600 hover:bg-cocoa-700 text-white shadow-sm"
                    onClick={() => navigate('/recipes/new')}
                >
                    <PlusCircle className="h-4 w-4" />
                    Create Recipe
                </Button>
            </div>

            {/* Search and Filter */}
            <Card className="border-cocoa-100 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search recipes by name or code..."
                                className="ps-9 border-cocoa-200 focus:border-gold-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recipe Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading recipes...</p>
                </div>
            ) : filteredRecipes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
                    <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-cocoa-900">No recipes found</h3>
                    <p className="text-muted-foreground mb-4">Create your first recipe to get started.</p>
                    <Button 
                        variant="outline" 
                        className="border-gold-200 text-gold-700 hover:bg-gold-50"
                        onClick={() => navigate('/recipes/new')}
                    >
                        Create Recipe
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRecipes.map((recipe) => (
                        <Card key={recipe.id} className="group hover:shadow-lg transition-all duration-300 border-cocoa-100 hover:border-gold-200">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="bg-gold-50 p-2 rounded-lg group-hover:bg-gold-100 transition-colors">
                                        <ChefHat className="h-6 w-6 text-gold-600" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cocoa-600">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                                <CardTitle className="mt-3 text-xl text-cocoa-900 group-hover:text-gold-700 transition-colors">
                                    {recipe.name}
                                </CardTitle>
                                <CardDescription className="font-mono text-xs text-slate-500">
                                    {recipe.code ?? 'NO-CODE'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <Scale className="h-4 w-4 text-cocoa-400" />
                                    <span>Batch: {recipe.batch_size} {recipe.batch_unit}</span>
                                </div>
                                {recipe.description && (
                                    <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                                        {recipe.description}
                                    </p>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 hover:bg-gold-50 border-gray-200 hover:border-gold-200 text-slate-700"
                                        onClick={() => navigate(`/recipes/${recipe.id}`)}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecipeList;
