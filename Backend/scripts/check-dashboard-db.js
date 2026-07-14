/**
 * Dashboard DB diagnostic script
 * Checks if the database has the data required for the school admin dashboard.
 * Usage: from Backend folder, with .env loaded:
 *   node scripts/check-dashboard-db.js
 *   SCHOOL_ID=<uuid> node scripts/check-dashboard-db.js  (check specific school)
 */

import "dotenv/config";
import prisma from "../src/prisma/client.js";
import { RoleName, UserType } from "../src/prisma/generated/index.js";

async function main() {
  console.log("=== Dashboard DB check ===\n");

  // 1. Roles (required for dashboard counts)
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });
  const teacherRole = await prisma.role.findUnique({ where: { name: RoleName.TEACHER } });
  const staffRole = await prisma.role.findUnique({ where: { name: RoleName.STAFF } });
  const schoolAdminRole = await prisma.role.findUnique({ where: { name: RoleName.SCHOOL_ADMIN } });

  console.log("Roles:");
  console.log("  STUDENT:", studentRole ? studentRole.id : "MISSING");
  console.log("  TEACHER:", teacherRole ? teacherRole.id : "MISSING");
  console.log("  STAFF:", staffRole ? staffRole.id : "MISSING");
  console.log("  SCHOOL_ADMIN:", schoolAdminRole ? schoolAdminRole.id : "MISSING");

  if (!studentRole || !teacherRole || !staffRole || !schoolAdminRole) {
    console.log("\n❌ Missing required roles. Run seed: npm run seed");
    process.exit(1);
  }

  // 2. Schools
  const schools = await prisma.school.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, code: true },
    take: 20,
  });
  console.log("\nSchools (first 20):", schools.length);
  if (schools.length === 0) {
    console.log("  No schools found. Dashboard needs at least one school.");
    process.exit(1);
  }
  schools.forEach((s) => console.log(`  - ${s.code} ${s.name} (${s.id})`));

  const schoolId = process.env.SCHOOL_ID || schools[0].id;
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true, code: true },
  });
  if (!school) {
    console.log("\n❌ School not found:", schoolId);
    process.exit(1);
  }
  console.log("\n--- Checking school:", school.code, school.name, "---\n");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 3. Settings (optional: production may have older schema without some columns)
  let settings = null;
  try {
    settings = await prisma.settings.findFirst({
      where: { schoolId, deletedAt: null },
    });
    console.log("Settings:", settings ? `currentInstallmentNumber=${settings.currentInstallmentNumber}` : "NONE (dashboard uses default 1)");
  } catch (e) {
    console.log("Settings: (skipped - schema mismatch:", e.message?.slice(0, 80) + ")");
  }

  // 4. Users by role (school-scoped)
  const [students, teachers, staff, schoolAdmins] = await Promise.all([
    prisma.user.count({
      where: { schoolId, roleId: studentRole.id, userType: UserType.SCHOOL, deletedAt: null },
    }),
    prisma.user.count({
      where: { schoolId, roleId: teacherRole.id, userType: UserType.SCHOOL, deletedAt: null },
    }),
    prisma.user.count({
      where: { schoolId, roleId: staffRole.id, userType: UserType.SCHOOL, deletedAt: null },
    }),
    prisma.user.count({
      where: { schoolId, roleId: schoolAdminRole.id, userType: UserType.SCHOOL, deletedAt: null },
    }),
  ]);
  console.log("Users (school-scoped):");
  console.log("  Students:", students);
  console.log("  Teachers:", teachers);
  console.log("  Staff:", staff);
  console.log("  School admins:", schoolAdmins);

  // 5. Fees (current year)
  const fees = await prisma.fee.findMany({
    where: { schoolId, year: currentYear, deletedAt: null },
    select: { id: true },
  });
  console.log("\nFees (year " + currentYear + "):", fees.length);

  // 6. Fee installments (if any fees)
  const instCount = await prisma.feeInstallements.count({
    where: { schoolId, deletedAt: null },
  });
  console.log("Fee installments (all):", instCount);

  // 7. Notices
  const noticesCount = await prisma.notice.count({
    where: { schoolId, deletedAt: null },
  });
  console.log("Notices:", noticesCount);

  // 8. Events
  const eventsCount = await prisma.event.count({
    where: { schoolId, deletedAt: null },
  });
  console.log("Events:", eventsCount);

  // 9. Salary payments
  const salaryCount = await prisma.salaryPayments.count({
    where: { schoolId },
  });
  console.log("Salary payments:", salaryCount);

  // 10. User with this school (e.g. admin@gis001.edu)
  const adminUser = await prisma.user.findFirst({
    where: { schoolId, roleId: schoolAdminRole.id, deletedAt: null },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  console.log("\nSample school admin user:", adminUser ? `${adminUser.email} (${adminUser.firstName} ${adminUser.lastName})` : "NONE");

  console.log("\n=== Summary ===");
  const hasMinimum = school && studentRole && teacherRole && schoolAdminRole;
  console.log("Roles + school present:", hasMinimum ? "YES" : "NO");
  console.log("Dashboard API can return 200 with at least fallback data if roles + school exist.");
  if (students === 0 && teachers === 0 && noticesCount === 0 && instCount === 0) {
    console.log("Data is mostly empty for this school; dashboard will show zeros until you add students/teachers/notices/fees.");
  }
}

function isConnectionError(err) {
  const code = err?.code || err?.meta?.code;
  return code === "P1000" || code === "P1001" || code === "P1003" || /Authentication failed|ECONNREFUSED|ENOTFOUND/.test(err?.message || "");
}

main()
  .then(() => {
    console.log("\nVerdict: DB has data (or minimum roles/school). If dashboard still fails, the issue is likely API/config, not missing data.");
    process.exit(0);
  })
  .catch((err) => {
    if (isConnectionError(err)) {
      console.error("\n--- Connection error (not a data issue) ---");
      console.error("Cannot reach the database. Check:");
      console.error("  1. DATABASE_URL in .env (or env) is correct and the DB server is running.");
      console.error("  2. On production: /opt/schooliat/backend/production/shared/.env has valid DATABASE_URL.");
      console.error("  3. Run this script where the database is reachable (e.g. on the server).");
      console.error("\nVerdict: CONNECTION/CREDENTIALS — fix .env and DB access, then re-run to check for data.");
    } else {
      console.error("Error:", err.message);
    }
    process.exit(1);
  });
