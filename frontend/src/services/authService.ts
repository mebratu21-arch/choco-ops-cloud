import api from './api';
import { useAuthStore } from '../store/authStore';
import socketService from '../lib/socketService';
import { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  User, 
  APIResponse 
} from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<LoginCredentials, APIResponse<AuthResponse>>('/auth/login', credentials);
    
    // Based on the api.ts interceptor, response is actually the data object
    // { success: true, data: { token, user }, ... }
    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setStoredUser(response.data.user);
      
      // Sync with global store
      useAuthStore.getState().setTokens(response.data.token, '');
      useAuthStore.getState().setUser(response.data.user);
      
      // Update socket connection
      socketService.updateToken(response.data.token);
      
      return response.data;
    }
    
    throw new Error(response.message ?? 'Login failed');
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<RegisterData, APIResponse<AuthResponse>>('/auth/register', data);
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
      this.setStoredUser(response.data.user);
      
      // Sync with global store
      useAuthStore.getState().setTokens(response.data.token, '');
      useAuthStore.getState().setUser(response.data.user);

      // Update socket connection
      socketService.updateToken(response.data.token);

      return response.data;
    }
    
    throw new Error(response.message ?? 'Registration failed');
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    useAuthStore.getState().logout();
    
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Get current authenticated user details from server
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<never, APIResponse<User>>('/auth/me');
    
    if (response.success && response.data) {
      this.setStoredUser(response.data); // Update stored user info
      useAuthStore.getState().setUser(response.data);
      return response.data;
    }
    
    throw new Error(response.message ?? 'Failed to fetch user profile');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get auth token from local storage
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set auth token to local storage
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('accessToken', token); // Sync for authStore initialization
  }

  /**
   * Get stored user data (without API call)
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Save user data to local storage
   */
  setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export const authService = new AuthService();
