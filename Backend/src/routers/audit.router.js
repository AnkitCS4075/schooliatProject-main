import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import auditService from "../services/audit.service.js";

const router = Router();

// Get audit logs
router.get(
  "/",
  withPermission(Permission.VIEW_AUDIT_LOGS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      // Super Admin can see all logs, others only their own
      const filters = {
        ...(query.userId && { userId: query.userId }),
        ...(query.action && { action: query.action }),
        ...(query.entityType && { entityType: query.entityType }),
        ...(query.entityId && { entityId: query.entityId }),
        ...(query.result && { result: query.result }),
        ...(query.startDate && query.endDate && {
          startDate: query.startDate,
          endDate: query.endDate,
        }),
      };

      // Non-super admins can only see their own logs
      if (currentUser.role?.name !== "SUPER_ADMIN") {
        filters.userId = currentUser.id;
      }

      const result = await auditService.getAuditLogs(filters, {
        page: parseInt(query.page) || 1,
        limit: parseInt(query.limit) || 50,
      });

      return res.status(200).json({
        message: "Audit logs fetched successfully",
        data: result.logs,
        pagination: result.pagination,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch audit logs",
      });
    }
  },
);

// Get audit log by ID
router.get(
  "/:id",
  withPermission(Permission.VIEW_AUDIT_LOGS),
  async (req, res) => {
    try {
      const { id } = req.params;
      const currentUser = req.context.user;

      const log = await auditService.getAuditLogById(id);

      if (!log) {
        return res.status(404).json({
          message: "Audit log not found",
        });
      }

      // Non-super admins can only see their own logs
      if (currentUser.role?.name !== "SUPER_ADMIN" && log.userId !== currentUser.id) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      return res.status(200).json({
        message: "Audit log fetched successfully",
        data: log,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch audit log",
      });
    }
  },
);

export default router;

