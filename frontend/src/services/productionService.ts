import api from './api';
import { 
  Recipe, 
  ProductionBatch, 
  BatchStatus, 
  BatchFilters,
  APIResponse,
  PaginationMeta
} from '../types';

interface RecipeListResponse {
  recipes: Recipe[];
  meta?: PaginationMeta;
}

interface BatchListResponse {
  batches: ProductionBatch[];
  meta?: PaginationMeta;
}

export interface IngredientCheckItem {
  id?: string;
  name: string;
  required: number;
  available: number;
  unit: string;
}

export interface IngredientCheckResult {
  available: boolean;
  missing?: IngredientCheckItem[];
}

export const productionService = {
  // --- Recipe Functions ---

  /**
   * Get all recipes with optional filters
   */
  async getAllRecipes(filters?: { category?: string; search?: string }): Promise<RecipeListResponse> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get<never, APIResponse<RecipeListResponse>>(`/recipes?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return { recipes: [] };
  },

  /**
   * Get a single recipe by ID
   */
  async getRecipeById(id: string): Promise<Recipe> {
    const response = await api.get<never, APIResponse<Recipe>>(`/recipes/${id}`);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Recipe not found');
  },

  /**
   * Create a new recipe
   */
  async createRecipe(data: Omit<Recipe, 'id' | 'isActive'>): Promise<Recipe> {
    const response = await api.post<Omit<Recipe, 'id' | 'isActive'>, APIResponse<Recipe>>('/recipes', data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to create recipe');
  },

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
    const response = await api.put<Partial<Recipe>, APIResponse<Recipe>>(`/recipes/${id}`, data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to update recipe');
  },

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<boolean> {
    const response = await api.delete<never, APIResponse<null>>(`/recipes/${id}`);
    return response.success;
  },

  // --- Batch Functions ---

  /**
   * Get all production batches with filters
   */
  async getAllBatches(filters?: BatchFilters): Promise<BatchListResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateRange) {
      params.append('startDate', filters.dateRange.from);
      params.append('endDate', filters.dateRange.to);
    }

    const response = await api.get<never, APIResponse<BatchListResponse>>(`/batches?${params.toString()}`);
    if (response.success && response.data) return response.data;
    return { batches: [] };
  },

  /**
   * Get single batch details
   */
  async getBatchById(id: string): Promise<ProductionBatch> {
    const response = await api.get<never, APIResponse<ProductionBatch>>(`/batches/${id}`);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Batch not found');
  },

  /**
   * Start a new production batch
   */
  async createBatch(data: { recipeId: string; targetQuantity: number; notes?: string }): Promise<ProductionBatch> {
    const response = await api.post<{ recipeId: string; targetQuantity: number; notes?: string }, APIResponse<ProductionBatch>>('/batches', data);
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to create batch');
  },

  /**
   * Update batch status
   */
  async updateBatchStatus(id: string, status: BatchStatus): Promise<ProductionBatch> {
    const response = await api.put<{ status: BatchStatus }, APIResponse<ProductionBatch>>(`/batches/${id}/status`, { status });
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to update batch status');
  },

  /**
   * Complete batch with actual quantity
   */
  async completeBatch(id: string, actualQuantity: number): Promise<ProductionBatch> {
    // This could also be an updateBatchStatus call depending on backend API design,
    // but assuming a specific endpoint or logic for completion with quantity.
    // Based on user request: "PUT /api/batches/:id/status -> update batch status"
    // and "completeBatch(id, actualQuantity)".
    // I will implement this as a specific action if endpoint exists, otherwise update status + quantity.
    // Spec didn't give explicit endpoint for completion other than update status, allowing flexible implementation.
    // I'll assume standard PUT update for now or status update + payload.
    // Let's assume the update status endpoint accepts additional data.
    
    const response = await api.put<{ status: string; actualQuantity: number }, APIResponse<ProductionBatch>>(`/batches/${id}/status`, { 
      status: 'completed', 
      actualQuantity 
    });
    
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Failed to complete batch');
  },

  /**
   * Check if enough ingredients are available
   */
  async checkIngredients(recipeId: string, quantity: number): Promise<IngredientCheckResult> {
    const response = await api.post<{ recipeId: string; quantity: number }, APIResponse<IngredientCheckResult>>('/batches/check-ingredients', { 
      recipeId, 
      quantity 
    });
    
    if (response.success && response.data) return response.data;
    // Default fail safe
    return { available: false, missing: [] };
  }
};
