/**
 * Fetch one user per role from the DB for Postman collection generation.
 * Outputs JSON to stdout so the generator can use real emails and avoid 401s.
 *
 * Passwords are not stored in DB (hashed). We use the same default passwords
 * the seed uses, so if the DB was seeded, login will work. For production
 * with custom passwords, override via POSTMAN_CREDENTIALS_FILE or collection vars.
 *
 * Usage (from Backend/):
 *   node scripts/fetch-postman-users.js
 *   node scripts/fetch-postman-users.js > ../postman-credentials.json
 *
 * Requires: DATABASE_URL in .env
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/prisma/client.js";
import { RoleName } from "../src/prisma/generated/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

async function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const dotenv = (await import("dotenv")).default;
    dotenv.config({ path: path.join(backendRoot, ".env") });
  }
}

// Default passwords used by seed (we cannot read hashed passwords from DB)
const DEFAULT_PASSWORDS = {
  [RoleName.SUPER_ADMIN]: "Admin@123",
  [RoleName.SCHOOL_ADMIN]: "Admin@123",
  [RoleName.TEACHER]: "Teacher@123",
  [RoleName.STUDENT]: "Student@123",
  [RoleName.STAFF]: "Staff@123",
  [RoleName.EMPLOYEE]: "Employee@123",
};

const ROLES_FOR_API = [
  RoleName.SUPER_ADMIN,
  RoleName.SCHOOL_ADMIN,
  RoleName.TEACHER,
  RoleName.STUDENT,
  RoleName.STAFF,
  RoleName.EMPLOYEE,
];

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(JSON.stringify({ error: "DATABASE_URL is not set" }));
    process.exit(1);
  }

  const usersByRole = {};
  const defaultPasswords = { ...DEFAULT_PASSWORDS };

  for (const roleName of ROLES_FOR_API) {
    const user = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        password: { not: null },
        role: { name: roleName },
      },
      select: { id: true, email: true, publicUserId: true },
    });
    if (user) {
      usersByRole[roleName] = {
        email: user.email,
        id: user.id,
        publicUserId: user.publicUserId ?? undefined,
      };
    }
  }

  // Mobile roles for Postman collection (role-based folders)
  const mobileRoles = {
    TEACHER: usersByRole[RoleName.TEACHER] ? { email: usersByRole[RoleName.TEACHER].email, password: defaultPasswords[RoleName.TEACHER] } : null,
    STUDENT: usersByRole[RoleName.STUDENT] ? { email: usersByRole[RoleName.STUDENT].email, password: defaultPasswords[RoleName.STUDENT] } : null,
    EMPLOYEE: usersByRole[RoleName.EMPLOYEE] ? { email: usersByRole[RoleName.EMPLOYEE].email, password: defaultPasswords[RoleName.EMPLOYEE] } : null,
  };

  const out = {
    users: usersByRole,
    defaultPasswords,
    mobileRoles,
    // Legacy: single default for backward compatibility
    postmanLogin: usersByRole[RoleName.TEACHER] || usersByRole[RoleName.STUDENT] || usersByRole[RoleName.EMPLOYEE] || usersByRole[RoleName.STAFF] || null,
    postmanLoginRole: usersByRole[RoleName.TEACHER] ? RoleName.TEACHER : usersByRole[RoleName.STUDENT] ? RoleName.STUDENT : usersByRole[RoleName.EMPLOYEE] ? RoleName.EMPLOYEE : usersByRole[RoleName.STAFF] ? RoleName.STAFF : null,
  };
  if (out.postmanLogin && out.postmanLoginRole) {
    out.postmanPassword = defaultPasswords[out.postmanLoginRole];
    out.x_platform = "android";
  }

  console.log(JSON.stringify(out, null, 0));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
