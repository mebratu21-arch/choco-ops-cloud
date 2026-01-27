import apiClient from '../lib/api/axios';
import { EmployeeSale, OnlineOrder, ApiResponse } from '../types';

export const salesService = {
  /**
   * Get all employee sales
   * GET /api/sales
   */
  async getAllSales(): Promise<EmployeeSale[]> {
    const { data } = await apiClient.get<ApiResponse<EmployeeSale[]>>('/sales');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch sales');
  },

  /**
   * Get sale by ID
   * GET /api/sales/:id
   */
  async getSaleById(id: string): Promise<EmployeeSale> {
    const { data } = await apiClient.get<ApiResponse<EmployeeSale>>(`/sales/${id}`);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Sale not found');
  },

  /**
   * Create employee sale
   * POST /api/sales
   */
  async createSale(saleData: Partial<EmployeeSale>): Promise<EmployeeSale> {
    const { data } = await apiClient.post<ApiResponse<EmployeeSale>>('/sales', saleData);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create sale');
  },

  /**
   * Get all online orders
   * GET /api/sales/orders
   */
  async getAllOrders(): Promise<OnlineOrder[]> {
    const { data } = await apiClient.get<ApiResponse<OnlineOrder[]>>('/sales/orders');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch orders');
  },
};
