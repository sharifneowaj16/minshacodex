import { Client } from 'minio';
import { createLogger } from '@/lib/logger';

const logger = createLogger('storage:minio');

// MinIO singleton pattern
const globalForMinio = globalThis as unknown as {
  minio: Client | undefined;
};

function createMinioClient(): Client {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = parseInt(process.env.MINIO_PORT || '9000', 10);
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const useSSL = process.env.MINIO_USE_SSL === 'true';

  if (!accessKey || !secretKey) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      logger.error('MinIO credentials not set in production. Storage operations will fail.');
      throw new Error('MINIO_ACCESS_KEY and MINIO_SECRET_KEY must be set in production');
    }
    logger.warn('MinIO credentials not set. Using development defaults.');
  }

  return new Client({
    endPoint: endpoint,
    port: port,
    useSSL: useSSL,
    accessKey: accessKey || '',
    secretKey: secretKey || '',
  });
}

export const minio = globalForMinio.minio ?? createMinioClient();

// Always cache the singleton to avoid creating a new client on every hot-reload
// or module re-evaluation (important in both development and production).
globalForMinio.minio = minio;

// Track whether bucket initialisation has run in this process.
const globalWithInit = globalThis as unknown as {
  minioInitialized: boolean | undefined;
};

/**
 * Ensure the bucket exists and has the correct policy.
 * Safe to call multiple times – runs only once per process.
 */
export async function ensureBucketInitialized(): Promise<void> {
  if (globalWithInit.minioInitialized) return;
  globalWithInit.minioInitialized = true; // mark before await to prevent races
  try {
    await initializeBucket();
  } catch (error) {
    globalWithInit.minioInitialized = false; // allow retry on next request
    throw error;
  }
}

// Default bucket name
export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'minsah-beauty';

// Public URL for serving files
const PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || '';

/**
 * Initialize MinIO bucket (run on app startup)
 */
export async function initializeBucket(): Promise<void> {
  try {
    const exists = await minio.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minio.makeBucket(BUCKET_NAME, 'us-east-1');
      logger.info(`Bucket '${BUCKET_NAME}' created successfully`);
    }

    // Set bucket policy for public read access on all media paths
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [
            `arn:aws:s3:::${BUCKET_NAME}/products/*`,
            `arn:aws:s3:::${BUCKET_NAME}/categories/*`,
            `arn:aws:s3:::${BUCKET_NAME}/brands/*`,
            `arn:aws:s3:::${BUCKET_NAME}/avatars/*`,
            `arn:aws:s3:::${BUCKET_NAME}/banners/*`,
            `arn:aws:s3:::${BUCKET_NAME}/blog/*`,
            `arn:aws:s3:::${BUCKET_NAME}/media/*`,
            `arn:aws:s3:::${BUCKET_NAME}/uploads/*`,
          ],
        },
      ],
    };

    await minio.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    logger.info('MinIO bucket policy set for public read access');
  } catch (error) {
    logger.error('Failed to initialize MinIO bucket:', error);
    throw error;
  }
}

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  file: Buffer,
  fileName: string,
  folder: string = 'uploads',
  contentType: string = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
  const key = `${folder}/${Date.now()}-${sanitizedName}`;

  await minio.putObject(BUCKET_NAME, key, file, file.length, {
    'Content-Type': contentType,
  });

  const url = getPublicUrl(key);
  return { key, url };
}

/**
 * Upload a product image
 */
export async function uploadProductImage(
  file: Buffer,
  productId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, `products/${productId}`, contentType);
}

/**
 * Upload a user avatar
 */
export async function uploadAvatar(
  file: Buffer,
  userId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  // Delete old avatars first
  await deleteFolder(`avatars/${userId}`);
  return uploadFile(file, fileName, `avatars/${userId}`, contentType);
}

/**
 * Upload a category image
 */
export async function uploadCategoryImage(
  file: Buffer,
  categoryId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, `categories/${categoryId}`, contentType);
}

/**
 * Upload a brand logo
 */
export async function uploadBrandLogo(
  file: Buffer,
  brandId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, `brands/${brandId}`, contentType);
}

/**
 * Upload a banner image
 */
export async function uploadBannerImage(
  file: Buffer,
  bannerId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, `banners/${bannerId}`, contentType);
}

/**
 * Upload a blog image
 */
export async function uploadBlogImage(
  file: Buffer,
  blogId: string,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, `blog/${blogId}`, contentType);
}

/**
 * Upload a general media file
 */
export async function uploadMediaFile(
  file: Buffer,
  fileName: string,
  contentType: string = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  return uploadFile(file, fileName, 'media', contentType);
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(key: string): Promise<void> {
  await minio.removeObject(BUCKET_NAME, key);
}

/**
 * Delete all files in a folder
 */
export async function deleteFolder(folder: string): Promise<void> {
  const objects = await listObjects(folder);
  const objectNames = objects.map((obj) => obj.name);

  if (objectNames.length > 0) {
    await minio.removeObjects(BUCKET_NAME, objectNames);
  }
}

/**
 * List objects in a folder
 */
export async function listObjects(
  prefix: string
): Promise<Array<{ name: string; size: number; lastModified: Date }>> {
  return new Promise((resolve, reject) => {
    const objects: Array<{ name: string; size: number; lastModified: Date }> = [];
    const stream = minio.listObjects(BUCKET_NAME, prefix, true);

    stream.on('data', (obj) => {
      objects.push({
        name: obj.name ?? '',
        size: obj.size ?? 0,
        lastModified: obj.lastModified ?? new Date(),
      });
    });

    stream.on('error', reject);
    stream.on('end', () => resolve(objects));
  });
}

/**
 * List all objects in the bucket with optional prefix
 */
export async function listAllObjects(
  prefix: string = ''
): Promise<Array<{ name: string; size: number; lastModified: Date; url: string }>> {
  const objects = await listObjects(prefix);
  return objects.map((obj) => ({
    ...obj,
    url: getPublicUrl(obj.name),
  }));
}

/**
 * Get a presigned URL for direct upload
 */
export async function getPresignedUploadUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return minio.presignedPutObject(BUCKET_NAME, key, expirySeconds);
}

/**
 * Get a presigned URL for download
 */
export async function getPresignedDownloadUrl(
  key: string,
  expirySeconds: number = 3600
): Promise<string> {
  return minio.presignedGetObject(BUCKET_NAME, key, expirySeconds);
}

/**
 * Get the public URL for a file
 */
export function getPublicUrl(key: string): string {
  if (PUBLIC_URL) {
    return `${PUBLIC_URL}/${BUCKET_NAME}/${key}`;
  }

  // Fallback to MinIO direct URL
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';

  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${key}`;
}

/**
 * Get file info
 */
export async function getFileInfo(key: string): Promise<{
  size: number;
  lastModified: Date;
  contentType: string;
} | null> {
  try {
    const stat = await minio.statObject(BUCKET_NAME, key);
    return {
      size: stat.size,
      lastModified: stat.lastModified,
      contentType: stat.metaData['content-type'] || 'application/octet-stream',
    };
  } catch (error) {
    if ((error as { code?: string }).code === 'NotFound') {
      return null;
    }
    throw error;
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  const info = await getFileInfo(key);
  return info !== null;
}

/**
 * Helper to process and validate image uploads
 */
export function validateImageUpload(
  file: { size: number; type: string },
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF',
    };
  }

  return { valid: true };
}

export default minio;
