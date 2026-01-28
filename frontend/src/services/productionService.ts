import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// ============ REACT QUERY HOOKS ============

/**
 * Hook to get all recipes
 * Usage:
 * ```ts
 * const { data: recipes, isLoading } = useRecipes();
 * ```
 */
export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: () => productionService.getAllRecipes(),
    staleTime: 1000 * 60 * 5, // 5 minutes - recipes don't change often
  });
};

/**
 * Hook to get a single recipe by ID
 */
export const useRecipe = (id: string) => {
  return useQuery({
    queryKey: ['recipes', id],
    queryFn: () => productionService.getRecipeById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get recipe with ingredients
 */
export const useRecipeWithIngredients = (id: string) => {
  return useQuery({
    queryKey: ['recipes', id, 'full'],
    queryFn: () => productionService.getRecipeWithIngredients(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to create a recipe
 */
export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recipe: Partial<Recipe>) => productionService.createRecipe(recipe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
};

/**
 * Hook to update a recipe
 */
export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Recipe> }) => 
      productionService.updateRecipe(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipes', id] });
    },
  });
};

/**
 * Hook to create a batch (automatically deducts ingredient stock)
 * Usage:
 * ```ts
 * const { mutate, isPending } = useCreateBatch();
 * mutate({ recipe_id: '123', quantity_produced: 100 });
 * ```
 */
export const useCreateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateBatchRequest) => productionService.createBatch(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] }); // Stock was deducted
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Hook to get a batch by ID
 */
export const useBatch = (id: string) => {
  return useQuery({
    queryKey: ['batches', id],
    queryFn: () => productionService.getBatchById(id),
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds - batches update frequently
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
};

/**
 * Hook to update a batch
 */
export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateBatchRequest }) => 
      productionService.updateBatch(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batches', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

