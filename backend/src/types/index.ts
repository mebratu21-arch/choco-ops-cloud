/**
 * CocoaFlow Backend - Type Definitions
 */

// ===========================================
// USER ROLE TYPE
// ===========================================

// Support both uppercase (DB) and lowercase (API/routes) formats
export type UserRole =
  | 'WAREHOUSE' | 'warehouse' | 'warehouse_worker'
  | 'PRODUCTION' | 'production' | 'production_worker'
  | 'QC' | 'qc' | 'quality_controller'
  | 'MECHANIC' | 'mechanic'
  | 'CONTROLLER' | 'controller'
  | 'MANAGER' | 'manager'
  | 'ADMIN' | 'admin'
  | 'OPERATOR' | 'operator'
  | 'SALES' | 'sales';

// ===========================================
// USER TYPES
// ===========================================

export interface User {
  id: string;
  email: string;
  password?: string;
  password_hash?: string;
  full_name?: string;
  name?: string;
  role: UserRole;
  language_preference?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// AUTH TYPES
// ===========================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
  language_preference?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password' | 'password_hash'>;
  refreshToken?: string;
}

export interface JWTPayload {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ===========================================
// REFRESH TOKEN
// ===========================================

export interface RefreshToken {
  id: string;
  token: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

// ===========================================
// AUDIT LOG
// ===========================================

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

// ===========================================
// API RESPONSE
// ===========================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ===========================================
// PAGINATION
// ===========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
