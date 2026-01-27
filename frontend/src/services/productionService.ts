import apiClient from '../lib/api/axios';
import { 
  Recipe, 
  RecipeWithIngredients,
  Batch,
  CreateBatchRequest,
  UpdateBatchRequest,
  ApiResponse
} from '../types';

export const productionService = {
  // ============ RECIPES ============
  
  /**
   * Get all recipes
   * GET /api/recipes
   */
  async getAllRecipes(): Promise<Recipe[]> {
    const { data } = await apiClient.get<ApiResponse<Recipe[]>>('/recipes');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch recipes');
  },

  /**
   * Get recipe by ID
   * GET /api/recipes/:id
   */
  async getRecipeById(id: string): Promise<Recipe> {
    const { data } = await apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Recipe not found');
  },

  /**
   * Get recipe with ingredients
   * GET /api/recipes/:id/full
   */
  async getRecipeWithIngredients(id: string): Promise<RecipeWithIngredients> {
    const { data } = await apiClient.get<ApiResponse<RecipeWithIngredients>>(`/recipes/${id}/full`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Recipe not found');
  },

  /**
   * Create new recipe
   * POST /api/recipes
   * Requires: ADMIN, MANAGER, or PRODUCTION role
   */
  async createRecipe(recipe: Partial<Recipe>): Promise<Recipe> {
    const { data } = await apiClient.post<ApiResponse<Recipe>>('/recipes', recipe);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create recipe');
  },

  /**
   * Update recipe
   * PUT /api/recipes/:id
   * Requires: ADMIN, MANAGER, or PRODUCTION role
   */
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data } = await apiClient.put<ApiResponse<Recipe>>(`/recipes/${id}`, updates);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update recipe');
  },

  /**
   * Delete recipe (soft delete)
   * DELETE /api/recipes/:id
   * Requires: ADMIN or MANAGER role
   */
  async deleteRecipe(id: string): Promise<void> {
    const { data } = await apiClient.delete<ApiResponse>(`/recipes/${id}`);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete recipe');
    }
  },

  // ============ PRODUCTION BATCHES ============
  
  /**
   * Create production batch (automatically deducts ingredient stock)
   * POST /api/production
   * Requires: MANAGER or PRODUCTION role
   * 
   * IMPORTANT: This endpoint automatically deducts ingredient stock in a transaction.
   * If insufficient stock, it returns 400 error.
   */
  async createBatch(request: CreateBatchRequest): Promise<Batch> {
    const { data } = await apiClient.post<ApiResponse<Batch>>('/production', {
      recipe_id: request.recipe_id,
      quantity_produced: request.quantity_produced,
      notes: request.notes,
    });
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create batch');
  },

  /**
   * Get batch by ID
   * GET /api/production/:id
   */
  async getBatchById(id: string): Promise<Batch> {
    const { data } = await apiClient.get<ApiResponse<Batch>>(`/production/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Batch not found');
  },

  /**
   * Update batch
   * PATCH /api/production/:id
   * Requires: MANAGER or PRODUCTION role
   */
  async updateBatch(id: string, updates: UpdateBatchRequest): Promise<Batch> {
    const { data } = await apiClient.patch<ApiResponse<Batch>>(`/production/${id}`, updates);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update batch');
  },

  // ============ LEGACY COMPATIBILITY ============
  
  /**
   * @deprecated Use createBatch instead
   * Legacy method for backward compatibility
   */
  async produceBatch(request: { recipe_id: string }): Promise<{ batch_number?: string; batch_id?: string }> {
    const batch = await this.createBatch({
      recipe_id: request.recipe_id,
      quantity_produced: 1, // Default quantity
    });
    
    return {
      batch_number: batch.batch_number,
      batch_id: batch.id,
    };
  },
};
