import compression from "compression";
import config from "../config.js";

/**
 * Response compression middleware
 * Reduces bandwidth usage and improves response times
 */
const compressionMiddleware = compression({
  // Only compress responses above this threshold
  threshold: 1024, // 1KB
  // Compression level (0-9, where 9 is maximum)
  level: config.ENVIRONMENT === "production" ? 6 : 1,
  // Filter function to determine if response should be compressed
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers["x-no-compression"]) {
      return false;
    }
    // Use compression filter
    return compression.filter(req, res);
  },
});

export default compressionMiddleware;

