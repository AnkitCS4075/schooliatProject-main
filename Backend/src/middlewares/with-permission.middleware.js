import { ApiErrors } from "../errors.js";
import logger from "../config/logger.js";

const withPermission = (permissionOrPermissions) => {
  return (req, res, next) => {
    // Ensure permissions exists and is an array
    const permissions = Array.isArray(req?.context?.permissions)
      ? req.context.permissions
      : [];

    // Support single permission or array (user needs at least one)
    const required = Array.isArray(permissionOrPermissions)
      ? permissionOrPermissions
      : [permissionOrPermissions];
    // Normalize to string comparison so DB enum values always match Permission enum (e.g. GET_INVENTORY)
    const hasAny = required.some((p) =>
      permissions.some((up) => String(up) === String(p))
    );

    if (hasAny) {
      next();
    } else {
      logger.warn(
        {
          userId: req?.context?.user?.id,
          roleId: req?.context?.user?.roleId,
          roleName: req?.context?.user?.role?.name,
          required,
          path: req.originalUrl || req.url,
          method: req.method,
          availablePermissionsCount: permissions.length,
        },
        "Permission check failed: User does not have required permission",
      );
      throw ApiErrors.FORBIDDEN;
    }
  };
};

export default withPermission;
