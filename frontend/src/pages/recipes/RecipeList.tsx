import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  BookOpen, 
  Search, 
  Plus, 
  ChefHat, 
  Scale, 
  Clock, 
  MoreVertical,
  Edit2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Recipe } from '../../types';

// Mock data service until backend is ready
const fetchRecipes = async (): Promise<Recipe[]> => {
    // In a real scenario, this would be: 
    // const { data } = await axios.get('/api/recipes');
    // return data.data;

    // Returning mock data for UI development
    return [
        {
            id: '1',
            name: 'Dark Chocolate 70%',
            code: 'REC-DC70',
            description: 'Standard dark chocolate formulation with 70% cocoa solids.',
            batch_size: 1000,
            batch_unit: 'kg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '2',
            name: 'Milk Chocolate Special',
            code: 'REC-MC45',
            description: 'Creamy milk chocolate with Swiss milk powder.',
            batch_size: 500,
            batch_unit: 'kg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '3',
            name: 'Hazelnut Praline Filling',
            code: 'REC-HPF',
            description: 'Roasted hazelnut paste for truffles.',
            batch_size: 200,
            batch_unit: 'kg',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
};

const RecipeList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: recipes = [], isLoading } = useQuery({
        queryKey: ['recipes'],
        queryFn: fetchRecipes
    });

    const filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-serif text-cocoa-900">Recipe Book</h1>
                    <p className="text-muted-foreground">Manage production formulas and ingredients</p>
                </div>
                <Button 
                    className="gap-2 bg-gold-500 hover:bg-gold-600 text-white shadow-md hover:shadow-lg transition-all"
                    onClick={() => navigate('/recipes/new')}
                >
                    <Plus className="h-4 w-4" /> New Recipe
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
                    <Button variant="outline" className="border-gold-200 text-gold-700 hover:bg-gold-50">
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
                                    {recipe.code || 'NO-CODE'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                                    {recipe.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded">
                                        <Scale className="h-4 w-4 text-cocoa-400" />
                                        <span className="font-medium">{recipe.batch_size} {recipe.batch_unit}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded">
                                        <Clock className="h-4 w-4 text-cocoa-400" />
                                        <span className="font-medium">45 mins</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <Button variant="outline" className="flex-1 hover:bg-gold-50 border-gray-200 hover:border-gold-200 text-slate-700">
                                        <Edit2 className="h-3 w-3 me-2" /> Edit
                                    </Button>
                                    <Button 
                                        variant="default" 
                                        className="flex-1 bg-cocoa-500 hover:bg-cocoa-600 shadow-sm"
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
