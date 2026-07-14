import { Router } from "express";
import prisma from "../prisma/client.js";
import csvUtil from "../utils/csv.util.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import validateRequest from "../middlewares/validate-request.middleware.js";
import markAttendanceSchema from "../schemas/attendance/mark-attendance.schema.js";
import markBulkAttendanceSchema from "../schemas/attendance/mark-bulk-attendance.schema.js";
import getAttendanceSchema from "../schemas/attendance/get-attendance.schema.js";
import getAttendanceReportSchema from "../schemas/attendance/get-attendance-report.schema.js";
import { createAttendancePeriodSchema, getAttendancePeriodsSchema } from "../schemas/attendance/attendance-period.schema.js";
import attendanceService from "../services/attendance.service.js";
import logger from "../config/logger.js";

const router = Router();

// Mark daily attendance
router.post(
  "/mark",
  withPermission([Permission.MARK_ATTENDANCE]),
  validateRequest(markAttendanceSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { studentId, classId, date, status, periodId, lateArrivalTime, absenceReason } = req.body.request;

      if (currentUser.role.name === "TEACHER") {
        // TODO: class-teacher relationship check
      }

      const attendance = await attendanceService.markAttendance({
        studentId,
        classId,
        date: new Date(date),
        status,
        periodId: periodId || null,
        lateArrivalTime: lateArrivalTime ?? null,
        absenceReason: absenceReason || null,
        markedBy: currentUser.id,
        schoolId: currentUser.schoolId,
      });

      return res.json({
        message: "Attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      logger.error({ err: error }, "mark attendance failed");
      return res.status(400).json({
        message: error?.message || "Failed to mark attendance",
      });
    }
  },
);

// Mark bulk attendance
router.post(
  "/mark-bulk",
  withPermission([Permission.MARK_ATTENDANCE]),
  validateRequest(markBulkAttendanceSchema),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { attendances } = req.body.request;

      const attendanceData = attendances.map((att) => ({
        studentId: att.studentId,
        classId: att.classId,
        date: new Date(att.date),
        status: att.status,
        periodId: att.periodId ?? null,
        lateArrivalTime: att.lateArrivalTime ?? null,
        absenceReason: att.absenceReason ?? null,
        schoolId: currentUser.schoolId,
        markedBy: currentUser.id,
      }));

      const result = await attendanceService.markBulkAttendance(attendanceData, currentUser.id);

      return res.json({
        message: "Bulk attendance marked successfully",
        data: {
          created: result.created,
          updated: result.updated,
          errors: result.errors,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "mark bulk attendance failed");
      return res.status(400).json({
        message: error?.message || "Failed to mark bulk attendance",
      });
    }
  },
);

// Get attendance
router.get(
  "/",
  withPermission([Permission.GET_ATTENDANCE]),
  validateRequest(getAttendanceSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, classId, startDate, endDate, date, page, limit, periodId } = req.query;

    // Role-based access control
    if (currentUser.role.name === "STUDENT") {
      // Students can only see their own attendance
      const attendance = await attendanceService.getStudentAttendance(
        currentUser.id,
        startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate ? new Date(endDate) : new Date(),
      );

      return res.json({
        message: "Attendance retrieved successfully",
        data: attendance,
      });
    }

    if (currentUser.role.name === "PARENT") {
      // Parents can see their children's attendance
      // Get linked children
      const parentLinks = await prisma.parentChildLink.findMany({
        where: {
          parentId: currentUser.id,
          deletedAt: null,
        },
        select: {
          childId: true,
        },
      });

      const childIds = parentLinks.map((link) => link.childId);
      if (childIds.length === 0) {
        return res.json({
          message: "No children linked to this account",
          data: [],
        });
      }

      const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
      const end = endDate ? new Date(endDate) : new Date();

      const allAttendance = await Promise.all(
        childIds.map((childId) =>
          attendanceService.getStudentAttendance(childId, start, end),
        ),
      );

      return res.json({
        message: "Attendance retrieved successfully",
        data: allAttendance.flat(),
      });
    }

    // For teachers and admins
    if (date && classId) {
      const periodFilter =
        periodId && periodId !== "all" ? periodId : null;
      const attendance = await attendanceService.getClassAttendance(
        classId,
        new Date(date),
        periodFilter,
      );

      return res.json({
        message: "Class attendance retrieved successfully",
        data: attendance,
      });
    }

    if (studentId) {
      // Get student attendance
      const attendance = await attendanceService.getStudentAttendance(
        studentId,
        startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate ? new Date(endDate) : new Date(),
      );

      return res.json({
        message: "Student attendance retrieved successfully",
        data: attendance,
      });
    }

    // Default: return empty if no specific query
    res.json({
      message: "Please specify studentId, classId with date, or use report endpoint",
      data: [],
    });
  },
);

// Get attendance statistics
router.get(
  "/statistics",
  withPermission([Permission.GET_ATTENDANCE]),
  validateRequest(getAttendanceSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, classId, startDate, endDate, periodId } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // Role-based access
    let finalStudentId = studentId;
    let finalClassId = classId;
    let finalSchoolId = currentUser.schoolId;

    if (currentUser.role.name === "STUDENT") {
      finalStudentId = currentUser.id;
    } else if (currentUser.role.name === "PARENT") {
      // Get first child for parent (or allow parent to specify)
      if (!finalStudentId) {
        const parentLink = await prisma.parentChildLink.findFirst({
          where: {
            parentId: currentUser.id,
            deletedAt: null,
          },
        });
        if (parentLink) {
          finalStudentId = parentLink.childId;
        }
      }
    }

    const statistics = await attendanceService.getAttendanceStatistics(
      finalStudentId,
      finalClassId,
      finalSchoolId,
      start,
      end,
      periodId || null,
    );

    res.json({
      message: "Attendance statistics retrieved successfully",
      data: statistics,
    });
  },
);

// Get attendance report
router.get(
  "/report",
  withPermission([Permission.EXPORT_ATTENDANCE]),
  validateRequest(getAttendanceReportSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { studentId, classId, schoolId, startDate, endDate, status, format, markedBy } = req.query;

    const filters = {
      studentId: studentId || (currentUser.role.name === "STUDENT" ? currentUser.id : null),
      classId,
      schoolId: schoolId || currentUser.schoolId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      markedBy: markedBy || undefined,
    };

    let reportData = await attendanceService.getAttendanceReport(filters);

    // Sort by roll number then date for consistent report ordering
    reportData = reportData.sort((a, b) => {
      const rollA = Number(a.student?.studentProfile?.rollNumber ?? 99999) || 99999;
      const rollB = Number(b.student?.studentProfile?.rollNumber ?? 99999) || 99999;
      if (rollA !== rollB) return rollA - rollB;
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    if (format === "csv" || format === "excel") {
      const headers = [
        { label: "Roll Number", key: "rollNumber" },
        { label: "Date", key: "date" },
        { label: "Student Name", key: "firstName" },
        { label: "Class", key: "className" },
        { label: "Period", key: "periodName" },
        { label: "Status", key: "status" },
        { label: "Late Time", key: "lateArrivalTime" },
        { label: "Reason", key: "absenceReason" },
        { label: "Recorded by", key: "markedBy" },
      ];

      // Flatten the data for CSV
      const flattenedData = reportData.map(record => ({
        date: record.date ? new Date(record.date).toLocaleDateString() : "N/A",
        firstName: record.student ? `${record.student.firstName} ${record.student.lastName || ""}` : "N/A",
        rollNumber: record.student?.studentProfile?.rollNumber || "N/A",
        className: record.class ? `${record.class.grade}${record.class.division ? `-${record.class.division}` : ""}` : "N/A",
        periodName: record.period?.name || "Daily",
        status: record.status || "N/A",
        lateArrivalTime: record.lateArrivalTime ? new Date(record.lateArrivalTime).toLocaleTimeString() : "N/A",
        absenceReason: record.absenceReason || "N/A",
        markedBy: record.markedByUser
          ? `${record.markedByUser.firstName} ${record.markedByUser.lastName || ""} (${record.markedByUser.publicUserId})`
          : "N/A",
      }));

      const csv = csvUtil.generateCSV(flattenedData, headers);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }

    return res.json({
      message: "Attendance report retrieved successfully",
      data: reportData,
    });
  },
);

// Create attendance period
router.post(
  "/periods",
  withPermission([Permission.MARK_ATTENDANCE]),
  validateRequest(createAttendancePeriodSchema),
  async (req, res) => {
    const currentUser = req.context.user;
    const { name, startTime, endTime } = req.body.request;

    // Validate time range
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        errorCode: "INVALID_TIME_RANGE",
        message: "End time must be after start time",
      });
    }

    const period = await prisma.attendancePeriod.create({
      data: {
        name,
        startTime,
        endTime,
        schoolId: currentUser.schoolId,
        createdBy: currentUser.id,
      },
    });

    res.json({
      message: "Attendance period created successfully",
      data: period,
    });
  },
);

// Get attendance periods
router.get(
  "/periods",
  withPermission([Permission.GET_ATTENDANCE]),
  validateRequest(getAttendancePeriodsSchema),
  async (req, res) => {
    const currentUser = req.context.user;

    const periods = await prisma.attendancePeriod.findMany({
      where: {
        schoolId: currentUser.schoolId,
        deletedAt: null,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    res.json({
      message: "Attendance periods retrieved successfully",
      data: periods,
    });
  },
);

// Staff self-attendance with geo-fencing
router.post(
  "/self-mark",
  withPermission([Permission.MARK_ATTENDANCE]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const { latitude, longitude, accuracy, status: attStatus } = req.body.request || {};

      if (!["TEACHER", "STAFF"].includes(currentUser.role.name)) {
        return res.status(403).json({ message: "Only staff and teachers can use self-attendance" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if already marked today
      const existing = await prisma.attendance.findFirst({
        where: {
          studentId: currentUser.id,
          date: today,
          deletedAt: null,
        },
      });

      if (existing) {
        return res.status(400).json({ message: "Attendance already marked for today" });
      }

      // Get school geofence settings
      const settings = await prisma.settings.findFirst({
        where: { schoolId: currentUser.schoolId, deletedAt: null },
      });

      let isWithinGeofence = true;
      if (settings?.geoFenceEnabled && settings.geoFenceLatitude && settings.geoFenceLongitude && latitude && longitude) {
        const R = 6371e3;
        const phi1 = (latitude * Math.PI) / 180;
        const phi2 = (settings.geoFenceLatitude * Math.PI) / 180;
        const deltaPhi = ((settings.geoFenceLatitude - latitude) * Math.PI) / 180;
        const deltaLambda = ((settings.geoFenceLongitude - longitude) * Math.PI) / 180;
        const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        isWithinGeofence = distance <= (settings.geoFenceRadiusMeters || 200);
      }

      // Find any class to link attendance (staff don't belong to a class, use a default or skip)
      // For staff attendance, we need a classId — use the first class of the school
      const defaultClass = await prisma.class.findFirst({
        where: { schoolId: currentUser.schoolId, deletedAt: null },
      });

      if (!defaultClass) {
        return res.status(400).json({ message: "No class configured in school" });
      }

      const attendance = await attendanceService.markAttendance({
        studentId: currentUser.id,
        classId: defaultClass.id,
        date: today,
        status: attStatus || "PRESENT",
        periodId: null,
        lateArrivalTime: null,
        absenceReason: null,
        markedBy: currentUser.id,
        schoolId: currentUser.schoolId,
        latitude: latitude || null,
        longitude: longitude || null,
        accuracy: accuracy || null,
        isWithinGeofence,
      });

      return res.json({
        message: isWithinGeofence ? "Attendance marked successfully" : "Attendance marked (outside geofence)",
        data: { ...attendance, isWithinGeofence },
      });
    } catch (error) {
      logger.error({ err: error }, "self-mark attendance failed");
      return res.status(400).json({
        message: error?.message || "Failed to mark attendance",
      });
    }
  }
);

// Get geofence config for current school
router.get(
  "/geofence",
  withPermission([Permission.GET_ATTENDANCE]),
  async (req, res) => {
    try {
      const currentUser = req.context.user;
      const settings = await prisma.settings.findFirst({
        where: { schoolId: currentUser.schoolId, deletedAt: null },
        select: {
          geoFenceLatitude: true,
          geoFenceLongitude: true,
          geoFenceRadiusMeters: true,
          geoFenceEnabled: true,
        },
      });

      return res.json({
        message: "Geofence config retrieved",
        data: settings || { geoFenceEnabled: false },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message || "Failed to get geofence config" });
    }
  }
);

export default router;

