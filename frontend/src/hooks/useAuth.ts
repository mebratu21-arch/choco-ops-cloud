import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const useLogin = () => {
    return useMutation({
      mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
      onSuccess: (data) => {
        // Invalidate current user query to refresh auth state
        queryClient.setQueryData(['auth', 'user'], data.user);
      },
    });
  };

  const useRegister = () => {
    return useMutation({
      mutationFn: (data: RegisterData) => authService.register(data),
      onSuccess: (data) => {
        queryClient.setQueryData(['auth', 'user'], data.user);
      },
    });
  };

  const useLogout = () => {
    return () => {
      authService.logout();
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    };
  };

  const useCurrentUser = () => {
    return useQuery({
      queryKey: ['auth', 'user'],
      queryFn: () => authService.getCurrentUser(),
      retry: false,
      staleTime: 1000 * 60 * 30, // 30 minutes
      // Only fetch if we have a token
      enabled: authService.isAuthenticated(),
    });
  };

  return {
    useLogin,
    useRegister,
    useLogout,
    useCurrentUser,
  };
};
