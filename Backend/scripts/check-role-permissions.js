import "dotenv/config";
import dotenv from "dotenv";
// Load production env if present
dotenv.config({ path: "/opt/schooliat/backend/production/shared/.env" });
import prisma from "../src/prisma/client.js";
import { RoleName } from "../src/prisma/generated/index.js";

async function main() {
  const role = await prisma.role.findUnique({
    where: { name: RoleName.SCHOOL_ADMIN },
    select: { id: true, name: true, permissions: true },
  });
  if (!role) {
    console.log("SCHOOL_ADMIN role not found");
    return;
  }
  console.log("SCHOOL_ADMIN permissions count:", role.permissions?.length ?? 0);
  const perms = role.permissions || [];
  const check = (p) => (perms.includes(p) ? "YES" : "NO");
  console.log("GET_ATTENDANCE:", check("GET_ATTENDANCE"));
  console.log("GET_HOMEWORK:", check("GET_HOMEWORK"));
  console.log("GET_MARKS:", check("GET_MARKS"));
  console.log("GET_TIMETABLE:", check("GET_TIMETABLE"));
  console.log("GET_LIBRARY_BOOKS:", check("GET_LIBRARY_BOOKS"));
  console.log("GET_NOTES:", check("GET_NOTES"));
  console.log("GET_GALLERIES:", check("GET_GALLERIES"));
  console.log("GET_CIRCULARS:", check("GET_CIRCULARS"));
  console.log("GET_ATTENDANCE_REPORTS:", check("GET_ATTENDANCE_REPORTS"));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
