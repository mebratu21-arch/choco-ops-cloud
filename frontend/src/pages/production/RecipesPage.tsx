import React, { useState } from 'react';
import { Search, Filter, ChefHat, Plus } from 'lucide-react';
import { useProduction } from '../../hooks/useProduction';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import RecipeCard from '../../components/production/RecipeCard';
import { Recipe } from '../../types';
import PageHeader from '../../components/layout/PageHeader';
import { motion } from 'framer-motion';

const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const { useRecipes } = useProduction();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: recipesData, isLoading } = useRecipes({
    search: searchQuery,
    category: categoryFilter
  });

  const recipes = recipesData?.recipes ?? [];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <PageHeader 
        title="Recipe Collections" 
        subtitle="Manage standard operating procedures, formulations, and production variants."
        actions={
          <Button 
            onClick={() => navigate('/production/recipes/new')} 
            className="bg-gradient-to-r from-chocolate-600 to-chocolate-800 text-white shadow-lg shadow-chocolate-900/20 hover:shadow-chocolate-900/40 transition-all active:scale-95 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Formulation
          </Button>
        }
      />

      {/* Filters & Search */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-[2rem] border border-chocolate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center sticky top-4 z-20">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-400 group-focus-within:text-gold-500 transition-colors" />
          <input
            type="text"
            placeholder="Search formulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-chocolate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-medium text-chocolate-900 placeholder:text-chocolate-300 shadow-sm group-hover:border-chocolate-200"
          />
        </div>

        <div className="relative w-full md:w-56 group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-chocolate-400 group-focus-within:text-gold-500 transition-colors" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-11 pr-8 py-3 bg-white border border-chocolate-100 rounded-xl text-sm text-chocolate-700 font-bold focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 appearance-none shadow-sm cursor-pointer hover:border-chocolate-200 transition-all"
          >
            <option value="">All Collections</option>
            <option value="Truffles">Truffles & Bonbons</option>
            <option value="Bars">Artisan Bars</option>
            <option value="Pralines">Pralines</option>
            <option value="Ganache">Ganache & Fillings</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-chocolate-400">
             <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-[2rem] border border-chocolate-100 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {recipes.map((recipe: Recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onClick={() => navigate(`/production/recipes/${recipe.id}`)}
              onEdit={() => navigate(`/production/recipes/${recipe.id}/edit`)}
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-chocolate-50/30 rounded-[2.5rem] border border-dashed border-chocolate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-chocolate-100 shadow-sm">
            <ChefHat className="w-8 h-8 text-chocolate-300" />
          </div>
          <h3 className="text-lg font-bold text-chocolate-900">No recipes found</h3>
          <p className="text-chocolate-500 mt-1 font-medium">Try adjusting your search or filters, or create a new formulation.</p>
        </div>
      )}
    </div>
  );
};

export default RecipesPage;
