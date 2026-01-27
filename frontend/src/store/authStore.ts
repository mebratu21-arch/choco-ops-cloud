import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  
  // Helpers
  isAuthenticated: () => boolean;
  hasRole: (roles: string[]) => boolean;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initialize from localStorage
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user });
  },
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Also remove legacy token if exists
    localStorage.removeItem('token');
    set({ user: null, accessToken: null, refreshToken: null });
  },
  
  isAuthenticated: () => {
    const state = get();
    return !!state.user && !!state.accessToken;
  },
  
  hasRole: (roles) => {
    const user = get().user;
    if (!user) return false;
    return roles.some(r => r.toUpperCase() === user.role.toUpperCase());
  },
  
  getAccessToken: () => get().accessToken,
  
  getRefreshToken: () => get().refreshToken,
}));
