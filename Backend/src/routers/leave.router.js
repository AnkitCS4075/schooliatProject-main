import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, LeaveStatus } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import createLeaveRequestSchema from "../schemas/leave/create-leave-request.schema.js";
import approveLeaveSchema from "../schemas/leave/approve-leave.schema.js";
import rejectLeaveSchema from "../schemas/leave/reject-leave.schema.js";
import leaveService from "../services/leave.service.js";
import { deleteByIdWithOtpSchema } from "../schemas/common/delete-with-otp.schema.js";
import { requireDeletionOTP } from "../middlewares/require-deletion-otp.middleware.js";
import logger from "../config/logger.js";

const router = Router();

// Create leave request
router.post(
  "/request",
  withPermission([Permission.CREATE_LEAVE_REQUEST]),
  validateRequest(createLeaveRequestSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { leaveTypeId, startDate, endDate, reason } = req.body.request;

    // Verify leave type exists
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType || leaveType.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "LEAVE_TYPE_NOT_FOUND",
        message: "Leave type not found",
      });
    }

    try {
      const leaveRequest = await leaveService.createLeaveRequest({
        userId: currentUser.id,
        leaveTypeId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      });

      res.json({
        message: "Leave request created successfully",
        data: leaveRequest,
      });
    } catch (error) {
      logger.error({ error, body: req.body }, "Failed to create leave request");
      res.status(400).json({
        errorCode: "LEAVE_REQUEST_FAILED",
        message: error.message || "Failed to create leave request",
      });
    }
  },
);

// Approve leave
router.post(
  "/approve",
  withPermission([Permission.APPROVE_LEAVE]),
  validateRequest(approveLeaveSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { leaveRequestId } = req.body.request;

    // Verify leave request exists and belongs to school
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
    });

    if (!leaveRequest || leaveRequest.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "LEAVE_REQUEST_NOT_FOUND",
        message: "Leave request not found",
      });
    }

    try {
      const approved = await leaveService.approveLeave(leaveRequestId, currentUser.id);

      res.json({
        message: "Leave request approved successfully",
        data: approved,
      });
    } catch (error) {
      logger.error({ error, leaveRequestId }, "Failed to approve leave");
      res.status(400).json({
        errorCode: "APPROVE_LEAVE_FAILED",
        message: error.message || "Failed to approve leave",
      });
    }
  },
);

// Reject leave
router.post(
  "/reject",
  withPermission([Permission.APPROVE_LEAVE]),
  validateRequest(rejectLeaveSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { leaveRequestId, rejectionReason } = req.body.request;

    // Verify leave request exists
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
    });

    if (!leaveRequest || leaveRequest.schoolId !== currentUser.schoolId) {
      return res.status(404).json({
        errorCode: "LEAVE_REQUEST_NOT_FOUND",
        message: "Leave request not found",
      });
    }

    try {
      const rejected = await leaveService.rejectLeave(leaveRequestId, currentUser.id, rejectionReason || null);

      res.json({
        message: "Leave request rejected successfully",
        data: rejected,
      });
    } catch (error) {
      logger.error({ error, leaveRequestId }, "Failed to reject leave");
      res.status(400).json({
        errorCode: "REJECT_LEAVE_FAILED",
        message: error.message || "Failed to reject leave",
      });
    }
  },
);

// Get leave balance
router.get(
  "/balance",
  withPermission([Permission.GET_LEAVE_REQUESTS]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { userId, year } = req.query;

    // Role-based access
    let targetUserId = currentUser.id;
    if (userId && (currentUser.role.name === "SCHOOL_ADMIN" || currentUser.role.name === "SUPER_ADMIN")) {
      targetUserId = userId;
    } else if (userId && currentUser.role.name === "PARENT") {
      // Verify parent-child relationship
      const link = await prisma.parentChildLink.findFirst({
        where: {
          parentId: currentUser.id,
          childId: userId,
          deletedAt: null,
        },
      });

      if (!link) {
        return res.status(403).json({
          errorCode: "FORBIDDEN",
          message: "You can only view your children's leave balance",
        });
      }

      targetUserId = userId;
    }

    try {
      const balance = await leaveService.getLeaveBalance(
        targetUserId,
        year ? parseInt(year) : new Date().getFullYear(),
      );

      res.json({
        message: "Leave balance retrieved successfully",
        data: balance,
      });
    } catch (error) {
      logger.error({ error, userId: targetUserId }, "Failed to get leave balance");
      res.status(500).json({
        errorCode: "LEAVE_BALANCE_FETCH_FAILED",
        message: "Failed to retrieve leave balance",
      });
    }
  },
);

// Shared handler for leave history / requests list
const handleLeaveHistory = async (req, res) => {
  const currentUser = req.context.user;
  const { userId, status, startDate, endDate, page = 1, limit = 20, classId } = req.query;

  let targetUserId = currentUser.id;
  let targetSchoolId = null;

  if (currentUser.role.name === "SCHOOL_ADMIN" || currentUser.role.name === "SUPER_ADMIN") {
    if (userId === "all") {
      targetUserId = null;
      targetSchoolId = currentUser.schoolId;
    } else if (userId) {
      targetUserId = userId;
    }
  } else if (userId && currentUser.role.name === "PARENT") {
    const link = await prisma.parentChildLink.findFirst({
      where: {
        parentId: currentUser.id,
        childId: userId,
        deletedAt: null,
      },
    });
    if (!link) {
      return res.status(403).json({
        errorCode: "FORBIDDEN",
        message: "You can only view your children's leave history",
      });
    }
    targetUserId = userId;
  }

  try {
    const result = await leaveService.getLeaveHistory(targetUserId, {
      status: status || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 20,
      schoolId: targetSchoolId,
      classId:
        typeof classId === "string" && classId.length > 0 && targetUserId == null
          ? classId
          : null,
    });
    const mappedLeaves = result.leaves.map((leave) => ({
      ...leave,
      requesterName: leave.user ? `${leave.user.firstName} ${leave.user.lastName || ""}`.trim() : leave.userId,
    }));
    res.json({
      message: "Leave history retrieved successfully",
      data: mappedLeaves,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error({ error, userId: targetUserId }, "Failed to get leave history");
    res.status(500).json({
      errorCode: "LEAVE_HISTORY_FETCH_FAILED",
      message: "Failed to retrieve leave history",
    });
  }
};

// Mobile API: GET /leave/requests (same as /leave/history)
router.get(
  "/requests",
  withPermission([Permission.GET_LEAVE_REQUESTS]),
  handleLeaveHistory,
);

// Get leave history
router.get(
  "/history",
  withPermission([Permission.GET_LEAVE_REQUESTS]),
  handleLeaveHistory,
);

// Get leave calendar
router.get(
  "/calendar",
  withPermission([Permission.GET_LEAVE_REQUESTS]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        errorCode: "DATE_RANGE_REQUIRED",
        message: "startDate and endDate are required",
      });
    }

    try {
      const calendar = await leaveService.getLeaveCalendar(
        currentUser.schoolId,
        new Date(startDate),
        new Date(endDate),
      );

      res.json({
        message: "Leave calendar retrieved successfully",
        data: calendar,
      });
    } catch (error) {
      logger.error({ error }, "Failed to get leave calendar");
      res.status(500).json({
        errorCode: "LEAVE_CALENDAR_FETCH_FAILED",
        message: "Failed to retrieve leave calendar",
      });
    }
  },
);

// Create leave type (admin only)
router.post(
  "/types",
  withPermission([Permission.APPROVE_LEAVE]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { name, maxLeaves } = req.body.request || {};

    if (!name) {
      return res.status(400).json({
        errorCode: "NAME_REQUIRED",
        message: "Leave type name is required",
      });
    }

    try {
      const leaveType = await prisma.leaveType.create({
        data: {
          name,
          maxLeaves: maxLeaves ? parseInt(maxLeaves) : null,
          schoolId: currentUser.schoolId,
          createdBy: currentUser.id,
        },
      });

      res.json({
        message: "Leave type created successfully",
        data: leaveType,
      });
    } catch (error) {
      logger.error({ error }, "Failed to create leave type");
      res.status(400).json({
        errorCode: "LEAVE_TYPE_CREATION_FAILED",
        message: error.message || "Failed to create leave type",
      });
    }
  },
);

// Get leave types
router.get(
  "/types",
  withPermission([Permission.GET_LEAVE_REQUESTS]),
  async (req, res) => {
    const currentUser = req.context.user;

    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        schoolId: currentUser.schoolId,
        deletedAt: null,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      message: "Leave types retrieved successfully",
      data: leaveTypes,
    });
  },
);

// Update leave type (admin only)
router.patch(
  "/types/:id",
  withPermission([Permission.APPROVE_LEAVE]),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;
    const { name, maxLeaves } = req.body.request || {};

    try {
      // Verify leave type belongs to school
      const leaveType = await prisma.leaveType.findUnique({
        where: { id },
      });

      if (!leaveType || leaveType.schoolId !== currentUser.schoolId || leaveType.deletedAt) {
        return res.status(404).json({
          errorCode: "LEAVE_TYPE_NOT_FOUND",
          message: "Leave type not found",
        });
      }

      const updated = await prisma.leaveType.update({
        where: { id },
        data: {
          name: name !== undefined ? name : leaveType.name,
          maxLeaves: maxLeaves !== undefined ? (maxLeaves === "" || maxLeaves === null ? null : parseInt(maxLeaves, 10)) : leaveType.maxLeaves,
          updatedBy: currentUser.id,
        },
      });

      res.json({
        message: "Leave type updated successfully",
        data: updated,
      });
    } catch (error) {
      logger.error({ error, params: req.params, body: req.body }, "Failed to update leave type");
      res.status(400).json({
        errorCode: "LEAVE_TYPE_UPDATE_FAILED",
        message: error.message || "Failed to update leave type",
      });
    }
  },
);

// Delete leave type (admin only)
router.delete(
  "/types/:id",
  withPermission([Permission.APPROVE_LEAVE]),
  validateRequest(deleteByIdWithOtpSchema),
  requireDeletionOTP({ entityType: "LeaveType" }),
  async (req, res) => {
    const currentUser = req.context.user;
    const { id } = req.params;

    try {
      // Verify leave type belongs to school
      const leaveType = await prisma.leaveType.findUnique({
        where: { id },
      });

      if (!leaveType || leaveType.schoolId !== currentUser.schoolId || leaveType.deletedAt) {
        return res.status(404).json({
          errorCode: "LEAVE_TYPE_NOT_FOUND",
          message: "Leave type not found",
        });
      }

      // Check if leave type is in use
      const usageCount = await prisma.leaveRequest.count({
        where: { leaveTypeId: id, deletedAt: null },
      });

      if (usageCount > 0) {
        return res.status(400).json({
          errorCode: "LEAVE_TYPE_IN_USE",
          message: "Cannot delete leave type because it is in use by existing leave requests",
        });
      }

      await prisma.leaveType.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: currentUser.id,
        },
      });

      res.json({
        message: "Leave type deleted successfully",
      });
    } catch (error) {
      logger.error({ error, params: req.params }, "Failed to delete leave type");
      res.status(400).json({
        errorCode: "LEAVE_TYPE_DELETION_FAILED",
        message: error.message || "Failed to delete leave type",
      });
    }
  },
);

export default router;

