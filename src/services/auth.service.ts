import apiClient from './api';
import axios from 'axios';

// Separate axios instance for refresh token calls (no interceptors to avoid loops)
const refreshClient = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RegisterRequest {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  timestamp: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  tenantId: string;
  category: string;
  roles: string[];
  permissions: string[];
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  timestamp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Call the logout API endpoint
      await apiClient.post<LogoutResponse>('/auth/logout');
    } catch (error) {
      // Even if API call fails, we should still clear tokens locally
      // This ensures logout works even if backend is unreachable
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear tokens from localStorage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await apiClient.get<ProfileResponse>('/auth/profile');
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    // Use separate axios instance without interceptors to avoid loops
    const response = await refreshClient.post<RefreshTokenResponse>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  },
};
