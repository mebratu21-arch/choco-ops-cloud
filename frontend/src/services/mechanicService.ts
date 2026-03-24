import api from './api';
import { 
  Machine, 
  SOSAlert, 
  MaintenanceLog, 
  MachineStatus, 
  AlertPriority,
  AlertStatus,
  APIResponse 
} from '../types';

export const mechanicService = {
  // --- Machine Functions ---

  /**
   * Get all machines
   */
  async getAllMachines(): Promise<Machine[]> {
    const response = await api.get<never, APIResponse<Machine[]>>('/machines');
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Get single machine by ID with details
   */
  async getMachineById(id: string): Promise<Machine> {
    const response = await api.get<never, APIResponse<Machine>>(`/machines/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Machine not found');
  },

  /**
   * Create a new machine
   */
  async createMachine(data: Partial<Machine>): Promise<Machine> {
    const response = await api.post<Partial<Machine>, APIResponse<Machine>>('/machines', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to create machine');
  },

  /**
   * Update an existing machine
   */
  async updateMachine(id: string, data: Partial<Machine>): Promise<Machine> {
    const response = await api.put<Partial<Machine>, APIResponse<Machine>>(`/machines/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to update machine');
  },

  /**
   * Update machine status
   */
  async updateMachineStatus(id: string, status: MachineStatus): Promise<Machine> {
    // Assuming backend endpoint /machines/:id for general updates, or specific status endpoint
    // If specific endpoint exists:
    // await api.put(\`/machines/\${id}/status\`, { status });
    // Using general update for consistency unless specified, but user requested 'updateMachineStatus'
    // I will assume it's a partial update to the machine
    return this.updateMachine(id, { status });
  },

  // --- SOS Alert Functions ---

  /**
   * Get all SOS alerts with filters
   */
  async getAllAlerts(filters?: { status?: AlertStatus; priority?: AlertPriority; machineId?: string }): Promise<SOSAlert[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.machineId) params.append('machineId', filters.machineId);

    const response = await api.get<never, APIResponse<{ alerts: SOSAlert[]; pagination: any }>>(`/sos?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data.alerts;
    }
    return [];
  },

  /**
   * Get single alert by ID
   */
  async getAlertById(id: string): Promise<SOSAlert> {
    const response = await api.get<never, APIResponse<SOSAlert>>(`/sos/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Alert not found');
  },

  /**
   * Create a new SOS alert
   */
  async createAlert(data: { machineId: string; priority: AlertPriority; problemDescription: string }): Promise<SOSAlert> {
    const response = await api.post<{ machineId: string; priority: AlertPriority; problemDescription: string }, APIResponse<SOSAlert>>('/sos', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to create alert');
  },

  /**
   * Update an alert
   */
  async updateAlert(id: string, data: Partial<SOSAlert>): Promise<SOSAlert> {
    const response = await api.put<Partial<SOSAlert>, APIResponse<SOSAlert>>(`/sos/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to update alert');
  },

  /**
   * Assign alert to mechanic
   */
  async assignAlert(id: string, mechanicId: string): Promise<SOSAlert> {
    // Usually via update, or specific assignment endpoint
    return this.updateAlert(id, { assigned_to: mechanicId, status: 'in_progress' });
  },

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string, resolutionNotes: string): Promise<SOSAlert> {
    const response = await api.put<{ resolutionNotes: string }, APIResponse<SOSAlert>>(`/sos/${id}/resolve`, { resolutionNotes });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to resolve alert');
  },

  /**
   * Cancel/Delete an alert
   */
  async cancelAlert(id: string): Promise<boolean> {
    const response = await api.delete<never, APIResponse<null>>(`/sos/${id}`);
    return response.success;
  },

  /**
   * Get open/unresolved alerts
   */
  async getOpenAlerts(): Promise<SOSAlert[]> {
    return this.getAllAlerts({ status: 'open' });
  },

  // --- Maintenance Functions ---

  /**
   * Get all maintenance logs with filters
   */
  async getAllMaintenanceLogs(filters?: Record<string, string>): Promise<MaintenanceLog[]> {
    const params = new URLSearchParams(filters);
    const response = await api.get<never, APIResponse<MaintenanceLog[]>>(`/maintenance?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Get maintenance history for a machine
   */
  async getMachineMaintenanceHistory(machineId: string, dateRange?: [string, string]): Promise<MaintenanceLog[]> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange[0]);
      params.append('endDate', dateRange[1]);
    }
    
    const response = await api.get<never, APIResponse<MaintenanceLog[]>>(`/machines/${machineId}/maintenance?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Create a new maintenance log
   */
  async createMaintenanceLog(data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const response = await api.post<Partial<MaintenanceLog>, APIResponse<MaintenanceLog>>('/maintenance', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to create maintenance log');
  },

  /**
   * Get upcoming maintenance
   */
  async getUpcomingMaintenance(): Promise<Machine[]> {
    // This might be a specific endpoint or filtered machines list
    // Assuming backend logic or filtering on clientside if simple
    // But usually backend provides this. Let's assume an endpoint exists or we use machines endpoint with filter
    // Spec didn't explicitly give endpoint for this, so likely derived from machines list
    // "GET /api/machines" returns all, we might filter by nextMaintenanceDate
    
    const machines = await this.getAllMachines();
    const now = new Date();
    // Filter for machines with nextMaintenanceDate in future (or past due)
    return machines.filter(m => m.next_maintenance_date && new Date(m.next_maintenance_date) > now); // Simplified logic
  }
};
