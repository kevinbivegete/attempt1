import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    tenantId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = authService.getAccessToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      authService.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    tenantId: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    try {
      await authService.register({
        tenantId,
        email,
        password,
        firstName,
        lastName,
      });
      // After registration, automatically log in
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout API fails, we still want to clear local state
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
