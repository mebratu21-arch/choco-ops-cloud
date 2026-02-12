import { useQuery } from '@tanstack/react-query';
import { managerService } from '../services/managerService';

export const useAnalytics = (dateRange?: [string, string]) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['manager', 'analytics', dateRange],
    queryFn: () => managerService.getAnalytics(dateRange),
  });

  return {
    analytics: data,
    loading: isLoading,
    error,
    refetch
  };
};
