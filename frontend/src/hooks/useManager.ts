import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerService } from '../services/managerService';
import { Announcement, Task } from '../types';

// Query Keys
export const managerKeys = {
  announcements: ['announcements'] as const,
  tasks: {
    all: ['tasks'] as const,
    list: (filters: { status?: string; assignedTo?: string; priority?: string }) => ['tasks', filters] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    analytics: (range?: string) => ['dashboard', 'analytics', range] as const,
  }
};

export const useManager = () => {
  const queryClient = useQueryClient();

  // --- Announcements ---

  const useAnnouncements = () => {
    return useQuery({
      queryKey: managerKeys.announcements,
      queryFn: () => managerService.getAllAnnouncements(),
    });
  };

  const useCreateAnnouncement = () => {
    return useMutation({
      mutationFn: (data: Partial<Announcement>) => managerService.createAnnouncement(data),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: managerKeys.announcements });
      },
    });
  };

  // --- Tasks ---

  const useTasks = (filters?: { status?: string; assignedTo?: string; priority?: string }) => {
    return useQuery({
      queryKey: managerKeys.tasks.list(filters ?? {}),
      queryFn: () => managerService.getAllTasks(filters),
    });
  };

  const useCreateTask = () => {
    return useMutation({
      mutationFn: (data: Partial<Task>) => managerService.createTask(data),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: managerKeys.tasks.all });
        // Update pending tasks count on dashboard
        void queryClient.invalidateQueries({ queryKey: managerKeys.dashboard.stats });
      },
    });
  };

  const useUpdateTaskStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled' }) => 
        managerService.updateTaskStatus(id, status),
      onSuccess: (data) => {
        void queryClient.invalidateQueries({ queryKey: managerKeys.tasks.detail(data.id) });
        void queryClient.invalidateQueries({ queryKey: managerKeys.tasks.all });
        void queryClient.invalidateQueries({ queryKey: managerKeys.dashboard.stats });
      },
    });
  };

  // --- Dashboard ---

  const useDashboardStats = () => {
    return useQuery({
      queryKey: managerKeys.dashboard.stats,
      queryFn: () => managerService.getDashboardStats(),
      refetchInterval: 60000, // Refresh every minute
    });
  };

  return {
    useAnnouncements,
    useCreateAnnouncement,
    useTasks,
    useCreateTask,
    useUpdateTaskStatus,
    useDashboardStats,
  };
};
