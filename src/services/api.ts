import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || currentPath === '/register';
      
      // Clear tokens //TODO: 
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Only redirect if we're NOT on an auth page
      // This prevents redirect loop and allows login errors to be displayed
      // Login attempts with wrong credentials will get 401, but we don't want to redirect
      if (!isAuthPage) {
        // User was authenticated but token expired/invalid - redirect to login
        window.location.href = '/login';
      }
      // If we're already on login/register page, just let the error propagate
      // so the form can display the error message
    }
    return Promise.reject(error);
  }
);

export default apiClient;
