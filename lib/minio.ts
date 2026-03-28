/**
 * lib/minio.ts
 *
 * MinIO storage utilities – re-exports from lib/storage/minio.ts
 * and provides the canonical uploadFile / getPublicUrl API expected
 * by the rest of the application.
 *
 * Environment variables required:
 *   MINIO_ENDPOINT          – e.g. "minio"
 *   MINIO_PORT              – e.g. "9000"
 *   MINIO_ACCESS_KEY        – e.g. "minsah_admin_2025"
 *   MINIO_SECRET_KEY        – e.g. "YourSuperSecurePassword123!"
 *   MINIO_USE_SSL           – "true" | "false"  (default: "false")
 *   MINIO_BUCKET_NAME       – e.g. "minsah-beauty"
 *   NEXT_PUBLIC_MINIO_PUBLIC_URL – e.g. "https://minio.minsahbeauty.cloud"
 */

export {
  minio as default,
  minio,
  BUCKET_NAME,
  initializeBucket,
  ensureBucketInitialized,
  uploadFile,
  uploadProductImage,
  uploadAvatar,
  uploadCategoryImage,
  uploadBrandLogo,
  uploadBannerImage,
  uploadBlogImage,
  uploadMediaFile,
  deleteFile,
  deleteFolder,
  listObjects,
  listAllObjects,
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  getPublicUrl,
  getFileInfo,
  fileExists,
  validateImageUpload,
} from '@/lib/storage/minio';
