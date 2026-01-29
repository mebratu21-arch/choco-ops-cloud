import apiClient from '../lib/api/axios';
import { Recipe, ApiResponse } from '../types';

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
  const { data } = await apiClient.get<ApiResponse<Recipe[]>>('/recipes');
  return data.data!;
};

/**
 * Fetch single recipe by ID
 */
export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  const { data } = await apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`);
  return data.data!;
};

/**
 * Fetch recipe with all ingredients
 */
export const fetchRecipeWithIngredients = async (id: string): Promise<RecipeWithIngredients> => {
  const { data } = await apiClient.get<ApiResponse<RecipeWithIngredients>>(`/recipes/${id}/full`);
  return data.data!;
};

/**
 * Create new recipe
 */
export const createRecipe = async (recipeData: Partial<Recipe>): Promise<Recipe> => {
  const { data } = await apiClient.post<ApiResponse<Recipe>>('/recipes', recipeData);
  return data.data!;
};

/**
 * Update existing recipe
 */
export const updateRecipe = async (id: string, recipeData: Partial<Recipe>): Promise<Recipe> => {
  const { data } = await apiClient.put<ApiResponse<Recipe>>(`/recipes/${id}`, recipeData);
  return data.data!;
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
  const { data } = await apiClient.post<ApiResponse>(`/recipes/${recipeId}/ingredients`, ingredientData);
  return data.data;
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
  const { data } = await apiClient.post<ApiResponse<ImportRecipeResult>>('/recipes/import', payload);
  return data.data!;
};
