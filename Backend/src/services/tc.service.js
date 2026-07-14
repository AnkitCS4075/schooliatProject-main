import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import { parsePagination } from "../utils/pagination.util.js";
import { TCStatus } from "../prisma/generated/index.js";

/**
 * Transfer Certificate (TC) Service
 * Handles TC issuance, tracking, and management
 */

/**
 * Create a Transfer Certificate
 * @param {Object} data - TC data
 * @param {string} data.studentId - Student user ID
 * @param {string} data.schoolId - School ID
 * @param {string} data.reason - Reason for transfer
 * @param {Date} data.transferDate - Transfer date
 * @param {string} data.destinationSchool - Destination school name (optional)
 * @param {string} data.remarks - Additional remarks (optional)
 * @param {string} data.createdBy - User ID creating the TC
 * @returns {Promise<Object>} - Created TC record
 */
const createTC = async (data) => {
  const {
    studentId,
    schoolId,
    reason,
    transferDate,
    destinationSchool = null,
    remarks = null,
    createdBy,
  } = data;

  // Verify student exists and belongs to school
  const student = await prisma.user.findUnique({
    where: {
      id: studentId,
      schoolId,
      deletedAt: null,
    },
    include: {
      studentProfile: {
        include: {
          class: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found or does not belong to this school");
  }

  // Check if TC already exists for this student
  const existingTC = await prisma.transferCertificate.findFirst({
    where: {
      studentId,
      schoolId,
      deletedAt: null,
    },
  });

  if (existingTC) {
    throw new Error("Transfer Certificate already exists for this student");
  }

  // Get school code for TC number
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { code: true }
  });

  if (!school) {
    throw new Error("School not found");
  }

  // Generate TC number (format: SCHOOLCODE/TC/YYYY/XXXXX)
  const year = new Date().getFullYear();
  const tcCount = await prisma.transferCertificate.count({
    where: {
      schoolId,
      tcNumber: {
        contains: `/TC/${year}/`,
      },
    },
  });
  const tcNumber = `${school.code}/TC/${year}/${String(tcCount + 1).padStart(5, "0")}`;

  // Create TC
  const tc = await prisma.transferCertificate.create({
    data: {
      studentId,
      schoolId,
      tcNumber,
      reason,
      transferDate: new Date(transferDate),
      destinationSchool,
      remarks,
      status: "ISSUED",
      createdBy,
    },
    include: {
      student: {
        include: {
          studentProfile: {
            include: {
              class: true,
            },
          },
        },
      },
    },
  });

  logger.info({ tcId: tc.id, studentId, schoolId }, "Transfer Certificate created");

  return tc;
};

/**
 * Get TC by ID
 * @param {string} tcId - TC ID
 * @param {string} schoolId - School ID (for authorization)
 * @returns {Promise<Object>} - TC record
 */
const getTCById = async (tcId, schoolId = null) => {
  const where = {
    id: tcId,
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const tc = await prisma.transferCertificate.findUnique({
    where,
    include: {
      student: {
        include: {
          studentProfile: {
            include: {
              class: true,
            },
          },
        },
      },
    },
  });

  return tc;
};

/**
 * Get TCs for a school
 * @param {Object} filters - Filter options
 * @param {string} filters.schoolId - School ID
 * @param {string} filters.studentId - Student ID (optional)
 * @param {string} filters.status - TC status (optional)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - TCs with pagination
 */
const getTCs = async (filters = {}, options = {}) => {
  const { page, limit, skip } = parsePagination(options);

  const where = {
    deletedAt: null,
  };

  if (filters.schoolId) {
    where.schoolId = filters.schoolId;
  }

  if (filters.studentId) {
    where.studentId = filters.studentId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.tcNumber) {
    where.tcNumber = {
      contains: filters.tcNumber,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.OR = [
      { tcNumber: { contains: filters.search, mode: "insensitive" } },
      {
        student: {
          firstName: { contains: filters.search, mode: "insensitive" },
        },
      },
      {
        student: {
          lastName: { contains: filters.search, mode: "insensitive" },
        },
      },
    ];
  }

  try {
    const [tcs, total] = await Promise.all([
      prisma.transferCertificate.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentProfile: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.transferCertificate.count({ where }),
    ]);

    return {
      tcs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (err) {
    logger.warn({ err: err.message, schoolId: filters.schoolId }, "getTCs failed");
    throw err;
  }
};

/**
 * Update TC status
 * @param {string} tcId - TC ID
 * @param {string} status - New status (ISSUED, COLLECTED, CANCELLED)
 * @param {string} updatedBy - User ID updating the TC
 * @returns {Promise<Object>} - Updated TC
 */
const updateTCStatus = async (tcId, status, updatedBy) => {
  const tc = await prisma.transferCertificate.update({
    where: { id: tcId },
    data: {
      status,
      updatedBy,
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  logger.info({ tcId, status }, "TC status updated");

  return tc;
};

/**
 * Delete TC (soft delete)
 * @param {string} tcId - TC ID
 * @param {string} deletedBy - User ID deleting the TC
 * @returns {Promise<Object>} - Deleted TC
 */
const deleteTC = async (tcId, deletedBy) => {
  const tc = await prisma.transferCertificate.update({
    where: { id: tcId },
    data: {
      deletedAt: new Date(),
      deletedBy,
    },
  });

  logger.info({ tcId }, "TC deleted");

  return tc;
};

const tcService = {
  createTC,
  getTCById,
  getTCs,
  updateTCStatus,
  deleteTC,
};

export default tcService;

