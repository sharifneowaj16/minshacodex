import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';
import { UserRole } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

// GET /api/admin/customers/[id]
// Full customer profile with order history, addresses, loyalty points
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyAdminAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id:              true,
        firstName:       true,
        lastName:        true,
        email:           true,
        phone:           true,
        avatar:          true,
        role:            true,
        status:          true,
        loyaltyPoints:   true,
        createdAt:       true,
        lastLoginAt:     true,
        dateOfBirth:     true,
        gender:          true,
        newsletter:      true,
        smsNotifications:true,
        promotions:      true,
        newProducts:     true,
        orderUpdates:    true,
        referralCode:    true,
        addresses: {
          orderBy: { createdAt: 'desc' },
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
            phone:     true,
            street1:   true,
            street2:   true,
            city:      true,
            state:     true,
            postalCode:true,
            country:   true,
            isDefault: true,
            type:      true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id:           true,
            orderNumber:  true,
            status:       true,
            paymentStatus:true,
            total:        true,
            createdAt:    true,
            items: {
              select: {
                name:     true,
                quantity: true,
                price:    true,
              },
            },
          },
        },
        _count: {
          select: { orders: true, reviews: true, wishlistItems: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate lifetime value
    const lifetimeValueAgg = await prisma.order.aggregate({
      where: { userId: id },
      _sum: { total: true },
      _avg: { total: true },
    });

    const customer = {
      id:              user.id,
      name:            [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      firstName:       user.firstName,
      lastName:        user.lastName,
      email:           user.email,
      phone:           user.phone,
      avatar:          user.avatar,
      role:            user.role,
      status:          user.status.toLowerCase(),
      loyaltyPoints:   user.loyaltyPoints,
      joinDate:        user.createdAt.toISOString(),
      lastLogin:       user.lastLoginAt?.toISOString() ?? null,
      dateOfBirth:     user.dateOfBirth?.toISOString() ?? null,
      gender:          user.gender,
      referralCode:    user.referralCode,
      totalOrders:     user._count.orders,
      totalReviews:    user._count.reviews,
      wishlistItems:   user._count.wishlistItems,
      totalSpent:      parseFloat((lifetimeValueAgg._sum.total ?? 0).toString()),
      averageOrderValue: parseFloat((lifetimeValueAgg._avg.total ?? 0).toString()),
      addresses:       user.addresses,
      recentOrders:    user.orders.map((o) => ({
        id:           o.id,
        orderNumber:  o.orderNumber,
        status:       o.status.toLowerCase(),
        paymentStatus:o.paymentStatus.toLowerCase(),
        total:        parseFloat(o.total.toString()),
        createdAt:    o.createdAt.toISOString(),
        itemCount:    o.items.length,
        items:        o.items,
      })),
      marketing: {
        emailConsent: user.newsletter,
        smsConsent:   user.smsNotifications,
        promotions:   user.promotions,
        newProducts:  user.newProducts,
        orderUpdates: user.orderUpdates,
      },
    };

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Admin customer GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/customers/[id]
// Update status, role, loyaltyPoints, adminNote etc.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyAdminAccessToken(accessToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Only SUPER_ADMIN and ADMIN can edit customers
    if (!['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    // Status update
    if (body.status) {
      const statusMap: Record<string, string> = {
        active:    'ACTIVE',
        suspended: 'SUSPENDED',
        banned:    'BANNED',
        inactive:  'INACTIVE',
      };
      const mapped = statusMap[body.status.toLowerCase()];
      if (!mapped) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateData.status = mapped;
    }

    // Role update (SUPER_ADMIN only)
    if (body.role) {
      if (payload.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only SUPER_ADMIN can change roles' }, { status: 403 });
      }
      const roleMap: Record<string, UserRole> = {
        customer:    'CUSTOMER',
        vip:         'VIP',
        premium:     'PREMIUM',
      };
      const mappedRole = roleMap[body.role.toLowerCase()];
      if (!mappedRole) {
        return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
      }
      updateData.role = mappedRole;
    }

    // Loyalty points adjustment
    if (typeof body.loyaltyPoints === 'number') {
      updateData.loyaltyPoints = Math.max(0, body.loyaltyPoints);
    }

    if (typeof body.loyaltyPointsAdjustment === 'number') {
      updateData.loyaltyPoints = Math.max(
        0,
        existing.loyaltyPoints + body.loyaltyPointsAdjustment
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id:           true,
        status:       true,
        role:         true,
        loyaltyPoints:true,
        updatedAt:    true,
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id:           updated.id,
        status:       updated.status.toLowerCase(),
        role:         updated.role.toLowerCase(),
        loyaltyPoints:updated.loyaltyPoints,
        updatedAt:    updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin customer PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
