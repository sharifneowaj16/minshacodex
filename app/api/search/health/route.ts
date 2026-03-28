import { NextResponse } from 'next/server';
import { testConnection, indexExists, PRODUCT_INDEX, esClient } from '@/lib/elasticsearch';

/**
 * GET /api/search/health
 * Health check endpoint for Elasticsearch
 * Returns cluster status, index status, and document count
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Run health checks in parallel
    const [connected, exists] = await Promise.all([
      testConnection(),
      indexExists(PRODUCT_INDEX)
    ]);

    let documentCount = 0;
    let clusterHealth = 'unknown';
    let indexHealth = null;

    if (connected && exists) {
      try {
        const [countRes, healthRes] = await Promise.all([
          esClient.count({ index: PRODUCT_INDEX }),
          esClient.cluster.health()
        ]);
        
        documentCount = countRes.count;
        clusterHealth = healthRes.status;

        // Get index health
        const indexStats = await esClient.indices.stats({ index: PRODUCT_INDEX });
        indexHealth = {
          sizeInBytes: indexStats.indices?.[PRODUCT_INDEX]?.total?.store?.size_in_bytes || 0,
          documentsCount: documentCount,
        };
      } catch (error) {
        console.error('Error fetching Elasticsearch stats:', error);
      }
    }

    const responseTime = Date.now() - startTime;
    const status = connected && exists && clusterHealth !== 'red' ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      status,
      responseTime,
      elasticsearch: {
        connected,
        clusterHealth,
        version: process.env.ELASTICSEARCH_VERSION || 'unknown',
      },
      index: {
        name: PRODUCT_INDEX,
        exists,
        documentCount,
        ...indexHealth,
      },
      timestamp: new Date().toISOString(),
    }, {
      status: status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'error',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  }
}
