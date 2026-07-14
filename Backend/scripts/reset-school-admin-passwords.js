/**
 * Reset all SCHOOL_ADMIN users' passwords to Admin@123 so login works.
 * School admin login requires x-platform: web (not android/ios).
 *
 * Usage (from Backend/):
 *   node scripts/reset-school-admin-passwords.js
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

const SCHOOL_ADMIN_PASSWORD = "Admin@123";

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      password: { not: null },
      role: { name: RoleName.SCHOOL_ADMIN },
    },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No SCHOOL_ADMIN users found in the database.");
    process.exit(0);
  }

  const hashed = await hashPassword(SCHOOL_ADMIN_PASSWORD);
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });
  }

  console.log("School admin passwords reset to:", SCHOOL_ADMIN_PASSWORD);
  console.log("Updated", users.length, "user(s).");
  console.log("");
  console.log("Credentials (use x-platform: web for login):");
  for (const u of users) {
    console.log("  ", u.email, "/", SCHOOL_ADMIN_PASSWORD);
  }
  console.log("");
  console.log("Test with: curl -X POST http://localhost:4000/auth/authenticate \\");
  console.log('  -H "Content-Type: application/json" -H "x-platform: web" \\');
  console.log('  -d \'{"request":{"email":"' + users[0].email + '","password":"' + SCHOOL_ADMIN_PASSWORD + '"}}\'');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
