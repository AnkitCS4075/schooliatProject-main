import { Router } from "express";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import reportsService from "../services/reports.service.js";

const router = Router();

// Get dashboard summary (overview KPIs for reports page)
router.get(
  "/dashboard-summary",
  withPermission(Permission.GET_ATTENDANCE_REPORTS), // reuse a reports permission
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const summary = await reportsService.getDashboardSummary(
        currentUser.schoolId || req.query.schoolId,
        { academicYear: req.query.academicYear },
      );
      return res.status(200).json({
        message: "Dashboard summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch dashboard summary",
      });
    }
  }
);

// Get attendance reports
router.get(
  "/attendance",
  withPermission(Permission.GET_ATTENDANCE_REPORTS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const report = await reportsService.getAttendanceReports(currentUser.schoolId || query.schoolId, {
        classId: query.classId,
        studentId: query.studentId,
        startDate: query.startDate,
        endDate: query.endDate,
        markedBy: query.markedBy,
      });

      return res.status(200).json({
        message: "Attendance report fetched successfully",
        data: report.attendance,
        statistics: report.statistics,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch attendance report",
      });
    }
  },
);

// Get fee analytics
router.get(
  "/fees",
  withPermission(Permission.GET_FEE_ANALYTICS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const analytics = await reportsService.getFeeAnalytics(currentUser.schoolId || query.schoolId, {
        classId: query.classId,
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return res.status(200).json({
        message: "Fee analytics fetched successfully",
        data: analytics.installments,
        statistics: analytics.statistics,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch fee analytics",
      });
    }
  },
);

// Get academic performance reports
router.get(
  "/academic",
  withPermission(Permission.GET_ACADEMIC_REPORTS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const report = await reportsService.getAcademicReports(currentUser.schoolId || query.schoolId, {
        classId: query.classId,
        examId: query.examId,
        subjectId: query.subjectId,
        studentId: query.studentId,
      });

      return res.status(200).json({
        message: "Academic report fetched successfully",
        data: report.marks,
        statistics: report.statistics,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch academic report",
      });
    }
  },
);

// Get salary reports
router.get(
  "/salary",
  withPermission(Permission.GET_SALARY_REPORTS),
  async (req, res) => {
    try {
      const query = req.query;
      const currentUser = req.context.user;

      const report = await reportsService.getSalaryReports(currentUser.schoolId || query.schoolId, {
        startDate: query.startDate,
        endDate: query.endDate,
      });

      return res.status(200).json({
        message: "Salary report fetched successfully",
        data: report.payments,
        statistics: report.statistics,
      });
    } catch (error) {
      return res.status(400).json({
        message: error.message || "Failed to fetch salary report",
      });
    }
  },
);

export default router;

