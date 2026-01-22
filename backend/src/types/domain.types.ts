// All domain types for ChocoOps Cloud

// ============ USER & AUTH ============
export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export type UserRole = 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER' | 'MANAGER' | 'ADMIN';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ============ SUPPLIER ============
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
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ============ RAW MATERIALS ============
export interface RawMaterial {
  id: string;
  name: string;
  code?: string;
  description?: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  unit_cost: number;
  supplier_id?: string;
  supplier_name?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ============ INGREDIENTS ============
export interface Ingredient {
  id: string;
  name: string;
  code?: string;
  current_stock: number;
  minimum_stock: number;
  optimal_stock: number;
  unit: string;
  aisle?: string;
  shelf?: string;
  bin?: string;
  cost_per_unit: number;
  expiry_date?: Date;
  supplier_id?: string;
  supplier_name?: string;
  is_active: boolean;
  is_low_stock?: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
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
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  ingredient_name?: string;
  quantity: number;
  unit: string;
}

// ============ PRODUCTION ============
export interface Batch {
  id: string;
  batch_number: string;
  recipe_id: string;
  recipe_name?: string;
  quantity: number;
  status: BatchStatus;
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export type BatchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

export interface ProductionBatch {
  id: string;
  batch_id: string;
  line_number?: string;
  operator_id?: string;
  start_time?: Date;
  end_time?: Date;
  yield_quantity?: number;
  waste_quantity?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ============ QUALITY CONTROL ============
export interface QualityControl {
  id: string;
  batch_id: string;
  batch_number?: string;
  inspector_id: string;
  inspector_name?: string;
  inspection_date: Date;
  status: QCStatus;
  temperature?: number;
  humidity?: number;
  viscosity?: number;
  color_score?: number;
  taste_score?: number;
  texture_score?: number;
  overall_score?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type QCStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW';

export interface QualityCheck {
  id: string;
  quality_control_id: string;
  check_type: string;
  check_name: string;
  expected_value?: string;
  actual_value?: string;
  passed: boolean;
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
  last_counted_at?: Date;
  created_at: Date;
  updated_at: Date;
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
  performed_at: Date;
  created_at: Date;
}

// ============ SALES ============
export interface ProductSale {
  id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: Date;
  customer_name?: string;
  employee_id?: string;
  employee_name?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OnlineOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  shipping_address?: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  ordered_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

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
  created_at: Date;
}

// ============ API RESPONSES ============
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
