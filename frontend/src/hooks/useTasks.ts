import { useQuery } from '@tanstack/react-query';
import { managerService } from '../services/managerService';

export const useTasks = (filters?: { status?: string; assignedTo?: string; priority?: string }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => managerService.getAllTasks(filters),
  });

  return {
    tasks: data,
    loading: isLoading,
    error,
    refetch
  };
};
