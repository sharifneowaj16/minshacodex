import { NextResponse } from 'next/server';
import { minio, BUCKET_NAME } from '@/lib/storage/minio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/health/minio
 *
 * Checks connectivity to MinIO and whether the target bucket exists.
 * Use this to diagnose upload failures in production.
 */
export async function GET() {
  const config = {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: process.env.MINIO_PORT || '9000',
    useSSL: process.env.MINIO_USE_SSL || 'false',
    bucket: BUCKET_NAME,
    publicUrl: process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || '(not set)',
    hasAccessKey: !!process.env.MINIO_ACCESS_KEY,
    hasSecretKey: !!process.env.MINIO_SECRET_KEY,
  };

  try {
    const bucketExists = await minio.bucketExists(BUCKET_NAME);
    return NextResponse.json({
      status: 'ok',
      bucketExists,
      config,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        status: 'error',
        message,
        config,
      },
      { status: 500 }
    );
  }
}
