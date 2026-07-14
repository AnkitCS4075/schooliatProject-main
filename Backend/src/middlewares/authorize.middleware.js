import jwt from "jsonwebtoken";
import config from "../config.js";
import { ApiErrors } from "../errors.js";
import logger from "../config/logger.js";
import prisma from "../prisma/client.js";
import tokenBlacklistService from "../services/token-blacklist.service.js";

/**
 * Authorization middleware
 * Validates JWT token and ensures user exists and is active
 */
const authorize = async (req, res, next) => {
  const pathForAuth = req.originalUrl?.split("?")[0] || req.path || req.url;
  const isExcluded = config.AUTH_EXCLUDED_PATHS.some((regex) =>
    regex.test(pathForAuth),
  );
  if (isExcluded) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw ApiErrors.UNAUTHORIZED;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw ApiErrors.UNAUTHORIZED;
  }

  // Check if token is blacklisted
  const isBlacklisted = await tokenBlacklistService.isBlacklisted(token);
  if (isBlacklisted) {
    logger.warn({ token: token.substring(0, 20) + "..." }, "Blacklisted token attempted");
    throw ApiErrors.UNAUTHORIZED;
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET, {
      issuer: "SchooliAT",
    });

    const userId = decoded.data?.user?.id;
    if (!userId) {
      throw ApiErrors.UNAUTHORIZED;
    }

    // Validate user exists and is not deleted
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      logger.warn({ userId }, "Authorization failed: User not found or deleted");
      throw ApiErrors.UNAUTHORIZED;
    }

    // Validate role exists
    if (!user.role) {
      logger.error(
        { userId, roleId: user.roleId },
        "Authorization failed: User role not found",
      );
      throw ApiErrors.UNAUTHORIZED;
    }

    // Ensure permissions is always an array
    const permissions = Array.isArray(user.role.permissions)
      ? user.role.permissions
      : [];

    // Set context with fresh user data
    req.context = {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        roleId: user.roleId,
        schoolId: user.schoolId,
        assignedRegionId: user.assignedRegionId,
        firstName: user.firstName,
        lastName: user.lastName,
        contact: user.contact,
        role: user.role,
      },
      permissions: permissions,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
      logger.warn({ error: err.message }, "JWT validation failed");
      throw ApiErrors.UNAUTHORIZED;
    }
    // Re-throw ApiErrors (like FORBIDDEN or UNAUTHORIZED manually thrown)
    if (err.statusCode) {
      throw err;
    }

    // For unexpected errors (DB issues, etc.), log and let it propagate as 500
    logger.error({ error: err }, "Unexpected error in authorization middleware");
    next(err);
  }
};

export default authorize;
