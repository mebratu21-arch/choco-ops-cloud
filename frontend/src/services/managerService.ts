import apiClient from '../lib/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ManagerDashboardData,
  Announcement,
  Task,
  ApiResponse
} from '../types';

// ============ MANAGER SERVICE ============

export const managerService = {
  /**
   * Get manager dashboard stats
   * GET /api/dashboard/stats
   */
  async getDashboardStats(): Promise<ManagerDashboardData> {
    const { data } = await apiClient.get<ApiResponse<ManagerDashboardData>>('/dashboard/stats');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to fetch dashboard stats');
  },

  /**
   * Create announcement
   * POST /api/manager/announcements
   */
  async createAnnouncement(announcement: Partial<Announcement>): Promise<Announcement> {
    const { data } = await apiClient.post<ApiResponse<Announcement>>('/manager/announcements', announcement);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create announcement');
  },

  /**
   * Get all announcements
   * GET /api/manager/announcements
   */
  async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await apiClient.get<ApiResponse<Announcement[]>>('/manager/announcements');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  },

  /**
   * Create task assignment
   * POST /api/manager/tasks
   */
  async createTask(task: Partial<Task>): Promise<Task> {
    const { data } = await apiClient.post<ApiResponse<Task>>('/manager/tasks', task);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to create task');
  },

  /**
   * Get all tasks
   * GET /api/manager/tasks
   */
  async getTasks(): Promise<Task[]> {
    const { data } = await apiClient.get<ApiResponse<Task[]>>('/manager/tasks');
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return [];
  },

  /**
   * Update task status
   * PATCH /api/manager/tasks/:id
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/manager/tasks/${id}`, updates);
    
    if (data.success && data.data) {
      return data.data;
    }
    
    throw new Error(data.error || 'Failed to update task');
  },
};

// ============ REACT QUERY HOOKS ============

/**
 * Hook to get manager dashboard stats
 * Usage:
 * ```ts
 * const { data: stats, isLoading } = useManagerDashboard();
 * ```
 */
export const useManagerDashboard = () => {
  return useQuery({
    queryKey: ['manager', 'dashboard'],
    queryFn: () => managerService.getDashboardStats(),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Auto-refresh every minute
  });
};

/**
 * Hook to get announcements
 */
export const useAnnouncements = () => {
  return useQuery({
    queryKey: ['manager', 'announcements'],
    queryFn: () => managerService.getAnnouncements(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to create announcement
 */
export const useCreateAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (announcement: Partial<Announcement>) => 
      managerService.createAnnouncement(announcement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'announcements'] });
    },
  });
};

/**
 * Hook to get tasks
 */
export const useTasks = () => {
  return useQuery({
    queryKey: ['manager', 'tasks'],
    queryFn: () => managerService.getTasks(),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to create task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (task: Partial<Task>) => managerService.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'tasks'] });
    },
  });
};

/**
 * Hook to update task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => 
      managerService.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manager', 'tasks'] });
    },
  });
};
