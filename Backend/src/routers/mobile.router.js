import { Router } from "express";
import attendanceService from "../services/attendance.service.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import { Permission } from "../prisma/generated/index.js";
import prisma from "../prisma/client.js";

const router = Router();

function monthRange(month) {
  const [yearStr, monthStr] = String(month).split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

// Compatibility endpoint used by older mobile clients:
// GET /mobile/student/attendance?month=YYYY-MM
router.get("/student/attendance", async (req, res) => {
  const currentUser = req.context.user;
  if (!currentUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Students can fetch their own attendance; parents can pass childId.
  const childId = req.query.childId ? String(req.query.childId) : null;
  const studentId = currentUser.role?.name === "PARENT" && childId ? childId : currentUser.id;
  const month = req.query.month ? String(req.query.month) : null;

  let startDate;
  let endDate;
  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Invalid month format. Use YYYY-MM",
      });
    }
    const r = monthRange(month);
    startDate = r.start;
    endDate = r.end;
  } else {
    startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    endDate = req.query.endDate ? new Date(String(req.query.endDate)) : new Date();
  }

  const attendance = await attendanceService.getStudentAttendance(studentId, startDate, endDate);
  return res.json({
    message: "Attendance retrieved successfully",
    data: attendance,
    meta: {
      studentId,
      month: month || null,
      startDate,
      endDate,
      count: Array.isArray(attendance) ? attendance.length : 0,
    },
  });
});

// Compatibility endpoint used by older mobile clients to save all attendance at once:
// POST /mobile/student/attendance
// Accepts either:
// 1) { request: { attendances: [...] } }  OR { attendances: [...] }
// 2) single record { request: { studentId, classId, date, status, ... } }
router.post(
  "/student/attendance",
  withPermission([Permission.MARK_ATTENDANCE]),
  async (req, res) => {
    const currentUser = req.context.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const requestBody = req.body?.request ?? req.body ?? {};
    const fromArray =
      requestBody.attendances ??
      requestBody.attendance ??
      req.body?.attendances ??
      req.body?.attendance;

    let rawRows = [];
    if (Array.isArray(fromArray)) {
      rawRows = fromArray;
    } else if (requestBody.studentId && requestBody.classId && requestBody.date && requestBody.status) {
      rawRows = [requestBody];
    }

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      return res.status(400).json({
        message:
          "Invalid payload. Send { request: { attendances: [...] } } or a single attendance record.",
      });
    }

    const attendanceData = rawRows
      .filter((r) => r?.studentId && r?.classId && r?.date && r?.status)
      .map((r) => ({
        studentId: String(r.studentId),
        classId: String(r.classId),
        date: new Date(r.date),
        status: r.status,
        periodId: r.periodId ?? null,
        lateArrivalTime: r.lateArrivalTime ?? null,
        absenceReason: r.absenceReason ?? null,
        schoolId: currentUser.schoolId,
        markedBy: currentUser.id,
      }));

    if (attendanceData.length === 0) {
      return res.status(400).json({
        message: "No valid attendance rows found in request.",
      });
    }

    const result = await attendanceService.markBulkAttendance(attendanceData, currentUser.id);
    return res.json({
      message: "Bulk attendance saved successfully",
      data: {
        created: result.created,
        updated: result.updated,
        errors: result.errors,
      },
    });
  },
);

// Compatibility endpoint used by mobile teacher app:
// GET /mobile/teacher/students?grouped=true
router.get(
  "/teacher/students",
  withPermission([Permission.GET_STUDENTS]),
  async (req, res) => {
    const currentUser = req.context.user;
    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const grouped = String(req.query.grouped ?? "false").toLowerCase() === "true";

    // Class IDs come from Timetable.classId (slots link to timetable, not directly to class).
    const teacherSlots = await prisma.timetableSlot.findMany({
      where: {
        teacherId: currentUser.id,
        deletedAt: null,
        timetable: {
          schoolId: currentUser.schoolId,
          deletedAt: null,
          classId: { not: null },
          class: { deletedAt: null },
        },
      },
      select: {
        timetable: { select: { classId: true } },
      },
    });

    const classIds = [
      ...new Set(teacherSlots.map((s) => s.timetable?.classId).filter(Boolean)),
    ];
    if (classIds.length === 0) {
      return res.json({
        message: "No assigned classes found for teacher",
        data: grouped ? [] : [],
      });
    }

    const students = await prisma.user.findMany({
      where: {
        schoolId: currentUser.schoolId,
        deletedAt: null,
        studentProfile: {
          classId: { in: classIds },
          deletedAt: null,
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        publicUserId: true,
        studentProfile: {
          select: {
            rollNumber: true,
            class: {
              select: {
                id: true,
                grade: true,
                division: true,
              },
            },
          },
        },
      },
      orderBy: [
        { studentProfile: { class: { grade: "asc" } } },
        { studentProfile: { class: { division: "asc" } } },
        { studentProfile: { rollNumber: "asc" } },
      ],
    });

    const flat = students.map((s) => ({
      id: s.id,
      studentId: s.id,
      publicUserId: s.publicUserId,
      firstName: s.firstName,
      lastName: s.lastName,
      name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
      rollNumber: s.studentProfile?.rollNumber ?? null,
      classId: s.studentProfile?.class?.id ?? null,
      className: s.studentProfile?.class
        ? `${s.studentProfile.class.grade}${s.studentProfile.class.division ? `-${s.studentProfile.class.division}` : ""}`
        : null,
      grade: s.studentProfile?.class?.grade ?? null,
      division: s.studentProfile?.class?.division ?? null,
    }));

    if (!grouped) {
      return res.json({
        message: "Teacher students retrieved successfully",
        data: flat,
      });
    }

    const groupsMap = new Map();
    flat.forEach((st) => {
      const key = st.classId || "unknown";
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          classId: st.classId,
          className: st.className || "Unknown class",
          grade: st.grade,
          division: st.division,
          students: [],
        });
      }
      groupsMap.get(key).students.push(st);
    });

    const groupedData = Array.from(groupsMap.values());
    return res.json({
      message: "Teacher students retrieved successfully",
      data: groupedData,
    });
  },
);

export default router;
