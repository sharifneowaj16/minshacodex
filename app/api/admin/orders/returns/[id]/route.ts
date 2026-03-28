import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminAccessToken } from '@/lib/auth/jwt';

// PATCH /api/admin/orders/returns/[id] - Approve, reject, or update return status
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

    const { id } = await params;
    const body = await request.json();
    const { status, adminNote } = body;

    const existing = await prisma.return.findFirst({
      where: { OR: [{ id }, { returnNumber: id }] },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Return request not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      pending: 'PENDING',
      approved: 'APPROVED',
      rejected: 'REJECTED',
      processing: 'PROCESSING',
      completed: 'COMPLETED',
    };

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = statusMap[status.toLowerCase()] || status.toUpperCase();
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const updated = await prisma.return.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      return: {
        id: updated.returnNumber,
        status: updated.status.toLowerCase(),
        adminNote: updated.adminNote,
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin return PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
