import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import leaveService from "./leave.service.js";
import quotationService from "./quotation.service.js";
import notificationService from "./notification.service.js";

const MODULE_LABELS = {
  LEAVE: "Leave Request",
  EVENT: "Event",
  GALLERY: "Gallery Album",
  QUOTATION: "Quotation",
  FEE_WAIVER: "Fee Waiver",
  TRANSFER_CERTIFICATE: "Transfer Certificate",
};

/**
 * Resolve the default approver for a school (school admin).
 * @param {string} schoolId - School ID
 * @returns {Promise<string|null>} - Approver user ID
 */
const resolveApprover = async (schoolId) => {
  const schoolAdmin = await prisma.user.findFirst({
    where: { schoolId, role: { name: "SCHOOL_ADMIN" }, deletedAt: null },
    select: { id: true },
  });
  return schoolAdmin?.id || null;
};

/**
 * Create an approval request for a trigger action.
 * Skips creation if a PENDING request already exists for the same module+refId.
 * @param {Object} data - Approval request data
 * @param {string} data.schoolId - School ID
 * @param {string} data.module - ApprovalModule value (LEAVE, EVENT, GALLERY, QUOTATION, FEE_WAIVER, TRANSFER_CERTIFICATE)
 * @param {string} data.refId - ID of the originating record
 * @param {string} data.title - Human-readable title
 * @param {string} [data.description] - Description / details
 * @param {string} data.requestedById - User who triggered the request
 * @param {string} [data.approverId] - Assigned approver (defaults to school admin)
 * @param {string} [data.createdBy] - User creating the request
 * @returns {Promise<Object|null>} - Created/existing approval request or null when no school
 */
const createApprovalRequest = async (data) => {
  const {
    schoolId,
    module,
    refId,
    title,
    description = null,
    requestedById,
    approverId = null,
    createdBy = null,
  } = data;

  if (!schoolId) return null;

  const existing = await prisma.approvalRequest.findFirst({
    where: { schoolId, module, refId, status: "PENDING" },
  });
  if (existing) return existing;

  const approver = approverId || (await resolveApprover(schoolId));

  try {
    return await prisma.approvalRequest.create({
      data: {
        schoolId,
        module,
        refId,
        title,
        description,
        requestedById,
        approverId: approver,
        createdBy: createdBy || requestedById,
      },
    });
  } catch (error) {
    logger.error(
      { error, module, refId, schoolId },
      "Failed to create approval request",
    );
    return null;
  }
};

/**
 * Attach requester / approver / decider names to a list of requests.
 * @param {Array<Object>} requests - Approval requests
 * @returns {Promise<Array<Object>>} - Enriched requests
 */
const enrichRequests = async (requests) => {
  const ids = new Set();
  requests.forEach((r) => {
    if (r.requestedById) ids.add(r.requestedById);
    if (r.approverId) ids.add(r.approverId);
    if (r.decidedBy) ids.add(r.decidedBy);
  });

  const users = await prisma.user.findMany({
    where: { id: { in: [...ids] } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: { select: { name: true } },
    },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return requests.map((r) => ({
    ...r,
    moduleLabel: MODULE_LABELS[r.module] || r.module,
    requester: r.requestedById
      ? {
          id: r.requestedById,
          firstName: userMap[r.requestedById]?.firstName || null,
          lastName: userMap[r.requestedById]?.lastName || null,
          role: userMap[r.requestedById]?.role?.name || null,
        }
      : null,
    approver: r.approverId
      ? {
          id: r.approverId,
          firstName: userMap[r.approverId]?.firstName || null,
          lastName: userMap[r.approverId]?.lastName || null,
          role: userMap[r.approverId]?.role?.name || null,
        }
      : null,
    decider: r.decidedBy
      ? {
          id: r.decidedBy,
          firstName: userMap[r.decidedBy]?.firstName || null,
          lastName: userMap[r.decidedBy]?.lastName || null,
          role: userMap[r.decidedBy]?.role?.name || null,
        }
      : null,
  }));
};

/**
 * Get pending approval requests for a school.
 * @param {string} schoolId - School ID
 * @returns {Promise<Array<Object>>} - Pending requests
 */
const getPendingApprovals = async (schoolId) => {
  const requests = await prisma.approvalRequest.findMany({
    where: { schoolId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
  return enrichRequests(requests);
};

/**
 * Get approval request history for a school (decided requests).
 * @param {string} schoolId - School ID
 * @param {Object} options - Query options (status, module, page, limit)
 * @returns {Promise<Object>} - History with pagination
 */
const getApprovalHistory = async (schoolId, options = {}) => {
  const {
    status = null,
    module = null,
    page = 1,
    limit = 20,
  } = options;

  const where = { schoolId, status: { not: "PENDING" } };
  if (status) where.status = status;
  if (module) where.module = module;

  const [requests, total] = await Promise.all([
    prisma.approvalRequest.findMany({
      where,
      orderBy: { decidedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.approvalRequest.count({ where }),
  ]);

  return {
    requests: await enrichRequests(requests),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Apply an approval decision to the originating record for the module.
 * @param {Object} req - Approval request record
 * @param {boolean} isApprove - Whether the action is an approval
 * @param {string} decidedBy - User ID deciding
 * @param {string|null} remarks - Decision remarks
 */
const applyDecisionToOrigin = async (req, isApprove, decidedBy, remarks) => {
  const module = req.module;

  if (module === "LEAVE") {
    if (isApprove) {
      await leaveService.approveLeave(req.refId, decidedBy);
    } else {
      await leaveService.rejectLeave(req.refId, decidedBy, remarks);
    }
  } else if (module === "EVENT") {
    await prisma.event.updateMany({
      where: { id: req.refId, schoolId: req.schoolId },
      data: {
        approvalStatus: isApprove ? "APPROVED" : "REJECTED",
        approvedBy: decidedBy,
        approvedAt: new Date(),
        rejectionReason: isApprove ? null : remarks,
        updatedBy: decidedBy,
      },
    });
  } else if (module === "GALLERY") {
    await prisma.gallery.updateMany({
      where: { id: req.refId, schoolId: req.schoolId },
      data: {
        approvalStatus: isApprove ? "APPROVED" : "REJECTED",
        approvedBy: decidedBy,
        approvedAt: new Date(),
        rejectionReason: isApprove ? null : remarks,
        updatedBy: decidedBy,
      },
    });
  } else if (module === "QUOTATION") {
    if (isApprove) {
      await quotationService.approveQuotation(req.refId, req.schoolId, decidedBy);
    } else {
      await quotationService.rejectQuotation(req.refId, req.schoolId, remarks);
    }
  } else if (module === "TRANSFER_CERTIFICATE") {
    await prisma.transferCertificate.updateMany({
      where: { id: req.refId, schoolId: req.schoolId },
      data: {
        status: isApprove ? "ISSUED" : "CANCELLED",
        updatedBy: decidedBy,
      },
    });
  } else if (module === "FEE_WAIVER") {
    // The fee ledger entry (WAIVER) was already recorded; persist the review decision
    const entry = await prisma.feeLedgerEntry.findFirst({
      where: { id: req.refId, schoolId: req.schoolId },
    });
    if (entry) {
      const metadata = {
        ...(typeof entry.metadata === "object" && entry.metadata !== null
          ? entry.metadata
          : {}),
        approvalStatus: isApprove ? "APPROVED" : "REJECTED",
        approvedBy: decidedBy,
        approvedAt: new Date().toISOString(),
        rejectionReason: isApprove ? null : remarks,
      };
      await prisma.feeLedgerEntry.update({
        where: { id: entry.id },
        data: { metadata },
      });
    }
  }
};

/**
 * Decide an approval request (approve / reject) with optional remarks.
 * Updates the originating record and notifies the requester.
 * @param {Object} data - Decision data
 * @param {string} data.approvalRequestId - Approval request ID
 * @param {string} data.decidedBy - User ID deciding
 * @param {string} data.action - "APPROVE" | "REJECT"
 * @param {string|null} [data.remarks] - Optional remarks
 * @returns {Promise<Object>} - Updated approval request
 */
const decideApprovalRequest = async ({
  approvalRequestId,
  decidedBy,
  action,
  remarks = null,
}) => {
  const req = await prisma.approvalRequest.findUnique({
    where: { id: approvalRequestId },
  });

  if (!req) {
    throw new Error("Approval request not found");
  }
  if (req.status !== "PENDING") {
    throw new Error("This approval request has already been decided");
  }

  const isApprove = action === "APPROVE";
  const isReject = action === "REJECT";
  if (!isApprove && !isReject) {
    throw new Error("Invalid action. Use APPROVE or REJECT");
  }

  await applyDecisionToOrigin(req, isApprove, decidedBy, remarks);

  const updated = await prisma.approvalRequest.update({
    where: { id: approvalRequestId },
    data: {
      status: isApprove ? "APPROVED" : "REJECTED",
      remarks,
      decidedBy,
      decidedAt: new Date(),
      updatedBy: decidedBy,
    },
  });

  try {
    await notificationService.createNotification({
      userId: req.requestedById,
      title: isApprove ? "Request Approved" : "Request Rejected",
      content: `Your ${MODULE_LABELS[req.module] || "request"} "${req.title}" was ${
        isApprove ? "approved" : "rejected"
      }.${remarks ? ` Remarks: ${remarks}` : ""}`,
      type: req.module === "LEAVE" ? "LEAVE" : "GENERAL",
      actionUrl: `/approvals/${req.id}`,
      schoolId: req.schoolId,
      createdBy: decidedBy,
    });
  } catch (error) {
    logger.error(
      { error, approvalRequestId },
      "Failed to send approval decision notification",
    );
  }

  return updated;
};

const approvalsService = {
  createApprovalRequest,
  getPendingApprovals,
  getApprovalHistory,
  decideApprovalRequest,
  resolveApprover,
};

export default approvalsService;
