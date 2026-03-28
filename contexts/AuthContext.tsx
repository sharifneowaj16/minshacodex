'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  loyaltyPoints: number;
  referralCode: string | null;
  preferences?: {
    newsletter: boolean;
    smsNotifications: boolean;
    promotions: boolean;
    newProducts: boolean;
    orderUpdates: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithProvider: (provider: string) => void;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  uploadAvatar: (file: File) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  isInRole: (role: string) => boolean;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions
const rolePermissions: Record<string, string[]> = {
  customer: [
    'browse_products',
    'view_products',
    'add_to_cart',
    'purchase_products',
    'write_reviews',
    'manage_profile',
    'manage_addresses',
    'manage_wishlist',
    'view_orders',
    'track_orders'
  ],
  vip: [
    'browse_products',
    'view_products',
    'add_to_cart',
    'purchase_products',
    'write_reviews',
    'manage_profile',
    'manage_addresses',
    'manage_wishlist',
    'view_orders',
    'track_orders',
    'exclusive_deals',
    'early_access',
    'free_shipping',
    'priority_support'
  ],
  premium: [
    'browse_products',
    'view_products',
    'add_to_cart',
    'purchase_products',
    'write_reviews',
    'manage_profile',
    'manage_addresses',
    'manage_wishlist',
    'view_orders',
    'track_orders',
    'exclusive_deals',
    'early_access',
    'free_shipping',
    'priority_support',
    'personal_stylist',
    'birthday_rewards',
    'anniversary_rewards'
  ]
};

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Fetch user profile from API
  const fetchUserProfile = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry fetching profile
          const retryResponse = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setUser(data.user);
            return true;
          }
        }
        setUser(null);
        return false;
      }
      return false;
    } catch {
      setUser(null);
      return false;
    }
  }, [refreshToken]);

  // Initialize auth state
  useEffect(() => {
    if (status === 'loading') return;

    const initAuth = async () => {
      setLoading(true);

      // If using NextAuth session
      if (session?.user) {
        await fetchUserProfile();
      } else {
        // Check for custom JWT auth
        await fetchUserProfile();
      }

      setLoading(false);
    };

    initAuth();
  }, [session, status, fetchUserProfile]);

  // Login with email/password
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        const errorMessage = data.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Login with OAuth provider
  const loginWithProvider = (provider: string) => {
    signIn(provider, { callbackUrl: '/' });
  };

  // Logout
  const logout = async (): Promise<void> => {
    setLoading(true);

    try {
      // Logout from custom auth
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Also logout from NextAuth if using it
      if (session) {
        await signOut({ redirect: false });
      }

      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        const errorMessage = data.error || 'Registration failed';
        if (data.details) {
          setError(`${errorMessage}: ${data.details.join(', ')}`);
        } else {
          setError(errorMessage);
        }
        return { success: false, error: errorMessage };
      }
    } catch {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Update preferences
  const updatePreferences = async (preferences: Partial<User['preferences']>): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/auth/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, preferences: data.preferences } : null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Change password
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to change password' };
      }
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Upload avatar
  const uploadAvatar = async (file: File): Promise<boolean> => {
    if (!user) return false;

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, avatar: data.avatarUrl } : null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Check permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  // Check role
  const isInRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    loginWithProvider,
    logout,
    register,
    updateUser,
    updatePreferences,
    changePassword,
    uploadAvatar,
    hasPermission,
    isInRole,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderContent>
        {children}
      </AuthProviderContent>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for checking user authentication status
export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}

// Hook for user permissions
export function useUserPermissions() {
  const { hasPermission, isInRole } = useAuth();

  return {
    canBrowseProducts: hasPermission('browse_products'),
    canViewProducts: hasPermission('view_products'),
    canAddToCart: hasPermission('add_to_cart'),
    canPurchaseProducts: hasPermission('purchase_products'),
    canWriteReviews: hasPermission('write_reviews'),
    canManageProfile: hasPermission('manage_profile'),
    canManageAddresses: hasPermission('manage_addresses'),
    canManageWishlist: hasPermission('manage_wishlist'),
    canViewOrders: hasPermission('view_orders'),
    canTrackOrders: hasPermission('track_orders'),
    canAccessExclusiveDeals: hasPermission('exclusive_deals'),
    canGetEarlyAccess: hasPermission('early_access'),
    hasFreeShipping: hasPermission('free_shipping'),
    hasPrioritySupport: hasPermission('priority_support'),
    hasPersonalStylist: hasPermission('personal_stylist'),
    getsBirthdayRewards: hasPermission('birthday_rewards'),
    getsAnniversaryRewards: hasPermission('anniversary_rewards'),
    isVip: isInRole('vip'),
    isPremium: isInRole('premium'),
    isCustomer: isInRole('customer')
  };
}

// Hook for loyalty points
export function useLoyaltyPoints() {
  const { user, updateUser } = useAuth();

  const addPoints = async (points: number) => {
    if (!user) return false;
    return updateUser({ loyaltyPoints: user.loyaltyPoints + points });
  };

  const redeemPoints = async (points: number) => {
    if (!user || user.loyaltyPoints < points) return false;
    return updateUser({ loyaltyPoints: user.loyaltyPoints - points });
  };

  return {
    currentPoints: user?.loyaltyPoints || 0,
    addPoints,
    redeemPoints,
    canRedeem: (points: number) => !!(user && user.loyaltyPoints >= points)
  };
}
