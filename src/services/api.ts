import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authService } from './auth.service';

// Products/Origination/Disbursement backend (port 3000)
const PRODUCTS_BASE_URL = 'http://localhost:3000/api/v1';

// Auth backend (port 3001)
const AUTH_BASE_URL = 'http://localhost:3001/api/v1';

// API client for products, origination, disbursement endpoints
export const apiClient = axios.create({
  baseURL: PRODUCTS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API client for authentication endpoints
export const authApiClient = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to auth client to include auth token
authApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're currently refreshing the token
let isRefreshing = false;
// Queue of failed requests waiting for token refresh
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors (unauthorized/expired token)
    if (error.response?.status === 401 && originalRequest) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';

      // Don't attempt refresh on auth pages (login/register errors)
      if (isAuthPage) {
        return Promise.reject(error);
      }

      // Prevent infinite loops - don't retry if we've already tried
      if (originalRequest._retry) {
        // Refresh failed or already attempted, clear tokens and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Start token refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, clear and redirect
        processQueue(error, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const response = await authService.refreshToken(refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage
        authService.setTokens(accessToken, newRefreshToken);

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests with new token
        processQueue(null, accessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, just reject
    return Promise.reject(error);
  }
);

export default apiClient;
