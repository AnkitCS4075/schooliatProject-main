/**
 * Repair a teacher mobile login account in-place (root-level fix).
 *
 * - Does NOT delete the user.
 * - Clears deletedAt (soft delete) if set.
 * - Resets password hash to the desired value.
 * - Optionally ensures the role is TEACHER.
 *
 * Usage (from Backend/):
 *   node scripts/repair-mobile-teacher.js
 *   EMAIL=teacher1@gis001.edu PASSWORD=Teacher@123 node scripts/repair-mobile-teacher.js
 *
 * This should be run on the SAME environment/database the API is using
 * (production/staging/local), so credentials and login behaviour align.
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
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

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  const email = process.env.EMAIL || "teacher1@gis001.edu";
  const plainPassword = process.env.PASSWORD || "Teacher@123";

  console.log("Repairing teacher mobile account");
  console.log("Email:", email);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("No user found with that email. Nothing to repair.");
    process.exit(1);
  }

  const teacherRole = await prisma.role.findFirst({
    where: { name: RoleName.TEACHER },
  });
  if (!teacherRole) {
    console.error("Role TEACHER not found. Run full seed or create roles first.");
    process.exit(1);
  }

  const passwordHash = await bcryptjs.hash(plainPassword, 10);

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: passwordHash,
      deletedAt: null,
      deletedBy: null,
      roleId: teacherRole.id,
    },
  });

  console.log("User repaired:");
  console.log("  id:", updated.id);
  console.log("  email:", updated.email);
  console.log("  roleId:", updated.roleId === teacherRole.id ? "TEACHER" : updated.roleId);
  console.log("  deletedAt:", updated.deletedAt);
  console.log("");
  console.log("You can now log in with:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${plainPassword}`);
}

main()
  .catch((e) => {
    console.error("Repair failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

