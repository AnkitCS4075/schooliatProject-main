import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import approvalsService from "../services/approvals.service.js";
import logger from "../config/logger.js";

const router = Router();

// Permissions that allow viewing/deciding approvals
const APPROVAL_PERMISSIONS = [
  Permission.APPROVE_LEAVE,
  Permission.REJECT_LEAVE,
  Permission.EDIT_EVENT,
  Permission.EDIT_GALLERY,
  Permission.APPROVE_QUOTATION,
  Permission.EDIT_STUDENT,
  Permission.GET_FEES,
  Permission.SEND_NOTIFICATION,
];

// Get pending approvals (unified approver dashboard)
router.get(
  "/pending",
  withPermission(APPROVAL_PERMISSIONS),
  async (req, res) => {
    const currentUser = req.context.user;
    try {
      const requests = await approvalsService.getPendingApprovals(
        currentUser.schoolId,
      );
      res.json({
        message: "Pending approvals fetched successfully",
        data: requests,
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch pending approvals");
      res.status(500).json({
        errorCode: "PENDING_APPROVALS_FETCH_FAILED",
        message: error.message || "Failed to fetch pending approvals",
      });
    }
  },
);

// Get approval history (decided requests with trail)
router.get(
  "/history",
  withPermission(APPROVAL_PERMISSIONS),
  async (req, res) => {
    const currentUser = req.context.user;
    const { status = null, module = null, page = 1, limit = 20 } = req.query;
    try {
      const result = await approvalsService.getApprovalHistory(
        currentUser.schoolId,
        {
          status: status || null,
          module: module || null,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      );
      res.json({
        message: "Approval history fetched successfully",
        data: result,
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch approval history");
      res.status(500).json({
        errorCode: "APPROVAL_HISTORY_FETCH_FAILED",
        message: error.message || "Failed to fetch approval history",
      });
    }
  },
);

// Decide an approval request (approve / reject with remarks)
router.post(
  "/:id/decide",
  withPermission(APPROVAL_PERMISSIONS),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;
    const { action, remarks } = req.body?.request || {};

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        errorCode: "INVALID_ACTION",
        message: "action is required and must be APPROVE or REJECT",
      });
    }

    try {
      const updated = await approvalsService.decideApprovalRequest({
        approvalRequestId: id,
        decidedBy: currentUser.id,
        action,
        remarks: remarks || null,
      });
      res.json({
        message: action === "APPROVE" ? "Request approved" : "Request rejected",
        data: updated,
      });
    } catch (error) {
      logger.error({ error, id }, "Failed to decide approval request");
      res.status(400).json({
        errorCode: "APPROVAL_DECISION_FAILED",
        message: error.message || "Failed to decide approval request",
      });
    }
  },
);

export default router;
