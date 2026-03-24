
import { UserRole } from '../types';

/**
 * Normalizes backend/legacy role strings to the strict frontend UserRole type.
 * This handles cases where the backend sends 'WAREHOUSE' but frontend expects 'warehouse_worker'.
 */
export const normalizeRole = (role: string): UserRole => {
  if (!role) return 'production_worker'; // Safe default

  const rawRole = role.toLowerCase();
  
  // Mapping for legacy/backend role variations to frontend UserRole
  const roleMapping: Record<string, UserRole> = {
    'admin': 'admin',
    'manager': 'manager',
    'production': 'production_worker',
    'production_worker': 'production_worker',
    'warehouse': 'warehouse_worker',
    'warehouse_worker': 'warehouse_worker',
    'qc': 'quality_controller',
    'quality_controller': 'quality_controller',
    'mechanic': 'mechanic',
    'controller': 'manager', // Sales controller maps to manager
    'sales': 'manager',      // Fallback for sales role
  };

  return roleMapping[rawRole] || (rawRole as UserRole);
};
