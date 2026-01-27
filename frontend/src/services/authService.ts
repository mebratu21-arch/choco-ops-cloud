import apiClient from '../lib/api/axios';
import { User, AuthResponse, RegisterRequest, ApiResponse } from '../types';
import { useAuthStore } from '../store/authStore';

export const authService = {
  /**
   * Login user with email and password
   * @returns AuthResponse with tokens and user data
   */
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      
      // Store tokens and user in authStore
      useAuthStore.getState().setTokens(accessToken, refreshToken);
      useAuthStore.getState().setUser(user);
      
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Login failed');
  },

  /**
   * Register new user
   */
  register: async (request: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', request);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Registration failed');
  },

  /**
   * Refresh access token using refresh token
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Token refresh failed');
  },

  /**
   * Logout user (revoke refresh token)
   */
  logout: async (): Promise<void> => {
    const refreshToken = useAuthStore.getState().getRefreshToken();
    
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state
      useAuthStore.getState().logout();
    }
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    
    if (response.data.success && response.data.data) {
      // Update user in store
      useAuthStore.getState().setUser(response.data.data);
      return response.data.data;
    }
    
    throw new Error(response.data.error || 'Failed to fetch user');
  },

  /**
   * Get current user from store (no API call)
   */
  getCurrentUser: (): User | null => {
    return useAuthStore.getState().user;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return useAuthStore.getState().isAuthenticated();
  },
};
