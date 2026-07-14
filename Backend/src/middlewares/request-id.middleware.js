import { randomUUID } from "crypto";

/**
 * Request ID tracking middleware
 * Adds a unique request ID to each request for tracing and debugging
 */
const requestIdMiddleware = (req, res, next) => {
  // Get request ID from header or generate new one
  const requestId =
    req.headers["x-request-id"] || req.headers["x-correlation-id"] || randomUUID();

  // Add to request object
  req.requestId = requestId;

  // Add to response headers
  res.setHeader("x-request-id", requestId);

  // Add to logger context (if using structured logging)
  if (req.logger) {
    req.logger = req.logger.child({ requestId });
  }

  next();
};

export default requestIdMiddleware;

