'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  avatar?: string;
  permissions: string[];
  lastLogin?: Date;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  refreshAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Permission constants
export const PERMISSIONS = {
  DASHBOARD: 'dashboard',
  PRODUCTS_VIEW: 'products_view',
  PRODUCTS_CREATE: 'products_create',
  PRODUCTS_EDIT: 'products_edit',
  PRODUCTS_DELETE: 'products_delete',
  ORDERS_VIEW: 'orders_view',
  ORDERS_PROCESS: 'orders_process',
  ORDERS_REFUND: 'orders_refund',
  CUSTOMERS_VIEW: 'customers_view',
  CUSTOMERS_EDIT: 'customers_edit',
  CUSTOMERS_DELETE: 'customers_delete',
  ANALYTICS_VIEW: 'analytics_view',
  SETTINGS_VIEW: 'settings_view',
  SETTINGS_EDIT: 'settings_edit',
  USERS_MANAGE: 'users_manage',
  CONTENT_MANAGE: 'content_manage',
} as const;

// Role-based permission mapping (fallback for client-side checks)
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_PROCESS,
    PERMISSIONS.ORDERS_REFUND,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.CONTENT_MANAGE,
  ],
  MANAGER: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_EDIT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_PROCESS,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.CONTENT_MANAGE,
  ],
  STAFF: [
    PERMISSIONS.DASHBOARD,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
  ],
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user from API
  const fetchCurrentUser = useCallback(async (): Promise<AdminUser | null> => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh the token
          const refreshResponse = await fetch('/api/admin/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            return {
              ...refreshData.user,
              permissions: ROLE_PERMISSIONS[refreshData.user.role] || [],
            };
          }
        }
        return null;
      }

      const data = await response.json();
      return {
        ...data.user,
        permissions: data.user.permissions || ROLE_PERMISSIONS[data.user.role] || [],
        lastLogin: data.user.lastLogin ? new Date(data.user.lastLogin) : undefined,
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [fetchCurrentUser]);

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, [fetchCurrentUser]);

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // Set user with permissions
      const loggedInUser: AdminUser = {
        ...data.user,
        permissions: ROLE_PERMISSIONS[data.user.role] || [],
        lastLogin: new Date(),
      };

      setUser(loggedInUser);
      setIsLoading(false);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return {
        success: false,
        error: 'Network error. Please try again.',
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Check if user has permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  const value = {
    user,
    login,
    logout,
    isLoading,
    hasPermission,
    refreshAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
