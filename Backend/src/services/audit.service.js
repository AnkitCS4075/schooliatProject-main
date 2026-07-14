import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Log an audit event
 * @param {Object} data - Audit log data
 * @returns {Promise<Object>} - Created audit log
 */
const logAuditEvent = async (data) => {
  const {
    userId,
    action, // CREATE, UPDATE, DELETE
    entityType, // User, Student, etc.
    entityId,
    ipAddress,
    userAgent = null,
    changes = null, // Before/after values
    result = "SUCCESS", // SUCCESS, FAILURE
    errorMessage = null,
  } = data;

  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        user: { connect: { id: userId } },
        action,
        entityType,
        entityId: entityId ?? "",
        ipAddress,
        userAgent,
        changes,
        result,
        errorMessage,
      },
    });

    return auditLog;
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    logger.error({ error, data }, "Failed to create audit log");
    return null;
  }
};

/**
 * Get audit logs
 * @param {Object} filters - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Audit logs with pagination
 */
const getAuditLogs = async (filters = {}, options = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.entityId) {
    where.entityId = filters.entityId;
  }

  if (filters.result) {
    where.result = filters.result;
  }

  if (filters.startDate && filters.endDate) {
    where.timestamp = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: {
              select: { name: true }
            }
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get audit log by ID
 * @param {string} logId - Audit log ID
 * @returns {Promise<Object>} - Audit log
 */
const getAuditLogById = async (logId) => {
  const log = await prisma.auditLog.findUnique({
    where: { id: logId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: {
            select: { name: true }
          }
        },
      },
    },
  });

  return log;
};

const auditService = {
  logAuditEvent,
  getAuditLogs,
  getAuditLogById,
};

export default auditService;

