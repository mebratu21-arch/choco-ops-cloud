import { useQuery } from '@tanstack/react-query';
import { managerService } from '../services/managerService';

export const useAnnouncements = (role?: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['announcements', role],
    queryFn: () => role ? managerService.getActiveAnnouncements(role as any) : managerService.getAllAnnouncements(),
  });

  return {
    announcements: data,
    loading: isLoading,
    error,
    refetch
  };
};
