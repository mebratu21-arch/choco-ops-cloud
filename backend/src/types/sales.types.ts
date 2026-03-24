/**
 * Core domain types for sales module
 */
export interface EmployeeSaleInput {
  buyer_id: string;
  batch_id: string;
  quantity_sold: number;
  unit: 'kg' | 'g' | 'liter' | 'unit' | 'pack' | 'bar';
  discount_percentage?: number;
  deduct_stock: boolean;  // flag to deduct from inventory
  notes?: string;
}

export interface OnlineOrder {
  id: string;
  customer_email: string;
  customer_name?: string;
  batch_id?: string;
  quantity: number;
  unit: string;
  total_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  order_date: string;
  processed_date?: string;
  notes?: string;
}

export const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export interface EmployeeSale {
  id: string;
  seller_id: string;
  buyer_id: string;
  batch_id: string;
  quantity_sold: number;
  unit: string;
  original_price: number;
  discount_percentage: number;
  final_amount: number;
  payment_method: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
