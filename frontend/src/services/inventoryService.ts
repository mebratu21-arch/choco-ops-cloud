import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Ingredient,
  InventoryFilters,
  ApiResponse
} from '../types';

export const inventoryService = {
  /**
   * Get all ingredients with optional filters
   * GET /api/ingredients
   */
  async getIngredients(filters?: InventoryFilters): Promise<Ingredient[]> {
    const { data } = await apiClient.get<ApiResponse<Ingredient[]>>('/ingredients', {
      params: filters,
    });
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch ingredients');
  },

  /**
   * Get ingredient by ID
   * GET /api/ingredients/:id
   */
  async getIngredientById(id: string): Promise<Ingredient> {
    const { data } = await apiClient.get<ApiResponse<Ingredient>>(`/ingredients/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Ingredient not found');
  },

  /**
   * Get low stock ingredients
   * GET /api/ingredients/low-stock
   */
  async getLowStock(): Promise<Ingredient[]> {
    const { data } = await apiClient.get<ApiResponse<Ingredient[]>>('/ingredients/low-stock');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch low stock ingredients');
  },

  /**
   * Get expiring soon ingredients
   * GET /api/ingredients/expiring-soon?days=X
   */
  async getExpiringSoon(days: number = 30): Promise<Ingredient[]> {
    const { data } = await apiClient.get<ApiResponse<Ingredient[]>>('/ingredients/expiring-soon', {
      params: { days },
    });
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch expiring ingredients');
  },

  /**
   * Update ingredient stock
   * PUT /api/inventory/:id
   */
  async updateStock(id: string, stockData: { current_stock: number; reason?: string }): Promise<Ingredient> {
    const { data } = await apiClient.put<ApiResponse<Ingredient>>(`/inventory/${id}`, stockData);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update stock');
  },

  // ============ LEGACY COMPATIBILITY ============
  
  /**
   * @deprecated Use getIngredients instead
   */
  async getAllMaterials(): Promise<Ingredient[]> {
    return this.getIngredients();
  },

  /**
   * @deprecated Use getIngredientById instead
   */
  async getMaterialById(id: string): Promise<Ingredient> {
    return this.getIngredientById(id);
  },
};

// ============ REACT QUERY HOOKS ============

/**
 * Hook to get all ingredients with optional filters
 * Usage:
 * ```ts
 * const { data: ingredients, isLoading } = useIngredients({ low_stock_only: true });
 * ```
 */
export const useIngredients = (filters?: InventoryFilters) => {
  return useQuery({
    queryKey: ['ingredients', filters],
    queryFn: () => inventoryService.getIngredients(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to get a single ingredient by ID
 */
export const useIngredient = (id: string) => {
  return useQuery({
    queryKey: ['ingredients', id],
    queryFn: () => inventoryService.getIngredientById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * Hook to get low stock ingredients
 */
export const useLowStock = () => {
  return useQuery({
    queryKey: ['ingredients', 'low-stock'],
    queryFn: () => inventoryService.getLowStock(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Auto-refresh every 2 minutes
  });
};

/**
 * Hook to get expiring soon ingredients
 */
export const useExpiringSoon = (days: number = 30) => {
  return useQuery({
    queryKey: ['ingredients', 'expiring-soon', days],
    queryFn: () => inventoryService.getExpiringSoon(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to update ingredient stock with optimistic updates
 * Usage:
 * ```ts
 * const { mutate } = useUpdateStock();
 * mutate({ id: '123', current_stock: 50, reason: 'Manual adjustment' });
 * ```
 */
export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, current_stock, reason }: { id: string; current_stock: number; reason?: string }) => 
      inventoryService.updateStock(id, { current_stock, reason }),
    // Optimistic update
    onMutate: async ({ id, current_stock }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['ingredients'] });
      
      // Snapshot previous value
      const previousIngredients = queryClient.getQueryData<Ingredient[]>(['ingredients']);
      
      // Optimistically update
      queryClient.setQueryData<Ingredient[]>(['ingredients'], (old) => 
        old?.map(item => item.id === id ? { ...item, current_stock } : item)
      );
      
      return { previousIngredients };
    },
    // On error, rollback
    onError: (_err, _variables, context) => {
      if (context?.previousIngredients) {
        queryClient.setQueryData(['ingredients'], context.previousIngredients);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredients', 'low-stock'] });
    },
  });
};

