import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (role: string): boolean => {
  const { hasRole } = useAuth();
  return hasRole(role);
};

/**
 * Hook to check if user has a specific permission
 */
export const useHasPermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
};

/**
 * Hook to check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: string[]): boolean => {
  const { hasRole } = useAuth();
  return roles.some((role) => hasRole(role));
};

/**
 * Hook to check if user has all of the specified roles
 */
export const useHasAllRoles = (roles: string[]): boolean => {
  const { hasRole } = useAuth();
  return roles.every((role) => hasRole(role));
};

/**
 * Hook to check if user has any of the specified permissions
 */
export const useHasAnyPermission = (permissions: string[]): boolean => {
  const { hasPermission } = useAuth();
  return permissions.some((permission) => hasPermission(permission));
};

/**
 * Hook to check if user has all of the specified permissions
 */
export const useHasAllPermissions = (permissions: string[]): boolean => {
  const { hasPermission } = useAuth();
  return permissions.every((permission) => hasPermission(permission));
};
