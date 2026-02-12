import apiClient from '../lib/api/axios';
import { EmployeeSale, OnlineOrder, APIResponse as ApiResponse, Product } from '../types';

export interface PaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
}

export const salesService = {
  /**
   * Get all employee sales
   * GET /api/sales/employee
   */
  async getAllSales(): Promise<EmployeeSale[]> {
    const { data } = await apiClient.get<ApiResponse<EmployeeSale[]>>('/sales/employee');

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.error ?? 'Failed to fetch sales');
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
    
    throw new Error(data.error ?? 'Sale not found');
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
    
    throw new Error(data.error ?? 'Failed to create sale');
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
    
    throw new Error(data.error ?? 'Failed to fetch orders');
  },

  /**
   * Get all products
   * GET /api/shop
   */
  async getProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<ApiResponse<Product[]>>('/shop');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error ?? 'Failed to fetch products');
  },

  /**
   * Get product categories
   * GET /api/shop/categories
   */
  async getProductCategories(): Promise<string[]> {
    const { data } = await apiClient.get<ApiResponse<string[]>>('/shop/categories');

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.error ?? 'Failed to fetch categories');
  },

  /**
   * Create Stripe payment intent
   * POST /api/payments/create-intent
   */
  async createPaymentIntent(items: PaymentItem[], customerEmail?: string): Promise<PaymentIntentResponse> {
    const { data } = await apiClient.post<ApiResponse<PaymentIntentResponse>>('/payments/create-intent', {
      items,
      customerEmail,
    });

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.error ?? 'Failed to create payment intent');
  },

  /**
   * Confirm payment was successful
   * POST /api/payments/confirm
   */
  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; status: string }> {
    const { data } = await apiClient.post<ApiResponse<{ success: boolean; status: string }>>('/payments/confirm', {
      paymentIntentId,
    });

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.error ?? 'Failed to confirm payment');
  },

  /**
   * Check if Stripe is configured
   * GET /api/payments/config
   */
  async getPaymentConfig(): Promise<{ configured: boolean }> {
    const { data } = await apiClient.get<ApiResponse<{ configured: boolean }>>('/payments/config');

    if (data.success && data.data) {
      return data.data;
    }

    return { configured: false };
  },
};
