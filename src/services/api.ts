import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';
import { authService } from './auth.service';

// Products/Origination/Disbursement backend (port 3000)
const PRODUCTS_BASE_URL = 'http://localhost:3000/api/v1';

// Auth backend (port 3001)
const AUTH_BASE_URL = 'http://localhost:3001/api/v1';

// FSP Customer Service API (port 3004)
const CUSTOMER_BASE_URL =
  import.meta.env.VITE_CUSTOMER_SERVICE_URL ||
  'http://localhost:3004/api/v1';

// API client for products, origination, disbursement endpoints
export const apiClient = axios.create({
  baseURL: PRODUCTS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API client for customer registry
export const customerApiClient = axios.create({
  baseURL: CUSTOMER_BASE_URL,
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
  },
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

function attachAuthBearer(client: AxiosInstance) {
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
}

function attach401Refresh(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && originalRequest) {
        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath === '/login' || currentPath === '/register';

        if (isAuthPage) {
          return Promise.reject(error);
        }

        if (originalRequest._retry) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return client(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = authService.getRefreshToken();

        if (!refreshToken) {
          processQueue(error, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const response = await authService.refreshToken(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } =
            response.data;

          authService.setTokens(accessToken, newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);

          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}

attachAuthBearer(apiClient);
attach401Refresh(apiClient);

attachAuthBearer(customerApiClient);
attach401Refresh(customerApiClient);

export default apiClient;
