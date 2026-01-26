export interface User {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'QC' | 'SALES';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: string; // Standardize on id
  userId: string; // Maintain compatibility
  email: string;
  role: string;
}

export interface RefreshToken {
  id: string;
  token: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuditLogEntry {
  user_id?: string;
  action: string;
  resource: string;
  resource_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
}
