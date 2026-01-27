// ============================================================================
// ChocoOps Cloud - Frontend Type Definitions
// Aligned with Backend API Contracts (2026-01-27)
// ============================================================================

// ============ USER & AUTH ============

export type UserRole = 
  | 'WAREHOUSE' 
  | 'PRODUCTION' 
  | 'QC' 
  | 'MECHANIC' 
  | 'CONTROLLER' 
  | 'MANAGER' 
  | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: string;
  message?: string;
}

export interface JWTPayload {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ============ RECIPES ============

export interface Recipe {
  id: string;
  name: string;
  code?: string;
  description?: string;
  batch_size: number;
  batch_unit: string;
  instructions?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity: number;
  unit: string;
}

export interface RecipeWithIngredients {
  recipe: Recipe;
  ingredients: RecipeIngredient[];
}

// ============ PRODUCTION ============

export type BatchStatus = 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED';

export interface Batch {
  id: string;
  batch_number?: string;
  recipe_id: string;
  recipe_name?: string;
  quantity_produced: number;
  status: BatchStatus;
  produced_by: string;
  created_by: string;
  started_at: string | null;
  completed_at: string | null;
  actual_yield: number | null;
  waste_percentage: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBatchRequest {
  recipe_id: string;
  quantity_produced: number;
  notes?: string;
}

export interface UpdateBatchRequest {
  status?: BatchStatus;
  quantity_produced?: number;
  actual_yield?: number;
  waste_percentage?: number;
  actual_cost?: number;
  notes?: string;
}

// ============ INVENTORY ============

export type IngredientUnit = 'kg' | 'g' | 'liter' | 'ml' | 'unit' | 'pack';

export interface Ingredient {
  id: string;
  name: string;
  code: string | null;
  current_stock: number;
  minimum_stock: number;
  optimal_stock: number;
  unit: IngredientUnit;
  aisle?: string;
  shelf?: string;
  bin?: string;
  cost_per_unit: number;
  expiry_date: string | null;
  supplier_id: string | null;
  supplier_name?: string;
  is_active: boolean;
  is_low_stock: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface InventoryFilters {
  low_stock_only?: boolean;
  expiring_soon_days?: number;
  supplier_id?: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
}

export type StockUpdateReason = 
  | 'PRODUCTION_USAGE'
  | 'SUPPLIER_DELIVERY'
  | 'MANUAL_ADJUSTMENT'
  | 'QUALITY_ISSUE'
  | 'EXPIRED_REMOVAL'
  | 'DAMAGE_LOSS'
  | 'INVENTORY_RECONCILIATION';

export interface StockUpdateInput {
  ingredient_id: string;
  quantity_change: number;
  reason?: StockUpdateReason;
  notes?: string;
}

// ============ SUPPLIERS ============

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

// ============ QUALITY CONTROL ============

export type QCStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'QUARANTINE';

export interface QualityControl {
  id: string;
  batch_id: string;
  batch_number?: string;
  inspector_id: string;
  inspector_name?: string;
  inspection_date: string;
  status: QCStatus;
  temperature?: number;
  humidity?: number;
  viscosity?: number;
  color_score?: number;
  taste_score?: number;
  texture_score?: number;
  overall_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QualityUpdateInput {
  batch_id: string;
  status: QCStatus;
  defect_count?: number;
  notes?: string;
}

// ============ SALES ============

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

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

export interface OnlineOrder {
  id: string;
  customer_email: string;
  customer_name?: string;
  batch_id?: string;
  quantity: number;
  unit: string;
  total_amount: number;
  status: OrderStatus;
  order_date: string;
  processed_date?: string;
  notes?: string;
}

// ============ WAREHOUSE ============

export interface WarehouseStock {
  id: string;
  item_type: 'RAW_MATERIAL' | 'INGREDIENT' | 'FINISHED_PRODUCT';
  item_id: string;
  item_name?: string;
  location_aisle?: string;
  location_shelf?: string;
  location_bin?: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity?: number;
  last_counted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  item_type: string;
  item_id: string;
  item_name?: string;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  from_location?: string;
  to_location?: string;
  reason?: string;
  reference_id?: string;
  performed_by: string;
  performed_at: string;
  created_at: string;
}

// ============ AUDIT ============

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: object;
  new_values?: object;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============ API RESPONSES ============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ DASHBOARD ============

export interface DashboardStats {
  total_materials: number;
  critical_stock_count: number;
  active_batches: number;
  total_production_value: number;
  low_stock_materials: Ingredient[];
  recent_batches: Batch[];
  stock_trend: StockTrendData[];
}

export interface StockTrendData {
  date: string;
  stock_value: number;
  production_count: number;
}

// ============ LEGACY ALIASES (for gradual migration) ============

/** @deprecated Use Batch instead */
export type ProductionBatch = Batch;

/** @deprecated Use Ingredient instead */
export type RawMaterial = Ingredient;

/** @deprecated Use Ingredient instead */
export type InventoryItem = Ingredient;
