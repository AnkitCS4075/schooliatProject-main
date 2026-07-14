import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Get children for parent
 * @param {string} parentId - Parent user ID
 * @returns {Promise<Array>} - List of children
 */
const getChildren = async (parentId) => {
  const links = await prisma.parentChildLink.findMany({
    where: {
      parentId,
      deletedAt: null,
    },
    include: {
      child: {
        include: {
          studentProfile: {
            include: {
              class: true,
            },
          },
        },
      },
    },
    orderBy: {
      isPrimary: "desc",
    },
  });

  return links.map((link) => ({
    id: link.child.id,
    firstName: link.child.firstName,
    lastName: link.child.lastName,
    relationship: link.relationship,
    isPrimary: link.isPrimary,
    class: link.child.studentProfile?.class,
    studentProfile: link.child.studentProfile,
  }));
};

/**
 * Get child data
 * @param {string} parentId - Parent user ID
 * @param {string} childId - Child user ID
 * @returns {Promise<Object>} - Child data
 */
const getChildData = async (parentId, childId) => {
  // Verify parent-child relationship
  const link = await prisma.parentChildLink.findFirst({
    where: {
      parentId,
      childId,
      deletedAt: null,
    },
  });

  if (!link) {
    throw new Error("Child not linked to this parent");
  }

  const child = await prisma.user.findUnique({
    where: { id: childId },
    include: {
      studentProfile: {
        include: {
          class: true,
        },
      },
      studentAttendances: {
        where: {
          deletedAt: null,
        },
        take: 30,
        orderBy: {
          date: "desc",
        },
      },
      studentHomeworkSubmissions: {
        where: {
          deletedAt: null,
        },
        include: {
          homework: true,
        },
        take: 10,
        orderBy: {
          submittedAt: "desc",
        },
      },
      studentResults: {
        where: {
          deletedAt: null,
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return child;
};

/**
 * Get consolidated dashboard for parent
 * @param {string} parentId - Parent user ID
 * @returns {Promise<Object>} - Consolidated dashboard data
 */
const getConsolidatedDashboard = async (parentId) => {
  const children = await getChildren(parentId);

  const dashboardData = await Promise.all(
    children.map(async (child) => {
      const childId = child.id;

      // Get recent attendance
      const recentAttendance = await prisma.attendance.findMany({
        where: {
          studentId: childId,
          deletedAt: null,
        },
        take: 7,
        orderBy: {
          date: "desc",
        },
      });

      // Get pending homework
      const pendingHomework = await prisma.homeworkSubmission.findMany({
        where: {
          studentId: childId,
          status: "PENDING",
          deletedAt: null,
        },
        include: {
          homework: true,
        },
        take: 5,
      });

      // Get recent results
      const recentResults = await prisma.result.findMany({
        where: {
          studentId: childId,
          deletedAt: null,
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get fee status
      const feeStatus = await prisma.feeInstallements.findMany({
        where: {
          studentId: childId,
          deletedAt: null,
        },
        take: 5,
        orderBy: {
          dueDate: "asc",
        },
      });

      return {
        child: {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          class: child.class,
        },
        recentAttendance,
        pendingHomework,
        recentResults,
        feeStatus,
      };
    }),
  );

  return {
    children: children.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      relationship: c.relationship,
      isPrimary: c.isPrimary,
      class: c.class,
    })),
    dashboardData,
  };
};

/**
 * Link child to parent
 * @param {Object} data - Link data
 * @returns {Promise<Object>} - Created link
 */
const linkChild = async (data) => {
  const { parentId, childId, relationship, isPrimary = false, createdBy } = data;

  // Check if link already exists
  const existingLink = await prisma.parentChildLink.findFirst({
    where: {
      parentId,
      childId,
      deletedAt: null,
    },
  });

  if (existingLink) {
    throw new Error("Child already linked to this parent");
  }

  // If this is primary, unset other primary links
  if (isPrimary) {
    await prisma.parentChildLink.updateMany({
      where: {
        parentId,
        isPrimary: true,
        deletedAt: null,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  const link = await prisma.parentChildLink.create({
    data: {
      parentId,
      childId,
      relationship,
      isPrimary,
      createdBy,
    },
  });

  return link;
};

const parentService = {
  getChildren,
  getChildData,
  getConsolidatedDashboard,
  linkChild,
};

export default parentService;

