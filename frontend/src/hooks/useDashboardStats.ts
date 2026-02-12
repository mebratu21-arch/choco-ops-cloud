import { useQuery } from '@tanstack/react-query';
import { managerService } from '../services/managerService';

export const useDashboardStats = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['manager', 'stats'],
    queryFn: () => managerService.getDashboardStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  return {
    stats: data,
    loading: isLoading,
    error,
    refetch
  };
};
