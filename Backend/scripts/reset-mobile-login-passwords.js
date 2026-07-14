/**
 * Reset one user per mobile role (TEACHER, STUDENT, EMPLOYEE) to default passwords
 * so Postman/Newman can log in. Safe to run multiple times.
 *
 * Usage (from Backend/):
 *   node scripts/reset-mobile-login-passwords.js
 *   npm run seed:mobile-credentials && node scripts/reset-mobile-login-passwords.js
 *
 * Requires: DATABASE_URL in .env
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";
import { RoleName } from "../src/prisma/generated/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

async function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const dotenv = (await import("dotenv")).default;
    dotenv.config({ path: path.join(backendRoot, ".env") });
  }
}

const DEFAULT_PASSWORDS = {
  [RoleName.TEACHER]: "Teacher@123",
  [RoleName.STUDENT]: "Student@123",
  [RoleName.EMPLOYEE]: "Employee@123",
};

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  const roles = [RoleName.TEACHER, RoleName.STUDENT, RoleName.EMPLOYEE];
  const updated = [];

  for (const roleName of roles) {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        password: { not: null },
        role: { name: roleName },
      },
      select: { id: true, email: true },
    });
    if (users.length === 0) {
      console.log(`No user found for role ${roleName}; skip.`);
      continue;
    }
    const password = DEFAULT_PASSWORDS[roleName];
    const hashed = await hashPassword(password);
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      updated.push({ role: roleName, email: user.email, password: password });
    }
    console.log(`Reset password for ${users.length} ${roleName}(s): ${password}`);
  }

  console.log("");
  console.log("Done. Updated", updated.length, "users. Use these credentials for Postman.");
  if (updated.length) {
    console.log("Teacher:", updated.find((u) => u.role === RoleName.TEACHER)?.email, "/ Teacher@123");
    console.log("Student:", updated.find((u) => u.role === RoleName.STUDENT)?.email, "/ Student@123");
    console.log("Employee:", updated.find((u) => u.role === RoleName.EMPLOYEE)?.email, "/ Employee@123");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
