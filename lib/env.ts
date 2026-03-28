/**
 * Environment variable validation and type-safe access
 * This module validates required environment variables at startup
 */

type EnvConfig = {
  // Required in all environments
  required: string[];
  // Required only in production
  productionRequired: string[];
  // Optional with defaults
  optional: Record<string, string>;
};

const envConfig: EnvConfig = {
  required: [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ],
  productionRequired: [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'REDIS_URL',
    'MINIO_ENDPOINT',
    'MINIO_ACCESS_KEY',
    'MINIO_SECRET_KEY',
  ],
  optional: {
    NODE_ENV: 'development',
    PORT: '3000',
    JWT_ACCESS_EXPIRY: '15m',
    JWT_REFRESH_EXPIRY: '7d',
    MINIO_PORT: '9000',
    MINIO_USE_SSL: 'false',
    MINIO_BUCKET_NAME: 'minsah-beauty',
  },
};

class EnvValidationError extends Error {
  constructor(public missingVars: string[]) {
    super(`Missing required environment variables: ${missingVars.join(', ')}`);
    this.name = 'EnvValidationError';
  }
}

let validated = false;

/**
 * Validate all required environment variables
 * Call this at application startup
 */
export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];
  const isProduction = process.env.NODE_ENV === 'production';

  // Check required variables
  for (const varName of envConfig.required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check production-required variables
  if (isProduction) {
    for (const varName of envConfig.productionRequired) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(missing);
  }

  validated = true;
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value !== undefined) return value;
  if (defaultValue !== undefined) return defaultValue;
  if (envConfig.optional[key] !== undefined) return envConfig.optional[key];
  throw new Error(`Environment variable ${key} is not set and has no default`);
}

/**
 * Get required environment variable (throws if not set)
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Get environment variable as boolean
 */
export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1' || value === 'yes';
}

/**
 * Get environment variable as number
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Type-safe environment access
 */
export const env = {
  // App
  nodeEnv: () => getEnv('NODE_ENV', 'development'),
  appUrl: () => getEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  port: () => getEnvNumber('PORT', 3000),

  // Auth
  nextAuthSecret: () => getRequiredEnv('NEXTAUTH_SECRET'),
  nextAuthUrl: () => getEnv('NEXTAUTH_URL', 'http://localhost:3000'),
  jwtSecret: () => getRequiredEnv('JWT_SECRET'),
  jwtRefreshSecret: () => getRequiredEnv('JWT_REFRESH_SECRET'),
  jwtAccessExpiry: () => getEnv('JWT_ACCESS_EXPIRY', '15m'),
  jwtRefreshExpiry: () => getEnv('JWT_REFRESH_EXPIRY', '7d'),

  // Database
  databaseUrl: () => getRequiredEnv('DATABASE_URL'),
  directUrl: () => getEnv('DIRECT_URL', getRequiredEnv('DATABASE_URL')),

  // Redis
  redisUrl: () => getEnv('REDIS_URL', ''),

  // MinIO
  minioEndpoint: () => getEnv('MINIO_ENDPOINT', 'localhost'),
  minioPort: () => getEnvNumber('MINIO_PORT', 9000),
  minioAccessKey: () => getEnv('MINIO_ACCESS_KEY', ''),
  minioSecretKey: () => getEnv('MINIO_SECRET_KEY', ''),
  minioBucketName: () => getEnv('MINIO_BUCKET_NAME', 'minsah-beauty'),
  minioUseSSL: () => getEnvBoolean('MINIO_USE_SSL', false),
  minioPublicUrl: () => getEnv('NEXT_PUBLIC_MINIO_PUBLIC_URL', ''),

  // CORS
  allowedOrigins: () => getEnv('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
};
