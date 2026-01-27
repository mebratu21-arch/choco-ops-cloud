export interface User {
  id: string;
  email: string;
  password?: string; // Optinal for some responses
  password_hash?: string; // Aligning with naming
  name?: string;
  role: 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER' | 'MANAGER' | 'ADMIN' | 'OPERATOR' | 'SALES';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  id: string;
  userId: string;
  email: string;
  role: 'WAREHOUSE' | 'PRODUCTION' | 'QC' | 'MECHANIC' | 'CONTROLLER' | 'MANAGER' | 'ADMIN' | 'OPERATOR' | 'SALES';
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
