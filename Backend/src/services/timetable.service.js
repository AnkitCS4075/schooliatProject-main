import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

/**
 * Create a new timetable
 * @param {Object} data - Timetable data
 * @param {string} data.name - Timetable name
 * @param {string} data.classId - Class ID (optional for school-wide timetable)
 * @param {string} data.schoolId - School ID
 * @param {Date} data.effectiveFrom - Effective from date
 * @param {Date} data.effectiveTill - Effective till date (optional)
 * @param {Array} data.slots - Array of timetable slots
 * @param {string} data.createdBy - User ID creating the timetable
 * @returns {Promise<Object>} - Created timetable with slots
 */
const createTimetable = async (data) => {
  const {
    name,
    classId,
    schoolId,
    effectiveFrom,
    effectiveTill,
    slots,
    createdBy,
  } = data;

  // Validate slots
  if (!slots || slots.length === 0) {
    throw new Error("Timetable must have at least one slot");
  }

  // Check for conflicts before creating
  const conflicts = await detectConflicts(slots, schoolId, classId, null);
  if (conflicts.length > 0) {
    throw new Error(`Conflicts detected: ${conflicts.map((c) => c.message).join(", ")}`);
  }

  // Deactivate existing timetables for the same class if this is active
  if (classId) {
    await prisma.timetable.updateMany({
      where: {
        classId,
        isActive: true,
        deletedAt: null,
      },
      data: {
        isActive: false,
      },
    });
  }

  // Create timetable with slots in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const timetable = await tx.timetable.create({
      data: {
        name,
        classId: classId || null,
        schoolId,
        effectiveFrom: new Date(effectiveFrom),
        effectiveTill: effectiveTill ? new Date(effectiveTill) : null,
        isActive: true,
        createdBy,
      },
    });

    // Create slots
    const slotData = slots.map((slot) => ({
      timetableId: timetable.id,
      dayOfWeek: slot.dayOfWeek,
      periodNumber: slot.periodNumber,
      subjectId: slot.subjectId,
      teacherId: slot.teacherId,
      room: slot.room || null,
      startTime: slot.startTime,
      endTime: slot.endTime,
      createdBy,
    }));

    await tx.timetableSlot.createMany({
      data: slotData,
    });

    // Fetch created timetable with slots
    const createdTimetable = await tx.timetable.findUnique({
      where: { id: timetable.id },
      include: {
        slots: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
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
        class: {
          select: {
            id: true,
            grade: true,
            division: true,
          },
        },
      },
    });

    return createdTimetable;
  });

  // Send notifications about timetable change
  await notifyTimetableChange(result, createdBy);

  return result;
};

/**
 * Update timetable
 * @param {string} timetableId - Timetable ID
 * @param {Object} data - Update data
 * @param {string} data.updatedBy - User ID updating
 * @returns {Promise<Object>} - Updated timetable
 */
const updateTimetable = async (timetableId, data) => {
  const { updatedBy, ...updateData } = data;

  // If slots are being updated, check for conflicts
  if (updateData.slots) {
    const timetable = await prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    const conflicts = await detectConflicts(
      updateData.slots,
      timetable.schoolId,
      timetable.classId,
      timetableId,
    );

    if (conflicts.length > 0) {
      throw new Error(`Conflicts detected: ${conflicts.map((c) => c.message).join(", ")}`);
    }

    // Delete existing slots and create new ones
    await prisma.$transaction(async (tx) => {
      await tx.timetableSlot.deleteMany({
        where: { timetableId },
      });

      const slotData = updateData.slots.map((slot) => ({
        timetableId,
        dayOfWeek: slot.dayOfWeek,
        periodNumber: slot.periodNumber,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        room: slot.room || null,
        startTime: slot.startTime,
        endTime: slot.endTime,
        createdBy: updatedBy,
      }));

      await tx.timetableSlot.createMany({
        data: slotData,
      });
    });

    delete updateData.slots;
  }

  // Update timetable
  const updated = await prisma.timetable.update({
    where: { id: timetableId },
    data: {
      ...updateData,
      updatedBy,
      effectiveFrom: updateData.effectiveFrom ? new Date(updateData.effectiveFrom) : undefined,
      effectiveTill: updateData.effectiveTill ? new Date(updateData.effectiveTill) : undefined,
    },
    include: {
      slots: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
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
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
  });

  // Send notifications
  await notifyTimetableChange(updated, updatedBy);

  return updated;
};

/**
 * Get timetable by class
 * @param {string} classId - Class ID
 * @param {Date} date - Date to check (optional, defaults to today)
 * @returns {Promise<Object|null>} - Active timetable for the class
 */
const getClassTimetable = async (classId, date = new Date()) => {
  return await prisma.timetable.findFirst({
    where: {
      classId,
      isActive: true,
      effectiveFrom: {
        lte: date,
      },
      OR: [
        { effectiveTill: null },
        { effectiveTill: { gte: date } },
      ],
      deletedAt: null,
    },
    include: {
      slots: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
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
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
  });
};

/**
 * Get timetable by teacher
 * @param {string} teacherId - Teacher user ID
 * @param {Date} date - Date to check (optional)
 * @returns {Promise<Array>} - Timetables where teacher has slots
 */
const getTeacherTimetable = async (teacherId, date = new Date()) => {
  const slots = await prisma.timetableSlot.findMany({
    where: {
      teacherId,
      deletedAt: null,
      timetable: {
        isActive: true,
        effectiveFrom: {
          lte: date,
        },
        OR: [
          { effectiveTill: null },
          { effectiveTill: { gte: date } },
        ],
        deletedAt: null,
      },
    },
    include: {
      timetable: {
        include: {
          class: {
            select: {
              id: true,
              grade: true,
              division: true,
            },
          },
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { periodNumber: "asc" },
    ],
  });

  // Group by day of week
  const grouped = {};
  slots.forEach((slot) => {
    if (!grouped[slot.dayOfWeek]) {
      grouped[slot.dayOfWeek] = [];
    }
    grouped[slot.dayOfWeek].push(slot);
  });

  return grouped;
};

/**
 * Get timetable by subject
 * @param {string} subjectId - Subject ID
 * @param {string} schoolId - School ID
 * @param {Date} date - Date to check (optional)
 * @returns {Promise<Array>} - Timetable slots for the subject
 */
const getSubjectTimetable = async (subjectId, schoolId, date = new Date()) => {
  return await prisma.timetableSlot.findMany({
    where: {
      subjectId,
      deletedAt: null,
      timetable: {
        schoolId,
        isActive: true,
        effectiveFrom: {
          lte: date,
        },
        OR: [
          { effectiveTill: null },
          { effectiveTill: { gte: date } },
        ],
        deletedAt: null,
      },
    },
    include: {
      timetable: {
        include: {
          class: {
            select: {
              id: true,
              grade: true,
              division: true,
            },
          },
        },
      },
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      subject: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { dayOfWeek: "asc" },
      { periodNumber: "asc" },
    ],
  });
};

/**
 * Detect conflicts in timetable slots
 * @param {Array} slots - Array of timetable slots
 * @param {string} schoolId - School ID
 * @param {string} classId - Class ID (optional)
 * @param {string} excludeTimetableId - Timetable ID to exclude from conflict check
 * @returns {Promise<Array>} - Array of conflict objects
 */
const detectConflicts = async (slots, schoolId, classId, excludeTimetableId) => {
  const conflicts = [];

  // Check for duplicate slots (same day, period, timetable)
  const slotMap = new Map();
  slots.forEach((slot, index) => {
    const key = `${slot.dayOfWeek}-${slot.periodNumber}`;
    if (slotMap.has(key)) {
      conflicts.push({
        type: "DUPLICATE_SLOT",
        message: `Duplicate slot at day ${slot.dayOfWeek}, period ${slot.periodNumber}`,
        slotIndex: index,
      });
    } else {
      slotMap.set(key, slot);
    }
  });

  // Check for teacher conflicts (same teacher, same day, overlapping time)
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      if (
        slot1.teacherId === slot2.teacherId &&
        slot1.dayOfWeek === slot2.dayOfWeek &&
        timeOverlaps(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)
      ) {
        conflicts.push({
          type: "TEACHER_CONFLICT",
          message: `Teacher conflict: Same teacher has overlapping classes on day ${slot1.dayOfWeek}`,
          slot1Index: i,
          slot2Index: j,
        });
      }
    }
  }

  // Check for room conflicts (same room, same day, overlapping time)
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const slot1 = slots[i];
      const slot2 = slots[j];

      if (
        slot1.room &&
        slot2.room &&
        slot1.room === slot2.room &&
        slot1.dayOfWeek === slot2.dayOfWeek &&
        timeOverlaps(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)
      ) {
        conflicts.push({
          type: "ROOM_CONFLICT",
          message: `Room conflict: Room ${slot1.room} is double-booked on day ${slot1.dayOfWeek}`,
          slot1Index: i,
          slot2Index: j,
        });
      }
    }
  }

  // Check against existing timetables in the same school
  const existingTimetables = await prisma.timetable.findMany({
    where: {
      schoolId,
      isActive: true,
      deletedAt: null,
      ...(excludeTimetableId ? { id: { not: excludeTimetableId } } : {}),
    },
    include: {
      slots: {
        where: {
          deletedAt: null,
        },
      },
    },
  });

  // Check for conflicts with existing timetables
  for (const existingTimetable of existingTimetables) {
    for (const newSlot of slots) {
      for (const existingSlot of existingTimetable.slots) {
        // Teacher conflict
        if (
          newSlot.teacherId === existingSlot.teacherId &&
          newSlot.dayOfWeek === existingSlot.dayOfWeek &&
          timeOverlaps(newSlot.startTime, newSlot.endTime, existingSlot.startTime, existingSlot.endTime)
        ) {
          conflicts.push({
            type: "EXISTING_TEACHER_CONFLICT",
            message: `Teacher already has a class at this time in ${existingTimetable.name}`,
            timetableName: existingTimetable.name,
            slotIndex: slots.indexOf(newSlot),
          });
        }

        // Room conflict
        if (
          newSlot.room &&
          existingSlot.room &&
          newSlot.room === existingSlot.room &&
          newSlot.dayOfWeek === existingSlot.dayOfWeek &&
          timeOverlaps(newSlot.startTime, newSlot.endTime, existingSlot.startTime, existingSlot.endTime)
        ) {
          conflicts.push({
            type: "EXISTING_ROOM_CONFLICT",
            message: `Room ${newSlot.room} is already booked at this time in ${existingTimetable.name}`,
            timetableName: existingTimetable.name,
            slotIndex: slots.indexOf(newSlot),
          });
        }
      }
    }
  }

  return conflicts;
};

/**
 * Check if two time ranges overlap
 * @param {string} start1 - Start time 1 (HH:MM)
 * @param {string} end1 - End time 1 (HH:MM)
 * @param {string} start2 - Start time 2 (HH:MM)
 * @param {string} end2 - End time 2 (HH:MM)
 * @returns {boolean} - True if times overlap
 */
const timeOverlaps = (start1, end1, start2, end2) => {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = end1.split(":").map(Number);
  const [h3, m3] = start2.split(":").map(Number);
  const [h4, m4] = end2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
};

/**
 * Notify users about timetable changes
 * @param {Object} timetable - Timetable object
 * @param {string} changedBy - User ID who made the change
 */
const notifyTimetableChange = async (timetable, changedBy) => {
  try {
    // Get all students in the class if it's a class timetable
    if (timetable.classId) {
      const students = await prisma.user.findMany({
        where: {
          studentProfile: {
            classId: timetable.classId,
          },
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      // Get teachers in the timetable
      const teacherIds = [...new Set(timetable.slots.map((slot) => slot.teacherId))];

      // Get parents of students
      const parentLinks = await prisma.parentChildLink.findMany({
        where: {
          childId: {
            in: students.map((s) => s.id),
          },
          deletedAt: null,
        },
        select: {
          parentId: true,
        },
      });

      const parentIds = [...new Set(parentLinks.map((link) => link.parentId))];

      // Create notifications
      const allUserIds = [
        ...students.map((s) => s.id),
        ...teacherIds,
        ...parentIds,
      ];

      if (allUserIds.length > 0) {
        await notificationService.createBulkNotifications(allUserIds, {
          title: "Timetable Updated",
          content: `Timetable "${timetable.name}" has been updated. Please check your new schedule.`,
          type: "GENERAL",
          schoolId: timetable.schoolId,
          createdBy: changedBy,
        });
      }
    }
  } catch (error) {
    logger.error({ error, timetableId: timetable.id }, "Failed to send timetable change notifications");
  }
};

/**
 * Get print-friendly timetable format
 * @param {string} timetableId - Timetable ID
 * @returns {Promise<Object>} - Formatted timetable for printing
 */
const getPrintFriendlyTimetable = async (timetableId) => {
  const timetable = await prisma.timetable.findUnique({
    where: { id: timetableId },
    include: {
      slots: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
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
      class: {
        select: {
          id: true,
          grade: true,
          division: true,
        },
      },
    },
  });

  if (!timetable) {
    return null;
  }

  // Format for printing (group by day)
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const formatted = {
    timetable: {
      id: timetable.id,
      name: timetable.name,
      class: timetable.class ? `${timetable.class.grade}${timetable.class.division || ""}` : "School-wide",
      effectiveFrom: timetable.effectiveFrom,
      effectiveTill: timetable.effectiveTill,
    },
    schedule: {},
  };

  timetable.slots.forEach((slot) => {
    const dayName = days[slot.dayOfWeek];
    if (!formatted.schedule[dayName]) {
      formatted.schedule[dayName] = [];
    }
    formatted.schedule[dayName].push({
      period: slot.periodNumber,
      time: `${slot.startTime} - ${slot.endTime}`,
      subject: slot.subject.name,
      teacher: `${slot.teacher.firstName} ${slot.teacher.lastName || ""}`.trim(),
      room: slot.room || "-",
    });
  });

  return formatted;
};

const timetableService = {
  createTimetable,
  updateTimetable,
  getClassTimetable,
  getTeacherTimetable,
  getSubjectTimetable,
  detectConflicts,
  getPrintFriendlyTimetable,
};

export default timetableService;

