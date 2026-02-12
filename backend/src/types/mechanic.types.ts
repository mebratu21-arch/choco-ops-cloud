export type MachineStatus = 'operational' | 'maintenance' | 'sos' | 'retired';
export type AlertStatus = 'pending' | 'assigned' | 'resolved' | 'cancelled';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Machine {
  id: string;
  name: string;
  machine_code: string;
  type: string;
  status: MachineStatus;
  location: string;
  installation_date?: Date;
  last_maintenance_date?: Date;
  next_maintenance_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SOSAlert {
  id: string;
  machine_id: string;
  reported_by: string; // user_id
  priority: AlertPriority;
  status: AlertStatus;
  urgency_level?: string; 
  description?: string;
  assigned_to?: string; // mechanic user_id
  resolution_notes?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Relations
  machine_name?: string;
  machine_code?: string;
  machine_location?: string;
  reporter_name?: string;
  mechanic_name?: string;
}

export interface MaintenanceLog {
  id: string;
  machine_id: string;
  performed_by: string; // mechanic user_id
  maintenance_type: 'routine' | 'repair' | 'installation' | 'inspection';
  description?: string;
  cost?: number;
  duration_minutes?: number;
  date_performed: Date;
  next_maintenance_date?: Date;
  created_at: Date;
  
  // Relations
  machine_name?: string;
  mechanic_name?: string;
}

export interface MachineManual {
  id: string;
  machine_id: string;
  title: string;
  version?: string;
  file_url: string; // or path
  uploaded_by: string;
  created_at: Date;
}

export interface AlertFilters {
  status?: AlertStatus;
  priority?: AlertPriority;
  machineId?: string;
  assignedTo?: string; // mechanic
  page?: number;
  limit?: number;
}
