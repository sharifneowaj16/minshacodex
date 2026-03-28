import type { NextRequest } from 'next/server';
import { verifyAdminAccessToken, verifyAdminRefreshToken } from '@/lib/auth/jwt';
import prisma from '@/lib/prisma';

export const ADMIN_PERMISSIONS = {
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

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

const ROLE_PERMISSIONS: Record<string, AdminPermission[]> = {
  SUPER_ADMIN: Object.values(ADMIN_PERMISSIONS),
  ADMIN: [
    ADMIN_PERMISSIONS.DASHBOARD,
    ADMIN_PERMISSIONS.PRODUCTS_VIEW,
    ADMIN_PERMISSIONS.PRODUCTS_CREATE,
    ADMIN_PERMISSIONS.PRODUCTS_EDIT,
    ADMIN_PERMISSIONS.ORDERS_VIEW,
    ADMIN_PERMISSIONS.ORDERS_PROCESS,
    ADMIN_PERMISSIONS.ORDERS_REFUND,
    ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
    ADMIN_PERMISSIONS.CUSTOMERS_EDIT,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW,
    ADMIN_PERMISSIONS.SETTINGS_VIEW,
    ADMIN_PERMISSIONS.CONTENT_MANAGE,
  ],
  MANAGER: [
    ADMIN_PERMISSIONS.DASHBOARD,
    ADMIN_PERMISSIONS.PRODUCTS_VIEW,
    ADMIN_PERMISSIONS.PRODUCTS_EDIT,
    ADMIN_PERMISSIONS.ORDERS_VIEW,
    ADMIN_PERMISSIONS.ORDERS_PROCESS,
    ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
    ADMIN_PERMISSIONS.ANALYTICS_VIEW,
    ADMIN_PERMISSIONS.CONTENT_MANAGE,
  ],
  STAFF: [
    ADMIN_PERMISSIONS.DASHBOARD,
    ADMIN_PERMISSIONS.PRODUCTS_VIEW,
    ADMIN_PERMISSIONS.ORDERS_VIEW,
    ADMIN_PERMISSIONS.CUSTOMERS_VIEW,
  ],
};

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  avatar: string | null;
  permissions: AdminPermission[];
}

function mapAdmin(admin: {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
}): AuthenticatedAdminUser {
  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as AuthenticatedAdminUser['role'],
    avatar: admin.avatar,
    permissions: ROLE_PERMISSIONS[admin.role] ?? [],
  };
}

export async function getAuthenticatedAdminFromRequest(
  request: NextRequest,
): Promise<AuthenticatedAdminUser | null> {
  const accessToken = request.cookies.get('admin_access_token')?.value ?? null;
  if (accessToken) {
    const payload = await verifyAdminAccessToken(accessToken);
    if (payload?.adminId) {
      const admin = await prisma.adminUser.findUnique({
        where: { id: payload.adminId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          status: true,
        },
      });

      if (admin && admin.status === 'ACTIVE') {
        return mapAdmin(admin);
      }
    }
  }

  const refreshToken = request.cookies.get('admin_refresh_token')?.value ?? null;
  if (!refreshToken) {
    return null;
  }

  const refreshPayload = await verifyAdminRefreshToken(refreshToken);
  if (!refreshPayload?.adminId) {
    return null;
  }

  const storedToken = await prisma.adminRefreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      admin: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          status: true,
        },
      },
    },
  });

  if (
    !storedToken ||
    storedToken.revoked ||
    storedToken.expiresAt < new Date() ||
    storedToken.admin.status !== 'ACTIVE'
  ) {
    return null;
  }

  return mapAdmin(storedToken.admin);
}

export function hasAdminPermission(
  admin: AuthenticatedAdminUser,
  permission: AdminPermission,
): boolean {
  return admin.permissions.includes(permission);
}
