/** 
 * Core domain types for inventory module 
 * Used across repository, service, controller & tests 
 */
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
  expiry_date: string | null;
  supplier_id: string | null;
  created_by: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  // computed
  is_low_stock: boolean;
  supplier_name?: string;
}

export interface StockUpdateInput {
  ingredient_id: string;
  quantity_change: number;
  reason?: StockUpdateReason;
  notes?: string;
}

export interface StockUpdateResult {
  ingredient_id: string;
  previous_stock: number;
  new_stock: number;
  change: number;
  reason?: StockUpdateReason;
  notes?: string;
  updated_by: string;
  updated_at: string;
}

export const STOCK_UPDATE_REASONS = [
  'PRODUCTION_USAGE',
  'SUPPLIER_DELIVERY',
  'MANUAL_ADJUSTMENT',
  'QUALITY_ISSUE',
  'EXPIRED_REMOVAL',
  'DAMAGE_LOSS',
  'INVENTORY_RECONCILIATION',
] as const;

export type StockUpdateReason = typeof STOCK_UPDATE_REASONS[number];

export interface InventoryFilters {
  low_stock_only?: boolean;
  expiring_soon_days?: number;
  supplier_id?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
}
