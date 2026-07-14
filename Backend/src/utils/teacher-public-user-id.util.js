import prisma from "../prisma/client.js";

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Allocate next `{schoolCode}T####` Login ID for a teacher.
 * Must consider ALL teacher-role users for the school (including soft-deleted), because
 * `public_user_id` stays unique forever — counting only active teachers produced collisions
 * (e.g. next ID reused a slot still held by a deleted row).
 */
export async function allocateTeacherPublicUserId(schoolCode, schoolId, teacherRoleId) {
  const prefix = `${schoolCode}T`;
  const users = await prisma.user.findMany({
    where: {
      schoolId,
      roleId: teacherRoleId,
    },
    select: { publicUserId: true },
  });

  const re = new RegExp(`^${escapeRegex(schoolCode)}T(\\d+)$`);
  let maxSuffix = 0;
  for (const u of users) {
    const m = u.publicUserId?.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) maxSuffix = Math.max(maxSuffix, n);
    }
  }

  let n = maxSuffix + 1;
  const maxAttempts = 100000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = `${prefix}${String(n).padStart(4, "0")}`;
    const taken = await prisma.user.findUnique({
      where: { publicUserId: candidate },
    });
    if (!taken) return candidate;
    n += 1;
  }

  throw new Error(
    "Could not allocate a unique Login ID for this school. Try again or set a custom Login ID.",
  );
}

/**
 * Allocate next `{schoolCode}AT####` Login ID for staff.
 * Considers all staff-role users for the school (including soft-deleted), like teachers,
 * because `public_user_id` is globally unique forever.
 */
export async function allocateStaffPublicUserId(schoolCode, schoolId, staffRoleId) {
  const prefix = `${schoolCode}AT`;
  const users = await prisma.user.findMany({
    where: {
      schoolId,
      roleId: staffRoleId,
    },
    select: { publicUserId: true },
  });

  const re = new RegExp(`^${escapeRegex(schoolCode)}AT(\\d+)$`);
  let maxSuffix = 0;
  for (const u of users) {
    const m = u.publicUserId?.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) maxSuffix = Math.max(maxSuffix, n);
    }
  }

  let n = maxSuffix + 1;
  const maxAttempts = 100000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = `${prefix}${String(n).padStart(4, "0")}`;
    const taken = await prisma.user.findUnique({
      where: { publicUserId: candidate },
    });
    if (!taken) return candidate;
    n += 1;
  }

  throw new Error(
    "Could not allocate a unique Login ID for this school. Try again or set a custom Login ID.",
  );
}

/**
 * Allocate next `{schoolCode}S####` Login ID for students (bulk + single create pattern).
 * Considers all student-role users for the school (including soft-deleted).
 */
export async function allocateStudentPublicUserId(schoolCode, schoolId, studentRoleId) {
  const prefix = `${schoolCode}S`;
  const users = await prisma.user.findMany({
    where: {
      schoolId,
      roleId: studentRoleId,
    },
    select: { publicUserId: true },
  });

  const re = new RegExp(`^${escapeRegex(schoolCode)}S(\\d+)$`);
  let maxSuffix = 0;
  for (const u of users) {
    const m = u.publicUserId?.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) maxSuffix = Math.max(maxSuffix, n);
    }
  }

  let n = maxSuffix + 1;
  const maxAttempts = 100000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = `${prefix}${String(n).padStart(4, "0")}`;
    const taken = await prisma.user.findUnique({
      where: { publicUserId: candidate },
    });
    if (!taken) return candidate;
    n += 1;
  }

  throw new Error(
    "Could not allocate a unique student Login ID for this school. Try again.",
  );
}
