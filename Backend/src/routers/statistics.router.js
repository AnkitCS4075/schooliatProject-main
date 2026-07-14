import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission, RoleName, UserType } from "../prisma/generated/index.js";
import roleService from "../services/role.service.js";
import dashboardService from "../services/dashboard.service.js";
import paginateUtil from "../utils/paginate.util.js";
import logger from "../config/logger.js";

const router = Router();

router.get(
  "/",
  withPermission(Permission.GET_STATISTICS),
  async (req, res) => {
    return res.json({
      message: "Statistics endpoints available",
      data: {
        endpoints: [
          { path: "/statistics/schools", description: "Get school statistics" },
          { path: "/statistics/dashboard", description: "Get dashboard statistics" },
        ],
      },
    });
  },
);

router.get(
  "/schools",
  withPermission(Permission.GET_STATISTICS),
  async (req, res) => {
    const { search, academicYear } = req.query;

    // Get all schools
    const where = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const schools = await prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...paginateUtil.getPaginationParams(req),
    });

    // Get role IDs
    const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
    const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
    const staffRole = await roleService.getRoleByName(RoleName.STAFF);
    const schoolAdminRole = await roleService.getRoleByName(
      RoleName.SCHOOL_ADMIN,
    );

    // Get all school IDs
    const schoolIds = schools.map((school) => school.id);

    // Build date filter for revenue if academicYear is provided (e.g. "2025-26")
    let receiptDateFilter = {};
    if (academicYear && typeof academicYear === "string") {
      const parts = academicYear.split("-");
      if (parts.length === 2) {
        const startYear = parseInt(parts[0], 10);
        const endYearShort = parseInt(parts[1], 10);
        const endYear = endYearShort < 100 ? 2000 + endYearShort : endYearShort;
        if (!isNaN(startYear) && !isNaN(endYear)) {
          receiptDateFilter = {
            createdAt: {
              gte: new Date(`${startYear}-04-01T00:00:00.000Z`),
              lte: new Date(`${endYear}-03-31T23:59:59.999Z`),
            },
          };
        }
      }
    }

    // Optimized: Use groupBy to get counts for all schools in a single query per role
    // Also get revenue totals from receipts
    const [studentCounts, teacherCounts, staffCounts, adminCounts, revenueCounts] =
      await Promise.all([
        // Students count grouped by schoolId
        prisma.user.groupBy({
          by: ["schoolId"],
          where: {
            schoolId: { in: schoolIds },
            roleId: studentRole?.id,
            userType: UserType.SCHOOL,
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        }),
        // Teachers count grouped by schoolId
        prisma.user.groupBy({
          by: ["schoolId"],
          where: {
            schoolId: { in: schoolIds },
            roleId: teacherRole?.id,
            userType: UserType.SCHOOL,
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        }),
        // Staff count grouped by schoolId
        prisma.user.groupBy({
          by: ["schoolId"],
          where: {
            schoolId: { in: schoolIds },
            roleId: staffRole?.id,
            userType: UserType.SCHOOL,
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        }),
        // Admin count grouped by schoolId
        prisma.user.groupBy({
          by: ["schoolId"],
          where: {
            schoolId: { in: schoolIds },
            roleId: schoolAdminRole?.id,
            userType: UserType.SCHOOL,
            deletedAt: null,
          },
          _count: {
            _all: true,
          },
        }),
        // Revenue grouped by schoolId from receipts
        prisma.receipt.groupBy({
          by: ["schoolId"],
          where: {
            schoolId: { in: schoolIds },
            deletedAt: null,
            ...receiptDateFilter,
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

    // Create maps for O(1) lookup
    const studentCountMap = new Map(
      studentCounts.map((item) => [item.schoolId, item._count._all]),
    );
    const teacherCountMap = new Map(
      teacherCounts.map((item) => [item.schoolId, item._count._all]),
    );
    const staffCountMap = new Map(
      staffCounts.map((item) => [item.schoolId, item._count._all]),
    );
    const adminCountMap = new Map(
      adminCounts.map((item) => [item.schoolId, item._count._all]),
    );
    const revenueMap = new Map(
      revenueCounts.map((item) => [item.schoolId, parseFloat(item._sum.amount || "0")]),
    );

    // Build statistics for each school using the maps
    const schoolStats = schools.map((school) => {
      const totalStudents = studentCountMap.get(school.id) || 0;
      const totalTeachers = teacherCountMap.get(school.id) || 0;
      const totalStaff = staffCountMap.get(school.id) || 0;
      const totalAdmin = adminCountMap.get(school.id) || 0;
      const totalStaffCount = totalTeachers + totalAdmin;
      const totalRevenue = revenueMap.get(school.id) || 0;

      return {
        ...school,
        totalStudents,
        totalStaff: totalStaffCount,
        teachers: totalTeachers,
        adminStaff: totalAdmin,
        totalRevenue,
        status: "Active",
      };
    });

    // Calculate totals
    const totals = schoolStats.reduce(
      (acc, stat) => ({
        totalStudents: acc.totalStudents + stat.totalStudents,
        totalStaff: acc.totalStaff + stat.totalStaff,
        totalTeachers: acc.totalTeachers + stat.teachers,
        totalAdminStaff: acc.totalAdminStaff + stat.adminStaff,
        totalRevenue: acc.totalRevenue + stat.totalRevenue,
      }),
      {
        totalStudents: 0,
        totalStaff: 0,
        totalTeachers: 0,
        totalAdminStaff: 0,
        totalRevenue: 0,
      },
    );

    return res.json({
      message: "School statistics fetched!",
      data: {
        schools: schoolStats,
        totals,
      },
    });
  },
);

// School-wise revenue breakdown
router.get(
  "/schools/:id/revenue",
  withPermission(Permission.GET_STATISTICS),
  async (req, res) => {
    const { id } = req.params;

    // Verify school exists
    const school = await prisma.school.findUniqueOrThrow({
      where: { id },
      select: { id: true, name: true, code: true },
    });

    // Get all receipts for this school grouped by year
    const receipts = await prisma.receipt.findMany({
      where: {
        schoolId: id,
        deletedAt: null,
      },
      select: {
        id: true,
        receiptNumber: true,
        amount: true,
        baseAmount: true,
        totalGst: true,
        description: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group receipts by academic year (April-March)
    const yearlyBreakdown = {};
    let grandTotal = 0;

    receipts.forEach((receipt) => {
      const date = new Date(receipt.createdAt);
      const month = date.getMonth(); // 0-indexed
      const year = date.getFullYear();
      // Academic year: if month >= April (3), it's startYear-endYear; else previous year
      const academicStartYear = month >= 3 ? year : year - 1;
      const academicEndYear = academicStartYear + 1;
      const academicYearKey = `${academicStartYear}-${String(academicEndYear).slice(-2)}`;

      if (!yearlyBreakdown[academicYearKey]) {
        yearlyBreakdown[academicYearKey] = {
          academicYear: academicYearKey,
          totalRevenue: 0,
          totalBase: 0,
          totalGst: 0,
          receiptCount: 0,
        };
      }

      const amount = parseFloat(receipt.amount || "0");
      const baseAmount = parseFloat(receipt.baseAmount || "0");
      const gst = parseFloat(receipt.totalGst || "0");

      yearlyBreakdown[academicYearKey].totalRevenue += amount;
      yearlyBreakdown[academicYearKey].totalBase += baseAmount;
      yearlyBreakdown[academicYearKey].totalGst += gst;
      yearlyBreakdown[academicYearKey].receiptCount += 1;
      grandTotal += amount;
    });

    // Convert to sorted array (most recent first)
    const yearlyData = Object.values(yearlyBreakdown).sort((a, b) =>
      b.academicYear.localeCompare(a.academicYear)
    );

    return res.json({
      message: "School revenue fetched!",
      data: {
        school,
        grandTotal,
        yearly: yearlyData,
        receipts,
      },
    });
  },
);

router.get(
  "/dashboard",
  withPermission(Permission.GET_DASHBOARD_STATS),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { academicYear, filterType, filterValue } = req.query;

      if (!currentUser) {
        return res.status(401).json({
          message: "User not authenticated",
        });
      }

      const data = await dashboardService.getDashboard(currentUser, academicYear, { filterType, filterValue });

      return res.json({
        message: "Dashboard statistics fetched!",
        data,
      });
    } catch (error) {
      logger.error(
        {
          error: error.message,
          stack: error.stack,
          userId: req.context?.user?.id,
          roleName: req.context?.user?.role?.name,
          schoolId: req.context?.user?.schoolId,
        },
        "Dashboard statistics error",
      );
      return res.status(500).json({
        message: error.message || "Failed to fetch dashboard statistics",
      });
    }
  },
);

export default router;
