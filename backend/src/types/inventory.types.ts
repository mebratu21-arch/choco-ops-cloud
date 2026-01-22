import { Supplier } from './supplier.types.js';

export interface Ingredient {
  id: string;
    name: string;
    code: string | null;
    current_stock: number;
    minimum_stock: number;
    optimal_stock: number;
    unit: 'kg' | 'g' | 'ml' | 'l' | 'pc' | 'box' | 'pack' | 'case' | 'set' | 'pair' | 'dozen' | 'piece' | 'unit' | 'other' | null;
    aisle?: string;
    shelf?: string;
    bin?: string;
    cost_per_unit: number;
    expiry_date?: string;
    supplier_id?: string;
    supplier?: Supplier;
    is_active: boolean;
    is_low_stock: boolean;
    created_by?: string;
    created_at: string;
    update_at: string;  
    updated_by?: string;
}

export interface StockUpdateResult {
    ingredient_id: string;
    previous_stock: number;
    new_stock: number;
    change: number;
    reason?: string;
    updated_by: string;
    updated_at: string;
    ingredient_name: string;
}

export interface InventoryFilters {
    low_stock_only?: boolean;
    supplier_id?: string;
    ingredient_name?: string;
    expiring_soon_days?: number;
    is_active?: boolean;
    location?: {
        aisle?: string;
        shelf?: string;
        bin?: string;
    }
}


