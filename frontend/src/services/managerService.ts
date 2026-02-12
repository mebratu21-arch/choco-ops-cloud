import api from './api';
import { 
  Announcement, 
  Task, 
  DashboardStats, 
  UserRole,
  APIResponse 
} from '../types';

interface AnalyticsData {
  productionTrends: unknown[];
  qcTrends: unknown[];
  inventoryTrends: unknown[];
  [key: string]: unknown;
}

export const managerService = {
  // --- Announcement Functions ---

  /**
   * Get all announcements
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    const response = await api.get<never, APIResponse<Announcement[]>>('/manager/announcements');
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Get active announcements for a specific role
   */
  async getActiveAnnouncements(userRole?: UserRole): Promise<Announcement[]> {
    // Often filtered on backend based on user context, but can pass param
    const params = new URLSearchParams();
    if (userRole) params.append('role', userRole);
    params.append('active', 'true');

    const response = await api.get<never, APIResponse<Announcement[]>>(`/manager/announcements?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Create a new announcement
   */
  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    const response = await api.post<Partial<Announcement>, APIResponse<Announcement>>('/manager/announcements', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to create announcement');
  },

  /**
   * Update an announcement
   */
  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    const response = await api.put<Partial<Announcement>, APIResponse<Announcement>>(`/manager/announcements/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to update announcement');
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string): Promise<boolean> {
    const response = await api.delete<never, APIResponse<null>>(`/manager/announcements/${id}`);
    return response.success;
  },

  // --- Task Functions ---

  /**
   * Get all tasks with filters
   */
  async getAllTasks(filters?: { status?: string; assignedTo?: string; priority?: string }): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.priority) params.append('priority', filters.priority);

    // Backend uses /tasks/all for listing all tasks
    const endpoint = filters?.assignedTo ? '/manager/tasks/my' : '/manager/tasks/all';
    const response = await api.get<never, APIResponse<Task[]>>(`${endpoint}?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  },

  /**
   * Get tasks assigned to current user (or specific user)
   */
  async getMyTasks(userId: string): Promise<Task[]> {
    return this.getAllTasks({ assignedTo: userId });
  },

  /**
   * Get single task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    const response = await api.get<never, APIResponse<Task>>(`/manager/tasks/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Task not found');
  },

  /**
   * Create a new task
   */
  async createTask(data: Partial<Task>): Promise<Task> {
    const response = await api.post<Partial<Task>, APIResponse<Task>>('/manager/tasks', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to create task');
  },

  /**
   * Update a task
   */
  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await api.put<Partial<Task>, APIResponse<Task>>(`/manager/tasks/${id}`, data);
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message ?? 'Failed to update task');
  },

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled'): Promise<Task> {
    // Assuming backend has specific status endpoint or general update
    // User requested "updateTaskStatus", so implementing tailored wrapper
    return this.updateTask(id, { status } as Partial<Task>);
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<boolean> {
    const response = await api.delete<never, APIResponse<null>>(`/manager/tasks/${id}`);
    return response.success;
  },

  // --- Dashboard Functions ---

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<never, APIResponse<DashboardStats>>('/dashboard/stats');
    
    if (response.success && response.data) {
      return response.data;
    }
    // Return empty stats if fail
    return {
      inventory_summary: {
        total_items: 0,
        low_stock_count: 0,
        expiring_soon_count: 0
      },
      production_summary: {
        active_batches: 0,
        completed_today: 0,
        planned_batches: 0
      },
      qc_summary: {
        pending_inspections: 0,
        approved_today: 0,
        rejected_today: 0,
        pass_rate: 0
      },
      mechanics_summary: {
        active_alerts: 0,
        machines_operational: 0,
        machines_down: 0
      }
    };
  },

  /**
   * Get analytics data for charts
   */
  async getAnalytics(dateRange?: [string, string]): Promise<AnalyticsData> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange[0]);
      params.append('endDate', dateRange[1]);
    }

    const response = await api.get<never, APIResponse<AnalyticsData>>(`/dashboard/analytics?${params.toString()}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    return {
        productionTrends: [],
        qcTrends: [],
        inventoryTrends: []
    };
  }
};
