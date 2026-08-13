import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import {
  PERMISSION_LEVELS,
  MODULE_PERMISSION_MAP,
} from "../constants/role-permission-map.js";

/**
 * Flatten a granular matrix (array of { module, levels }) into a `Permission[]`
 * array suitable for the runtime `withPermission` middleware.
 * @param {Array<{module: string, levels: string[]}>} matrix
 * @returns {string[]}
 */
function matrixToPermissions(matrix) {
  const perms = new Set();
  for (const entry of Array.isArray(matrix) ? matrix : []) {
    const def = MODULE_PERMISSION_MAP[entry?.module];
    if (!def || !Array.isArray(entry.levels)) continue;
    for (const level of entry.levels) {
      for (const perm of def[level] || []) {
        perms.add(perm);
      }
    }
  }
  return [...perms];
}

/**
 * Convert a flat `Permission[]` array back into a granular matrix. Modules that
 * have no matching permission are omitted, so the matrix reflects the actual
 * runtime permissions carried by a role.
 * @param {string[]} permissions
 * @returns {Array<{module: string, levels: string[]}>}
 */
function permissionsToMatrix(permissions) {
  const permSet = new Set((permissions || []).map((p) => String(p)));
  const rows = [];
  for (const [module, def] of Object.entries(MODULE_PERMISSION_MAP)) {
    const levels = PERMISSION_LEVELS.filter((level) =>
      (def[level] || []).some((perm) => permSet.has(String(perm))),
    );
    if (levels.length > 0) rows.push({ module, levels });
  }
  return rows;
}

/**
 * Matrix definition for the dashboard grid: every module, its label and the
 * permission enum values granted by each available level.
 */
function getMatrixDefinition() {
  return {
    levels: PERMISSION_LEVELS,
    modules: Object.entries(MODULE_PERMISSION_MAP).map(([module, def]) => ({
      module,
      label: def.label,
      levels: PERMISSION_LEVELS.filter((level) => (def[level] || []).length > 0).map(
        (level) => ({ level, permissions: def[level] }),
      ),
    })),
  };
}

/**
 * Replace the granular role_permissions rows for a custom role.
 * When `matrix` is omitted it is derived from the role's flat `permissions`.
 * @param {string} customRoleId
 * @param {Array<{module: string, levels: string[]}>} [matrix]
 * @param {string} createdBy
 * @returns {Promise<Array<{module: string, levels: string[]}>>}
 */
async function syncRolePermissions(customRoleId, matrix, createdBy) {
  let rows = [];
  if (Array.isArray(matrix)) {
    rows = matrix
      .filter((entry) => entry && entry.module && Array.isArray(entry.levels))
      .flatMap((entry) =>
        (entry.levels || [])
          .filter((level) => MODULE_PERMISSION_MAP[entry.module]?.[level]?.length)
          .map((level) => ({
            customRoleId,
            moduleName: entry.module,
            permissionLevel: level,
            createdBy,
          })),
      );
  } else {
    const customRole = await prisma.customRole.findUnique({
      where: { id: customRoleId },
      select: { permissions: true },
    });
    rows = permissionsToMatrix(customRole?.permissions || []).flatMap((entry) =>
      entry.levels.map((level) => ({
        customRoleId,
        moduleName: entry.module,
        permissionLevel: level,
        createdBy,
      })),
    );
  }

  if (rows.length === 0) {
    await prisma.rolePermission.deleteMany({ where: { customRoleId } });
    return [];
  }

  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { customRoleId } }),
    prisma.rolePermission.createMany({ data: rows }),
  ]);
  return rows.map((r) => ({ module: r.moduleName, levels: [r.permissionLevel] }));
}

/**
 * Read the granular matrix for a custom role.
 * @param {string} customRoleId
 * @returns {Promise<Array<{module: string, levels: string[]}>>}
 */
async function getRoleMatrix(customRoleId) {
  const rows = await prisma.rolePermission.findMany({
    where: { customRoleId, deletedAt: null },
    select: { moduleName: true, permissionLevel: true },
  });
  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.moduleName]) grouped[row.moduleName] = [];
    grouped[row.moduleName].push(row.permissionLevel);
  }
  return Object.entries(grouped).map(([module, levels]) => ({ module, levels }));
}

/**
 * Build the full matrix for a role, combining stored granular rows and the
 * flattened permission array (so legacy roles without granular rows still render).
 * @param {string} customRoleId
 * @param {string[]} permissions
 * @returns {Promise<Array<{module: string, levels: string[]}>>}
 */
async function resolveRoleMatrix(customRoleId, permissions) {
  const stored = await getRoleMatrix(customRoleId);
  if (stored.length > 0) return stored;
  return permissionsToMatrix(permissions);
}

const rolePermissionService = {
  matrixToPermissions,
  permissionsToMatrix,
  getMatrixDefinition,
  syncRolePermissions,
  getRoleMatrix,
  resolveRoleMatrix,
  PERMISSION_LEVELS,
};

export default rolePermissionService;
