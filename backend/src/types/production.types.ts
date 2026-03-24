import { InventoryItem } from './inventory.types.js';

export type BatchStatus = 'pending' | 'mixing' | 'cooking' | 'cooling' | 'packaging' | 'completed' | 'failed';

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  inventory_item_id?: string | null;
  custom_name?: string | null;
  quantity: number;
  unit: string;
  notes?: string;
  item?: InventoryItem;
  ingredient_name?: string;
  item_code?: string;
  item_unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  yield_quantity: number;
  yield_unit: string;
  duration_minutes: number;
  instructions: any; // JSON or string array
  difficulty_level: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  ingredients?: RecipeIngredient[];
}

export interface BatchMaterial {
  id: string;
  batch_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit: string;
  item?: InventoryItem;
}

export interface ProductionBatch {
  id: string;
  batch_number: string;
  recipe_id: string;
  status: BatchStatus;
  target_quantity: number;
  actual_quantity?: number;
  started_at?: Date;
  completed_at?: Date;
  started_by?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  recipe?: Recipe;
  materials?: BatchMaterial[];
}

export interface BatchFilters {
  status?: BatchStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}
