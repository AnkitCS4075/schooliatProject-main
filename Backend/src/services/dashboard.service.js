import prisma from "../prisma/client.js";
import {
  RoleName,
  UserType,
  Gender,
  FeePaymentStatus,
  AttendanceStatus,
} from "../prisma/generated/index.js";
import roleService from "./role.service.js";
import dateUtil from "../utils/date.util.js";
import cacheService from "./cache.service.js";
import logger from "../config/logger.js";

const getDashboard = async (currentUser, academicYear, filterOptions = {}) => {
  try {
    const roleName = currentUser?.role?.name;

    if (roleName === RoleName.SUPER_ADMIN) {
      return await getSuperAdminDashboard(academicYear);
    }
    if (roleName === RoleName.SCHOOL_ADMIN) {
      return await getSchoolAdminDashboard(currentUser, academicYear, filterOptions);
    }
    if (roleName === RoleName.TEACHER) {
      return await getTeacherDashboard(currentUser, academicYear);
    }
    if (roleName === RoleName.STAFF) {
      return await getStaffDashboard(currentUser, academicYear);
    }
    if (roleName === RoleName.STUDENT) {
      return await getStudentDashboard(currentUser, academicYear);
    }
    if (roleName === RoleName.PARENT) {
      return await getParentDashboard(currentUser, academicYear);
    }
    if (roleName === RoleName.EMPLOYEE) {
      return await getEmployeeDashboard(currentUser, academicYear);
    }

    // Unknown role or missing role - return fallback for school admin if we have schoolId
    if (currentUser?.schoolId) {
      return await getSchoolAdminDashboardFallback(currentUser.schoolId);
    }
    return {};
  } catch (err) {
    logger.error(
      { err: err.message, stack: err.stack, userId: currentUser?.id, schoolId: currentUser?.schoolId },
      "getDashboard failed",
    );
    if (currentUser?.schoolId) {
      return await getSchoolAdminDashboardFallback(currentUser.schoolId);
    }
    return {};
  }
};

const getSuperAdminDashboard = async (academicYear) => {
  // Cache dashboard for 5 minutes (include academicYear in cache key)
  const cacheKey = `dashboard:super_admin:${academicYear || 'all'}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await getSuperAdminDashboardData(academicYear);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

/**
 * Parse an academic year string like "2025-26" into a date range.
 * Academic year runs from April 1 of start year to March 31 of end year.
 * Returns { start: Date, end: Date } or null if invalid.
 */
const parseAcademicYearRange = (academicYear) => {
  if (!academicYear || typeof academicYear !== 'string') return null;
  const parts = academicYear.split('-');
  if (parts.length !== 2) return null;
  const startYear = parseInt(parts[0], 10);
  let endYear = parseInt(parts[1], 10);
  if (isNaN(startYear) || isNaN(endYear)) return null;
  // Handle 2-digit end year (e.g. "2025-26" => endYear = 2026)
  if (endYear < 100) {
    endYear = Math.floor(startYear / 100) * 100 + endYear;
  }
  return {
    start: new Date(startYear, 3, 1), // April 1
    end: new Date(endYear, 2, 31, 23, 59, 59, 999), // March 31 end of day
  };
};

const getSuperAdminDashboardData = async (academicYear) => {
  // Get role IDs
  const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
  const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
  const staffRole = await roleService.getRoleByName(RoleName.STAFF);
  const employeeRole = await roleService.getRoleByName(RoleName.EMPLOYEE);

  // Build date filter for academic year
  const yearRange = parseAcademicYearRange(academicYear);
  const dateFilter = yearRange ? {
    createdAt: { gte: yearRange.start, lte: yearRange.end },
  } : {};

  // Get counts
  const [
    totalSchools,
    totalEmployees,
    totalStudents,
    totalStaff,
    recentSchools,
  ] = await Promise.all([
    prisma.school.count({
      where: { deletedAt: null, ...dateFilter },
    }),
    prisma.user.count({
      where: {
        roleId: employeeRole?.id,
        userType: UserType.APP,
        deletedAt: null,
        ...dateFilter,
      },
    }),
    prisma.user.count({
      where: {
        roleId: studentRole?.id,
        userType: UserType.SCHOOL,
        deletedAt: null,
        ...dateFilter,
      },
    }),
    prisma.user.count({
      where: {
        roleId: { in: [teacherRole?.id, staffRole?.id].filter(Boolean) },
        userType: UserType.SCHOOL,
        deletedAt: null,
        ...dateFilter,
      },
    }),
    prisma.school.findMany({
      where: { deletedAt: null, ...dateFilter },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  // Get student count for recent schools
  const recentSchoolsWithStats = await Promise.all(
    recentSchools.map(async (school) => {
      const studentCount = await prisma.user.count({
        where: {
          schoolId: school.id,
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          deletedAt: null,
          ...dateFilter,
        },
      });

      return {
        ...school,
        students: studentCount,
        status: "Active",
      };
    }),
  );

  return {
    totalSchools,
    totalEmployees,
    totalStudents,
    totalStaff,
    recentSchools: recentSchoolsWithStats,
    academicYear: academicYear || null,
  };
};

const getSchoolAdminDashboard = async (currentUser, academicYear, filterOptions = {}) => {
  const schoolId = currentUser?.schoolId;

  if (!schoolId) {
    return {};
  }

  // Cache dashboard per school, academic year, and filter for 5 minutes
  const filterKey = filterOptions.filterType ? `${filterOptions.filterType}:${filterOptions.filterValue}` : 'none';
  const cacheKey = `dashboard:school_admin:${schoolId}:${academicYear || 'all'}:${filterKey}`;
  try {
    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await getSchoolAdminDashboardData(currentUser, schoolId, academicYear, filterOptions);
      },
      5 * 60 * 1000, // 5 minutes TTL
    );
  } catch (err) {
    logger.error(
      { err: err.message, stack: err.stack, schoolId, userId: currentUser?.id, academicYear },
      "Dashboard cache/get failed, returning safe fallback",
    );
    return getSchoolAdminDashboardFallback(schoolId, academicYear);
  }
};

/**
 * Return a safe fallback dashboard when getSchoolAdminDashboardData fails (e.g. 500).
 * Fetches only school name/code so the UI can still render.
 */
const getSchoolAdminDashboardFallback = async (schoolId, academicYear) => {
  let school = { id: schoolId, name: "School", code: "", address: [] };
  try {
    const s = await prisma.school.findUnique({
      where: { id: schoolId },
      select: { id: true, name: true, code: true, address: true },
    });
    if (s) {
      school = {
        id: s.id,
        name: s.name || "School",
        code: s.code || "",
        address: Array.isArray(s.address) ? s.address : [],
      };
    }
  } catch (e) {
    logger.warn({ schoolId, err: e.message }, "Fallback: could not load school");
  }

  const yearRange = parseAcademicYearRange(academicYear);
  const currentDate = new Date();
  const currentMonth = yearRange ? 4 : currentDate.getMonth() + 1; // April if year range provided, else real month
  const currentYear = yearRange ? yearRange.start.getFullYear() : currentDate.getFullYear();

  return {
    school,
    userCounts: {
      students: { total: 0, boys: 0, girls: 0 },
      teachers: 0,
      staff: 0,
    },
    installments: {
      currentYear,
      currentInstallmentNumber: 1,
      paid: 0,
      pending: 0,
      partiallyPaid: 0,
      total: 0,
    },
    financial: {
      totalIncome: 0,
      totalSalary: 0,
      incomeChangePercent: "+0",
      salaryChangePercent: "+0",
      monthlyEarnings: Array.from({ length: 12 }, (_, i) => ({
        month: new Date(currentYear, (yearRange ? 3 : 0) + i, 1).toLocaleString("default", { month: "short" }),
        income: 0,
        expense: 0,
      })),
    },
    calendar: { events: [], currentMonth, currentYear },
    notices: [],
    academicYear: academicYear || null,
  };
};

const getSchoolAdminDashboardData = async (currentUser, schoolId, academicYear, filterOptions = {}) => {
  // Get role IDs with null checks
  const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
  const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
  const staffRole = await roleService.getRoleByName(RoleName.STAFF);

  // Validate roles exist - return fallback instead of throwing so admin still sees a page
  if (!studentRole || !teacherRole || !staffRole) {
    logger.warn({ schoolId }, "Dashboard: required roles not found, returning fallback");
    return getSchoolAdminDashboardFallback(schoolId, academicYear);
  }

  try {
    // Get academic year date range
    const yearRange = parseAcademicYearRange(academicYear);
    const currentDate = new Date();

    // Academic year runs April-March
    const academicStart = yearRange ? yearRange.start : (currentDate.getMonth() >= 3 ? new Date(currentDate.getFullYear(), 3, 1) : new Date(currentDate.getFullYear() - 1, 3, 1));
    const academicEnd = yearRange ? yearRange.end : (currentDate.getMonth() >= 3 ? new Date(currentDate.getFullYear() + 1, 2, 31, 23, 59, 59, 999) : new Date(currentDate.getFullYear(), 2, 31, 23, 59, 59, 999));

    // Use academic start year as the 'currentYear' for labeling
    const currentYear = academicStart.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const firstDayOfMonth = dateUtil.getFirstDayOfMonth(
      currentMonth,
      currentYear,
    );
    const lastDayOfMonth = dateUtil.getLastDayOfMonth(currentMonth, currentYear);

    // Date filter for users (all created up to end of academic year)
    const activeUserFilter = {
      createdAt: { lte: academicEnd },
      OR: [
        { deletedAt: null },
        { deletedAt: { gte: academicStart } }
      ]
    };

    // Date filter for new additions this year (for growth calculation)
    const newThisYearFilter = {
      createdAt: { gte: academicStart, lte: academicEnd },
      deletedAt: null
    };

    // Previous year range for growth calculation
    const prevYearStart = new Date(academicStart);
    prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
    const prevYearEnd = new Date(academicEnd);
    prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);

    const prevActiveUserFilter = {
      createdAt: { lte: prevYearEnd },
      OR: [
        { deletedAt: null },
        { deletedAt: { gte: prevYearStart } }
      ]
    };

    // Calculate attendance date range based on filterOptions
    let attendanceStart, attendanceEnd;
    const { filterType, filterValue } = filterOptions;
    if (filterType === 'date' && filterValue) {
      // Single day: filterValue = "2026-03-05"
      attendanceStart = new Date(filterValue);
      attendanceStart.setHours(0, 0, 0, 0);
      attendanceEnd = new Date(attendanceStart);
      attendanceEnd.setDate(attendanceEnd.getDate() + 1);
    } else if (filterType === 'month' && filterValue) {
      // Month: filterValue = "2026-03" or "3" (month number)
      if (filterValue.includes('-')) {
        const [y, m] = filterValue.split('-').map(Number);
        attendanceStart = new Date(y, m - 1, 1);
        attendanceEnd = new Date(y, m, 1);
      } else {
        const m = parseInt(filterValue, 10);
        attendanceStart = new Date(currentYear, m - 1, 1);
        attendanceEnd = new Date(currentYear, m, 1);
      }
    } else if (filterType === 'term' && filterValue) {
      // Term: "Term 1" = Apr-Sep, "Term 2" = Oct-Mar
      if (filterValue === 'Term 1' || filterValue === '1') {
        attendanceStart = new Date(academicStart);
        attendanceEnd = new Date(academicStart.getFullYear(), 8, 30, 23, 59, 59, 999); // Sep 30
      } else {
        attendanceStart = new Date(academicStart.getFullYear(), 9, 1); // Oct 1
        attendanceEnd = new Date(academicEnd);
      }
    } else {
      // Default: today
      attendanceStart = new Date();
      attendanceStart.setHours(0, 0, 0, 0);
      attendanceEnd = new Date(attendanceStart);
      attendanceEnd.setDate(attendanceEnd.getDate() + 1);
    }

    // Get school settings to fetch current installment number (resilient to missing columns e.g. platform_config)
    let schoolSettings = null;
    try {
      schoolSettings = await prisma.settings.findFirst({
        where: {
          schoolId,
          deletedAt: null,
        },
      });
    } catch (err) {
      logger.warn({ err: err.message, schoolId }, "Dashboard: could not load settings, using defaults");
    }

    const currentInstallmentNumber =
      schoolSettings?.currentInstallmentNumber ?? 1;

    /**
     * Fee.year is the calendar year when the fee row was created (see fee.service).
     * An academic year (Apr–Mar) spans two calendar years, so matching only
     * academicStart.getFullYear() drops fees created in the second year and makes
     * feeId filters empty → all fee stats showed 0.
     */
    const feeCalendarYears = [];
    for (let y = academicStart.getFullYear(); y <= academicEnd.getFullYear(); y++) {
      feeCalendarYears.push(y);
    }

    let feeRowsForFilter = await prisma.fee.findMany({
      where: {
        schoolId,
        year: { in: feeCalendarYears },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (feeRowsForFilter.length === 0) {
      feeRowsForFilter = await prisma.fee.findMany({
        where: { schoolId, deletedAt: null },
        select: { id: true },
      });
    }

    const currentYearFeeIds = feeRowsForFilter.map((f) => f.id);

    // Build fee filter - if no fees exist for the school, match nothing
    const buildFeeFilter = (baseWhere) => {
      if (currentYearFeeIds.length > 0) {
        return { ...baseWhere, feeId: { in: currentYearFeeIds } };
      }
      return { ...baseWhere, feeId: { in: ["00000000-0000-0000-0000-000000000000"] } };
    };

    // Get counts for the school
    // Start tracking query performance
    const queryStartTime = Date.now();
    logger.info({ schoolId, userId: currentUser.id }, "Starting dashboard data fetch");

    const [
      totalStudents,
      totalStudentsBoys,
      totalStudentsGirls,
      totalTeachers,
      totalStaff,
      totalStudentsPrevYear,
      school,
      notices,
      paidInstallments,
      pendingInstallments,
      partialPaidInstallments,
      // Financial data
      totalFeeIncome,
      totalSalaryDistributed,
      monthlyEarnings,
      // Calendar events for current month
      calendarEvents,
      totalFeeIncomePrevYear,
      totalSalaryPrevYear,
      presentStudentsCount,
      presentStaffCount,
      // New financial data
      todayFeeCollection,
      pendingFeeAmount,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          schoolId,
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          ...activeUserFilter,
        },
      }),
      prisma.user.count({
        where: {
          schoolId,
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          gender: Gender.MALE,
          ...activeUserFilter,
        },
      }),
      prisma.user.count({
        where: {
          schoolId,
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          gender: Gender.FEMALE,
          ...activeUserFilter,
        },
      }),
      prisma.user.count({
        where: {
          schoolId,
          roleId: teacherRole?.id,
          userType: UserType.SCHOOL,
          ...activeUserFilter,
        },
      }),
      prisma.user.count({
        where: {
          schoolId,
          roleId: staffRole?.id,
          userType: UserType.SCHOOL,
          ...activeUserFilter,
        },
      }),
      // Previous year counts for growth
      prisma.user.count({
        where: {
          schoolId,
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          ...prevActiveUserFilter,
        },
      }),
      prisma.school.findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
        },
      }),
      prisma.notice.findMany({
        where: {
          schoolId,
          deletedAt: null,
          // Filter notices that are visible during the selected academic year
          visibleFrom: { lte: academicEnd },
          visibleTill: { gte: academicStart },
        },
        select: {
          id: true,
          title: true,
          content: true,
          visibleFrom: true,
          visibleTill: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      prisma.feeInstallements.count({
        where: buildFeeFilter({
          schoolId,
          installementNumber: currentInstallmentNumber,
          paymentStatus: FeePaymentStatus.PAID,
          deletedAt: null,
        }),
      }),
      prisma.feeInstallements.count({
        where: buildFeeFilter({
          schoolId,
          installementNumber: currentInstallmentNumber,
          paymentStatus: FeePaymentStatus.PENDING,
          deletedAt: null,
        }),
      }),
      prisma.feeInstallements.count({
        where: buildFeeFilter({
          schoolId,
          installementNumber: currentInstallmentNumber,
          paymentStatus: FeePaymentStatus.PARTIALLY_PAID,
          deletedAt: null,
        }),
      }),
      // Total fee income in the selected academic window (payments recorded in range)
      prisma.feeInstallements.aggregate({
        where: buildFeeFilter({
          schoolId,
          paymentStatus: { in: [FeePaymentStatus.PAID, FeePaymentStatus.PARTIALLY_PAID] },
          deletedAt: null,
          updatedAt: {
            gte: academicStart,
            lte: academicEnd,
          },
        }),
        _sum: {
          paidAmount: true,
        },
      }),
      // Total salary distributed for current year
      prisma.salaryPayments.aggregate({
        where: {
          schoolId,
          createdAt: {
            gte: academicStart,
            lte: academicEnd,
          },
          deletedAt: null,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // Monthly earnings (income and expenses) for the last 12 months - simplified to avoid complex async in Promise.all
      Promise.resolve([]), // Will be calculated separately after Promise.all
      // Calendar events for current month
      prisma.event.findMany({
        where: {
          schoolId,
          deletedAt: null,
          approvalStatus: "APPROVED",
          from: { lte: academicEnd },
          till: { gte: academicStart },
        },
        select: {
          id: true,
          title: true,
          from: true,
          till: true,
          dateType: true,
        },
        orderBy: {
          from: 'asc',
        },
        take: 10,
      }),
      // Previous year financial data for growth
      prisma.feeInstallements.aggregate({
        where: buildFeeFilter({
          schoolId,
          paymentStatus: { in: [FeePaymentStatus.PAID, FeePaymentStatus.PARTIALLY_PAID] },
          deletedAt: null,
          updatedAt: {
            gte: prevYearStart,
            lte: prevYearEnd,
          },
        }),
        _sum: {
          paidAmount: true,
        },
      }),
      prisma.salaryPayments.aggregate({
        where: {
          schoolId,
          createdAt: {
            gte: prevYearStart,
            lte: prevYearEnd,
          },
          deletedAt: null,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      // new attendance queries for today
      prisma.attendance.count({
        where: {
          schoolId,
          date: { gte: attendanceStart, lt: attendanceEnd },
          status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY] },
          student: { role: { name: "STUDENT" }, deletedAt: null }
        }
      }),
      prisma.attendance.count({
        where: {
          schoolId,
          date: { gte: attendanceStart, lt: attendanceEnd },
          status: { in: [AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY] },
          student: { role: { name: { in: ["STAFF", "TEACHER"] } }, deletedAt: null }
        }
      }),
      // Collection in the dashboard filter window (aligned with attendance date range)
      prisma.feeInstallements.aggregate({
        where: buildFeeFilter({
          schoolId,
          paymentStatus: { in: [FeePaymentStatus.PAID, FeePaymentStatus.PARTIALLY_PAID] },
          deletedAt: null,
          updatedAt:
            filterType === "term" && filterValue
              ? { gte: attendanceStart, lte: attendanceEnd }
              : { gte: attendanceStart, lt: attendanceEnd },
        }),
        _sum: {
          paidAmount: true,
        },
      }),
      // Outstanding unpaid balance (pending + partial)
      prisma.feeInstallements.aggregate({
        where: buildFeeFilter({
          schoolId,
          paymentStatus: {
            in: [FeePaymentStatus.PENDING, FeePaymentStatus.PARTIALLY_PAID],
          },
          deletedAt: null,
        }),
        _sum: {
          remainingAmount: true,
        },
      }),
    ]);
    const queryDuration = Date.now() - queryStartTime;
    logger.info({ schoolId, duration: `${queryDuration}ms` }, "Dashboard data fetch complete");

    const totalIncome = Number(totalFeeIncome._sum?.paidAmount || 0);
    const totalSalary = Number(totalSalaryDistributed._sum?.totalAmount || 0);

    // Calculate monthly earnings for the selected academic year (April to March) in parallel
    const monthPromises = Array.from({ length: 12 }).map(async (_, i) => {
      const monthDate = new Date(academicStart.getFullYear(), academicStart.getMonth() + i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const [income, expense] = await Promise.all([
        // Income from fees
        prisma.feeInstallements.aggregate({
          where: buildFeeFilter({
            schoolId,
            paymentStatus: { in: [FeePaymentStatus.PAID, FeePaymentStatus.PARTIALLY_PAID] },
            deletedAt: null,
            updatedAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          }),
          _sum: {
            paidAmount: true,
          },
        }),
        // Expenses (salary payments)
        prisma.salaryPayments.aggregate({
          where: {
            schoolId,
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
            deletedAt: null,
          },
          _sum: {
            totalAmount: true,
          },
        }),
      ]);

      return {
        month: monthDate.toLocaleString('default', { month: 'short' }),
        income: Number(income._sum?.paidAmount || 0),
        expense: Number(expense._sum?.totalAmount || 0),
      };
    });

    const monthlyEarningsData = await Promise.all(monthPromises);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? "+100" : "0";
      const diff = ((current - previous) / previous) * 100;
      return (diff >= 0 ? "+" : "") + diff.toFixed(1);
    };

    const studentGrowth = calculateGrowth(totalStudents, totalStudentsPrevYear);
    const incomeGrowth = calculateGrowth(totalIncome, Number(totalFeeIncomePrevYear._sum?.paidAmount || 0));
    const salaryGrowth = calculateGrowth(totalSalary, Number(totalSalaryPrevYear._sum?.totalAmount || 0));

    // Validate school exists - return fallback instead of throwing so UI still loads
    if (!school) {
      logger.warn({ schoolId }, "Dashboard: school not found, returning fallback");
      return getSchoolAdminDashboardFallback(schoolId, academicYear);
    }

    const schoolAddress = school.address;
    const safeAddress = Array.isArray(schoolAddress) ? schoolAddress : [];

    return {
      school: {
        id: school.id,
        name: school.name || "Unknown School",
        code: school.code || "",
        address: safeAddress,
      },
      userCounts: {
        students: {
          total: totalStudents || 0,
          boys: totalStudentsBoys || 0,
          girls: totalStudentsGirls || 0,
          present: presentStudentsCount || 0,
        },
        teachers: totalTeachers || 0,
        staff: totalStaff || 0,
        presentStaffAndTeachers: presentStaffCount || 0,
      },
      installments: {
        currentYear,
        currentInstallmentNumber,
        paid: paidInstallments || 0,
        pending: pendingInstallments || 0,
        partiallyPaid: partialPaidInstallments || 0,
        total: (paidInstallments || 0) + (pendingInstallments || 0) + (partialPaidInstallments || 0),
      },
      financial: {
        totalIncome: totalIncome || 0,
        totalSalary: totalSalary || 0,
        todayCollection: Number(todayFeeCollection?._sum?.paidAmount || 0),
        pendingAmount: Number(pendingFeeAmount?._sum?.amount || 0),
        incomeChangePercent: incomeGrowth,
        salaryChangePercent: salaryGrowth,
        studentChangePercent: studentGrowth,
        monthlyEarnings: monthlyEarningsData || [],
      },
      calendar: {
        events: calendarEvents || [],
        currentMonth,
        currentYear,
      },
      notices: notices || [],
    };
  } catch (err) {
    logger.error(
      { err: err.message, stack: err.stack, schoolId, userId: currentUser?.id },
      "Dashboard getSchoolAdminDashboardData failed",
    );
    return getSchoolAdminDashboardFallback(schoolId);
  }
};

// Teacher Dashboard
const getTeacherDashboard = async (currentUser, academicYear) => {
  const schoolId = currentUser?.schoolId;
  const teacherId = currentUser?.id;

  if (!schoolId || !teacherId) {
    return {};
  }

  const cacheKey = `dashboard:teacher:${teacherId}:${academicYear || 'all'}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await getTeacherDashboardData(schoolId, teacherId, academicYear);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

const getTeacherDashboardData = async (schoolId, teacherId, academicYear) => {
  const yearRange = parseAcademicYearRange(academicYear);
  const currentDate = new Date();
  const academicStart = yearRange ? yearRange.start : new Date(currentDate.getFullYear() - (currentDate.getMonth() < 3 ? 1 : 0), 3, 1);
  const academicEnd = yearRange ? yearRange.end : new Date(academicStart.getFullYear() + 1, 2, 31, 23, 59, 59, 999);
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const [
    timetableSlots,
    pendingHomeworks,
    submittedHomeworks,
    upcomingExams,
    recentNotices,
  ] = await Promise.all([
    prisma.timetableSlot.findMany({
      where: {
        teacherId,
        deletedAt: null,
      },
      include: {
        timetable: {
          include: {
            class: true,
          },
        },
        subject: true,
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNumber: "asc" },
      ],
    }),
    prisma.homework.findMany({
      where: {
        teacherId,
        dueDate: { gte: currentDate },
        deletedAt: null,
      },
      include: {
        subject: true,
        _count: {
          select: {
            submissions: {
              where: {
                status: "PENDING",
                deletedAt: null,
              },
            },
          },
        },
      },
      take: 5,
      orderBy: {
        dueDate: "asc",
      },
    }),
    prisma.homeworkSubmission.findMany({
      where: {
        homework: {
          teacherId,
          deletedAt: null,
        },
        status: "SUBMITTED",
        deletedAt: null,
      },
      include: {
        homework: {
          include: {
            subject: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      take: 10,
      orderBy: {
        submittedAt: "desc",
      },
    }),
    // Get exams with upcoming dates from exam calendar items
    (async () => {
      // First, find exam calendar items with upcoming dates
      const upcomingItems = await prisma.examCalendarItem.findMany({
        where: {
          date: { gte: currentDate },
          deletedAt: null,
        },
        select: {
          examCalendarId: true,
        },
        take: 50, // Get enough to find unique calendars
      });

      const examCalendarIds = [...new Set(upcomingItems.map(item => item.examCalendarId))];

      if (examCalendarIds.length === 0) {
        return [];
      }

      // Get exam calendars
      const upcomingExamCalendars = await prisma.examCalendar.findMany({
        where: {
          id: { in: examCalendarIds },
          schoolId,
          deletedAt: null,
        },
        take: 5,
      });

      // Fetch exam calendar items for these calendars
      const calendarItemMap = new Map();
      for (const ec of upcomingExamCalendars) {
        const items = await prisma.examCalendarItem.findMany({
          where: {
            examCalendarId: ec.id,
            deletedAt: null,
          },
          orderBy: {
            date: "asc",
          },
        });
        calendarItemMap.set(ec.id, items);
      }

      // Fetch exams separately since there's no relation defined
      const examIds = [...new Set(upcomingExamCalendars.map(ec => ec.examId))];
      const exams = await prisma.exam.findMany({
        where: {
          id: { in: examIds },
        },
      });

      const examMap = new Map(exams.map(e => [e.id, e]));

      return upcomingExamCalendars.map(ec => ({
        ...examMap.get(ec.examId),
        examCalendar: {
          ...ec,
          examCalendarItems: calendarItemMap.get(ec.id) || [],
          examId: undefined, // Remove redundant field
        },
      })).filter(e => e.id); // Filter out any exams that weren't found
    })(),
    prisma.notice.findMany({
      where: {
        schoolId,
        deletedAt: null,
        visibleFrom: { lte: academicEnd },
        visibleTill: { gte: academicStart },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    timetableSlots,
    pendingHomeworks,
    submittedHomeworks,
    upcomingExams,
    recentNotices,
  };
};

// Staff Dashboard
const getStaffDashboard = async (currentUser, academicYear) => {
  const schoolId = currentUser?.schoolId;
  const staffId = currentUser?.id;

  if (!schoolId || !staffId) {
    return {};
  }

  const cacheKey = `dashboard:staff:${staffId}:${academicYear || 'all'}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await getStaffDashboardData(schoolId, staffId, academicYear);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

const getStaffDashboardData = async (schoolId, staffId, academicYear) => {
  const yearRange = parseAcademicYearRange(academicYear);
  const currentDate = new Date();
  const academicStart = yearRange ? yearRange.start : new Date(currentDate.getFullYear() - (currentDate.getMonth() < 3 ? 1 : 0), 3, 1);
  const academicEnd = yearRange ? yearRange.end : new Date(academicStart.getFullYear() + 1, 2, 31, 23, 59, 59, 999);

  const [
    recentNotices,
    upcomingEvents,
    recentCirculars,
  ] = await Promise.all([
    prisma.notice.findMany({
      where: {
        schoolId,
        deletedAt: null,
        visibleFrom: { lte: academicEnd },
        visibleTill: { gte: academicStart },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.event.findMany({
      where: {
        schoolId,
        startDate: { gte: currentDate },
        deletedAt: null,
        approvalStatus: "APPROVED",
      },
      take: 5,
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.circular.findMany({
      where: {
        schoolId,
        status: "PUBLISHED",
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    recentNotices,
    upcomingEvents,
    recentCirculars,
  };
};

// Student Dashboard
const getStudentDashboard = async (currentUser, academicYear) => {
  const schoolId = currentUser?.schoolId;
  const studentId = currentUser?.id;

  if (!schoolId || !studentId) {
    return {};
  }

  const cacheKey = `dashboard:student:${studentId}:${academicYear || 'all'}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await getStudentDashboardData(schoolId, studentId, academicYear);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

const getStudentDashboardData = async (schoolId, studentId, academicYear) => {
  const yearRange = parseAcademicYearRange(academicYear);
  const currentDate = new Date();
  const academicStart = yearRange ? yearRange.start : new Date(currentDate.getFullYear() - (currentDate.getMonth() < 3 ? 1 : 0), 3, 1);
  const academicEnd = yearRange ? yearRange.end : new Date(academicStart.getFullYear() + 1, 2, 31, 23, 59, 59, 999);
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get student profile to get class
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      class: true,
    },
  });

  const classId = studentProfile?.classId;

  const [
    recentAttendance,
    pendingHomeworks,
    upcomingExams,
    recentResults,
    timetable,
    recentNotices,
    feeStatus,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      take: 7,
      orderBy: {
        date: "desc",
      },
    }),
    prisma.homeworkSubmission.findMany({
      where: {
        studentId,
        status: "PENDING",
        deletedAt: null,
      },
      include: {
        homework: {
          include: {
            subject: true,
          },
        },
      },
      take: 5,
      orderBy: {
        homework: {
          dueDate: "asc",
        },
      },
    }),
    // Get exams with upcoming dates from exam calendar items
    (async () => {
      // First, find exam calendar items with upcoming dates
      const upcomingItems = await prisma.examCalendarItem.findMany({
        where: {
          date: { gte: currentDate },
          deletedAt: null,
        },
        select: {
          examCalendarId: true,
        },
        take: 50, // Get enough to find unique calendars
      });

      const examCalendarIds = [...new Set(upcomingItems.map(item => item.examCalendarId))];

      if (examCalendarIds.length === 0) {
        return [];
      }

      // Get exam calendars
      const upcomingExamCalendars = await prisma.examCalendar.findMany({
        where: {
          id: { in: examCalendarIds },
          schoolId,
          deletedAt: null,
        },
        take: 5,
      });

      // Fetch exam calendar items for these calendars
      const calendarItemMap = new Map();
      for (const ec of upcomingExamCalendars) {
        const items = await prisma.examCalendarItem.findMany({
          where: {
            examCalendarId: ec.id,
            deletedAt: null,
          },
          orderBy: {
            date: "asc",
          },
        });
        calendarItemMap.set(ec.id, items);
      }

      // Fetch exams separately since there's no relation defined
      const examIds = [...new Set(upcomingExamCalendars.map(ec => ec.examId))];
      const exams = await prisma.exam.findMany({
        where: {
          id: { in: examIds },
        },
      });

      const examMap = new Map(exams.map(e => [e.id, e]));

      return upcomingExamCalendars.map(ec => ({
        ...examMap.get(ec.examId),
        examCalendar: {
          ...ec,
          examCalendarItems: calendarItemMap.get(ec.id) || [],
          examId: undefined, // Remove redundant field
        },
      })).filter(e => e.id); // Filter out any exams that weren't found
    })(),
    prisma.result.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
    classId ? prisma.timetable.findFirst({
      where: {
        classId,
        schoolId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        slots: {
          include: {
            subject: true,
            teacher: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: [
            { dayOfWeek: "asc" },
            { periodNumber: "asc" },
          ],
        },
      },
    }) : null,
    prisma.notice.findMany({
      where: {
        schoolId,
        deletedAt: null,
        visibleFrom: { lte: academicEnd },
        visibleTill: { gte: academicStart },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.feeInstallements.findMany({
      where: {
        studentId,
        paymentStatus: { in: ["PENDING", "PARTIALLY_PAID"] },
        deletedAt: null,
      },
      take: 5,
      orderBy: {
        installementNumber: "asc",
      },
    }),
  ]);

  return {
    recentAttendance,
    pendingHomeworks,
    upcomingExams,
    recentResults,
    timetable,
    recentNotices,
    feeStatus,
    class: studentProfile?.class,
  };
};

// Parent Dashboard
const getParentDashboard = async (currentUser) => {
  const parentId = currentUser?.id;

  if (!parentId) {
    return {};
  }

  const cacheKey = `dashboard:parent:${parentId}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      // Use parent service for consolidated dashboard
      const parentService = (await import("./parent.service.js")).default;
      return await parentService.getConsolidatedDashboard(parentId);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

// Employee Dashboard
const getEmployeeDashboard = async (currentUser, academicYear) => {
  const employeeId = currentUser?.id;

  if (!employeeId) {
    return {};
  }

  const cacheKey = `dashboard:employee:${employeeId}:${academicYear || 'all'}`;
  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await getEmployeeDashboardData(academicYear);
    },
    5 * 60 * 1000, // 5 minutes TTL
  );
};

const getEmployeeDashboardData = async (academicYear) => {
  const yearRange = parseAcademicYearRange(academicYear);
  const currentDate = new Date();
  const academicStart = yearRange ? yearRange.start : new Date(currentDate.getFullYear() - (currentDate.getMonth() < 3 ? 1 : 0), 3, 1);
  const academicEnd = yearRange ? yearRange.end : new Date(academicStart.getFullYear() + 1, 2, 31, 23, 59, 59, 999);

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = academicStart.getFullYear();
  const firstDayOfMonth = dateUtil.getFirstDayOfMonth(currentMonth, currentYear);
  const lastDayOfMonth = dateUtil.getLastDayOfMonth(currentMonth, currentYear);

  // Get role IDs for statistics
  const studentRole = await roleService.getRoleByName(RoleName.STUDENT);
  const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
  const staffRole = await roleService.getRoleByName(RoleName.STAFF);

  const [
    totalSchools,
    activeLicenses,
    expiringLicenses,
    expiredLicenses,
    totalVendors,
    recentSchools,
    recentLicenses,
    recentReceipts,
    monthlyRevenue,
    totalRevenue,
    licenseStatistics,
  ] = await Promise.all([
    // Total schools count
    prisma.school.count({
      where: { deletedAt: null },
    }),
    // Active licenses count
    prisma.license.count({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
    }),
    // Expiring soon licenses (within 30 days)
    prisma.license.count({
      where: {
        status: "EXPIRING_SOON",
        deletedAt: null,
      },
    }),
    // Expired licenses count
    prisma.license.count({
      where: {
        status: "EXPIRED",
        deletedAt: null,
      },
    }),
    // Total vendors count
    prisma.vendor.count({
      where: { deletedAt: null },
    }),
    // Recent schools (last 5)
    prisma.school.findMany({
      where: { deletedAt: null },
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
      take: 5,
    }),
    // Recent licenses (last 5)
    prisma.license.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        issuer: true,
        issueDate: true,
        expiryDate: true,
        status: true,
        certificateNumber: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    // Recent receipts (last 10)
    prisma.receipt.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        receiptNumber: true,
        schoolId: true,
        baseAmount: true,
        amount: true,
        paymentMethod: true,
        createdAt: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    // Monthly revenue (current month)
    prisma.receipt.aggregate({
      where: {
        createdAt: {
          gte: academicStart,
          lte: academicEnd,
        },
        deletedAt: null,
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
    // Total revenue (all time)
    prisma.receipt.aggregate({
      where: { deletedAt: null },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
    // License statistics by status
    prisma.license.groupBy({
      by: ["status"],
      where: { deletedAt: null },
      _count: {
        id: true,
      },
    }),
  ]);

  // Calculate student and staff counts for recent schools
  const recentSchoolIds = recentSchools.map((school) => school.id);
  const [studentCounts, teacherCounts, staffCounts] = await Promise.all([
    recentSchoolIds.length > 0
      ? prisma.user.groupBy({
        by: ["schoolId"],
        where: {
          schoolId: { in: recentSchoolIds },
          roleId: studentRole?.id,
          userType: UserType.SCHOOL,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      })
      : [],
    recentSchoolIds.length > 0
      ? prisma.user.groupBy({
        by: ["schoolId"],
        where: {
          schoolId: { in: recentSchoolIds },
          roleId: teacherRole?.id,
          userType: UserType.SCHOOL,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      })
      : [],
    recentSchoolIds.length > 0
      ? prisma.user.groupBy({
        by: ["schoolId"],
        where: {
          schoolId: { in: recentSchoolIds },
          roleId: staffRole?.id,
          userType: UserType.SCHOOL,
          deletedAt: null,
        },
        _count: {
          _all: true,
        },
      })
      : [],
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

  // Enhance recent schools with statistics
  const recentSchoolsWithStats = recentSchools.map((school) => ({
    ...school,
    studentCount: studentCountMap.get(school.id) || 0,
    teacherCount: teacherCountMap.get(school.id) || 0,
    staffCount: staffCountMap.get(school.id) || 0,
    status: "Active",
  }));

  // Calculate license statistics summary
  const licenseStatsMap = new Map(
    licenseStatistics.map((stat) => [stat.status, stat._count.id]),
  );

  return {
    // Overview statistics
    totalSchools,
    totalVendors,
    totalLicenses: activeLicenses + expiringLicenses + expiredLicenses,
    activeLicenses,
    expiringLicenses,
    expiredLicenses,
    // License statistics breakdown
    licenseStatistics: {
      active: licenseStatsMap.get("ACTIVE") || 0,
      expiringSoon: licenseStatsMap.get("EXPIRING_SOON") || 0,
      expired: licenseStatsMap.get("EXPIRED") || 0,
    },
    // Financial statistics
    revenue: {
      monthly: {
        amount: monthlyRevenue._sum.amount ? Number(monthlyRevenue._sum.amount) : 0,
        receiptCount: monthlyRevenue._count.id || 0,
        period: `${currentMonth}/${currentYear}`,
      },
      total: {
        amount: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0,
        receiptCount: totalRevenue._count.id || 0,
      },
    },
    // Recent data
    recentSchools: recentSchoolsWithStats,
    recentLicenses,
    recentReceipts,
  };
};

// Invalidate dashboard cache when data changes
const invalidateDashboardCache = async (schoolId = null, userId = null, roleName = null) => {
  // Clearing cache with academicYear suffix is harder without knowing all keys.
  // We'll use a flush or prefix matching if supported, but for now we'll just clear the exact key if known.
  // In a real system, we'd use a pattern-based invalidation (e.g., dashboard:school_admin:ID:*)
  // For now, let's at least clear the default 'all' keys.
  if (schoolId) {
    await cacheService.delete(`dashboard:school_admin:${schoolId}:all`);
  }
  if (userId && roleName) {
    await cacheService.delete(`dashboard:${roleName.toLowerCase()}:${userId}:all`);
  }
  if (!schoolId && !userId) {
    await cacheService.delete("dashboard:super_admin:all");
  }
};

const dashboardService = {
  getDashboard,
  getSuperAdminDashboard,
  getSchoolAdminDashboard,
  getTeacherDashboard,
  getStaffDashboard,
  getStudentDashboard,
  getParentDashboard,
  getEmployeeDashboard,
  invalidateDashboardCache,
};

export default dashboardService;
