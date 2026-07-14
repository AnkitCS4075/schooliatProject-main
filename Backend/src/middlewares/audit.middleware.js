import auditService from "../services/audit.service.js";
import logger from "../config/logger.js";

/**
 * Audit logging middleware
 * Logs all create, update, and delete operations
 */
const auditMiddleware = (req, res, next) => {
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Track if response has been sent
  let responseSent = false;

  // Helper to log audit event
  const logAudit = async (result, errorMessage = null) => {
    if (responseSent) return;
    responseSent = true;

    const user = req.context?.user;
    if (!user) return; // Skip if no user context

    // Determine action from HTTP method
    let action = null;
    if (req.method === "POST") {
      action = "CREATE";
    } else if (req.method === "PUT" || req.method === "PATCH") {
      action = "UPDATE";
    } else if (req.method === "DELETE") {
      action = "DELETE";
    }

    if (!action) return; // Only log CUD operations

    // Extract entity info from route
    const routeParts = req.path.split("/").filter(Boolean);
    const entityType = routeParts[routeParts.length - 1] || routeParts[routeParts.length - 2] || "Unknown";
    const entityId = req.params.id || req.params[Object.keys(req.params)[0]] || null;

    // Get IP address
    const ipAddress =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.connection?.remoteAddress ||
      "unknown";

    // Get user agent
    const userAgent = req.headers["user-agent"] || null;

    // Log audit event (non-blocking)
    auditService
      .logAuditEvent({
        userId: user.id,
        action,
        entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
        entityId,
        ipAddress,
        userAgent,
        changes: req.method === "UPDATE" || req.method === "PATCH" ? { body: req.body } : null,
        result,
        errorMessage,
      })
      .catch((err) => {
        logger.error({ error: err }, "Failed to log audit event");
      });
  };

  // Override res.send
  res.send = function (body) {
    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      logAudit("SUCCESS");
    } else if (statusCode >= 400) {
      logAudit("FAILURE", body?.message || "Request failed");
    }
    return originalSend.call(this, body);
  };

  // Override res.json
  res.json = function (body) {
    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      logAudit("SUCCESS");
    } else if (statusCode >= 400) {
      logAudit("FAILURE", body?.message || "Request failed");
    }
    return originalJson.call(this, body);
  };

  next();
};

export default auditMiddleware;

