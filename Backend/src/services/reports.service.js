import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/** @param {string} label e.g. "2025-26" (April → March Indian academic year) */
const parseAcademicYearRange = (label) => {
  if (!label || typeof label !== "string") return null;
  const parts = label.trim().split("-");
  if (parts.length !== 2) return null;
  const y1 = parseInt(parts[0], 10);
  const y2s = parts[1];
  if (!Number.isFinite(y1) || !/^\d{2}$/.test(y2s)) return null;
  const endYear = Math.floor(y1 / 100) * 100 + parseInt(y2s, 10);
  const start = new Date(y1, 3, 1, 0, 0, 0, 0);
  const end = new Date(endYear, 2, 31, 23, 59, 59, 999);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;
  return { start, end, startYear: y1 };
};

const defaultAcademicYearLabel = (now = new Date()) => {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) {
    return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
  }
  return `${year - 1}-${String(year % 100).padStart(2, "0")}`;
};

/** Salary row overlaps [rangeStart, rangeEnd] if month is YYYY-MM payroll month or createdAt falls in range */
const salaryPaymentInDateRange = (payment, rangeStart, rangeEnd) => {
  if (payment.month && /^\d{4}-\d{2}$/.test(payment.month)) {
    const [y, m] = payment.month.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
    return monthEnd >= rangeStart && monthStart <= rangeEnd;
  }
  const created = payment.createdAt;
  return created >= rangeStart && created <= rangeEnd;
};

/**
 * Get attendance reports
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Attendance report data
 */
const getAttendanceReports = async (schoolId, filters = {}) => {
  const { classId = null, startDate = null, endDate = null, studentId = null, markedBy = null } = filters;

  const where = {
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  if (classId) {
    where.classId = classId;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  if (markedBy) {
    where.markedBy = markedBy;
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const attendance = await prisma.attendance.findMany({
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
      markedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          publicUserId: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calculate statistics
  const totalDays = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE" || a.status === "HALF_DAY").length;
  const totalStudents = new Set(attendance.map((a) => a.studentId)).size;
  const attendanceRate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;

  return {
    attendance,
    statistics: {
      totalDays,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: Number(attendanceRate.toFixed(2)),
      averageAttendance: Number(attendanceRate.toFixed(2)),
      totalPresent: presentCount,
      totalAbsent: absentCount,
    },
  };
};

/**
 * Get fee collection analytics
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Fee analytics
 */
const getFeeAnalytics = async (schoolId, filters = {}) => {
  const { startDate = null, endDate = null, studentId = null, classId = null } = filters;

  const where = {
    schoolId,
    deletedAt: null,
  };

  if (studentId) {
    where.studentId = studentId;
  } else if (classId) {
    const studentsInClass = await prisma.user.findMany({
      where: {
        schoolId,
        deletedAt: null,
        studentProfile: {
          classId,
          deletedAt: null,
        },
      },
      select: { id: true },
    });
    const ids = studentsInClass.map((u) => u.id);
    if (ids.length === 0) {
      return {
        installments: [],
        statistics: {
          totalAmount: 0,
          totalRevenue: 0,
          paidAmount: 0,
          totalPaid: 0,
          pendingAmount: 0,
          totalPending: 0,
          overdueAmount: 0,
          collectionRate: 0,
          totalInstallments: 0,
          paidInstallments: 0,
          pendingInstallments: 0,
          cancelledInstallments: 0,
          cancelledAmountGross: 0,
        },
      };
    }
    where.studentId = { in: ids };
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Invalid start or end date for fee analytics");
    }
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { createdAt: { gte: start, lte: end } },
          { paidAt: { gte: start, lte: end } },
        ],
      },
    ];
  }

  const installments = await prisma.feeInstallements.findMany({
    where,
  });

  // Use paymentStatus (schema field), not status
  const totalAmount = installments.reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
  const paidAmount = installments
    .filter((inst) => inst.paymentStatus === "PAID")
    .reduce((sum, inst) => sum + Number(inst.paidAmount != null ? inst.paidAmount : (inst.amount || 0)), 0);
  const pendingAmount = installments
    .filter((inst) => inst.paymentStatus === "PENDING")
    .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);
  const overdueAmount = installments
    .filter((inst) => inst.paymentStatus === "PENDING" && inst.paidAt == null && new Date(inst.createdAt) < new Date())
    .reduce((sum, inst) => sum + Number(inst.amount || 0), 0);

  const cancelledRows = installments.filter(
    (inst) => inst.paymentStatus === "CANCELLED",
  );
  const cancelledAmountGross = cancelledRows.reduce(
    (sum, inst) => sum + Number(inst.amount || 0),
    0,
  );

  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return {
    installments,
    statistics: {
      totalAmount,
      totalRevenue: totalAmount,
      paidAmount,
      totalPaid: paidAmount,
      pendingAmount,
      totalPending: pendingAmount,
      overdueAmount,
      collectionRate: Number(collectionRate.toFixed(2)),
      totalInstallments: installments.length,
      paidInstallments: installments.filter((inst) => inst.paymentStatus === "PAID").length,
      pendingInstallments: installments.filter((inst) => inst.paymentStatus === "PENDING").length,
      cancelledInstallments: cancelledRows.length,
      cancelledAmountGross,
    },
  };
};

/**
 * Get academic performance reports
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Academic performance data
 */
const getAcademicReports = async (schoolId, filters = {}) => {
  const { classId = null, examId = null, subjectId = null, studentId = null } = filters;

  const where = {
    schoolId,
    deletedAt: null,
  };

  if (classId) {
    where.classId = classId;
  }

  if (examId) {
    where.examId = examId;
  }

  if (subjectId) {
    where.subjectId = subjectId;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  const marks = await prisma.marks.findMany({
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
      exam: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate statistics
  const totalStudents = new Set(marks.map((m) => m.studentId)).size;
  const averagePercentage =
    marks.length > 0
      ? marks.reduce((sum, m) => sum + Number(m.percentage || 0), 0) / marks.length
      : 0;

  const passCount = marks.filter((m) => {
    const percentage = Number(m.percentage || 0);
    return percentage >= 40; // Assuming 40% is passing
  }).length;

  const failCount = marks.length - passCount;
  const topPerformers = marks.filter((m) => Number(m.percentage || 0) >= 80).length;
  const passRateNum = marks.length > 0 ? (passCount / marks.length) * 100 : 0;

  return {
    marks,
    statistics: {
      totalStudents,
      totalMarks: marks.length,
      averagePercentage: Number(averagePercentage.toFixed(2)),
      averageScore: Number(averagePercentage.toFixed(2)),
      passCount,
      failCount,
      passRate: Number(passRateNum.toFixed(2)),
      topPerformers,
    },
  };
};

/**
 * Get salary/expense reports
 * SalaryPayments has: schoolId, userId (teacher_id), month (YYYY-MM), totalAmount, createdAt (no paymentDate/employee relation)
 * @param {string} schoolId - School ID
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} - Salary reports
 */
const getSalaryReports = async (schoolId, filters = {}) => {
  const { startDate = null, endDate = null } = filters;

  const where = {
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const payments = await prisma.salaryPayments.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter by date: use month (YYYY-MM) or createdAt
  let filteredPayments = payments;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new Error("Invalid start or end date for salary report");
    }
    filteredPayments = payments.filter((payment) =>
      salaryPaymentInDateRange(payment, start, end),
    );
  }

  // Resolve user names for display (SalaryPayments has userId = teacher_id)
  const userIds = [...new Set(filteredPayments.map((p) => p.userId))];
  const users = userIds.length
    ? await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    })
    : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.id]));

  const paymentsForResponse = filteredPayments.map((p) => ({
    ...p,
    amount: Number(p.totalAmount || 0),
    employeeName: userMap[p.userId] || p.userId,
    paymentDate: p.createdAt,
  }));

  const totalSalary = paymentsForResponse.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalEmployees = new Set(paymentsForResponse.map((p) => p.userId)).size;

  return {
    payments: paymentsForResponse,
    statistics: {
      totalSalary,
      totalPaid: totalSalary,
      totalEmployees,
      totalPayments: paymentsForResponse.length,
      averageSalary: paymentsForResponse.length > 0 ? totalSalary / paymentsForResponse.length : 0,
      pendingPayments: 0,
    },
  };
};

/**
 * Overview KPIs for the reports page: all blocks use the same academic year window
 * (April–March) and optional academicYear label from the portal (e.g. "2025-26").
 * @param {string} [schoolId]
 * @param {{ academicYear?: string }} [options]
 */
const getDashboardSummary = async (schoolId, options = {}) => {
  const label = options.academicYear || defaultAcademicYearLabel();
  const range = parseAcademicYearRange(label);
  if (!range) {
    throw new Error("Invalid academic year for dashboard summary");
  }
  const { start, end, startYear } = range;

  const baseWhere = { deletedAt: null };
  if (schoolId) baseWhere.schoolId = schoolId;

  const feeWhere = {
    ...baseWhere,
    OR: [
      { createdAt: { gte: start, lte: end } },
      { paidAt: { gte: start, lte: end } },
    ],
  };

  const examWhere = schoolId ? { schoolId, year: startYear } : { year: startYear };

  const [attendanceRows, feeRows, marksRows, salaryRowsAll, examCount, totalEnrolledStudents] =
    await Promise.all([
      prisma.attendance.findMany({
        where: { ...baseWhere, date: { gte: start, lte: end } },
        select: { status: true, studentId: true },
      }),
      prisma.feeInstallements.findMany({
        where: feeWhere,
        select: { amount: true, paidAmount: true, paymentStatus: true },
      }),
      prisma.marks.findMany({
        where: { ...baseWhere, exam: { year: startYear } },
        select: { percentage: true },
      }),
      prisma.salaryPayments.findMany({
        where: baseWhere,
        select: { totalAmount: true, userId: true, month: true, createdAt: true },
      }),
      prisma.exam.count({ where: examWhere }),
      prisma.user.count({
        where: {
          ...baseWhere,
          role: { name: "STUDENT" },
          userType: "SCHOOL",
        },
      }),
    ]);

  const salaryRows = salaryRowsAll.filter((p) => salaryPaymentInDateRange(p, start, end));

  const presentCount = attendanceRows.filter((a) => a.status === "PRESENT").length;
  const attendanceRate =
    attendanceRows.length > 0
      ? Number(((presentCount / attendanceRows.length) * 100).toFixed(2))
      : 0;

  const totalFeeAmount = feeRows.reduce((s, f) => s + Number(f.amount || 0), 0);
  const paidFeeAmount = feeRows
    .filter((f) => f.paymentStatus === "PAID")
    .reduce((s, f) => s + Number(f.paidAmount != null ? f.paidAmount : f.amount || 0), 0);
  const pendingFeeAmount = feeRows
    .filter((f) => f.paymentStatus === "PENDING")
    .reduce((s, f) => s + Number(f.amount || 0), 0);
  const collectionRate = totalFeeAmount > 0 ? Number(((paidFeeAmount / totalFeeAmount) * 100).toFixed(2)) : 0;

  const avgScore =
    marksRows.length > 0
      ? Number(
          (marksRows.reduce((s, m) => s + Number(m.percentage || 0), 0) / marksRows.length).toFixed(2),
        )
      : 0;
  const passCount = marksRows.filter((m) => Number(m.percentage || 0) >= 40).length;
  const passRate = marksRows.length > 0 ? Number(((passCount / marksRows.length) * 100).toFixed(2)) : 0;

  const totalSalaryPaid = salaryRows.reduce((s, p) => s + Number(p.totalAmount || 0), 0);
  const salaryEmployees = new Set(salaryRows.map((p) => p.userId)).size;

  return {
    academicYear: label,
    attendance: {
      totalStudents: totalEnrolledStudents,
      averageRate: attendanceRate,
      periodLabel: label,
    },
    fees: {
      totalRevenue: totalFeeAmount,
      totalPending: pendingFeeAmount,
      collectionRate,
    },
    academic: {
      totalExams: examCount,
      averageScore: avgScore,
      passRate,
    },
    salary: {
      totalPaid: totalSalaryPaid,
      totalEmployees: salaryEmployees,
    },
  };
};

const reportsService = {
  getAttendanceReports,
  getFeeAnalytics,
  getAcademicReports,
  getSalaryReports,
  getDashboardSummary,
};

export default reportsService;

