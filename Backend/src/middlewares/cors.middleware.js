import cors from "cors";
import config from "../config.js";

function normalizeOrigin(o) {
  if (!o || typeof o !== "string") return "";
  return o.trim().replace(/\/$/, "");
}

/**
 * Build effective allowlist: explicit ALLOWED_ORIGINS plus FRONTEND_URL, plus
 * https://app.schooliat.com when any schooliat.com host is already allowed (common misconfig).
 */
function buildAllowedOriginSet() {
  const raw =
    typeof config.ALLOWED_ORIGINS === "string"
      ? config.ALLOWED_ORIGINS === "*"
        ? "*"
        : config.ALLOWED_ORIGINS.split(",").map((o) => normalizeOrigin(o)).filter(Boolean)
      : config.ALLOWED_ORIGINS;

  if (raw === "*" || !Array.isArray(raw)) {
    return raw;
  }

  const set = new Set(raw.map(normalizeOrigin).filter(Boolean));
  const front = normalizeOrigin(config.FRONTEND_URL);
  if (front) set.add(front);

  const appDashboard = "https://app.schooliat.com";
  const hasSchooliat = [...set].some((o) => {
    try {
      const { hostname } = new URL(o);
      return hostname === "schooliat.com" || hostname.endsWith(".schooliat.com");
    } catch {
      return false;
    }
  });
  if (hasSchooliat && !set.has(appDashboard)) {
    set.add(appDashboard);
  }

  return [...set];
}

/**
 * CORS middleware with proper origin validation
 * Supports multiple origins and proper credential handling
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedRequest = normalizeOrigin(origin);

    // Parse allowed origins from config
    const allowedOrigins = buildAllowedOriginSet();

    // Allow all origins in development
    if (allowedOrigins === "*" || config.ENVIRONMENT !== "production") {
      return callback(null, true);
    }

    // Check if origin is in allowed list (compare normalized)
    if (Array.isArray(allowedOrigins) && allowedOrigins.some((o) => normalizeOrigin(o) === normalizedRequest)) {
      return callback(null, true);
    }

    // Reject origin
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true, // Allow cookies and authorization headers
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-platform",
    "x-request-id",
  ],
  exposedHeaders: ["x-request-id", "x-total-count"],
};

const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
