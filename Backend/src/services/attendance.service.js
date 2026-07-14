import prisma from "../prisma/client.js";
import { AttendanceStatus } from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import emailService from "./email.service.js";
import notificationService from "./notification.service.js";
import {
  getLocalDayBounds,
  resolveLateArrivalDateTime,
  assertAttendanceDateEditable,
} from "../utils/attendance-date.util.js";

/**
 * Mark daily attendance for a student
 * @param {Object} data - Attendance data
 * @param {string} data.studentId - Student user ID
 * @param {string} data.classId - Class ID
 * @param {Date} data.date - Attendance date
 * @param {string} data.status - Attendance status (PRESENT, ABSENT, LATE, HALF_DAY)
 * @param {string} data.periodId - Period ID (optional, for period-wise attendance)
 * @param {Date} data.lateArrivalTime - Late arrival time (optional)
 * @param {string} data.absenceReason - Absence reason (optional)
 * @param {string} data.markedBy - User ID who marked the attendance
 * @param {string} data.schoolId - School ID
 * @returns {Promise<Object>} - Created attendance record
 */
const markAttendance = async (data) => {
  const {
    studentId,
    classId,
    date,
    status,
    periodId = null,
    lateArrivalTime = null,
    absenceReason = null,
    markedBy,
    schoolId,
    latitude = null,
    longitude = null,
    accuracy = null,
    isWithinGeofence = true,
  } = data;

  const attendanceDate = new Date(date);
  assertAttendanceDateEditable(attendanceDate);
  const resolvedLate = resolveLateArrivalDateTime(attendanceDate, lateArrivalTime);
  const { start: startOfDay, end: endOfDay } = getLocalDayBounds(attendanceDate);

  // Check if attendance already exists for this student, class, date, and period
  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      studentId,
      classId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      periodId: periodId || null,
      deletedAt: null,
    },
  });

  let attendance;
  if (existingAttendance) {
    // Update existing attendance
    attendance = await prisma.attendance.update({
      where: { id: existingAttendance.id },
      data: {
        status,
        lateArrivalTime: resolvedLate,
        absenceReason,
        markedBy,
        updatedBy: markedBy,
        latitude,
        longitude,
        accuracy,
        isWithinGeofence,
      },
    });
  } else {
    // Create new attendance
    attendance = await prisma.attendance.create({
      data: {
        studentId,
        classId,
        date: attendanceDate,
        status,
        periodId,
        lateArrivalTime: resolvedLate,
        absenceReason,
        markedBy,
        schoolId,
        createdBy: markedBy,
        latitude,
        longitude,
        accuracy,
        isWithinGeofence,
      },
    });
  }

  // Send email alert to parent if student is absent
  if (status === AttendanceStatus.ABSENT) {
    try {
      await sendAbsenceAlert(studentId, date, absenceReason);
    } catch (error) {
      logger.error({ error, studentId, date }, "Failed to send absence alert");
    }
  }

  return attendance;
};

/**
 * Mark bulk attendance for multiple students
 * @param {Array} attendanceData - Array of attendance records
 * @param {string} markedBy - User ID who marked the attendance
 * @returns {Promise<Object>} - Result with created/updated counts
 */
const markBulkAttendance = async (attendanceData, markedBy) => {
  const results = {
    created: 0,
    updated: 0,
    errors: [],
  };

  // Process in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < attendanceData.length; i += batchSize) {
    const batch = attendanceData.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (data) => {
        try {
          assertAttendanceDateEditable(data.date);
          const { start: dayStart, end: dayEnd } = getLocalDayBounds(data.date);
          const existing = await prisma.attendance.findFirst({
            where: {
              studentId: data.studentId,
              classId: data.classId,
              date: {
                gte: dayStart,
                lte: dayEnd,
              },
              periodId: data.periodId ?? null,
              deletedAt: null,
            },
          });

          const rowDate = new Date(data.date);
          const resolvedLateBulk = resolveLateArrivalDateTime(rowDate, data.lateArrivalTime);

          if (existing) {
            await prisma.attendance.update({
              where: { id: existing.id },
              data: {
                status: data.status,
                lateArrivalTime: resolvedLateBulk,
                absenceReason: data.absenceReason ?? null,
                markedBy,
                updatedBy: markedBy,
              },
            });
            results.updated++;
          } else {
            await prisma.attendance.create({
              data: {
                studentId: data.studentId,
                classId: data.classId,
                date: rowDate,
                status: data.status,
                periodId: data.periodId ?? null,
                lateArrivalTime: resolvedLateBulk,
                absenceReason: data.absenceReason ?? null,
                schoolId: data.schoolId,
                markedBy,
                createdBy: markedBy,
              },
            });
            results.created++;
          }

          // Send absence alerts
          if (data.status === AttendanceStatus.ABSENT) {
            try {
              await sendAbsenceAlert(data.studentId, data.date, data.absenceReason);
            } catch (error) {
              logger.error({ error, studentId: data.studentId }, "Failed to send absence alert");
            }
          }
        } catch (error) {
          results.errors.push({
            studentId: data.studentId,
            error: error.message,
          });
        }
      }),
    );
  }

  return results;
};

/**
 * Get student attendance
 * @param {string} studentId - Student user ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} - Attendance records
 */
const getStudentAttendance = async (studentId, startDate, endDate) => {
  return await prisma.attendance.findMany({
    where: {
      studentId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      deletedAt: null,
    },
    include: {
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
      period: {
        select: {
          id: true,
          name: true,
        },
      },
      markedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
};

/**
 * Get class attendance for a specific date
 * @param {string} classId - Class ID
 * @param {Date} date - Attendance date
 * @returns {Promise<Array>} - Attendance records
 */
const getClassAttendance = async (classId, date, periodId = null) => {
  const { start: startOfDay, end: endOfDay } = getLocalDayBounds(date);

  const where = {
    classId,
    date: {
      gte: startOfDay,
      lte: endOfDay,
    },
    deletedAt: null,
  };

  if (periodId) {
    where.periodId = periodId;
  }

  return await prisma.attendance.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentProfile: {
            select: {
              rollNumber: true,
            },
          },
        },
      },
      period: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      student: {
        studentProfile: {
          rollNumber: "asc",
        },
      },
    },
  });
};

/**
 * Get attendance statistics
 * @param {string} studentId - Student user ID (optional)
 * @param {string} classId - Class ID (optional)
 * @param {string} schoolId - School ID (optional)
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} - Attendance statistics
 */
const getAttendanceStatistics = async (studentId, classId, schoolId, startDate, endDate, periodId = null) => {
  const where = {
    date: {
      gte: startDate,
      lte: endDate,
    },
    deletedAt: null,
  };

  if (studentId) where.studentId = studentId;
  if (classId) where.classId = classId;
  if (schoolId) where.schoolId = schoolId;
  if (periodId && periodId !== "all") where.periodId = periodId;

  const [total, present, absent, late, halfDay] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.count({
      where: { ...where, status: AttendanceStatus.PRESENT },
    }),
    prisma.attendance.count({
      where: { ...where, status: AttendanceStatus.ABSENT },
    }),
    prisma.attendance.count({
      where: { ...where, status: AttendanceStatus.LATE },
    }),
    prisma.attendance.count({
      where: { ...where, status: AttendanceStatus.HALF_DAY },
    }),
  ]);

  const attendancePercentage = total > 0 ? (present / total) * 100 : 0;

  return {
    total,
    present,
    absent,
    late,
    halfDay,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100,
  };
};

/**
 * Send absence alert to parent
 * @param {string} studentId - Student user ID
 * @param {Date} date - Absence date
 * @param {string} reason - Absence reason
 */
const sendAbsenceAlert = async (studentId, date, reason) => {
  // Get student with parent information
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentProfile: {
        include: {
          class: {
            select: {
              grade: true,
              division: true,
            },
          },
        },
      },
      childLinks: {
        include: {
          parent: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!student || !student.studentProfile) {
    return;
  }

  // Send email to all linked parents
  const parents = student.childLinks.map((link) => link.parent);
  const studentName = `${student.firstName} ${student.lastName || ""}`.trim();
  const className = `${student.studentProfile.class.grade}${student.studentProfile.class.division || ""}`;

  for (const parent of parents) {
    if (parent.email) {
      try {
        await emailService.sendEmail({
          to: parent.email,
          subject: `Absence Alert - ${studentName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Absence Alert - SchooliAt</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6f8f3e;">Absence Alert</h2>
                <p>Dear ${parent.firstName},</p>
                <p>This is to inform you that your child <strong>${studentName}</strong> (Class: ${className}) was marked as <strong>ABSENT</strong> on ${new Date(date).toLocaleDateString()}.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
                <p>If you have any concerns, please contact the school administration.</p>
                <hr>
                <p style="color: #999; font-size: 12px;">This is an automated message from SchooliAt.</p>
              </div>
            </body>
            </html>
          `,
        });

        // Also create a notification
        await notificationService.createNotification({
          userId: parent.id,
          title: "Absence Alert",
          content: `${studentName} was marked absent on ${new Date(date).toLocaleDateString()}.`,
          type: "ATTENDANCE",
          schoolId: student.schoolId,
        });
      } catch (error) {
        logger.error({ error, parentId: parent.id, studentId }, "Failed to send absence alert to parent");
      }
    }
  }
};

/**
 * Get attendance report data
 * @param {Object} filters - Report filters
 * @returns {Promise<Array>} - Attendance report data
 */
const getAttendanceReport = async (filters) => {
  const {
    studentId,
    classId,
    schoolId,
    startDate,
    endDate,
    status,
    markedBy,
  } = filters;

  const where = {
    deletedAt: null,
  };

  if (studentId) where.studentId = studentId;
  if (classId) where.classId = classId;
  if (schoolId) where.schoolId = schoolId;
  if (status) where.status = status;
  if (markedBy) where.markedBy = markedBy;
  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  return await prisma.attendance.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentProfile: {
            select: {
              rollNumber: true,
            },
          },
        },
      },
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
      period: {
        select: {
          id: true,
          name: true,
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
    orderBy: [
      { date: "desc" },
      { student: { studentProfile: { rollNumber: "asc" } } },
    ],
  });
};

const attendanceService = {
  markAttendance,
  markBulkAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStatistics,
  getAttendanceReport,
  sendAbsenceAlert,
};

export default attendanceService;

