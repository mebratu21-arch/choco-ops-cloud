import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Extend the AxiosRequestConfig interface to include our custom property
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

const API_URL: string = (import.meta?.env?.VITE_API_URL as string) ?? 'http://127.0.0.1:5003/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data ?? '');
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    if (error.response) {
      // Handle 401 Unauthorized
      // Handle 401 Unauthorized OR 404 Not Found on the /me endpoint
      // 404 on /me means the token is valid but the user ID no longer exists (stale session)
      if (error.response.status === 401 || (error.response.status === 404 && originalRequest?.url?.includes('/auth/me'))) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Prevent infinite redirect loops if we are already on login
        if (window.location.pathname !== '/login') {
             window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access Denied: You do not have permission to perform this action.');
        // Optionally trigger a UI toast here
      }
    }

    // Standardize error message
    const responseData = error.response?.data as { message?: string; error?: string } | undefined;
    const errorMessage = 
      responseData?.message ?? 
      responseData?.error ?? 
      error.message ?? 
      'An unexpected error occurred';

    // Construct a consistent error object to return
    // Note: We reject with a proper Error so components can use error.message
    const enhancedError = new Error(errorMessage) as Error & { success?: boolean; originalError?: unknown };
    enhancedError.success = false;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
