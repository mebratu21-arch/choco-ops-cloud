export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  price?: number;
  description?: string;
  is_active?: boolean;
}

export interface Order {
  id: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
