import prisma from "../prisma/client.js";
import { parsePagination } from "../utils/pagination.util.js";
import { LeaveStatus } from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

const leaveBalanceCompoundUnique = (userId, leaveTypeId, year) => ({
  leave_balances_unique_user_type_year: {
    userId,
    leaveTypeId,
    year,
  },
});

/**
 * Create leave request
 * @param {Object} data - Leave request data
 * @param {string} data.userId - User ID requesting leave
 * @param {string} data.leaveTypeId - Leave type ID
 * @param {Date} data.startDate - Start date
 * @param {Date} data.endDate - End date
 * @param {string} data.reason - Leave reason
 * @param {string} data.schoolId - School ID
 * @param {string} data.createdBy - User ID creating request
 * @returns {Promise<Object>} - Created leave request
 */
const createLeaveRequest = async (data) => {
  const {
    userId,
    leaveTypeId,
    startDate,
    endDate,
    reason,
    schoolId,
    createdBy,
  } = data;

  // Validate date range
  if (new Date(endDate) < new Date(startDate)) {
    throw new Error("End date must be after start date");
  }

  // Check leave balance
  const currentYear = new Date().getFullYear();
  const leaveBalance = await prisma.leaveBalance.findUnique({
    where: leaveBalanceCompoundUnique(userId, leaveTypeId, currentYear),
  });

  // Calculate days requested
  const daysRequested = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  if (leaveBalance && leaveBalance.remainingLeaves < daysRequested) {
    throw new Error(`Insufficient leave balance. Available: ${leaveBalance.remainingLeaves}, Requested: ${daysRequested}`);
  }

  // Create leave request
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: LeaveStatus.PENDING,
      schoolId,
      createdBy,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      leaveType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Send notification to approver (school admin)
  await notifyLeaveRequestCreated(leaveRequest, schoolId);

  return leaveRequest;
};

/**
 * Approve leave request
 * @param {string} leaveRequestId - Leave request ID
 * @param {string} approvedBy - User ID approving
 * @returns {Promise<Object>} - Updated leave request
 */
const approveLeave = async (leaveRequestId, approvedBy) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
    include: {
      leaveType: true,
    },
  });

  if (!leaveRequest) {
    throw new Error("Leave request not found");
  }

  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new Error("Leave request is not pending");
  }

  // Calculate days
  const days = Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;

  // Update in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update leave request
    const updated = await tx.leaveRequest.update({
      where: { id: leaveRequestId },
      data: {
        status: LeaveStatus.APPROVED,
        approvedBy,
        approvedAt: new Date(),
        updatedBy: approvedBy,
      },
    });

    const currentYear = new Date().getFullYear();
    const maxLeaves = leaveRequest.leaveType?.maxLeaves ?? 12;

    await tx.leaveBalance.upsert({
      where: leaveBalanceCompoundUnique(
        leaveRequest.userId,
        leaveRequest.leaveTypeId,
        currentYear,
      ),
      update: {
        usedLeaves: {
          increment: days,
        },
        remainingLeaves: {
          decrement: days,
        },
        updatedBy: approvedBy,
      },
      create: {
        userId: leaveRequest.userId,
        leaveTypeId: leaveRequest.leaveTypeId,
        year: currentYear,
        totalLeaves: maxLeaves,
        usedLeaves: days,
        remainingLeaves: maxLeaves - days,
        schoolId: leaveRequest.schoolId,
        createdBy: approvedBy,
      },
    });

    return updated;
  });

  // Send notification to requester
  await notificationService.createNotification({
    userId: leaveRequest.userId,
    title: "Leave Request Approved",
    content: `Your leave request from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()} has been approved.`,
    type: "LEAVE",
    schoolId: leaveRequest.schoolId,
    createdBy: approvedBy,
  });

  return result;
};

/**
 * Reject leave request
 * @param {string} leaveRequestId - Leave request ID
 * @param {string} rejectedBy - User ID rejecting
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} - Updated leave request
 */
const rejectLeave = async (leaveRequestId, rejectedBy, rejectionReason) => {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id: leaveRequestId },
  });

  if (!leaveRequest) {
    throw new Error("Leave request not found");
  }

  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new Error("Leave request is not pending");
  }

  const updated = await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: {
      status: LeaveStatus.REJECTED,
      rejectionReason,
      updatedBy: rejectedBy,
    },
  });

  // Send notification
  await notificationService.createNotification({
    userId: leaveRequest.userId,
    title: "Leave Request Rejected",
    content: `Your leave request has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`,
    type: "LEAVE",
    schoolId: leaveRequest.schoolId,
    createdBy: rejectedBy,
  });

  return updated;
};

/**
 * Get leave balance
 * @param {string} userId - User ID
 * @param {number} year - Year (optional, defaults to current year)
 * @returns {Promise<Array>} - Leave balances
 */
const getLeaveBalance = async (userId, year = new Date().getFullYear()) => {
  return await prisma.leaveBalance.findMany({
    where: {
      userId,
      year,
      deletedAt: null,
    },
    include: {
      leaveType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

/**
 * Get leave history
 * @param {string|null} userId - User ID (null for school-wide)
 * @param {Object} filters - Filter options (includes schoolId if school-wide)
 * @returns {Promise<Object>} - Leave history with pagination
 */
const getLeaveHistory = async (userId, filters = {}) => {
  const {
    status = null,
    startDate = null,
    endDate = null,
    schoolId = null,
    classId = null,
    ...paginationOptions
  } = filters;

  const { page, limit, skip } = parsePagination(paginationOptions);

  const where = {
    deletedAt: null,
  };

  if (userId) {
    where.userId = userId;
  } else if (schoolId) {
    where.schoolId = schoolId;
  } else {
    throw new Error("Either userId or schoolId must be provided");
  }

  if (classId && !userId) {
    where.user = {
      studentProfile: {
        classId,
        deletedAt: null,
      },
    };
  }

  if (status) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.OR = [
      {
        startDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      {
        endDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    ];
  }

  const [leaves, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where,
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
          },
        },
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return {
    leaves,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get leave calendar view
 * @param {string} schoolId - School ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Leave calendar data
 */
const getLeaveCalendar = async (schoolId, startDate, endDate) => {
  return await prisma.leaveRequest.findMany({
    where: {
      schoolId,
      status: LeaveStatus.APPROVED,
      OR: [
        {
          startDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        {
          endDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      ],
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      leaveType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });
};

/**
 * Notify about leave request creation
 * @param {Object} leaveRequest - Leave request object
 * @param {string} schoolId - School ID
 */
const notifyLeaveRequestCreated = async (leaveRequest, schoolId) => {
  try {
    // Get school admin
    const schoolAdmin = await prisma.user.findFirst({
      where: {
        schoolId,
        role: {
          name: "SCHOOL_ADMIN",
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (schoolAdmin) {
      await notificationService.createNotification({
        userId: schoolAdmin.id,
        title: "New Leave Request",
        content: `${leaveRequest.user.firstName} ${leaveRequest.user.lastName || ""} has requested leave from ${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()}.`,
        type: "LEAVE",
        actionUrl: `/leave/${leaveRequest.id}`,
        schoolId,
        createdBy: leaveRequest.userId,
      });
    }
  } catch (error) {
    logger.error({ error, leaveRequestId: leaveRequest.id }, "Failed to send leave request notification");
  }
};

const leaveService = {
  createLeaveRequest,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  getLeaveHistory,
  getLeaveCalendar,
};

export default leaveService;

