import { NextRequest, NextResponse } from 'next/server';
import { BehaviorTracker } from '@/lib/tracking/behavior';
import { TRACKING_EVENTS } from '@/types/tracking';
import prisma from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth/jwt';

// ✅ Type definitions
interface ClickTrackingPayload {
  query: string;
  productId: string;
  productName: string;
  position: number;
  resultCount: number;
  filters?: string[];
  category?: string;
  price?: number;
  score?: number;
  timestamp?: number;
}

// ========================================
// TRACK SEARCH RESULT CLICK
// ========================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ClickTrackingPayload;
    const {
      query,
      productId,
      productName,
      position,
      resultCount,
      filters = [],
      category,
      price,
      score,
      timestamp = Date.now(),
    } = body;

    // ✅ Validate required fields
    if (!query || !productId || position === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: query, productId, position' },
        { status: 400 }
      );
    }

    // ✅ Get user ID if authenticated
    let userId: string | null = null;
    const token = request.cookies.get('auth_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (token) {
      const payload = await verifyAccessToken(token);
      userId = payload?.userId ?? null;
    }

    // getBehavior() always returns null server-side; device/session IDs unavailable here
    const deviceId: string | null = null;
    const sessionId: string | null = null;

    // No-op server-side (window check inside); runs on client via hydration
    BehaviorTracker.trackEvent(TRACKING_EVENTS.VIEW_CONTENT, {
      content_ids: [productId],
      content_name: productName,
      content_category: category,
      value: price,
      currency: 'USD',
    });

    // ========================================
    // ✅ PERSIST CLICK EVENT TO DATABASE
    // ========================================
    try {
      await prisma.searchClickEvent.create({
        data: {
          query: query.toLowerCase().trim(),
          productId,
          position,
          resultCount,
          filters: filters.join(',') || null,
          category: category ?? null,
          price: price ?? null,
          score: score ?? null,
          userId: userId ?? null,
          deviceId: deviceId ?? null,
          sessionId: sessionId ?? null,
          clickedAt: new Date(timestamp),
        }
      });
    } catch (dbError) {
      // Non-fatal: don't fail the request if the DB write fails
      console.error('Failed to persist click event:', dbError);
    }

    // ========================================
    // ✅ UPDATE AGGREGATED CLICK METRICS
    // ========================================
    try {
      await prisma.searchClickMetrics.upsert({
        where: {
          query_productId: {
            query: query.toLowerCase().trim(),
            productId,
          }
        },
        create: {
          query: query.toLowerCase().trim(),
          productId,
          avgPosition: position,
          clicks: 1,
          conversions: 0,
          revenue: 0,
          resultCount,
          lastClicked: new Date(timestamp),
        },
        update: {
          clicks: { increment: 1 },
          lastClicked: new Date(timestamp),
        }
      });
    } catch (metricsError) {
      // Non-fatal
      console.error('Failed to update click metrics:', metricsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Click tracked successfully',
      data: { query, productId, position, timestamp },
    });

  } catch (error: any) {
    console.error('❌ Click tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Click tracking failed', message: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// GET CLICK-THROUGH RATE (CTR) ANALYTICS
// ========================================
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const productId = searchParams.get('productId');
    const limit = parseInt(searchParams.get('limit') || '20');

    // ✅ Top queries by total clicks (aggregate view)
    if (!query && !productId) {
      const topMetrics = await prisma.searchClickMetrics.groupBy({
        by: ['query'],
        _sum: { clicks: true, conversions: true, revenue: true },
        _count: { productId: true },
        orderBy: { _sum: { clicks: 'desc' } },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        type: 'top_queries',
        data: topMetrics.map(m => ({
          query: m.query,
          uniqueProductsClicked: m._count.productId,
          totalClicks: m._sum.clicks ?? 0,
          totalConversions: m._sum.conversions ?? 0,
          totalRevenue: m._sum.revenue ?? 0,
        })),
      });
    }

    // ✅ Metrics for a specific search query
    if (query) {
      const queryMetrics = await prisma.searchClickMetrics.findMany({
        where: { query: query.toLowerCase().trim() },
        orderBy: { clicks: 'desc' },
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, slug: true, price: true },
          }
        }
      });

      const totalClicks = queryMetrics.reduce((sum, m) => sum + m.clicks, 0);
      const avgResultCount = queryMetrics[0]?.resultCount ?? 1;
      const ctr = avgResultCount > 0 ? (totalClicks / avgResultCount) * 100 : 0;

      return NextResponse.json({
        success: true,
        type: 'query_metrics',
        query,
        metrics: {
          totalClicks,
          uniqueProductsClicked: queryMetrics.length,
          avgResultCount,
          ctr: Math.round(ctr * 100) / 100,
          topClickedProducts: queryMetrics.map(m => ({
            productId: m.productId,
            productName: m.product?.name,
            productSlug: m.product?.slug,
            clicks: m.clicks,
            conversions: m.conversions,
            revenue: m.revenue,
            avgPosition: m.avgPosition,
          })),
        }
      });
    }

    // ✅ Metrics for a specific product across all queries
    if (productId) {
      const productMetrics = await prisma.searchClickMetrics.findMany({
        where: { productId },
        orderBy: { clicks: 'desc' },
        take: limit,
      });

      const totalClicks = productMetrics.reduce((sum, m) => sum + m.clicks, 0);
      const totalConversions = productMetrics.reduce((sum, m) => sum + m.conversions, 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      return NextResponse.json({
        success: true,
        type: 'product_metrics',
        productId,
        metrics: {
          totalClicks,
          totalConversions,
          conversionRate: Math.round(conversionRate * 100) / 100,
          queriesThatLeadHere: productMetrics.map(m => ({
            query: m.query,
            clicks: m.clicks,
            conversions: m.conversions,
            avgPosition: m.avgPosition,
          })),
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide query or productId parameter' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ CTR analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics', message: error.message },
      { status: 500 }
    );
  }
}

// ========================================
// TRACK CONVERSION (Purchase attributed to a search)
// ========================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, productId, revenue } = body;

    if (!query || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: query, productId' },
        { status: 400 }
      );
    }

    await prisma.searchClickMetrics.update({
      where: {
        query_productId: {
          query: query.toLowerCase().trim(),
          productId,
        }
      },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: revenue ?? 0 },
      }
    });

    return NextResponse.json({ success: true, message: 'Conversion tracked successfully' });

  } catch (error: any) {
    console.error('❌ Conversion tracking error:', error);
    return NextResponse.json(
      { success: false, error: 'Conversion tracking failed', message: error.message },
      { status: 500 }
    );
  }
}
