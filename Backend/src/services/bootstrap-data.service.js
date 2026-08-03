import prisma from "../prisma/client.js";
import { RoleName } from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import roleService from "./role.service.js";
import userService from "./user.service.js";

/**
 * Ensure one platform settings row (school_id = null) exists.
 */
async function ensurePlatformSettings() {
  const existing = await prisma.settings.findFirst({
    where: { schoolId: null, deletedAt: null },
  });
  if (existing) return { created: false };

  await prisma.settings.create({
    data: {
      schoolId: null,
      studentFeeInstallments: 12,
      studentFeeAmount: 0,
      currentInstallmentNumber: 1,
      createdBy: "system",
    },
  });
  return { created: true };
}

/**
 * Ensure every active school has a settings row.
 */
async function ensureSchoolSettings() {
  const schools = await prisma.school.findMany({
    where: { deletedAt: null },
    select: { id: true, createdBy: true },
  });
  let createdCount = 0;

  for (const school of schools) {
    const existing = await prisma.settings.findFirst({
      where: { schoolId: school.id, deletedAt: null },
      select: { id: true },
    });
    if (existing) continue;

    const schoolAdmin = await prisma.user.findFirst({
      where: {
        schoolId: school.id,
        role: { name: RoleName.SCHOOL_ADMIN },
        deletedAt: null,
      },
      select: { id: true },
    });

    await prisma.settings.create({
      data: {
        schoolId: school.id,
        studentFeeInstallments: 12,
        studentFeeAmount: 0,
        currentInstallmentNumber: 1,
        createdBy: schoolAdmin?.id || school.createdBy || "system",
      },
    });
    createdCount += 1;
  }

  return { createdCount, totalSchools: schools.length };
}

/**
 * Idempotent baseline bootstrap for production safety.
 */
async function ensureBaselineData() {
  await roleService.createDefaultRoles();
  await roleService.updateRolePermissions();
  await roleService.createRoleTemplates();
  await userService.createSuperAdmin();

  const [platform, schools] = await Promise.all([
    ensurePlatformSettings(),
    ensureSchoolSettings(),
  ]);

  logger.info(
    {
      platformSettingsCreated: platform.created,
      schoolSettingsCreated: schools.createdCount,
      totalSchools: schools.totalSchools,
    },
    "Baseline bootstrap complete",
  );
}

const bootstrapDataService = {
  ensureBaselineData,
};

export default bootstrapDataService;
