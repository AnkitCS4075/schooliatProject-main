/**
 * Reports & Analytics – shared types
 * Used across hooks, components, and export utilities.
 */

export type ReportDatePreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "custom";

export interface ReportDateRange {
  startDate: string; // yyyy-MM-dd
  endDate: string;
  preset?: ReportDatePreset;
}

export interface ReportFilters {
  dateRange: ReportDateRange;
  classId: string | null;
  examId: string | null;
  compareWithPrevious: boolean;
}

// Attendance
export interface AttendanceReportItem {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  studentId: string;
  student?: { firstName?: string; lastName?: string; studentProfile?: { class?: { grade?: string; division?: string } } };
}

export interface AttendanceStatistics {
  totalDays: number;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
  averageAttendance: number;
  totalPresent: number;
  totalAbsent: number;
}

// Fees
export interface FeeInstallmentItem {
  id: string;
  amount: number;
  paidAmount?: number;
  paymentStatus: string;
  dueDate?: string;
  createdAt: string;
}

export interface FeeStatistics {
  totalAmount: number;
  totalRevenue: number;
  paidAmount: number;
  totalPaid: number;
  pendingAmount: number;
  totalPending: number;
  collectionRate: number;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  /** Ledger: cancelled installment rows (Phase 2 fee analytics). */
  cancelledInstallments?: number;
  cancelledAmountGross?: number;
}

// Academic
export interface MarksItem {
  id: string;
  percentage: number;
  totalMarks?: number;
  marksObtained?: number;
  maxMarks?: number;
  studentId: string;
  subjectId: string;
  examId: string;
  student?: { firstName?: string; lastName?: string };
  exam?: { name?: string; type?: string };
  subject?: { name?: string };
}

export interface AcademicStatistics {
  totalStudents: number;
  totalMarks: number;
  averagePercentage: number;
  averageScore: number;
  passCount: number;
  failCount: number;
  passRate: number;
  topPerformers: number;
}

// Salary
export interface SalaryPaymentItem {
  id: string;
  userId: string;
  employeeName?: string;
  amount: number;
  totalAmount?: number;
  paymentDate?: string;
  month?: string;
}

export interface SalaryStatistics {
  totalSalary: number;
  totalPaid: number;
  totalEmployees: number;
  totalPayments: number;
  averageSalary: number;
  pendingPayments: number;
}

// Dashboard summary (overview KPIs — scoped to selected academic year on backend)
export interface DashboardSummary {
  academicYear?: string;
  attendance: { totalStudents: number; averageRate: number; periodLabel: string };
  fees: { totalRevenue: number; totalPending: number; collectionRate: number };
  academic: { totalExams: number; averageScore: number; passRate: number };
  salary: { totalPaid: number; totalEmployees: number };
}

// Chart data shapes (for Recharts)
export interface AttendanceChartPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface FeeChartPoint {
  period: string;
  paid: number;
  pending: number;
  cancelled: number;
  amount: number;
}

export interface DistributionSlice {
  name: string;
  value: number;
  color?: string;
}
