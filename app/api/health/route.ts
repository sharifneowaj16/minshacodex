import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/cache/redis';
import { minio } from '@/lib/storage/minio';
import { createLogger } from '@/lib/logger';

const logger = createLogger('health');

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    minio: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    logger.error('Database health check failed', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  if (!redis) {
    return {
      status: 'unhealthy',
      error: 'Redis client not initialized',
    };
  }
  const start = Date.now();
  try {
    await redis.ping();
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    logger.error('Redis health check failed', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

async function checkMinio(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const bucketName = process.env.MINIO_BUCKET_NAME || 'minsah-beauty';
    await minio.bucketExists(bucketName);
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    logger.error('MinIO health check failed', error);
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

export async function GET() {
  const startTime = Date.now();

  // Run all health checks in parallel
  const [database, redisHealth, minioHealth] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkMinio(),
  ]);

  const services = {
    database,
    redis: redisHealth,
    minio: minioHealth,
  };

  // Determine overall status
  const unhealthyServices = Object.values(services).filter(s => s.status === 'unhealthy');
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';

  if (unhealthyServices.length === 0) {
    overallStatus = 'healthy';
  } else if (unhealthyServices.length < Object.keys(services).length) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'unhealthy';
  }

  // Database being unhealthy means the app is unhealthy
  if (database.status === 'unhealthy') {
    overallStatus = 'unhealthy';
  }

  const healthCheck: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    services,
  };

  const totalLatency = Date.now() - startTime;
  logger.debug('Health check completed', { status: overallStatus, latency: totalLatency });

  // Return appropriate status code
  const statusCode = overallStatus === 'unhealthy' ? 503 : overallStatus === 'degraded' ? 200 : 200;

  return NextResponse.json(healthCheck, { status: statusCode });
}

// HEAD request for simple liveness check
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
