export interface Ingredient {
  id: string;
  name: string;
  code: string | null;
  current_stock: number;
  minimum_stock: number;
  optimal_stock: number;
  unit: 'kg' | 'g' | 'liter' | 'ml' | 'unit' | 'pack';
  aisle?: string;
  shelf?: string;
  bin?: string;
  cost_per_unit: number;
  expiry_date?: string | null;
  supplier_id?: string;
  is_active: boolean;
  is_low_stock: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface StockUpdateInput {
  ingredient_id: string;
  quantity_change: number;
  reason?: string;
}

export interface StockUpdateResult {
  ingredient_id: string;
  previous_stock: number;
  new_stock: number;
  change: number;
  reason?: string;
  updated_by: string;
}

export interface InventoryFilters {
  low_stock_only?: boolean;
  expiring_soon_days?: number;
  supplier_id?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
}
