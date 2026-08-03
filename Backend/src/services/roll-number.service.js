import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import { RollNumberChangeAction } from "../prisma/generated/index.js";

/**
 * Find the next available roll number for a class (max current roll + 1, or 1).
 * Used for auto-assignment when no roll number is provided on admission.
 */
const getNextRollNumberForClass = async (classId) => {
  const aggregate = await prisma.studentProfile.aggregate({
    where: { classId, deletedAt: null },
    _max: { rollNumber: true },
  });
  const maxRoll = aggregate._max.rollNumber ?? 0;
  return maxRoll + 1;
};

/**
 * Record a roll number change in history (with before/after values).
 * Auto-logged for AUTO_ASSIGNED, MANUAL_OVERRIDE, and REARRANGED actions.
 */
const logRollNumberChange = async ({
  studentUserId,
  classId,
  oldRollNumber,
  newRollNumber,
  action,
  changedBy,
}) => {
  return prisma.rollNumberHistory.create({
    data: {
      studentUserId,
      classId,
      oldRollNumber,
      newRollNumber,
      action,
      changedBy,
    },
  });
};

/**
 * Set a student's roll number (auto-assigned or manual override), logging history.
 * @returns {Promise<{ profile, history }>}
 */
const setStudentRollNumber = async ({ studentUserId, classId, rollNumber, action, changedBy }) => {
  const existing = await prisma.studentProfile.findUnique({
    where: { userId: studentUserId },
    select: { userId: true, classId: true, rollNumber: true },
  });
  if (!existing) throw new Error("Student profile not found");

  const effectiveClassId = classId || existing.classId;
  const finalRoll =
    rollNumber && rollNumber > 0
      ? rollNumber
      : await getNextRollNumberForClass(effectiveClassId);

  const profile = await prisma.studentProfile.update({
    where: { userId: studentUserId },
    data: { rollNumber: finalRoll, updatedBy: changedBy },
  });

  let history = null;
  if (existing.rollNumber !== finalRoll) {
    history = await logRollNumberChange({
      studentUserId,
      classId: effectiveClassId,
      oldRollNumber: existing.rollNumber,
      newRollNumber: finalRoll,
      action,
      changedBy,
    });
  }

  return { profile, history };
};

/**
 * Auto-assign sequential roll numbers to all students of a class.
 * If a student already has a roll number > 0, it is left untouched.
 */
const autoAssignRollNumbersForClass = async ({ classId, changedBy }) => {
  const students = await prisma.studentProfile.findMany({
    where: { classId, deletedAt: null },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { rollNumber: "asc" },
  });

  // Students without roll numbers get the next free number (max + 1, then +2, ...)
  const maxRoll = students.reduce(
    (max, s) => Math.max(max, s.rollNumber || 0),
    0,
  );
  let nextFree = maxRoll + 1;

  const assigned = [];
  for (const student of students) {
    if (!student.rollNumber || student.rollNumber <= 0) {
      const { profile, history } = await setStudentRollNumber({
        studentUserId: student.userId,
        classId,
        rollNumber: nextFree,
        action: RollNumberChangeAction.AUTO_ASSIGNED,
        changedBy,
      });
      assigned.push({ studentUserId: student.userId, rollNumber: profile.rollNumber, history });
      nextFree += 1;
    }
  }

  logger.info({ classId, assignedCount: assigned.length }, "Auto-assigned roll numbers");
  return { assigned, untouched: students.length - assigned.length };
};

/**
 * Bulk rearrange: reassign sequential roll numbers to all students of a class
 * sorted alphabetically by first name (then last name). Every change is logged.
 * @param {Object} options - { classId, changedBy, order }
 * @param {"alphabetical"|"reverse"} [order] - sort direction
 */
const rearrangeClassRollNumbers = async ({ classId, changedBy, order = "alphabetical" }) => {
  const students = await prisma.studentProfile.findMany({
    where: { classId, deletedAt: null },
    include: {
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const sorted = students.sort((a, b) => {
    const aName = `${a.user?.firstName || ""} ${a.user?.lastName || ""}`.trim().toLowerCase();
    const bName = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim().toLowerCase();
    if (aName < bName) return order === "reverse" ? 1 : -1;
    if (aName > bName) return order === "reverse" ? -1 : 1;
    return 0;
  });

  const changes = [];
  const histories = [];
  for (let i = 0; i < sorted.length; i++) {
    const student = sorted[i];
    const newRoll = i + 1;
    if (student.rollNumber !== newRoll) {
      const { profile, history } = await setStudentRollNumber({
        studentUserId: student.userId,
        classId,
        rollNumber: newRoll,
        action: RollNumberChangeAction.REARRANGED,
        changedBy,
      });
      changes.push({ studentUserId: student.userId, name: `${student.user?.firstName || ""} ${student.user?.lastName || ""}`.trim(), oldRollNumber: student.rollNumber, newRollNumber: profile.rollNumber });
      if (history) histories.push(history);
    }
  }

  logger.info({ classId, changes: changes.length }, "Rearranged class roll numbers");
  return { changes, histories, totalStudents: sorted.length };
};

const getRollNumberHistory = async ({ classId, studentUserId, page = 1, limit = 20 }) => {
  const where = {};
  if (classId) where.classId = classId;
  if (studentUserId) where.studentUserId = studentUserId;

  const [items, total] = await Promise.all([
    prisma.rollNumberHistory.findMany({
      where,
      orderBy: { changedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        studentProfile: {
          select: {
            userId: true,
            user: { select: { firstName: true, lastName: true, publicUserId: true } },
          },
        },
      },
    }),
    prisma.rollNumberHistory.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const rollNumberService = {
  getNextRollNumberForClass,
  setStudentRollNumber,
  logRollNumberChange,
  autoAssignRollNumbersForClass,
  rearrangeClassRollNumbers,
  getRollNumberHistory,
};

export default rollNumberService;
