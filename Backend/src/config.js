// ENV variables with defaults
const config = {
  ENVIRONMENT: process.env.NODE_ENV?.toLowerCase() || "production",
  PORT: process.env.PORT || 4000,
  // Supabase connection string (use pooled connection for better performance)
  // Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
  // Or direct: postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
  // Remove quotes if present in .env file
  DATABASE_URL: process.env.DATABASE_URL?.replace(/^["']|["']$/g, "").trim() || process.env.DATABASE_URL,
  // Supabase specific: Use direct connection for migrations, pooled for runtime
  DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL?.replace(/^["']|["']$/g, "").trim() || process.env.DATABASE_URL?.replace(/^["']|["']$/g, "").trim(),
  API_URL: process.env.API_URL,
  /** Browser-reachable API base for /files/:id links in JSON (omit internal Docker hostnames). */
  PUBLIC_API_URL: process.env.PUBLIC_API_URL || process.env.API_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  // JWT_SECRET must be set in production
  JWT_SECRET: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV?.toLowerCase() === "production") {
      throw new Error(
        "JWT_SECRET must be set in production environment!",
      );
    }
    return secret || "jwt-super-secret-key-dev-only";
  })(),
  JWT_EXPIRATION_TIME: parseInt(process.env.JWT_EXPIRATION_TIME) || 48, // in hours
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",
  /** Browser app origin (dashboard). Merged into CORS allowlist in production; set in prod if API is locked to a subset of ALLOWED_ORIGINS. */
  FRONTEND_URL: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.trim().replace(/\/$/, "")
    : "",
  // GET /files/:uuid must match without a bogus trailing slash (browser open / download has no auth header)
  AUTH_EXCLUDED_PATHS: process.env.AUTH_EXCLUDED_PATHS?.split(",") || [
    /^\/$/,
    /^\/docs/,
    /^\/health/,
    /^\/api\/v1\/health/,
    /^\/files\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?:\?.*)?$/,
    /^\/api\/v1\/files\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?:\?.*)?$/,
  ],

  // File Storage Config: "local" (filesystem), "minio" (local MinIO), "aws-s3" (AWS cloud)
  FILE_STORAGE: process.env.FILE_STORAGE || "local",
  FILE_SIZE_LIMIT: parseInt(process.env.FILE_SIZE_LIMIT) || 10,
  FILE_PATH: process.env.FILE_PATH || "files",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || (process.env.FILE_STORAGE === "minio" ? "schooliat-files" : undefined),
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

  // MinIO (locally installed S3-compatible storage). Set when FILE_STORAGE=minio or aws-s3 with local MinIO.
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
  MINIO_FORCE_PATH_STYLE: process.env.MINIO_FORCE_PATH_STYLE !== "false",

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB) || 0,

  // Admin IP Whitelist (comma-separated IPs or CIDR ranges)
  // Example: "192.168.1.1,10.0.0.0/8,172.16.0.0/12"
  ADMIN_IP_WHITELIST: process.env.ADMIN_IP_WHITELIST?.split(",").map((ip) => ip.trim()) || [],

  // Puppeteer Config
  PUPPETEER_POOL_SIZE: parseInt(process.env.PUPPETEER_POOL_SIZE) || 1,
};

export default config;
