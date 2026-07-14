import { RoleName } from "../prisma/generated/index.js";
import { FALLBACK_SCHOOL_REGION_NAME } from "../constants/school-region.constants.js";

/**
 * @typedef {import("../prisma/generated/index.js").PrismaClient} PrismaClient
 */

/**
 * Prefer a super admin as actor for createdBy/updatedBy on reconciliation writes.
 * @param {PrismaClient} prisma
 */
export async function resolveReconciliationActorId(prisma) {
  const superAdminRole = await prisma.role.findUnique({
    where: { name: RoleName.SUPER_ADMIN },
  });
  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role missing; run seed before reconciliation.");
  }
  const user = await prisma.user.findFirst({
    where: {
      roleId: superAdminRole.id,
      deletedAt: null,
      deletedBy: null,
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  if (!user) {
    throw new Error("No active Super Admin user found; cannot set createdBy/updatedBy.");
  }
  return user.id;
}

/**
 * Longest active region name contained in school name or address lines (case-insensitive).
 * @param {{ name: string, address?: string[] }} school
 * @param {{ id: string, name: string }[]} regions
 * @returns {string | null} region id
 */
export function inferRegionIdFromSchoolText(school, regions) {
  const haystacks = [school.name, ...(school.address || [])]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());

  let bestId = null;
  let bestLen = 0;

  for (const r of regions) {
    const rn = String(r.name).toLowerCase().trim();
    if (rn.length < 2) continue;
    for (const h of haystacks) {
      if (h.includes(rn) && rn.length > bestLen) {
        bestLen = rn.length;
        bestId = r.id;
      }
    }
  }
  return bestId;
}

/**
 * @param {PrismaClient} prisma
 * @param {string} schoolId
 * @param {Set<string>} validRegionIds
 */
async function inferFromSchoolAdminRegion(prisma, schoolId, validRegionIds) {
  const admin = await prisma.user.findFirst({
    where: {
      schoolId,
      deletedAt: null,
      deletedBy: null,
      assignedRegionId: { not: null },
      role: { name: RoleName.SCHOOL_ADMIN },
    },
    select: { assignedRegionId: true },
  });
  if (
    admin?.assignedRegionId &&
    validRegionIds.has(admin.assignedRegionId)
  ) {
    return admin.assignedRegionId;
  }
  return null;
}

/**
 * Majority assignedRegionId among non-deleted users in the school (valid regions only).
 * @param {PrismaClient} prisma
 * @param {string} schoolId
 * @param {Set<string>} validRegionIds
 */
async function inferFromStaffRegionPlurality(prisma, schoolId, validRegionIds) {
  const rows = await prisma.user.groupBy({
    by: ["assignedRegionId"],
    where: {
      schoolId,
      deletedAt: null,
      deletedBy: null,
      assignedRegionId: { not: null },
    },
    _count: { _all: true },
  });

  const scored = rows
    .filter((r) => r.assignedRegionId && validRegionIds.has(r.assignedRegionId))
    .map((r) => ({
      regionId: r.assignedRegionId,
      count: r._count._all,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return String(a.regionId).localeCompare(String(b.regionId));
    });

  return scored[0]?.regionId ?? null;
}

/**
 * Pick fallback region: name match General (case-insensitive), else first by name asc.
 * @param {{ id: string, name: string }[]} regions
 */
export function pickFallbackRegion(regions) {
  const byName = [...regions].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
  const named = byName.find(
    (r) =>
      r.name.trim().toLowerCase() ===
      FALLBACK_SCHOOL_REGION_NAME.toLowerCase(),
  );
  return named || byName[0] || null;
}

/**
 * When creating a school without an explicit region, attach the same bucket the reconciler uses
 * ("General" if present, else first region by name). Returns null if no regions exist yet.
 * @param {PrismaClient} prisma
 */
export async function getDefaultSchoolRegionIdForNewSchool(prisma) {
  const regions = await prisma.region.findMany({
    where: { deletedAt: null, deletedBy: null },
    select: { id: true, name: true },
  });
  const fb = pickFallbackRegion(regions);
  return fb?.id ?? null;
}

/**
 * Ensures every active school points at an active region using a fixed inference order.
 *
 * Order: keep valid assignment → school admin assignedRegionId → staff region plurality →
 *        school name/address contains region name (longest match) → fallback region.
 *
 * @param {PrismaClient} prisma
 * @param {{ dryRun?: boolean }} [options]
 */
export async function reconcileSchoolRegionAssignments(prisma, options = {}) {
  const dryRun = Boolean(options.dryRun);
  const actorId = dryRun ? null : await resolveReconciliationActorId(prisma);

  let regions = await prisma.region.findMany({
    where: { deletedAt: null, deletedBy: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  let createdFallbackRegion = null;

  if (regions.length === 0) {
    if (dryRun) {
      return {
        dryRun: true,
        createdFallbackRegion: null,
        wouldCreateFallbackRegion: true,
        results: [],
        message:
          "No active regions. Run with dryRun=false after creating a region, or let the script create one.",
      };
    }
    const region = await prisma.region.create({
      data: {
        name: FALLBACK_SCHOOL_REGION_NAME,
        createdBy: actorId,
      },
      select: { id: true, name: true },
    });
    regions = [region];
    createdFallbackRegion = region;
  }

  const validRegionIds = new Set(regions.map((r) => r.id));
  const fallbackRegion = pickFallbackRegion(regions);
  if (!fallbackRegion) {
    throw new Error("Unexpected: no fallback region after ensure step.");
  }

  const schools = await prisma.school.findMany({
    where: { deletedAt: null, deletedBy: null },
    select: {
      id: true,
      name: true,
      code: true,
      address: true,
      regionId: true,
    },
  });

  const results = [];

  for (const school of schools) {
    let previousRegionId = school.regionId;
    let targetRegionId = school.regionId;
    let reason = "unchanged_valid";

    if (targetRegionId && validRegionIds.has(targetRegionId)) {
      results.push({
        schoolId: school.id,
        code: school.code,
        name: school.name,
        previousRegionId,
        newRegionId: targetRegionId,
        reason,
        changed: false,
      });
      continue;
    }

    if (targetRegionId && !validRegionIds.has(targetRegionId)) {
      reason = "fixed_orphan_region";
      targetRegionId = null;
    } else {
      reason = "missing_region";
    }

    if (!targetRegionId) {
      const fromAdmin = await inferFromSchoolAdminRegion(
        prisma,
        school.id,
        validRegionIds,
      );
      if (fromAdmin) {
        targetRegionId = fromAdmin;
        reason = "school_admin_assigned_region";
      }
    }

    if (!targetRegionId) {
      const fromStaff = await inferFromStaffRegionPlurality(
        prisma,
        school.id,
        validRegionIds,
      );
      if (fromStaff) {
        targetRegionId = fromStaff;
        reason = "staff_region_majority";
      }
    }

    if (!targetRegionId) {
      const fromText = inferRegionIdFromSchoolText(school, regions);
      if (fromText) {
        targetRegionId = fromText;
        reason = "name_address_match";
      }
    }

    if (!targetRegionId) {
      targetRegionId = fallbackRegion.id;
      reason = "fallback_region";
    }

    const changed = previousRegionId !== targetRegionId;

    if (changed && !dryRun) {
      await prisma.school.update({
        where: { id: school.id },
        data: { regionId: targetRegionId, updatedBy: actorId },
      });
    }

    results.push({
      schoolId: school.id,
      code: school.code,
      name: school.name,
      previousRegionId,
      newRegionId: targetRegionId,
      reason,
      changed,
    });
  }

  const changedRows = results.filter((r) => r.changed);

  return {
    dryRun,
    createdFallbackRegion,
    fallbackRegionUsed: { id: fallbackRegion.id, name: fallbackRegion.name },
    summary: {
      schoolsExamined: schools.length,
      rowsChanged: changedRows.length,
      unchangedValid: results.filter((r) => r.reason === "unchanged_valid")
        .length,
    },
    results,
    changed: changedRows,
  };
}
