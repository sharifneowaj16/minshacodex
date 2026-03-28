import { NextResponse } from 'next/server';
import { searchMetrics } from '@/lib/elasticsearch/metrics';

export async function GET() {
  try {
    const summary = searchMetrics.getSummary();
    const noResultQueries = searchMetrics.getZeroResultQueries();

    return NextResponse.json({
      success: true,
      metrics: {
        overview: summary,
        slowQueries: summary.slowQueries.slice(0, 10),
        noResultQueries: noResultQueries.slice(0, 10),
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
