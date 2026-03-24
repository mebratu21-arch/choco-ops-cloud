import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productionService } from '../services/productionService';
import { BatchFilters, BatchStatus, Recipe } from '../types';

// Query Keys
export const productionKeys = {
  recipes: {
    all: ['recipes'] as const,
    lists: () => [...productionKeys.recipes.all, 'list'] as const,
    list: (filters: { category?: string; search?: string }) => [...productionKeys.recipes.lists(), filters] as const,
    detail: (id: string) => [...productionKeys.recipes.all, 'detail', id] as const,
  },
  batches: {
    all: ['batches'] as const,
    lists: () => [...productionKeys.batches.all, 'list'] as const,
    list: (filters: BatchFilters) => [...productionKeys.batches.lists(), filters] as const,
    detail: (id: string) => [...productionKeys.batches.all, 'detail', id] as const,
  },
};

export const useProduction = () => {
  const queryClient = useQueryClient();

  // --- Recipes ---

  const useRecipes = (filters?: { category?: string; search?: string }) => {
    return useQuery({
      queryKey: productionKeys.recipes.list(filters ?? {}),
      queryFn: () => productionService.getAllRecipes(filters),
    });
  };

  const useRecipe = (id: string) => {
    return useQuery({
      queryKey: productionKeys.recipes.detail(id),
      queryFn: () => productionService.getRecipeById(id),
      enabled: !!id,
    });
  };

  const useCreateRecipe = () => {
    return useMutation({
      mutationFn: (data: Omit<Recipe, 'id' | 'isActive'>) => productionService.createRecipe(data),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: productionKeys.recipes.lists() });
      },
    });
  };

  const useUpdateRecipe = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Recipe> }) => productionService.updateRecipe(id, data),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: productionKeys.recipes.detail(data.id) });
        void queryClient.invalidateQueries({ queryKey: productionKeys.recipes.lists() });
      },
    });
  };

  // --- Batches ---

  const useBatches = (filters?: BatchFilters) => {
    return useQuery({
      queryKey: productionKeys.batches.list(filters ?? {}),
      queryFn: () => productionService.getAllBatches(filters),
      refetchInterval: 30000, // Refresh every 30s to see status updates
    });
  };

  const useBatch = (id: string) => {
    return useQuery({
      queryKey: productionKeys.batches.detail(id),
      queryFn: () => productionService.getBatchById(id),
      enabled: !!id,
      refetchInterval: 10000, // Faster refresh for single batch
    });
  };

  const useCreateBatch = () => {
    return useMutation({
      mutationFn: (data: { recipeId: string; targetQuantity: number; notes?: string }) => productionService.createBatch(data),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: productionKeys.batches.lists() });
        // Also might affect inventory stocks
        void queryClient.invalidateQueries({ queryKey: ['inventory'] }); 
      },
    });
  };

  const useUpdateBatchStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: BatchStatus }) => productionService.updateBatchStatus(id, status),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: productionKeys.batches.detail(data.id) });
        void queryClient.invalidateQueries({ queryKey: productionKeys.batches.lists() });
      },
    });
  };

  const useCheckIngredients = () => {
    return useMutation({
      mutationFn: ({ recipeId, quantity }: { recipeId: string; quantity: number }) => productionService.checkIngredients(recipeId, quantity),
    });
  };

  return {
    useRecipes,
    useRecipe,
    useCreateRecipe,
    useUpdateRecipe,
    useBatches,
    useBatch,
    useCreateBatch,
    useUpdateBatchStatus,
    useCheckIngredients,
  };
};
