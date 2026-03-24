import { UserRole } from './index.js';
import { InventoryItem } from './inventory.types.js';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type AnnouncementPriority = 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  created_by: string;
  target_roles: UserRole[]; // Array of roles
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  author_name?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to: string; // user_id
  assigned_by: string; // user_id (manager)
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  assignee_name?: string;
  assigner_name?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  
  // Populated
  item_name?: string;
}

export interface Order {
  id: string;
  order_number: string; // PO-2024-001
  supplier_id: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  total_amount?: number;
  expected_delivery_date?: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  supplier_name?: string;
  items?: OrderItem[];
  creator_name?: string;
}
