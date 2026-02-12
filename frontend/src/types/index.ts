/**
 * ===========================================
 * COCOAFLOW - TypeScript Type Definitions
 * ===========================================
 *
 * Complete type definitions for the CocoaFlow
 * chocolate factory management system.
 *
 * @version 1.0.0
 * @author CocoaFlow Team
 */

// ===========================================
// USER & AUTHENTICATION TYPES
// ===========================================

/**
 * Available user roles in the system.
 * Each role has different permissions and dashboard views.
 */
export type UserRole =
  | 'admin'              // Full system access
  | 'manager'            // Management dashboard, reports, oversight
  | 'production_worker'  // Production batches, recipes
  | 'warehouse_worker'   // Inventory management
  | 'quality_controller' // QC inspections, approvals
  | 'mechanic';          // Machine maintenance, SOS alerts

/**
 * User entity representing a system user.
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;
  /** User's email address (unique, used for login) */
  email: string;
  /** User's full display name */
  full_name: string;
  /** User's role determining permissions */
  role: UserRole;
  /** Preferred language code (e.g., 'en', 'es', 'fr') */
  language_preference: string;
  /** Whether the user account is active */
  is_active: boolean;
  /** ISO timestamp of account creation */
  created_at: string;
  /** ISO timestamp of last update */
  updated_at: string;
}

/**
 * Credentials required for user login.
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password (plain text, will be hashed server-side) */
  password: string;
}

/**
 * Data required for new user registration.
 */
export interface RegisterData {
  /** User's email address */
  email: string;
  /** User's password (min 8 characters recommended) */
  password: string;
  /** User's full display name */
  full_name: string;
  /** User's role in the system */
  role: UserRole;
  /** Optional language preference (defaults to 'en') */
  language_preference?: string;
}

/**
 * Response from authentication endpoints (login/register).
 */
export interface AuthResponse {
  /** JWT access token for API authentication */
  token: string;
  /** Authenticated user data */
  user: User;
  /** Optional refresh token for token renewal */
  refreshToken?: string;
}

/**
 * JWT token payload structure.
 */
export interface JWTPayload {
  /** User ID */
  id: string;
  /** User email */
  email: string;
  /** User role */
  role: UserRole;
  /** Token issued at timestamp */
  iat?: number;
  /** Token expiration timestamp */
  exp?: number;
}

// ===========================================
// COMMON / SHARED TYPES
// ===========================================

/**
 * Standard API response wrapper.
 * All API endpoints return data in this format.
 *
 * @template T - The type of data returned on success
 */
export interface APIResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
  /** Optional informational message */
  message?: string;
  /** Optional pagination metadata */
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata for list endpoints.
 */
export interface PaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext?: boolean;
  /** Whether there's a previous page */
  hasPrev?: boolean;
}

/**
 * Sort direction for list queries.
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Base filter interface for list endpoints.
 */
export interface BaseFilters {
  /** Search query string */
  search?: string;
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: SortOrder;
}

/**
 * Date range filter for reports and queries.
 */
export interface DateRange {
  /** Start date (ISO string) */
  from: string;
  /** End date (ISO string) */
  to: string;
}

// ===========================================
// INVENTORY TYPES
// ===========================================

/**
 * Category types for inventory items.
 */
export type InventoryCategory =
  | 'raw_material'  // Cocoa beans, sugar, milk, etc.
  | 'packaging'     // Boxes, wrappers, labels
  | 'ingredient'    // Processed ingredients
  | 'finished_good' // Final products
  | 'supplies';     // General supplies

/**
 * Types of inventory movements.
 */
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'EXPIRED' | 'DAMAGED';

/**
 * Inventory item in the warehouse.
 */
export interface InventoryItem {
  /** Unique identifier */
  id: string;
  /** Item name */
  name: string;
  /** Unique item code/SKU */
  code: string;
  /** Item category */
  category: InventoryCategory;
  /** Current quantity in stock */
  quantity: number;
  /** Unit of measurement (kg, liters, pieces, etc.) */
  unit: string;
  /** Storage location in warehouse */
  location?: string;
  /** Associated supplier ID */
  supplier_id?: string;
  /** Supplier name (joined from suppliers table) */
  supplier_name?: string;
  /** Minimum stock level before reorder alert */
  reorder_level: number;
  /** Expiry date for perishable items (ISO string) */
  expiry_date?: string;
  /** Cost per unit in local currency */
  cost_per_unit?: number;
  /** Additional notes */
  notes?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Record of inventory stock movement.
 */
export interface InventoryMovement {
  /** Unique identifier */
  id: string;
  /** Associated inventory item ID */
  item_id: string;
  /** Item name (joined) */
  item_name?: string;
  /** Type of movement */
  movement_type: MovementType;
  /** Quantity moved (positive number) */
  quantity: number;
  /** Reference type (batch, order, manual, etc.) */
  reference_type?: string;
  /** Reference ID (batch ID, order ID, etc.) */
  reference_id?: string;
  /** User who performed the movement */
  performed_by: string;
  /** Performer's name (joined) */
  performer_name?: string;
  /** Reason for movement */
  reason?: string;
  /** Additional notes */
  notes?: string;
  /** Movement timestamp */
  created_at: string;
}

/**
 * Filters for inventory list queries.
 */
export interface InventoryFilters extends BaseFilters {
  /** Filter by category */
  category?: InventoryCategory;
  /** Show only low stock items */
  lowStock?: boolean;
  /** Filter by supplier */
  supplier_id?: string;
  /** Filter by location */
  location?: string;
  /** Show only expiring items (within N days) */
  expiringWithinDays?: number;
}

/**
 * Data for updating stock levels.
 */
export interface StockUpdateData {
  /** New quantity or quantity to add/remove */
  quantity: number;
  /** Type of movement */
  movementType: MovementType;
  /** Reason for the update */
  reason?: string;
  /** Reference type (if linked to batch/order) */
  referenceType?: string;
  /** Reference ID */
  referenceId?: string;
}

/**
 * Supplier entity.
 */
export interface Supplier {
  /** Unique identifier */
  id: string;
  /** Supplier company name */
  name: string;
  /** Contact person name */
  contact_person?: string;
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
  /** Supplier address */
  address?: string;
  /** Whether supplier is active */
  is_active: boolean;
  /** Creation timestamp */
  created_at?: string;
}

// ===========================================
// PRODUCTION TYPES
// ===========================================

/**
 * Difficulty level for recipes.
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

/**
 * Recipe for chocolate production.
 */
export interface Recipe {
  /** Unique identifier */
  id: string;
  /** Recipe name */
  name: string;
  /** Recipe code (e.g., REC-001) */
  code?: string;
  /** Recipe description */
  description?: string;
  /** Product category (dark, milk, white, etc.) */
  category: string;
  /** Expected yield quantity */
  yield_quantity: number;
  /** Yield unit (kg, pieces, etc.) */
  yield_unit: string;
  /** URL for recipe cover image */
  image_url?: string;
  /** Batch size (alias for yield_quantity in some views) */
  batch_size?: number;
  /** Batch unit (alias for yield_unit in some views) */
  batch_unit?: string;
  /** Estimated production duration in minutes */
  duration_minutes: number;
  /** Step-by-step instructions */
  instructions: string[] | string;
  /** Required ingredients with quantities */
  ingredients?: RecipeIngredient[];
  /** Recipe difficulty */
  difficulty_level: DifficultyLevel;
  /** Whether recipe is active/available */
  is_active: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Ingredient requirement for a recipe.
 */
export interface RecipeIngredient {
  /** Ingredient/inventory item ID */
  ingredient_id: string | null;
  /** Ingredient name (joined) */
  ingredient_name?: string;
  /** Custom name for manual entry */
  custom_name?: string | null;
  /** Required quantity */
  quantity: number;
  /** Unit of measurement */
  unit: string;
  /** Whether this ingredient is optional */
  is_optional?: boolean;
  /** Additional notes */
  notes?: string;
}

/**
 * Production batch status workflow.
 */
export type BatchStatus =
  | 'pending'    // Batch created, not started
  | 'in_progress' // General active state
  | 'mixing'     // Ingredients being mixed
  | 'cooking'    // Cooking/processing
  | 'cooling'    // Cooling phase
  | 'tempering'  // Tempering chocolate
  | 'molding'    // Pouring into molds
  | 'packaging'  // Packaging finished product
  | 'completed'  // Successfully completed
  | 'failed'     // Failed/rejected
  | 'cancelled'; // Cancelled before completion

/**
 * Production batch entity.
 */
export interface ProductionBatch {
  /** Unique identifier */
  id: string;
  /** Unique batch number (e.g., BATCH-2024-0001) */
  batch_number: string;
  /** Associated recipe ID */
  recipe_id: string;
  /** Recipe name (joined) */
  recipe_name?: string;
  /** Current batch status */
  status: BatchStatus;
  /** Target production quantity */
  target_quantity: number;
  /** Actual quantity produced */
  actual_quantity?: number;
  /** Production start timestamp */
  started_at?: string;
  /** Production completion timestamp */
  completed_at?: string;
  /** User who started the batch */
  started_by: string;
  /** Starter's name (joined) */
  started_by_name?: string;
  /** Production notes */
  notes?: string;
  /** QC result (if checked) */
  qc_status?: QCResult;
  /** Name of the operator in charge */
  operator_name?: string;
  /** Role/classification of the operator */
  classification?: string;
  /** Reason for batch failure if applicable */
  failure_reason?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Filters for batch list queries.
 */
export interface BatchFilters extends BaseFilters {
  /** Filter by status */
  status?: BatchStatus;
  /** Filter by recipe */
  recipe_id?: string;
  /** Filter by date range */
  dateRange?: DateRange;
  /** Filter by starter */
  started_by?: string;
}

/**
 * Data for creating a new batch.
 */
export interface CreateBatchData {
  /** Recipe to produce */
  recipe_id: string;
  /** Target quantity */
  target_quantity: number;
  /** Optional notes */
  notes?: string;
}

/**
 * Data for updating batch status.
 */
export interface UpdateBatchStatusData {
  /** New status */
  status: BatchStatus;
  /** Actual quantity (for completion) */
  actual_quantity?: number;
  /** Update notes */
  notes?: string;
}

// ===========================================
// QUALITY CONTROL TYPES
// ===========================================

/**
 * QC inspection result.
 */
export type QCResult = 'approved' | 'rejected' | 'quarantine' | 'pending';

/**
 * Defect severity levels.
 */
export type DefectSeverity = 'minor' | 'major' | 'critical';

/**
 * Individual defect found during inspection.
 */
export interface QCDefect {
  /** Type of defect (e.g., 'crack', 'discoloration', 'air_bubble') */
  type: string;
  /** Number of items with this defect */
  count: number;
  /** Severity level */
  severity: DefectSeverity;
  /** Additional description */
  description?: string;
}

/**
 * Quality control inspection record.
 */
export interface QCCheck {
  /** Unique identifier */
  id: string;
  /** Associated batch ID */
  batch_id: string;
  /** Batch number (joined) */
  batch_number?: string;
  /** Inspector user ID */
  inspector_id: string;
  /** Inspector name (joined) */
  inspector_name?: string;
  /** Recipe name (joined) */
  recipe_name?: string;
  /** Inspection date/time */
  inspection_date: string;

  // Quality Metrics (1-10 scale)
  /** Visual appearance score */
  appearance_score?: number;
  /** Texture/consistency score */
  texture_score?: number;
  /** Taste/flavor score */
  taste_score?: number;
  /** Overall quality score (calculated average) */
  overall_score?: number;

  // Environmental readings
  /** Temperature reading (Celsius) */
  temperature?: number;
  /** Humidity reading (%) */
  humidity?: number;

  // Defect tracking
  /** Total number of defects found */
  defect_count: number;
  /** Detailed defect breakdown */
  defect_types: QCDefect[];

  // Results
  /** Final inspection result */
  result: QCResult;
  /** Inspection notes and observations */
  notes?: string;
  /** Photos/attachments */
  attachments?: string[];

  /** Creation timestamp */
  created_at?: string;
}

/**
 * Data for creating a new QC inspection.
 */
export interface CreateQCCheckData {
  /** Batch to inspect */
  batch_id: string;
  /** Quality scores */
  appearance_score?: number;
  texture_score?: number;
  taste_score?: number;
  /** Environmental readings */
  temperature?: number;
  humidity?: number;
  /** Defects found */
  defect_count: number;
  defect_types?: QCDefect[];
  /** Result determination */
  result: QCResult;
  /** Notes */
  notes?: string;
}

/**
 * QC statistics for dashboard and reports.
 */
export interface QCStats {
  /** Total inspections in period */
  totalInspections: number;
  /** Approval rate (0-100) */
  passRate: number;
  /** Rejection rate (0-100) */
  rejectRate: number;
  /** Quarantine rate (0-100) */
  quarantineRate: number;
  /** Average quality score */
  averageScore: number;
  /** Defect trends by type */
  defectTrends: Record<string, number>;
  /** Inspections by result */
  byResult: {
    approved: number;
    rejected: number;
    quarantine: number;
    pending: number;
  };
  /** Trend data for approval rate */
  approvalTrend?: { date: string; approvalRate: number; target: number }[];
  /** Trend data for quality scores */
  qualityScoresTrend?: { date: string; appearance: number; texture: number; taste: number }[];
}

/**
 * Detailed defect analysis for reports.
 */
export interface DefectAnalysis {
  /** Breakdown of defects by type */
  defectsByType: { type: string; count: number }[];
  /** Total number of defects found */
  totalDefects: number;
  /** Number of critical severity defects */
  criticalDefects: number;
}

/**
 * Filters for QC check queries.
 */
export interface QCFilters extends BaseFilters {
  /** Filter by result */
  result?: QCResult;
  /** Filter by batch */
  batch_id?: string;
  /** Filter by inspector */
  inspector_id?: string;
  /** Filter by date range */
  dateRange?: DateRange;
  /** Filter by minimum score */
  minScore?: number;
}

// ===========================================
// MECHANIC / MAINTENANCE TYPES
// ===========================================

/**
 * Machine operational status.
 */
export type MachineStatus =
  | 'operational'   // Running normally
  | 'maintenance'   // Under scheduled maintenance
  | 'repair'        // Under repair
  | 'offline'       // Not operational
  | 'standby'       // Idle/not in use
  | 'sos';          // Emergency alert active

/**
 * Machine/equipment entity.
 */
export interface Machine {
  /** Unique identifier */
  id: string;
  /** Machine display name */
  name: string;
  /** Unique machine code (e.g., TEMP-001) */
  machine_code: string;
  /** Machine type/category */
  type: string;
  /** Physical location */
  location: string;
  /** Current operational status */
  status: MachineStatus;
  /** Last maintenance date */
  last_maintenance_date?: string;
  /** Next scheduled maintenance */
  next_maintenance_date?: string;
  /** Additional notes */
  notes?: string;
  /** Machine specifications */
  specifications?: Record<string, string | number>;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * SOS alert priority levels.
 */
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * SOS alert status workflow.
 */
export type AlertStatus =
  | 'open'         // New alert, not assigned
  | 'assigned'     // Assigned to mechanic
  | 'in_progress'  // Being worked on
  | 'resolved'     // Fixed
  | 'closed';      // Closed (verified fixed)

/**
 * SOS emergency alert for machine issues.
 */
export interface SOSAlert {
  /** Unique identifier */
  id: string;
  /** Associated machine ID */
  machine_id: string;
  /** Machine name (joined) */
  machine_name?: string;
  /** Machine code (joined) */
  machine_code?: string;
  /** User who reported the alert */
  reported_by: string;
  /** Reporter name (joined) */
  reported_by_name?: string;
  /** Alert priority level */
  priority: AlertPriority;
  /** Current alert status */
  status: AlertStatus;
  /** Description of the problem */
  problem_description: string;
  /** Resolution notes (filled when resolved) */
  resolution_notes?: string;
  /** Assigned mechanic user ID */
  assigned_to?: string;
  /** Assigned mechanic name (joined) */
  assigned_to_name?: string;
  /** Alert creation timestamp */
  reported_at: string;
  /** Resolution timestamp */
  resolved_at?: string;
  /** Estimated resolution time */
  estimated_resolution?: string;
  /** Attachments (photos, etc.) */
  attachments?: string[];
}

/**
 * Maintenance log entry.
 */
export interface MaintenanceLog {
  /** Unique identifier */
  id: string;
  /** Associated machine ID */
  machine_id: string;
  /** Machine name (joined) */
  machine_name?: string;
  /** Mechanic who performed maintenance */
  performed_by: string;
  /** Mechanic name (joined) */
  performed_by_name?: string;
  /** Name returned from backend join */
  mechanic_name?: string;
  /** Mechanic ID (alias for performed_by for consistency) */
  technician_id?: string;
  /** Mechanic name (alias for performed_by_name) */
  technician_name?: string;
  /** Maintenance type */
  maintenance_type: 'preventive' | 'corrective' | 'emergency' | 'Preventive' | 'Corrective' | 'Emergency';
  /** Maintenance date */
  date: string;
  /** ISO timestamp of when maintenance was performed */
  performed_at?: string;
  /** Description of work done */
  description: string;
  /** Parts replaced during maintenance */
  parts_replaced?: string[];
  /** Database column name for parts */
  parts_used?: string;
  /** Cost of maintenance */
  cost?: number;
  /** Duration in minutes */
  duration_minutes?: number;
  /** Associated SOS alert ID (if any) */
  sos_alert_id?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Status */
  status?: 'pending' | 'in_progress' | 'completed';
}

/**
 * Machine maintenance fix record (Legacy format used by dashboards)
 */
export interface MachineFix {
  id: string;
  machine_name: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'FIXED' | 'REPORTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  reported_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  fixed_at?: string;
}

/**
 * Filters for SOS alert queries.
 */
export interface AlertFilters extends BaseFilters {
  /** Filter by status */
  status?: AlertStatus;
  /** Filter by priority */
  priority?: AlertPriority;
  /** Filter by machine */
  machine_id?: string;
  /** Filter by assigned mechanic */
  assigned_to?: string;
  /** Filter by date range */
  dateRange?: DateRange;
}

/**
 * Filters for machine queries.
 */
export interface MachineFilters extends BaseFilters {
  /** Filter by status */
  status?: MachineStatus;
  /** Filter by type */
  type?: string;
  /** Filter by location */
  location?: string;
  /** Show only machines needing maintenance */
  needsMaintenance?: boolean;
}

// ===========================================
// MANAGER / ADMIN TYPES
// ===========================================

/**
 * Announcement priority levels.
 */
export type AnnouncementPriority = 'normal' | 'high' | 'urgent';

/**
 * System announcement.
 */
export interface Announcement {
  /** Unique identifier */
  id: string;
  /** Announcement title */
  title: string;
  /** Announcement content (supports markdown) */
  content: string;
  /** Priority level */
  priority: AnnouncementPriority;
  /** Target audience (roles) */
  target_roles: UserRole[];
  /** Creator user ID */
  created_by: string;
  /** Creator name (joined) */
  created_by_name?: string;
  /** Expiration date (optional) */
  expires_at?: string;
  /** Whether announcement is active */
  is_active: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Task status workflow.
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Task priority levels.
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task assignment entity.
 */
export interface Task {
  /** Unique identifier */
  id: string;
  /** Task title */
  title: string;
  /** Task description */
  description?: string;
  /** Assigned user ID */
  assigned_to: string;
  /** Assigned user name (joined) */
  assigned_to_name?: string;
  /** Assigner user ID */
  assigned_by: string;
  /** Assigner name (joined) */
  assigned_by_name?: string;
  /** Current status */
  status: TaskStatus;
  /** Priority level */
  priority: TaskPriority;
  /** Due date */
  due_date?: string;
  /** Completion timestamp */
  completed_at?: string;
  /** Related entity type (batch, machine, etc.) */
  related_type?: string;
  /** Related entity ID */
  related_id?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Filters for task queries.
 */
export interface TaskFilters extends BaseFilters {
  /** Filter by status */
  status?: TaskStatus;
  /** Filter by priority */
  priority?: TaskPriority;
  /** Filter by assignee */
  assigned_to?: string;
  /** Filter by assigner */
  assigned_by?: string;
  /** Filter overdue tasks */
  overdue?: boolean;
  /** Filter by due date range */
  dateRange?: DateRange;
}

// ===========================================
// ORDER / SHOP TYPES
// ===========================================

/**
 * Order status workflow.
 */
export type OrderStatus =
  | 'pending'     // Order placed, awaiting confirmation
  | 'confirmed'   // Order confirmed
  | 'processing'  // Being prepared
  | 'ready'       // Ready for pickup/delivery
  | 'shipped'     // In transit
  | 'delivered'   // Delivered to customer
  | 'cancelled';  // Order cancelled

/**
 * Order type (sales channel).
 */
export type OrderType = 'online' | 'in_store' | 'wholesale';

/**
 * Order item (product in an order).
 */
export interface OrderItem {
  /** Product ID */
  product_id: string;
  /** Product name */
  product_name: string;
  /** Quantity ordered */
  quantity: number;
  /** Unit price */
  unit_price: number;
  /** Subtotal (quantity * unit_price) */
  subtotal: number;
}

/**
 * Customer order entity.
 */
export interface Order {
  /** Unique identifier */
  id: string;
  /** Order number (e.g., ORD-2024-0001) */
  order_number: string;
  /** Order type/channel */
  order_type: OrderType;
  /** Current status */
  status: OrderStatus;
  /** Customer name */
  customer_name: string;
  /** Customer email */
  customer_email?: string;
  /** Customer phone */
  customer_phone?: string;
  /** Delivery/shipping address */
  shipping_address?: string;
  /** Order items */
  items: OrderItem[];
  /** Subtotal before tax */
  subtotal: number;
  /** Tax amount */
  tax_amount: number;
  /** Discount amount */
  discount_amount?: number;
  /** Total order amount */
  total_amount: number;
  /** Payment status */
  payment_status: 'pending' | 'paid' | 'refunded';
  /** Order notes */
  notes?: string;
  /** Order placement timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Filters for order queries.
 */
export interface OrderFilters extends BaseFilters {
  /** Filter by status */
  status?: OrderStatus;
  /** Filter by type */
  order_type?: OrderType;
  /** Filter by payment status */
  payment_status?: 'pending' | 'paid' | 'refunded';
  /** Filter by customer */
  customer_name?: string;
  /** Filter by date range */
  dateRange?: DateRange;
}

// ===========================================
// DASHBOARD & ANALYTICS TYPES
// ===========================================

/**
 * Manager dashboard statistics.
 */
export interface DashboardStats {
  inventory_summary: {
    total_items: number;
    low_stock_count: number;
    expiring_soon_count: number;
  };
  production_summary: {
    active_batches: number;
    completed_today: number;
    planned_batches: number;
  };
  qc_summary: {
    pending_inspections: number;
    approved_today: number;
    rejected_today: number;
    pass_rate: number;
  };
  mechanics_summary: {
    active_alerts: number;
    machines_operational: number;
    machines_down: number;
  };
}

/**
 * Production statistics for reports.
 */
export interface ProductionStats {
  /** Total batches in period */
  totalBatches: number;
  /** Completed batches */
  completedBatches: number;
  /** Failed batches */
  failedBatches: number;
  /** Success rate (0-100) */
  successRate: number;
  /** Total quantity produced */
  totalQuantity: number;
  /** Average batch duration (minutes) */
  avgDuration: number;
  /** Production by recipe */
  byRecipe: Record<string, number>;
  /** Production by day */
  byDay: { date: string; count: number }[];
}

/**
 * Inventory statistics for reports.
 */
export interface InventoryStats {
  /** Total unique items */
  totalItems: number;
  /** Total stock value */
  totalValue: number;
  /** Low stock items count */
  lowStockCount: number;
  /** Expiring items count */
  expiringCount: number;
  /** Stock by category */
  byCategory: Record<string, number>;
  /** Recent movements */
  recentMovements: InventoryMovement[];
}

/**
 * Mechanic dashboard statistics.
 */
export interface MechanicStats {
  /** Total machines */
  totalMachines: number;
  /** Operational machines */
  operationalCount: number;
  /** Machines under maintenance */
  maintenanceCount: number;
  /** Offline machines */
  offlineCount: number;
  /** Open alerts */
  openAlerts: number;
  /** Critical alerts */
  criticalAlerts: number;
  /** Upcoming maintenance count */
  upcomingMaintenance: number;
}

// ===========================================
// FORM DATA TYPES
// ===========================================

/**
 * Form data for creating/updating inventory items.
 */
export interface InventoryFormData {
  name: string;
  code: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  supplier_id?: string;
  reorder_level: number;
  expiry_date?: string;
  cost_per_unit?: number;
  notes?: string;
}



/**
 * Form data for creating/updating recipes.
 */
export interface RecipeFormData {
  name: string;
  description?: string;
  category: string;
  yield_quantity: number;
  yield_unit: string;
  duration_minutes: number;
  instructions: string[];
  ingredients: RecipeIngredient[];
  difficulty_level: DifficultyLevel;
  is_active: boolean;
}

/**
 * Form data for creating/updating machines.
 */
export interface MachineFormData {
  name: string;
  machine_code: string;
  type: string;
  location: string;
  status: MachineStatus;
  notes?: string;
}

/**
 * Form data for creating SOS alerts.
 */
export interface SOSAlertFormData {
  machine_id: string;
  priority: AlertPriority;
  problem_description: string;
}

/**
 * Form data for creating announcements.
 */
export interface AnnouncementFormData {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  target_roles: UserRole[];
  expires_at?: string;
  is_active: boolean;
}

/**
 * Form data for creating tasks.
 */
export interface TaskFormData {
  title: string;
  description?: string;
  assigned_to: string;
  priority: TaskPriority;
  due_date?: string;
}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * Make all properties optional recursively.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract the data type from an APIResponse.
 */
export type ExtractData<T> = T extends APIResponse<infer U> ? U : never;

/**
 * ID type (for explicit typing).
 */
export type ID = string;

/**
 * ISO date string type (for explicit typing).
 */
export type ISODateString = string;

/**
 * Currency amount (for explicit typing).
 */
export type Currency = number;

// ===========================================
// AI / CHAT TYPES
// ===========================================

/**
 * Message in the AI chat interface.
 */
export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
}

// ===========================================
// SALES TYPES
// ===========================================

export interface OnlineOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items?: OrderItem[];
  date: string;
}

export interface EmployeeSale {
  id: string;
  seller_id: string;
  buyer_id: string;
  seller_name?: string;
  buyer_name?: string;
  recipe_name?: string;
  batch_number?: string;
  batch_id: string;
  quantity_sold: number;
  unit: string;
  original_price: number;
  discount_percentage: number;
  final_amount: number;
  payment_method: 'CASH' | 'CARD' | 'TRANSFER';
  status: 'PENDING' | 'PAID' | 'REFUNDED';
  notes?: string;
  created_at: string;
}

export type Batch = ProductionBatch;

export interface Product {
  id: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  status: 'active' | 'draft' | 'archived';
  created_at?: string;
  updated_at?: string;
}
