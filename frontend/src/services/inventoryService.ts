import api from './api';
import { 
  InventoryItem, 
  InventoryFilters, 
  StockUpdateData, 
  InventoryMovement, 
  APIResponse,
  PaginationMeta
} from '../types';

interface InventoryListResponse {
  items: InventoryItem[];
  meta?: PaginationMeta;
}

export const inventoryService = {
  /**
   * Get all inventory items with optional filters
   */
  async getAllItems(filters?: InventoryFilters): Promise<InventoryListResponse> {
    // Construct query parameters
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.lowStock) params.append('lowStock', 'true');
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    interface InventoryRawResponse {
      items: InventoryItem[];
      pagination?: {
        total: number;
        totalPages: number;
        page: number;
        limit: number;
      };
    }

    const response = await api.get<never, APIResponse<InventoryRawResponse>>(`/inventory?${params.toString()}`);
    
    if (response.success && response.data) {
      const raw = response.data;
      // Backend returns { items, pagination: { page, limit, total, totalPages } }
      // Frontend expects { items, meta: { total, totalPages } }
      return {
        items: raw.items || [],
        meta: raw.pagination ? {
          total: raw.pagination.total,
          totalPages: raw.pagination.totalPages,
          page: raw.pagination.page,
          limit: raw.pagination.limit,
        } : undefined,
      };
    }
    
    return { items: [] };
  },

  /**
   * Get a single inventory item by ID
   */
  async getItemById(id: string): Promise<InventoryItem> {
    const response = await api.get<never, APIResponse<InventoryItem>>(`/inventory/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message ?? 'Item not found');
  },

  /**
   * Search inventory items (shortcut for getAllItems with search param)
   */
  async searchItems(query: string): Promise<InventoryItem[]> {
    const response = await api.get<never, APIResponse<InventoryItem[]>>(`/inventory/search?q=${encodeURIComponent(query)}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  },

  /**
   * Create a new inventory item
   */
  async createItem(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    const response = await api.post<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>, APIResponse<InventoryItem>>('/inventory', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message ?? 'Failed to create item');
  },

  /**
   * Update an existing inventory item
   */
  async updateItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.put<Partial<InventoryItem>, APIResponse<InventoryItem>>(`/inventory/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message ?? 'Failed to update item');
  },

  /**
   * Delete an inventory item
   */
  async deleteItem(id: string): Promise<boolean> {
    const response = await api.delete<never, APIResponse<null>>(`/inventory/${id}`);
    return response.success;
  },

  /**
   * Update stock quantity (IN/OUT/ADJUSTMENT)
   */
  async updateStock(id: string, data: StockUpdateData): Promise<InventoryItem> {
    const response = await api.post<StockUpdateData, APIResponse<InventoryItem>>(`/inventory/${id}/stock`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message ?? 'Failed to update stock');
  },

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(): Promise<InventoryItem[]> {
    const response = await api.get<never, APIResponse<InventoryItem[]>>('/inventory/alerts/low-stock');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  },

  /**
   * Get expiry alerts
   */
  async getExpiryAlerts(): Promise<InventoryItem[]> {
    const response = await api.get<never, APIResponse<InventoryItem[]>>('/inventory/alerts/expiry');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  },

  /**
   * Get movement history for a specific item
   */
  async getMovementHistory(itemId: string): Promise<InventoryMovement[]> {
    const response = await api.get<never, APIResponse<InventoryMovement[]>>(`/inventory/${itemId}/movements`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    return [];
  }
};
