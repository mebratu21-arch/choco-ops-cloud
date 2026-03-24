import apiClient from '../lib/api/axios';
import { Recipe, APIResponse } from '../types';

export interface RecipeWithIngredients extends Recipe {
  ingredients?: {
    id: string;
    ingredient_id: string;
    ingredient_name?: string;
    quantity: number;
    unit: string;
  }[];
}

export interface RecipeIngredientInput {
  ingredient_id: string;
  quantity: number;
  unit: string;
}

/**
 * Fetch all recipes
 */
export const fetchRecipes = async (): Promise<Recipe[]> => {
  const response = await apiClient.get<APIResponse<Recipe[]>>('/recipes');
  return response.data.data ?? [];
};

/**
 * Fetch single recipe by ID
 */
export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  const response = await apiClient.get<APIResponse<Recipe>>(`/recipes/${id}`);
  if (!response.data.data) throw new Error('Recipe not found');
  return response.data.data;
};

/**
 * Fetch recipe with all ingredients
 */
export const fetchRecipeWithIngredients = async (id: string): Promise<RecipeWithIngredients> => {
  const response = await apiClient.get<APIResponse<RecipeWithIngredients>>(`/recipes/${id}/full`);
  if (!response.data.data) throw new Error('Recipe not found');
  return response.data.data;
};

/**
 * Create new recipe
 */
export const createRecipe = async (recipeData: Partial<Recipe>): Promise<Recipe> => {
  const response = await apiClient.post<APIResponse<Recipe>>('/recipes', recipeData);
  if (!response.data.data) throw new Error('Failed to create recipe');
  return response.data.data;
};

/**
 * Update existing recipe
 */
export const updateRecipe = async (id: string, recipeData: Partial<Recipe>): Promise<Recipe> => {
  const response = await apiClient.put<APIResponse<Recipe>>(`/recipes/${id}`, recipeData);
  if (!response.data.data) throw new Error('Failed to update recipe');
  return response.data.data;
};

/**
 * Delete recipe
 */
export const deleteRecipe = async (id: string): Promise<void> => {
  await apiClient.delete(`/recipes/${id}`);
};

/**
 * Add ingredient to recipe
 */
export const addIngredientToRecipe = async (
  recipeId: string,
  ingredientData: RecipeIngredientInput
): Promise<unknown> => {
  const response = await apiClient.post<APIResponse>(`/recipes/${recipeId}/ingredients`, ingredientData);
  return response.data.data;
};

/**
 * Remove ingredient from recipe
 */
export const removeIngredientFromRecipe = async (recipeId: string, ingredientId: string): Promise<void> => {
  await apiClient.delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
};

/**
 * Import recipes from JSON with scaling factor
 */
export interface ImportRecipePayload {
  scaling_factor?: number;
  recipes: {
    title: string;
    batch_size: string;
    ingredients: { item: string; amount: number; unit: string }[];
    instructions: string[];
    description?: string;
  }[];
}

export interface ImportRecipeResult {
  success: boolean;
  imported: number;
  failed: number;
  scaling_factor: number;
  results: {
    title: string;
    status: 'success' | 'failed';
    id?: string;
    error?: string;
    ingredients?: { name: string; status: string }[];
  }[];
}

export const importRecipes = async (payload: ImportRecipePayload): Promise<ImportRecipeResult> => {
  const response = await apiClient.post<APIResponse<ImportRecipeResult>>('/recipes/import', payload);
  if (!response.data.data) throw new Error('Failed to import recipes');
  return response.data.data;
};
