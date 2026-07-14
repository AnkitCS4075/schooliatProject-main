/**
 * Seed only teacher and student login credentials for mobile API testing.
 * Safe: creates users only when they do not exist. Does not delete or overwrite
 * any existing data.
 *
 * Usage (from Backend/):
 *   node scripts/seed-mobile-credentials.js
 *   npm run seed:mobile-credentials
 *
 * Requires: DATABASE_URL in .env. Roles TEACHER and STUDENT must exist.
 * For each school in the DB, ensures:
 *   - teacher1@<schoolCode>.edu / Teacher@123 (with TeacherProfile)
 *   - student1@<schoolCode>.edu / Student@123 (with StudentProfile, if school has at least one class)
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";
import {
  RoleName,
  UserType,
  Gender,
  BloodGroup,
  AccommodationType,
} from "../src/prisma/generated/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

async function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const dotenv = (await import("dotenv")).default;
    dotenv.config({ path: path.join(backendRoot, ".env") });
  }
}

const TEACHER_PASSWORD = "Teacher@123";
const STUDENT_PASSWORD = "Student@123";

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  const teacherRole = await prisma.role.findUnique({ where: { name: RoleName.TEACHER } });
  const studentRole = await prisma.role.findUnique({ where: { name: RoleName.STUDENT } });
  if (!teacherRole || !studentRole) {
    console.error("Roles TEACHER and STUDENT must exist. Run full seed first: npm run seed");
    process.exit(1);
  }

  const schools = await prisma.school.findMany({
    where: { deletedAt: null },
    orderBy: { code: "asc" },
  });
  if (schools.length === 0) {
    console.log("No schools found. Create schools first (e.g. run full seed).");
    process.exit(0);
  }

  let teachersCreated = 0;
  let studentsCreated = 0;

  for (const school of schools) {
    const code = school.code.toLowerCase();
    const teacherEmail = `teacher1@${code}.edu`;
    const studentEmail = `student1@${code}.edu`;

    // ----- Teacher: create only if missing -----
    const existingTeacher = await prisma.user.findFirst({
      where: { email: teacherEmail, deletedAt: null },
    });
    if (!existingTeacher) {
      const schoolAdmin = await prisma.user.findFirst({
        where: { schoolId: school.id, deletedAt: null, role: { name: RoleName.SCHOOL_ADMIN } },
      });
      const createdBy = schoolAdmin?.id ?? "seed-mobile-credentials";
      await prisma.user.create({
        data: {
          publicUserId: `${school.code}T0001`,
          userType: UserType.SCHOOL,
          email: teacherEmail,
          password: await hashPassword(TEACHER_PASSWORD),
          firstName: "Teacher",
          lastName: "One",
          contact: school.phone ?? "+91-0000000000",
          gender: Gender.MALE,
          dateOfBirth: new Date("1990-01-01"),
          address: school.address ?? ["Address"],
          aadhaarId: `1234567890${String(schools.indexOf(school) + 1).padStart(2, "0")}01`,
          roleId: teacherRole.id,
          schoolId: school.id,
          createdBy,
          teacherProfile: {
            create: {
              designation: "Teacher",
              highestQualification: "B.Ed",
              university: "University",
              yearOfPassing: 2015,
              grade: "A",
              panCardNumber: `ABCDE${String(schools.indexOf(school) + 1).padStart(4, "0")}F`,
              bloodGroup: BloodGroup.O_POSITIVE,
              createdBy,
            },
          },
        },
      });
      teachersCreated++;
      console.log(`Created teacher: ${teacherEmail} / ${TEACHER_PASSWORD}`);
    } else {
      console.log(`Teacher already exists: ${teacherEmail}`);
    }

    // ----- Student: create only if missing and school has a class -----
    const existingStudent = await prisma.user.findFirst({
      where: { email: studentEmail, deletedAt: null },
    });
    if (!existingStudent) {
      const firstClass = await prisma.class.findFirst({
        where: { schoolId: school.id, deletedAt: null },
        orderBy: { createdAt: "asc" },
      });
      if (!firstClass) {
        console.log(`No class for school ${school.code}; skipping student ${studentEmail}`);
        continue;
      }
      const schoolAdmin = await prisma.user.findFirst({
        where: { schoolId: school.id, deletedAt: null, role: { name: RoleName.SCHOOL_ADMIN } },
      });
      const createdBy = schoolAdmin?.id ?? "seed-mobile-credentials";
      const apaarId = `APAAR${school.code}000001`;
      const existingProfile = await prisma.studentProfile.findFirst({
        where: { apaarId },
      });
      if (existingProfile) {
        console.log(`Student profile with apaar_id ${apaarId} already exists; skipping ${studentEmail}`);
        continue;
      }
      try {
        await prisma.user.create({
          data: {
            publicUserId: `${school.code}S0001`,
            userType: UserType.SCHOOL,
            email: studentEmail,
            password: await hashPassword(STUDENT_PASSWORD),
            firstName: "Student",
            lastName: "One",
            contact: "+91-9876500001",
            gender: Gender.MALE,
            dateOfBirth: new Date("2012-01-01"),
            address: school.address ?? ["Address"],
            aadhaarId: `5678901234${String(schools.indexOf(school) + 1).padStart(2, "0")}01`,
            roleId: studentRole.id,
            schoolId: school.id,
            createdBy,
            studentProfile: {
              create: {
                rollNumber: 1,
                apaarId,
                classId: firstClass.id,
                fatherName: "Father",
                motherName: "Mother",
                fatherContact: "+91-9876500002",
                motherContact: "+91-9876500003",
                fatherOccupation: "Engineer",
                annualIncome: 500000,
                accommodationType: AccommodationType.DAY_SCHOLAR,
                bloodGroup: BloodGroup.O_POSITIVE,
                createdBy,
              },
            },
          },
        });
        studentsCreated++;
        console.log(`Created student: ${studentEmail} / ${STUDENT_PASSWORD}`);
      } catch (err) {
        if (err.code === "P2002") {
          console.log(`Student with email ${studentEmail} or apaar_id already exists, skipping.`);
        } else {
          throw err;
        }
      }
    } else {
      console.log(`Student already exists: ${studentEmail}`);
    }
  }

  console.log("");
  console.log("Done. Teachers created:", teachersCreated, "| Students created:", studentsCreated);
  console.log("Existing users were not modified.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
