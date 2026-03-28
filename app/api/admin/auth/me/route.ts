import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';

// Permission mappings by role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'products_view', 'products_create', 'products_edit', 'products_delete',
    'orders_view', 'orders_process', 'orders_refund',
    'customers_view', 'customers_edit', 'customers_delete',
    'analytics_view',
    'settings_view', 'settings_edit',
    'users_manage',
    'content_manage',
  ],
  ADMIN: [
    'dashboard',
    'products_view', 'products_create', 'products_edit',
    'orders_view', 'orders_process',
    'customers_view', 'customers_edit',
    'analytics_view',
    'settings_view',
    'content_manage',
  ],
  MANAGER: [
    'dashboard',
    'products_view', 'products_edit',
    'orders_view', 'orders_process',
    'customers_view',
    'analytics_view',
    'content_manage',
  ],
  STAFF: [
    'dashboard',
    'products_view',
    'orders_view',
    'customers_view',
  ],
};

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify access token
    const payload = await verifyAdminAccessToken(accessToken);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch current admin user from database
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    if (admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been suspended' },
        { status: 403 }
      );
    }

    // Get permissions for role
    const permissions = ROLE_PERMISSIONS[admin.role] || [];

    return NextResponse.json({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
        permissions,
        lastLogin: admin.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get admin user error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
