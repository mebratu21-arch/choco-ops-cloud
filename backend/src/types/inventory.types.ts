/**
 * CocoaFlow Backend - Inventory Type Definitions
 */

// ===========================================
// ENUMS & CONSTANTS
// ===========================================

export type MovementType = 'in' | 'out' | 'adjustment' | 'expired' | 'damaged';
export type ItemCategory = 'raw_material' | 'packaging' | 'ingredient' | 'finished_good' | 'supplies';

export const STOCK_UPDATE_REASONS = [
  'production_use',
  'received_shipment',
  'manual_adjustment',
  'damaged',
  'expired',
  'returned',
  'quality_issue',
  'inventory_count',
  'transfer',
  'other'
] as const;

export type StockUpdateReason = typeof STOCK_UPDATE_REASONS[number];

// ===========================================
// INVENTORY ITEM
// ===========================================

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: ItemCategory | string;
  quantity: number;
  unit: string;
  location?: string;
  supplier_id?: string;
  supplier_name?: string;
  reorder_level: number;
  expiry_date?: Date;
  cost_per_unit?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// INGREDIENT (alias for recipe ingredients)
// ===========================================

export interface Ingredient {
  id: string;
  name: string;
  code: string;
  category: ItemCategory | string;
  quantity: number;
  unit: string;
  location?: string;
  supplier_id?: string;
  reorder_level: number;
  expiry_date?: Date;
  cost_per_unit?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// INVENTORY MOVEMENT
// ===========================================

export interface InventoryMovement {
  id: string;
  item_id: string;
  item_name?: string;
  movement_type: MovementType;
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  performed_by?: string;
  performer_name?: string;
  reason?: string;
  notes?: string;
  created_at: Date;
}

// ===========================================
// FILTERS
// ===========================================

export interface InventoryFilters {
  search?: string;
  category?: ItemCategory | string;
  lowStock?: boolean;
  low_stock_only?: boolean;
  supplier_id?: string;
  location?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  expiringWithinDays?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===========================================
// STOCK UPDATE
// ===========================================

export interface StockUpdate {
  quantity: number;
  movementType: MovementType;
  reason?: StockUpdateReason | string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

// ===========================================
// SUPPLIER
// ===========================================

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}
