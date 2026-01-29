import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../../store/authStore';

// Types for API responses
interface ApiResponseData {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

// Queue item type
interface QueueItem {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason: Error) => void;
}

// Create axios instance
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://127.0.0.1:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = useAuthStore.getState().getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error): Promise<never> => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh tokens
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Unwrap { success, data } responses automatically
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Keep the full response for error handling, but make data easily accessible
      return response;
    }
    return response;
  },
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const { data } = await axios.post<RefreshTokenResponse>(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken }
        );

        if (data.success && data.data) {
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          
          // Update tokens in store
          useAuthStore.getState().setTokens(accessToken, newRefreshToken);
          
          // Update the failed request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const errorToPass = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        processQueue(errorToPass, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(errorToPass);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data as ApiResponseData;
      if ('error' in errorData && errorData.error) {
        // Backend returned { success: false, error: "message" }
        return Promise.reject(new Error(errorData.error));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
