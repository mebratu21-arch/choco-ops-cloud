import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

// Extended request config to track retries
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors & Token Refresh
api.interceptors.response.use(
  (response) => {
    // Unwrap data if strict unwrapping is desired - but keeping response object is safer for headers/pagination
    // We will return the full response and let repositories unwrap 'data.data'
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle 401 - Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt refresh
        const refreshToken = localStorage.getItem('refreshToken'); // Assuming we store this
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed -> Logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        toast.error('Session expired. Please log in again.');
        setTimeout(() => window.location.href = '/login', 1500);
        return Promise.reject(refreshError);
      }
    }

    // Global Error Handling
    let message = 'Something went wrong';
    if (error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        // specific backend error format
        const errData = error.response.data as any;
        message = errData.error?.message || errData.message || message;
    } else if (error.message) {
        message = error.message;
    }

    if (error.response?.status !== 401) { // 401 is handled above or by redirect
        toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default api;

