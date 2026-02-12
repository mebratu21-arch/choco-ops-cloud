import { useQuery } from '@tanstack/react-query';
import api from '../services/api'; 
import { User, APIResponse } from '../types';

export const useUsers = () => {
  const { data, isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
        const response = await api.get<never, APIResponse<User[]>>('/users');
        return response.success && response.data ? response.data : [];
    },
  });

  return {
    users: data,
    loading: isLoading,
    error,
    refetch
  };
};
