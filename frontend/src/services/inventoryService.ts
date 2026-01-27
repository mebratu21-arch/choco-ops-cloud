import apiClient from '../lib/api/axios';
import { 
  Ingredient,
  InventoryFilters,
  StockUpdateInput,
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
   * Note: This endpoint may not be implemented in backend yet
   */
  async updateStock(update: StockUpdateInput): Promise<void> {
    const { data } = await apiClient.post<ApiResponse>('/ingredients/stock-update', update);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update stock');
    }
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
