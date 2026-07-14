/**
 * Comprehensive Seed File for SchooliAt Backend
 * 
 * This seed file populates the database with complete test data including:
 * - Roles with permissions
 * - Regions and Locations
 * - Schools
 * - Classes and Subjects
 * - Users (Super Admin, Employees, School Admins, Teachers, Students, Staff)
 * - Transport Vehicles
 * - Fees and Fee Installments
 * - Exams and Exam Calendars
 * - Events, Holidays, and Notices
 * - Receipts
 * - Licenses
 * - Vendors
 * - Settings
 * - Grievances
 * - Salary Structures and Payments
 * - Library (books, issues)
 * - Notes and Syllabus
 * - Galleries and Gallery Images
 * - Circulars
 * - FAQs (global and school-specific)
 * - Transport Routes, Route Stops, Vehicle Maintenance
 * 
 * Usage: node prisma/seed.js  (or: npm run seed)
 */

import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";
import {
  RoleName,
  Permission,
  UserType,
  Gender,
  AccommodationType,
  BloodGroup,
  DateType,
  ExamType,
  FeePaymentStatus,
  GrievanceStatus,
  GrievancePriority,
  LicenseStatus,
  PaymentMethod,
  ReceiptStatus,
  TransportType,
  LeadStatus,
  SalaryComponentType,
  SalaryComponentValueType,
  SalaryComponentFrequency,
  AttendanceStatus,
  SubmissionStatus,
  LeaveStatus,
  ConversationType,
  NotificationType,
  TCStatus,
  TemplateType,
  IdCardCollectionStatus,
  LibraryIssueStatus,
  GalleryPrivacy,
  CircularStatus,
} from "../src/prisma/generated/index.js";
import logger from "../src/config/logger.js";

// Helper function to generate random date within a range
const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to generate random number in range
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random string
const randomString = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

// Store created IDs for relationships
const seedData = {
  roles: {},
  regions: [],
  locations: [],
  schools: [],
  classes: {},
  subjects: {},
  users: {
    superAdmin: null,
    employees: [],
    schoolAdmins: {},
    teachers: {},
    students: {},
    staff: [],
  },
  transports: {},
  exams: {},
  settings: {},
  attendancePeriods: {},
  timetables: {},
  homeworks: {},
  leaveTypes: {},
  libraryBooks: {},
  galleries: {},
  parents: {},
};

/**
 * Get permission enum values that exist in the database (handles DB behind migrations).
 */
async function getDbPermissionValues() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT enumlabel FROM pg_enum
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'permission')
      ORDER BY enumsortorder
    `;
    return new Set(rows.map((r) => r.enumlabel));
  } catch {
    return null; // e.g. raw not supported or different DB
  }
}

/**
 * Seed Roles with Permissions
 * Uses role.service.defaultRolePermissionsMap as single source of truth so dashboard and API permissions stay in sync.
 */
async function seedRoles() {
  logger.info("Seeding Roles...");

  const dbPermissions = await getDbPermissionValues();
  const roleService = (await import("../src/services/role.service.js")).default;
  const defaultRolePermissionsMap = roleService.defaultRolePermissionsMap;

  for (const [roleName, permissions] of Object.entries(defaultRolePermissionsMap)) {
    // Filter out undefined and permissions not present in DB enum (e.g. DB behind migrations)
    let validPermissions = permissions.filter((p) => p != null);
    if (dbPermissions && dbPermissions.size > 0) {
      validPermissions = validPermissions.filter((p) => dbPermissions.has(p));
    }

    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) {
      const role = await prisma.role.create({
        data: {
          name: roleName,
          permissions: validPermissions,
          createdBy: "seed",
        },
      });
      seedData.roles[roleName] = role.id;
      logger.info(`Created role: ${roleName}`);
    } else {
      // Update permissions for existing role to ensure they match the seed data
      const updatedRole = await prisma.role.update({
        where: { name: roleName },
        data: {
          permissions: validPermissions,
          updatedBy: "seed",
        },
      });
      seedData.roles[roleName] = updatedRole.id;
      logger.info(`Updated permissions for existing role: ${roleName}`);
    }
  }
}

/**
 * Seed Regions and Locations
 */
async function seedRegionsAndLocations() {
  logger.info("Seeding Regions and Locations...");

  const regionsData = [
    { name: "North Region" },
    { name: "South Region" },
    { name: "East Region" },
    { name: "West Region" },
    { name: "Central Region" },
  ];

  for (const regionData of regionsData) {
    const existingRegion = await prisma.region.findFirst({
      where: { name: regionData.name, deletedAt: null },
    });

    let region;
    if (!existingRegion) {
      region = await prisma.region.create({
        data: {
          ...regionData,
          createdBy: "seed",
        },
      });
      logger.info(`Created region: ${regionData.name}`);
    } else {
      region = existingRegion;
      logger.info(`Region already exists: ${regionData.name}`);
    }

    seedData.regions.push(region.id);

    // Create 2-3 locations per region
    const locationCount = randomInt(2, 3);
    for (let i = 1; i <= locationCount; i++) {
      const location = await prisma.location.create({
        data: {
          name: `${regionData.name} - Location ${i}`,
          regionId: region.id,
          createdBy: "seed",
        },
      });
      seedData.locations.push(location.id);
      logger.info(`Created location: ${location.name}`);
    }
  }
}

/**
 * Seed Schools
 */
async function seedSchools() {
  logger.info("Seeding Schools...");

  const schoolsData = [
    {
      name: "Greenwood International School",
      code: "GIS001",
      email: "admin@greenwood.edu",
      phone: "+91-9876543210",
      address: ["123 Education Street", "Greenwood City", "State - 123456"],
      gstNumber: "29ABCDE1234F1Z5",
      principalName: "Dr. Sarah Johnson",
      principalEmail: "principal@greenwood.edu",
      principalPhone: "+91-9876543211",
      establishedYear: 1995,
      boardAffiliation: "CBSE",
      studentStrength: 1200,
    },
    {
      name: "Sunshine Public School",
      code: "SPS002",
      email: "admin@sunshine.edu",
      phone: "+91-9876543220",
      address: ["456 Learning Avenue", "Sunshine Town", "State - 123457"],
      gstNumber: "29FGHIJ5678K2L6",
      principalName: "Mr. Rajesh Kumar",
      principalEmail: "principal@sunshine.edu",
      principalPhone: "+91-9876543221",
      establishedYear: 2000,
      boardAffiliation: "ICSE",
      studentStrength: 800,
    },
    {
      name: "Bright Future Academy",
      code: "BFA003",
      email: "admin@brightfuture.edu",
      phone: "+91-9876543230",
      address: ["789 Knowledge Road", "Bright City", "State - 123458"],
      gstNumber: "29MNOPQ9012R3S7",
      principalName: "Mrs. Priya Sharma",
      principalEmail: "principal@brightfuture.edu",
      principalPhone: "+91-9876543231",
      establishedYear: 2010,
      boardAffiliation: "State Board",
      studentStrength: 600,
    },
  ];

  for (const schoolData of schoolsData) {
    const existingSchool = await prisma.school.findUnique({
      where: { code: schoolData.code },
    });

    let school;
    if (!existingSchool) {
      school = await prisma.school.create({
        data: {
          ...schoolData,
          createdBy: "seed",
        },
      });
      logger.info(`Created school: ${schoolData.name}`);
    } else {
      school = existingSchool;
      logger.info(`School already exists: ${schoolData.name}`);
    }

    seedData.schools.push(school.id);
  }
}

/**
 * Seed Classes and Subjects
 */
async function seedClassesAndSubjects() {
  logger.info("Seeding Classes and Subjects...");

  const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const divisions = ["A", "B", "C"];
  const commonSubjects = [
    "Mathematics",
    "English",
    "Science",
    "Social Studies",
    "Hindi",
    "Physical Education",
    "Art",
    "Music",
  ];

  for (const schoolId of seedData.schools) {
    seedData.classes[schoolId] = [];
    seedData.subjects[schoolId] = [];

    // Create subjects for the school
    for (const subjectName of commonSubjects) {
      const existingSubject = await prisma.subject.findFirst({
        where: {
          name: subjectName,
          schoolId: schoolId,
          deletedAt: null,
        },
      });

      if (!existingSubject) {
        const subject = await prisma.subject.create({
          data: {
            name: subjectName,
            schoolId: schoolId,
            createdBy: "seed",
          },
        });
        seedData.subjects[schoolId].push(subject.id);
      }
    }

    // Create classes for the school
    for (const grade of grades) {
      // Create 1-2 divisions per grade
      const divisionCount = grade <= "5" ? 1 : randomInt(1, 2);
      for (let i = 0; i < divisionCount; i++) {
        const division = divisions[i] || null;
        const existingClass = await prisma.class.findFirst({
          where: {
            grade: grade,
            division: division,
            schoolId: schoolId,
            deletedAt: null,
          },
        });

        if (!existingClass) {
          const classData = await prisma.class.create({
            data: {
              grade: grade,
              division: division,
              schoolId: schoolId,
              createdBy: "seed",
            },
          });
          seedData.classes[schoolId].push(classData.id);
        }
      }
    }

    logger.info(`Created classes and subjects for school: ${schoolId}`);
  }
}

/**
 * Seed Users
 */
async function seedUsers() {
  logger.info("Seeding Users...");

  // 1. Create Super Admin
  const superAdminRoleId = seedData.roles[RoleName.SUPER_ADMIN];
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { roleId: superAdminRoleId, deletedAt: null },
  });

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        publicUserId: "ADMIN001",
        userType: UserType.APP,
        email: "admin@schooliat.com",
        password: await hashPassword("Admin@123"),
        firstName: "Super",
        lastName: "Admin",
        contact: "+91-9999999999",
        gender: Gender.MALE,
        dateOfBirth: new Date("1980-01-01"),
        address: ["Admin Office", "SchooliAt Headquarters"],
        roleId: superAdminRoleId,
        createdBy: "seed",
      },
    });
    seedData.users.superAdmin = superAdmin.id;
    logger.info("Created Super Admin: admin@schooliat.com / Admin@123");
  } else {
    seedData.users.superAdmin = existingSuperAdmin.id;
    logger.info("Super Admin already exists");
  }

  // 2. Create Employees
  const employeeRoleId = seedData.roles[RoleName.EMPLOYEE];
  const employeeData = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@schooliat.com",
      contact: "+91-9876543001",
      gender: Gender.MALE,
      dateOfBirth: new Date("1990-05-15"),
      assignedRegionId: seedData.regions[0],
    },
    {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@schooliat.com",
      contact: "+91-9876543002",
      gender: Gender.FEMALE,
      dateOfBirth: new Date("1992-08-20"),
      assignedRegionId: seedData.regions[1],
    },
    {
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@schooliat.com",
      contact: "+91-9876543003",
      gender: Gender.MALE,
      dateOfBirth: new Date("1988-03-10"),
      assignedRegionId: seedData.regions[2],
    },
  ];

  for (let i = 0; i < employeeData.length; i++) {
    const emp = employeeData[i];
    const existingEmployee = await prisma.user.findFirst({
      where: { email: emp.email, deletedAt: null },
    });

    if (!existingEmployee) {
      const employee = await prisma.user.create({
        data: {
          publicUserId: `APPE${String(i + 1).padStart(4, "0")}`,
          userType: UserType.APP,
          email: emp.email,
          password: await hashPassword("Employee@123"),
          firstName: emp.firstName,
          lastName: emp.lastName,
          contact: emp.contact,
          gender: emp.gender,
          dateOfBirth: emp.dateOfBirth,
          address: ["Employee Address", "City"],
          roleId: employeeRoleId,
          assignedRegionId: emp.assignedRegionId,
          createdBy: seedData.users.superAdmin || "seed",
        },
      });
      seedData.users.employees.push(employee.id);
      logger.info(`Created Employee: ${emp.email} / Employee@123`);
    }
  }

  // 3. Create School Admins, Teachers, Students, and Staff for each school
  const schoolAdminRoleId = seedData.roles[RoleName.SCHOOL_ADMIN];
  const teacherRoleId = seedData.roles[RoleName.TEACHER];
  const studentRoleId = seedData.roles[RoleName.STUDENT];
  const staffRoleId = seedData.roles[RoleName.STAFF];

  for (let schoolIndex = 0; schoolIndex < seedData.schools.length; schoolIndex++) {
    const schoolId = seedData.schools[schoolIndex];
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    seedData.users.schoolAdmins[schoolId] = null;
    seedData.users.teachers[schoolId] = [];
    seedData.users.students[schoolId] = [];

    // Create School Admin
    const schoolAdminEmail = `admin@${school.code.toLowerCase()}.edu`;
    const existingSchoolAdmin = await prisma.user.findFirst({
      where: { email: schoolAdminEmail, deletedAt: null },
    });

    if (!existingSchoolAdmin) {
      const schoolAdmin = await prisma.user.create({
        data: {
          publicUserId: `${school.code}A0001`,
          userType: UserType.SCHOOL,
          email: schoolAdminEmail,
          password: await hashPassword("Admin@123"),
          firstName: school.code,
          lastName: "Admin",
          contact: school.phone,
          gender: Gender.MALE,
          dateOfBirth: new Date("1985-01-01"),
          address: school.address,
          roleId: schoolAdminRoleId,
          schoolId: schoolId,
          createdBy: seedData.users.superAdmin || "seed",
        },
      });
      seedData.users.schoolAdmins[schoolId] = schoolAdmin.id;
      logger.info(`Created School Admin: ${schoolAdminEmail} / Admin@123`);
    } else {
      seedData.users.schoolAdmins[schoolId] = existingSchoolAdmin.id;
    }

    const schoolAdminId = seedData.users.schoolAdmins[schoolId];

    // Create Teachers (5-8 per school)
    const teacherCount = randomInt(5, 8);
    const teacherNames = [
      ["Rajesh", "Kumar"],
      ["Priya", "Sharma"],
      ["Amit", "Patel"],
      ["Sneha", "Singh"],
      ["Vikram", "Reddy"],
      ["Anjali", "Gupta"],
      ["Rahul", "Mehta"],
      ["Kavita", "Joshi"],
    ];

    for (let i = 0; i < teacherCount; i++) {
      const name = teacherNames[i % teacherNames.length];
      const teacherEmail = `teacher${i + 1}@${school.code.toLowerCase()}.edu`;
      const existingTeacher = await prisma.user.findFirst({
        where: { email: teacherEmail, deletedAt: null },
      });

      if (!existingTeacher) {
        const teacher = await prisma.user.create({
          data: {
            publicUserId: `${school.code}T${String(i + 1).padStart(4, "0")}`,
            userType: UserType.SCHOOL,
            email: teacherEmail,
            password: await hashPassword("Teacher@123"),
            firstName: name[0],
            lastName: name[1],
            contact: `+91-98765${String(40000 + schoolIndex * 100 + i).slice(-5)}`,
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
            dateOfBirth: randomDate(new Date("1980-01-01"), new Date("1995-01-01")),
            address: school.address,
            aadhaarId: `1234${String(567890 + schoolIndex * 1000 + i).padStart(6, "0")}`,
            roleId: teacherRoleId,
            schoolId: schoolId,
            createdBy: schoolAdminId || "seed",
            teacherProfile: {
              create: {
                designation: i === 0 ? "Senior Teacher" : "Teacher",
                highestQualification: ["B.Ed", "M.Ed", "M.Sc", "B.Sc"][i % 4],
                university: ["Delhi University", "Mumbai University", "Bangalore University"][i % 3],
                yearOfPassing: 2010 + (i % 10),
                grade: ["A+", "A", "B+", "B"][i % 4],
                panCardNumber: `ABCDE${String(1000 + schoolIndex * 100 + i).padStart(4, "0")}F`,
                bloodGroup: Object.values(BloodGroup)[i % Object.values(BloodGroup).length],
                createdBy: schoolAdminId || "seed",
              },
            },
          },
        });
        seedData.users.teachers[schoolId].push(teacher.id);
        logger.info(`Created Teacher: ${teacherEmail} / Teacher@123`);
      }
    }

    // Create Students (20-30 per school, distributed across classes)
    const studentCount = randomInt(20, 30);
    const studentNames = [
      ["Arjun", "Kumar"],
      ["Sita", "Sharma"],
      ["Krishna", "Patel"],
      ["Radha", "Singh"],
      ["Ravi", "Reddy"],
      ["Meera", "Gupta"],
      ["Sohan", "Mehta"],
      ["Lakshmi", "Joshi"],
      ["Vishal", "Verma"],
      ["Pooja", "Yadav"],
    ];

    const classIds = seedData.classes[schoolId] || [];
    let rollNumber = 1;

    for (let i = 0; i < studentCount; i++) {
      const name = studentNames[i % studentNames.length];
      const studentEmail = `student${i + 1}@${school.code.toLowerCase()}.edu`;
      const existingStudent = await prisma.user.findFirst({
        where: { email: studentEmail, deletedAt: null },
      });

      if (!existingStudent && classIds.length > 0) {
        const classId = classIds[i % classIds.length];
        const classData = await prisma.class.findUnique({ where: { id: classId } });
        const apaarId = `APAAR${school.code}${String(rollNumber).padStart(6, "0")}`;
        
        // Check if student profile with this apaar_id already exists
        const existingProfile = await prisma.studentProfile.findFirst({
          where: { apaarId: apaarId },
        });

        if (!existingProfile) {
          try {
            const student = await prisma.user.create({
              data: {
                publicUserId: `${school.code}S${String(rollNumber).padStart(4, "0")}`,
                userType: UserType.SCHOOL,
                email: studentEmail,
                password: await hashPassword("Student@123"),
                firstName: name[0],
                lastName: name[1],
                contact: `+91-98765${String(50000 + schoolIndex * 1000 + i).slice(-5)}`,
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                dateOfBirth: randomDate(new Date("2010-01-01"), new Date("2015-01-01")),
                address: school.address,
                aadhaarId: `5678${String(901234 + schoolIndex * 10000 + i).padStart(6, "0")}`,
                roleId: studentRoleId,
                schoolId: schoolId,
                createdBy: schoolAdminId || "seed",
                studentProfile: {
                  create: {
                    rollNumber: rollNumber,
                    apaarId: apaarId,
                    classId: classId,
                    fatherName: `${name[1]} ${["Ram", "Mohan", "Suresh", "Dinesh", "Ganesh", "Rajendra", "Mahesh", "Naresh"][i % 8]}`,
                    motherName: `${["Sunita", "Anita", "Rekha", "Savita", "Kavita", "Meena", "Neeta", "Geeta"][i % 8]} ${name[1]}`,
                    fatherContact: `+91-98765${String(60000 + schoolIndex * 1000 + i).slice(-5)}`,
                    motherContact: `+91-98765${String(70000 + schoolIndex * 1000 + i).slice(-5)}`,
                    fatherOccupation: ["Engineer", "Doctor", "Teacher", "Business"][i % 4],
                    annualIncome: randomInt(300000, 1500000),
                    accommodationType: i % 3 === 0 ? AccommodationType.HOSTELLER : AccommodationType.DAY_SCHOLAR,
                    bloodGroup: Object.values(BloodGroup)[i % Object.values(BloodGroup).length],
                    createdBy: schoolAdminId || "seed",
                  },
                },
              },
            });
            seedData.users.students[schoolId].push(student.id);
            logger.info(`Created Student: ${studentEmail} / Student@123`);
          } catch (error) {
            // Skip if student already exists (unique constraint)
            if (error.code === 'P2002') {
              logger.info(`Student with email ${studentEmail} or apaar_id ${apaarId} already exists, skipping...`);
            } else {
              throw error;
            }
          }
        } else {
          logger.info(`Student profile with apaar_id ${apaarId} already exists, skipping...`);
        }
        rollNumber++;
      }
    }

    // Create Staff (2-3 per school)
    const staffCount = randomInt(2, 3);
    for (let i = 0; i < staffCount; i++) {
      const staffEmail = `staff${i + 1}@${school.code.toLowerCase()}.edu`;
      const existingStaff = await prisma.user.findFirst({
        where: { email: staffEmail, deletedAt: null },
      });

      if (!existingStaff) {
        const staff = await prisma.user.create({
          data: {
            publicUserId: `${school.code}ST${String(i + 1).padStart(4, "0")}`,
            userType: UserType.SCHOOL,
            email: staffEmail,
            password: await hashPassword("Staff@123"),
            firstName: ["Ramesh", "Sunita", "Mohan"][i],
            lastName: ["Yadav", "Devi", "Sharma"][i],
            contact: `+91-98765${String(80000 + i).slice(-5)}`,
            gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
            dateOfBirth: randomDate(new Date("1985-01-01"), new Date("1995-01-01")),
            address: school.address,
            roleId: staffRoleId,
            schoolId: schoolId,
            createdBy: schoolAdminId || "seed",
          },
        });
        seedData.users.staff.push(staff.id);
        logger.info(`Created Staff: ${staffEmail} / Staff@123`);
      }
    }
  }
}

/**
 * Seed Transport Vehicles
 */
async function seedTransport() {
  logger.info("Seeding Transport Vehicles...");

  const transportTypes = [TransportType.BUS, TransportType.VAN, TransportType.CAR];
  const vehicleNumbers = ["KA01AB1234", "KA02CD5678", "KA03EF9012", "KA04GH3456", "KA05IJ7890"];

  for (let schoolIndex = 0; schoolIndex < seedData.schools.length; schoolIndex++) {
    const schoolId = seedData.schools[schoolIndex];
    seedData.transports[schoolId] = [];
    const transportCount = randomInt(2, 4);

    for (let i = 0; i < transportCount; i++) {
      const licenseNumber = `LIC${String(1000 + schoolIndex * 1000 + i).padStart(6, "0")}`;
      const existingTransport = await prisma.transport.findUnique({
        where: { licenseNumber: licenseNumber },
      });

      if (!existingTransport) {
        const transport = await prisma.transport.create({
          data: {
            type: transportTypes[i % transportTypes.length],
            licenseNumber: licenseNumber,
            vehicleNumber: vehicleNumbers[i % vehicleNumbers.length],
            schoolId: schoolId,
          ownerFirstName: ["Ramesh", "Suresh", "Mahesh"][i % 3],
          ownerLastName: "Kumar",
          driverFirstName: ["Rajesh", "Vijay", "Ajay"][i % 3],
          driverLastName: "Singh",
          driverDateOfBirth: randomDate(new Date("1980-01-01"), new Date("1990-01-01")),
          driverContact: `+91-98765${String(90000 + i).slice(-5)}`,
          driverGender: Gender.MALE,
          conductorFirstName: ["Sunil", "Anil", "Ramesh", "Kumar"][i % 4],
          conductorLastName: "Yadav",
          conductorDateOfBirth: randomDate(new Date("1985-01-01"), new Date("1995-01-01")),
          conductorContact: `+91-98765${String(91000 + i).slice(-5)}`,
          conductorGender: Gender.MALE,
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });
      seedData.transports[schoolId].push(transport.id);
      logger.info(`Created Transport: ${transport.vehicleNumber} for school ${schoolId}`);
      } else {
        seedData.transports[schoolId].push(existingTransport.id);
        logger.info(`Transport already exists: ${licenseNumber}`);
      }
    }
  }
}

/**
 * Seed Fees and Fee Installments
 */
async function seedFees() {
  logger.info("Seeding Fees and Fee Installments...");

  const currentYear = new Date().getFullYear();
  const installmentCount = 12;
  const baseFeeAmount = 50000; // Annual fee in paise (₹500.00)

  for (const schoolId of seedData.schools) {
    const students = seedData.users.students[schoolId] || [];
    const schoolAdminId = seedData.users.schoolAdmins[schoolId];

    for (const studentId of students) {
      // Create fee record
      const fee = await prisma.fee.create({
        data: {
          schoolId: schoolId,
          studentId: studentId,
          year: currentYear,
          totalAmount: baseFeeAmount,
          totalPaidAmount: 0,
          totalRemainingAmount: baseFeeAmount,
          createdBy: schoolAdminId || "seed",
        },
      });

      // Create fee installments
      const installmentAmount = Math.floor(baseFeeAmount / installmentCount);
      const remainder = baseFeeAmount % installmentCount;

      for (let i = 1; i <= installmentCount; i++) {
        const amount = i === installmentCount ? installmentAmount + remainder : installmentAmount;
        const paymentStatus =
          i <= 6 ? FeePaymentStatus.PAID : i <= 9 ? FeePaymentStatus.PARTIALLY_PAID : FeePaymentStatus.PENDING;

        await prisma.feeInstallements.create({
          data: {
            feeId: fee.id,
            schoolId: schoolId,
            studentId: studentId,
            installementNumber: i,
            paymentStatus: paymentStatus,
            amount: amount,
            remainingAmount: paymentStatus === FeePaymentStatus.PAID ? 0 : amount,
            paidAmount: paymentStatus === FeePaymentStatus.PAID ? amount : paymentStatus === FeePaymentStatus.PARTIALLY_PAID ? Math.floor(amount / 2) : 0,
            paidAt: paymentStatus === FeePaymentStatus.PAID ? randomDate(new Date(`${currentYear}-01-01`), new Date()) : null,
            createdBy: schoolAdminId || "seed",
          },
        });
      }

      logger.info(`Created fees for student: ${studentId}`);
    }
  }
}

/**
 * Seed Exams and Exam Calendars
 */
async function seedExams() {
  logger.info("Seeding Exams and Exam Calendars...");

  const currentYear = new Date().getFullYear();
  const examTypes = [ExamType.UNIT_TEST, ExamType.SEMESTER, ExamType.FINAL];
  const examNames = ["First Unit Test", "Second Unit Test", "First Semester", "Second Semester", "Annual Exam"];

  for (const schoolId of seedData.schools) {
    seedData.exams[schoolId] = [];

    // Create exams
    for (let i = 0; i < examNames.length; i++) {
      const exam = await prisma.exam.create({
        data: {
          schoolId: schoolId,
          year: currentYear,
          name: examNames[i],
          type: examTypes[i % examTypes.length],
        },
      });
      seedData.exams[schoolId].push(exam.id);
    }

    // Create exam calendars for each class
    const classIds = seedData.classes[schoolId] || [];
    const subjects = ["Mathematics", "English", "Science", "Social Studies", "Hindi"];

    for (const classId of classIds) {
      const examId = seedData.exams[schoolId][0]; // Use first exam
      const examCalendar = await prisma.examCalendar.create({
        data: {
          classId: classId,
          examId: examId,
          title: `Exam Calendar for ${examNames[0]}`,
          visibleFrom: new Date(`${currentYear}-01-01`),
          visibleTill: new Date(`${currentYear}-12-31`),
          schoolId: schoolId,
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });

      // Create exam calendar items
      for (let i = 0; i < subjects.length; i++) {
        await prisma.examCalendarItem.create({
          data: {
            examCalendarId: examCalendar.id,
            subject: subjects[i],
            date: randomDate(new Date(`${currentYear}-03-01`), new Date(`${currentYear}-03-31`)),
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });
      }

      logger.info(`Created exam calendar for class: ${classId}`);
    }
  }
}

/**
 * Seed Events, Holidays, and Notices
 */
async function seedCalendarItems() {
  logger.info("Seeding Events, Holidays, and Notices...");

  const currentYear = new Date().getFullYear();

  for (const schoolId of seedData.schools) {
    const schoolAdminId = seedData.users.schoolAdmins[schoolId];

    // Create Events
    const events = [
      {
        title: "Annual Sports Day",
        description: "School annual sports day with various competitions",
        dateType: DateType.SINGLE_DATE,
        from: new Date(`${currentYear}-02-15`),
        till: new Date(`${currentYear}-02-15`),
        visibleFrom: new Date(`${currentYear}-01-01`),
        visibleTill: new Date(`${currentYear}-02-20`),
      },
      {
        title: "Science Exhibition",
        description: "Students showcase their science projects",
        dateType: DateType.DATE_RANGE,
        from: new Date(`${currentYear}-03-10`),
        till: new Date(`${currentYear}-03-12`),
        visibleFrom: new Date(`${currentYear}-02-01`),
        visibleTill: new Date(`${currentYear}-03-15`),
      },
      {
        title: "Annual Day Celebration",
        description: "School annual day with cultural programs",
        dateType: DateType.SINGLE_DATE,
        from: new Date(`${currentYear}-12-20`),
        till: new Date(`${currentYear}-12-20`),
        visibleFrom: new Date(`${currentYear}-11-01`),
        visibleTill: new Date(`${currentYear}-12-25`),
      },
    ];

    for (const eventData of events) {
      await prisma.event.create({
        data: {
          ...eventData,
          schoolId: schoolId,
          createdBy: schoolAdminId || "seed",
        },
      });
    }

    // Create Holidays
    const holidays = [
      {
        title: "Republic Day",
        dateType: DateType.SINGLE_DATE,
        from: new Date(`${currentYear}-01-26`),
        till: new Date(`${currentYear}-01-26`),
        visibleFrom: new Date(`${currentYear}-01-01`),
        visibleTill: new Date(`${currentYear}-01-31`),
      },
      {
        title: "Summer Vacation",
        dateType: DateType.DATE_RANGE,
        from: new Date(`${currentYear}-05-15`),
        till: new Date(`${currentYear}-06-15`),
        visibleFrom: new Date(`${currentYear}-04-01`),
        visibleTill: new Date(`${currentYear}-06-20`),
      },
      {
        title: "Diwali Holidays",
        dateType: DateType.DATE_RANGE,
        from: new Date(`${currentYear}-11-10`),
        till: new Date(`${currentYear}-11-15`),
        visibleFrom: new Date(`${currentYear}-10-01`),
        visibleTill: new Date(`${currentYear}-11-20`),
      },
    ];

    for (const holidayData of holidays) {
      await prisma.holiday.create({
        data: {
          ...holidayData,
          schoolId: schoolId,
          createdBy: schoolAdminId || "seed",
        },
      });
    }

    // Create Notices
    const notices = [
      {
        title: "Parent-Teacher Meeting",
        content: "All parents are requested to attend the parent-teacher meeting scheduled for next week.",
        visibleFrom: new Date(`${currentYear}-01-01`),
        visibleTill: new Date(`${currentYear}-12-31`),
      },
      {
        title: "Fee Payment Reminder",
        content: "Please ensure all fee payments are completed by the end of this month.",
        visibleFrom: new Date(`${currentYear}-01-01`),
        visibleTill: new Date(`${currentYear}-12-31`),
      },
      {
        title: "Library Book Return",
        content: "Students are reminded to return library books before the end of the semester.",
        visibleFrom: new Date(`${currentYear}-01-01`),
        visibleTill: new Date(`${currentYear}-12-31`),
      },
    ];

    for (const noticeData of notices) {
      await prisma.notice.create({
        data: {
          ...noticeData,
          schoolId: schoolId,
          createdBy: schoolAdminId || "seed",
        },
      });
    }

    logger.info(`Created calendar items for school: ${schoolId}`);
  }
}

/**
 * Seed Receipts
 */
async function seedReceipts() {
  logger.info("Seeding Receipts...");

  for (const schoolId of seedData.schools) {
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const schoolAdminId = seedData.users.schoolAdmins[schoolId];

    // Create 5-10 receipts per school
    const receiptCount = randomInt(5, 10);

    for (let i = 0; i < receiptCount; i++) {
      const receiptNumber = `REC${school.code}${String(i + 1).padStart(6, "0")}`;
      
      // Check if receipt already exists
      const existingReceipt = await prisma.receipt.findUnique({
        where: { receiptNumber: receiptNumber },
      });

      if (!existingReceipt) {
        const baseAmount = randomInt(10000, 100000); // ₹100 to ₹1000
        const sgstPercent = 9;
        const cgstPercent = 9;
        const sgstAmount = Math.floor((baseAmount * sgstPercent) / 100);
        const cgstAmount = Math.floor((baseAmount * cgstPercent) / 100);
        const totalGst = sgstAmount + cgstAmount;
        const amount = baseAmount + totalGst;

        try {
          const receipt = await prisma.receipt.create({
            data: {
              receiptNumber: receiptNumber,
              schoolId: schoolId,
              amount: amount,
              baseAmount: baseAmount,
              sgstPercent: sgstPercent,
              cgstPercent: cgstPercent,
              sgstAmount: sgstAmount,
              cgstAmount: cgstAmount,
              totalGst: totalGst,
              description: `Payment for services - Receipt ${i + 1}`,
              paymentMethod: Object.values(PaymentMethod)[i % Object.values(PaymentMethod).length],
              status: i < 7 ? ReceiptStatus.PAID : ReceiptStatus.PENDING,
              createdBy: schoolAdminId || "seed",
            },
          });

          logger.info(`Created receipt: ${receipt.receiptNumber}`);
        } catch (error) {
          // Skip if receipt already exists (unique constraint)
          if (error.code === 'P2002') {
            logger.info(`Receipt with number ${receiptNumber} already exists, skipping...`);
          } else {
            throw error;
          }
        }
      } else {
        logger.info(`Receipt with number ${receiptNumber} already exists, skipping...`);
      }
    }
  }
}

/**
 * Seed Licenses
 */
async function seedLicenses() {
  logger.info("Seeding Licenses...");

  const licensesData = [
    {
      name: "Educational License",
      issuer: "State Education Department",
      issueDate: new Date("2020-01-01"),
      expiryDate: new Date("2025-12-31"),
      certificateNumber: "EDU-LIC-2020-001",
      status: LicenseStatus.ACTIVE,
    },
    {
      name: "Fire Safety Certificate",
      issuer: "Fire Department",
      issueDate: new Date("2021-06-01"),
      expiryDate: new Date("2024-05-31"),
      certificateNumber: "FIRE-2021-002",
      status: LicenseStatus.EXPIRING_SOON,
    },
    {
      name: "Health License",
      issuer: "Health Department",
      issueDate: new Date("2019-01-01"),
      expiryDate: new Date("2023-12-31"),
      certificateNumber: "HLTH-2019-003",
      status: LicenseStatus.EXPIRED,
    },
  ];

  for (const licenseData of licensesData) {
    const existingLicense = await prisma.license.findUnique({
      where: { certificateNumber: licenseData.certificateNumber },
    });

    if (!existingLicense) {
      await prisma.license.create({
        data: {
          ...licenseData,
          createdBy: seedData.users.superAdmin || "seed",
        },
      });
      logger.info(`Created license: ${licenseData.name}`);
    }
  }
}

/**
 * Seed Vendors
 */
async function seedVendors() {
  logger.info("Seeding Vendors...");

  const vendorsData = [
    {
      name: "ABC Stationery Supplies",
      email: "contact@abcstationery.com",
      contact: "+91-9876544001",
      address: ["123 Supply Street", "City"],
      status: LeadStatus.CONVERTED,
      comments: "Regular supplier of stationery items",
      regionId: seedData.regions[0],
      employeeId: seedData.users.employees[0] || null,
    },
    {
      name: "XYZ Uniform Manufacturers",
      email: "info@xyzuniforms.com",
      contact: "+91-9876544002",
      address: ["456 Uniform Road", "City"],
      status: LeadStatus.HOT,
      comments: "Potential supplier for school uniforms",
      regionId: seedData.regions[1],
      employeeId: seedData.users.employees[1] || null,
    },
    {
      name: "Tech Solutions Pvt Ltd",
      email: "sales@techsolutions.com",
      contact: "+91-9876544003",
      address: ["789 Tech Avenue", "City"],
      status: LeadStatus.FOLLOW_UP,
      comments: "IT equipment supplier",
      regionId: seedData.regions[2],
      employeeId: seedData.users.employees[2] || null,
    },
  ];

  for (const vendorData of vendorsData) {
    const existingVendor = await prisma.vendor.findFirst({
      where: { name: vendorData.name, deletedAt: null },
    });

    if (!existingVendor) {
      await prisma.vendor.create({
        data: {
          ...vendorData,
          createdBy: seedData.users.superAdmin || "seed",
        },
      });
      logger.info(`Created vendor: ${vendorData.name}`);
    }
  }
}

/**
 * Seed Settings
 */
async function seedSettings() {
  logger.info("Seeding Settings...");

  for (const schoolId of seedData.schools) {
    const existingSettings = await prisma.settings.findFirst({
      where: { schoolId: schoolId, deletedAt: null },
    });

    if (!existingSettings) {
      await prisma.settings.create({
        data: {
          schoolId: schoolId,
          studentFeeInstallments: 12,
          studentFeeAmount: 50000, // ₹500.00 in paise
          currentInstallmentNumber: 6,
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });
      logger.info(`Created settings for school: ${schoolId}`);
    }
  }
}

/**
 * Seed ID Card template, config, and collections (so ID Cards page has rows per class).
 */
async function seedIdCards() {
  logger.info("Seeding templates, ID card config, and collections...");

  const currentYear = new Date().getFullYear();

  const allTemplates = [
    ...Array.from({ length: 14 }, (_, i) => ({
      type: TemplateType.ID_CARD,
      path: `id-cards/${i + 1}`,
      title: `ID Card Template ${i + 1}`,
    })),
    { type: TemplateType.FEE_RECEIPT, path: "receipts/fee/1", title: "Fee Receipt Template 1" },
  ];

  for (const tpl of allTemplates) {
    const existing = await prisma.template.findFirst({
      where: { type: tpl.type, path: tpl.path },
    });
    if (!existing) {
      await prisma.template.create({ data: tpl });
      logger.info(`Created template: ${tpl.title} (${tpl.type})`);
    }
  }

  let template = await prisma.template.findFirst({
    where: { type: TemplateType.ID_CARD },
  });

  for (const schoolId of seedData.schools) {
    const schoolAdminId = seedData.users.schoolAdmins[schoolId] || "seed";

    // 2. IdCardConfig for current year (so school can manage config and generate)
    const existingConfig = await prisma.idCardConfig.findFirst({
      where: { schoolId, year: currentYear, deletedAt: null },
    });
    if (!existingConfig) {
      await prisma.idCardConfig.create({
        data: {
          schoolId,
          year: currentYear,
          templateId: template.id,
          config: {},
          createdBy: schoolAdminId,
        },
      });
      logger.info(`Created IdCardConfig for school ${schoolId} (year ${currentYear})`);
    }

    // 3. IdCardCollection per class (so ID Cards page shows one row per class)
    const classes = await prisma.class.findMany({
      where: { schoolId, deletedAt: null },
      select: { id: true },
    });
    const classIds = classes.map((c) => c.id);
    for (const classId of classIds) {
      const existing = await prisma.idCardCollection.findUnique({
        where: {
          schoolId_classId_year: { schoolId, classId, year: currentYear },
        },
      });
      if (!existing) {
        await prisma.idCardCollection.create({
          data: {
            schoolId,
            classId,
            year: currentYear,
            status: IdCardCollectionStatus.NOT_GENERATED,
            createdBy: schoolAdminId,
          },
        });
      }
    }
    logger.info(`Created IdCardCollection for ${classIds.length} classes in school ${schoolId}`);
  }
}

/**
 * Seed Grievances
 */
async function seedGrievances() {
  logger.info("Seeding Grievances...");

  const grievancesData = [
    {
      title: "Internet Connectivity Issue",
      description: "Facing frequent internet disconnections affecting online classes",
      status: GrievanceStatus.OPEN,
      priority: GrievancePriority.HIGH,
      schoolId: seedData.schools[0],
      createdById: seedData.users.schoolAdmins[seedData.schools[0]] || seedData.users.superAdmin,
    },
    {
      title: "Request for Additional Staff",
      description: "Need additional teaching staff for mathematics department",
      status: GrievanceStatus.IN_PROGRESS,
      priority: GrievancePriority.MEDIUM,
      schoolId: seedData.schools[1],
      createdById: seedData.users.schoolAdmins[seedData.schools[1]] || seedData.users.superAdmin,
    },
    {
      title: "Software Update Required",
      description: "Requesting update to latest version of SchooliAt platform",
      status: GrievanceStatus.RESOLVED,
      priority: GrievancePriority.LOW,
      schoolId: null,
      createdById: seedData.users.employees[0] || seedData.users.superAdmin,
    },
  ];

  for (const grievanceData of grievancesData) {
    const grievance = await prisma.grievance.create({
      data: {
        title: grievanceData.title,
        description: grievanceData.description,
        status: grievanceData.status,
        priority: grievanceData.priority,
        createdById: grievanceData.createdById,
        schoolId: grievanceData.schoolId,
        resolvedById: grievanceData.status === GrievanceStatus.RESOLVED ? seedData.users.superAdmin : null,
        resolvedAt: grievanceData.status === GrievanceStatus.RESOLVED ? new Date() : null,
      },
    });

    // Add comments to some grievances
    if (grievanceData.status === GrievanceStatus.IN_PROGRESS) {
      await prisma.grievanceComment.create({
        data: {
          grievanceId: grievance.id,
          authorId: seedData.users.superAdmin || grievanceData.createdById,
          content: "We are looking into this matter and will update you soon.",
        },
      });
    }

    logger.info(`Created grievance: ${grievanceData.title}`);
  }
}

/**
 * Seed Salary Structures and Payments
 */
async function seedSalaries() {
  logger.info("Seeding Salary Structures and Payments...");

  for (const schoolId of seedData.schools) {
    const schoolAdminId = seedData.users.schoolAdmins[schoolId];
    const teachers = seedData.users.teachers[schoolId] || [];

    // Create salary structure
    const salaryStructure = await prisma.salaryStructure.create({
      data: {
        name: "Standard Teacher Salary",
        schoolId: schoolId,
        grossMonthlyAmount: 50000, // ₹50,000
        netMonthlyAmount: 40000, // ₹40,000
        createdBy: schoolAdminId || "seed",
      },
    });

    // Create salary structure components
    const components = [
      {
        name: "Basic Pay",
        type: SalaryComponentType.GROSS,
        value: 30000,
        valueType: SalaryComponentValueType.ABSOLUTE,
        frequency: SalaryComponentFrequency.MONTHLY,
        isBasePayComponent: true,
      },
      {
        name: "HRA",
        type: SalaryComponentType.GROSS,
        value: 40,
        valueType: SalaryComponentValueType.PERCENTAGE,
        frequency: SalaryComponentFrequency.MONTHLY,
        isBasePayComponent: false,
      },
      {
        name: "Transport Allowance",
        type: SalaryComponentType.GROSS,
        value: 5000,
        valueType: SalaryComponentValueType.ABSOLUTE,
        frequency: SalaryComponentFrequency.MONTHLY,
        isBasePayComponent: false,
      },
      {
        name: "Income Tax",
        type: SalaryComponentType.NET,
        value: 10,
        valueType: SalaryComponentValueType.PERCENTAGE,
        frequency: SalaryComponentFrequency.MONTHLY,
        isBasePayComponent: false,
      },
    ];

    for (const componentData of components) {
      await prisma.salaryStructureComponent.create({
        data: {
          ...componentData,
          salaryStructureId: salaryStructure.id,
          schoolId: schoolId,
          createdBy: schoolAdminId || "seed",
        },
      });
    }

    // Create salary records for teachers
    for (const teacherId of teachers.slice(0, 3)) {
      const salary = await prisma.salary.create({
        data: {
          schoolId: schoolId,
          userId: teacherId,
          salaryStructureId: salaryStructure.id,
          from: new Date(`${new Date().getFullYear()}-01-01`),
          till: new Date(`${new Date().getFullYear()}-12-31`),
          createdBy: schoolAdminId || "seed",
        },
      });

      // Create salary payments for last 3 months
      const currentMonth = new Date();
      for (let i = 0; i < 3; i++) {
        const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
        const monthString = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;

        await prisma.salaryPayments.create({
          data: {
            schoolId: schoolId,
            userId: teacherId,
            month: monthString,
            totalAmount: 40000,
            componentAmounts: {
              basic: 30000,
              hra: 12000,
              transport: 5000,
              tax: 5000,
            },
            createdBy: schoolAdminId || "seed",
          },
        });
      }

      logger.info(`Created salary for teacher: ${teacherId}`);
    }
  }
}

// ============================================
// PHASE 1: ACADEMIC & ADMINISTRATIVE MODULES
// ============================================

/**
 * Seed Attendance Periods
 */
async function seedAttendancePeriods() {
  logger.info("Seeding attendance periods...");
  
  for (const schoolId of seedData.schools) {
    const periods = [
      { name: "Period 1", startTime: "08:00", endTime: "08:45" },
      { name: "Period 2", startTime: "08:45", endTime: "09:30" },
      { name: "Period 3", startTime: "09:30", endTime: "10:15" },
      { name: "Period 4", startTime: "10:15", endTime: "11:00" },
      { name: "Period 5", startTime: "11:15", endTime: "12:00" },
      { name: "Period 6", startTime: "12:00", endTime: "12:45" },
      { name: "Period 7", startTime: "12:45", endTime: "13:30" },
    ];

    seedData.attendancePeriods[schoolId] = {};
    let createdCount = 0;

    for (const period of periods) {
      const existing = await prisma.attendancePeriod.findFirst({
        where: {
          name: period.name,
          schoolId: schoolId,
          deletedAt: null,
        },
      });

      if (!existing) {
        const created = await prisma.attendancePeriod.create({
          data: {
            name: period.name,
            startTime: period.startTime,
            endTime: period.endTime,
            schoolId: schoolId,
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });

        seedData.attendancePeriods[schoolId][created.id] = created;
        createdCount++;
      }
    }

    logger.info(`Created ${createdCount} attendance periods for school: ${schoolId}`);
  }
}

/**
 * Seed Attendance Records
 */
async function seedAttendance() {
  logger.info("Seeding attendance records...");

  for (const schoolId of seedData.schools) {
    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 10, // Limit to 10 students per school
    });

    if (students.length === 0) continue;

    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 3,
    });

    if (classes.length === 0) continue;

    const teachers = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.TEACHER },
        deletedAt: null,
      },
      take: 2,
    });

    if (teachers.length === 0) continue;

    // Create attendance for last 30 days
    const today = new Date();
    const attendanceStatuses = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.HALF_DAY];

    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() - day);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const student of students) {
        const studentClass = classes[Math.floor(Math.random() * classes.length)];
        const teacher = teachers[Math.floor(Math.random() * teachers.length)];
        const status = attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)];

        await prisma.attendance.create({
          data: {
            studentId: student.id,
            classId: studentClass.id,
            date: date,
            status: status,
            markedBy: teacher.id,
            schoolId: schoolId,
            lateArrivalTime: status === AttendanceStatus.LATE ? (() => { const d = new Date(date); d.setHours(8, 30); return d; })() : null,
            absenceReason: status === AttendanceStatus.ABSENT ? "Sick" : null,
            createdBy: teacher.id,
          },
        });
      }
    }

    logger.info(`Created attendance records for ${students.length} students over 30 days for school: ${schoolId}`);
  }
}

/**
 * Seed Timetables
 */
async function seedTimetables() {
  logger.info("Seeding timetables...");

  for (const schoolId of seedData.schools) {
    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 3,
    });

    if (classes.length === 0) continue;

    const subjects = await prisma.subject.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 5,
    });

    if (subjects.length === 0) continue;

    const teachers = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.TEACHER },
        deletedAt: null,
      },
      take: 5,
    });

    if (teachers.length === 0) continue;

    for (const classItem of classes) {
      const effectiveFrom = new Date();
      effectiveFrom.setMonth(effectiveFrom.getMonth() - 1);

      const classLabel = `${classItem.grade}${classItem.division ? "-" + classItem.division : ""}`;
      const timetable = await prisma.timetable.create({
        data: {
          name: `Timetable - ${classLabel}`,
          classId: classItem.id,
          schoolId: schoolId,
          effectiveFrom: effectiveFrom,
          isActive: true,
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });

      // Create slots for each day (Monday to Friday, 0-4)
      const days = [1, 2, 3, 4, 5]; // Monday to Friday
      const periods = [
        { number: 1, startTime: "08:00", endTime: "08:45" },
        { number: 2, startTime: "08:45", endTime: "09:30" },
        { number: 3, startTime: "09:30", endTime: "10:15" },
        { number: 4, startTime: "10:15", endTime: "11:00" },
        { number: 5, startTime: "11:15", endTime: "12:00" },
        { number: 6, startTime: "12:00", endTime: "12:45" },
        { number: 7, startTime: "12:45", endTime: "13:30" },
      ];

      for (const day of days) {
        for (const period of periods) {
          const subject = subjects[Math.floor(Math.random() * subjects.length)];
          const teacher = teachers[Math.floor(Math.random() * teachers.length)];

          await prisma.timetableSlot.create({
            data: {
              timetableId: timetable.id,
              dayOfWeek: day,
              periodNumber: period.number,
              subjectId: subject.id,
              teacherId: teacher.id,
              room: `Room ${Math.floor(Math.random() * 20) + 1}`,
              startTime: period.startTime,
              endTime: period.endTime,
              createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
            },
          });
        }
      }

      logger.info(`Created timetable with ${days.length * periods.length} slots for class: ${classLabel}`);
    }
  }
}

/**
 * Seed Homeworks
 */
async function seedHomeworks() {
  logger.info("Seeding homeworks...");

  for (const schoolId of seedData.schools) {
    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 3,
    });

    if (classes.length === 0) continue;

    const subjects = await prisma.subject.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 5,
    });

    if (subjects.length === 0) continue;

    const teachers = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.TEACHER },
        deletedAt: null,
      },
      take: 3,
    });

    if (teachers.length === 0) continue;

    const homeworkTitles = [
      "Complete Chapter 5 Exercises",
      "Write an essay on Environmental Conservation",
      "Solve Math Problems 1-20",
      "Read Chapter 3 and answer questions",
      "Prepare presentation on History",
    ];

    for (let i = 0; i < 5; i++) {
      const classIds = [classes[Math.floor(Math.random() * classes.length)].id];
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const teacher = teachers[Math.floor(Math.random() * teachers.length)];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1);

      const isMCQ = Math.random() > 0.5;

      const homework = await prisma.homework.create({
        data: {
          title: homeworkTitles[i % homeworkTitles.length],
          description: `Complete the assigned work for ${subject.name}. Submit before the due date.`,
          classIds: classIds,
          subjectId: subject.id,
          teacherId: teacher.id,
          dueDate: dueDate,
          isMCQ: isMCQ,
          attachments: [],
          schoolId: schoolId,
          createdBy: teacher.id,
        },
      });

      // Create MCQ questions if it's an MCQ homework
      if (isMCQ) {
        for (let q = 0; q < 5; q++) {
          await prisma.mCQQuestion.create({
            data: {
              homeworkId: homework.id,
              question: `MCQ Question ${q + 1}: What is the answer?`,
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: Math.floor(Math.random() * 4),
              marks: 2,
              createdBy: teacher.id,
            },
          });
        }
      }

      // Create submissions for some students
      const students = await prisma.user.findMany({
        where: {
          schoolId: schoolId,
          role: { name: RoleName.STUDENT },
          deletedAt: null,
        },
        take: 5,
      });

      for (const student of students) {
        const status = Math.random() > 0.3 ? SubmissionStatus.SUBMITTED : SubmissionStatus.PENDING;
        const submittedAt = status === SubmissionStatus.SUBMITTED ? new Date() : null;

        await prisma.homeworkSubmission.create({
          data: {
            homeworkId: homework.id,
            studentId: student.id,
            submittedAt: submittedAt,
            status: status,
            files: [],
            feedback: status === SubmissionStatus.SUBMITTED && Math.random() > 0.5 ? "Good work!" : null,
            grade: status === SubmissionStatus.SUBMITTED && Math.random() > 0.5 ? "A" : null,
            createdBy: student.id,
          },
        });
      }

      logger.info(`Created homework: ${homework.title}`);
    }
  }
}

/**
 * Seed Marks and Results
 */
async function seedMarks() {
  logger.info("Seeding marks and results...");

  for (const schoolId of seedData.schools) {
    const exams = await prisma.exam.findMany({
      where: { schoolId: schoolId },
      take: 2,
    });

    if (exams.length === 0) continue;

    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 10,
    });

    if (students.length === 0) continue;

    const subjects = await prisma.subject.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 5,
    });

    if (subjects.length === 0) continue;

    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId, deletedAt: null },
      take: 3,
    });

    if (classes.length === 0) continue;

    for (const exam of exams) {
      for (const student of students) {
        const studentClass = classes[Math.floor(Math.random() * classes.length)];
        let totalMarks = 0;
        let maxTotalMarks = 0;

        // Create marks for each subject
        for (const subject of subjects) {
          // Check if marks already exist
          const existingMarks = await prisma.marks.findFirst({
            where: {
              examId: exam.id,
              studentId: student.id,
              subjectId: subject.id,
              deletedAt: null,
            },
          });

          if (existingMarks) {
            totalMarks += Number(existingMarks.marksObtained);
            maxTotalMarks += Number(existingMarks.maxMarks);
            continue;
          }

          const maxMarks = 100;
          const marksObtained = Math.floor(Math.random() * maxMarks) + 20; // 20-100
          const percentage = (marksObtained / maxMarks) * 100;
          let grade = "F";
          if (percentage >= 90) grade = "A+";
          else if (percentage >= 80) grade = "A";
          else if (percentage >= 70) grade = "B";
          else if (percentage >= 60) grade = "C";
          else if (percentage >= 50) grade = "D";

          await prisma.marks.create({
            data: {
              examId: exam.id,
              studentId: student.id,
              subjectId: subject.id,
              classId: studentClass.id,
              marksObtained: marksObtained,
              maxMarks: maxMarks,
              percentage: percentage,
              grade: grade,
              schoolId: schoolId,
              createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
            },
          });

          totalMarks += marksObtained;
          maxTotalMarks += maxMarks;
        }

        // Create result (check if it already exists)
        const existingResult = await prisma.result.findFirst({
          where: {
            examId: exam.id,
            studentId: student.id,
            deletedAt: null,
          },
        });

        if (!existingResult && maxTotalMarks > 0) {
          const totalPercentage = (totalMarks / maxTotalMarks) * 100;
          const cgpa = totalPercentage / 10;
          let grade = "F";
          if (totalPercentage >= 90) grade = "A+";
          else if (totalPercentage >= 80) grade = "A";
          else if (totalPercentage >= 70) grade = "B";
          else if (totalPercentage >= 60) grade = "C";
          else if (totalPercentage >= 50) grade = "D";

          await prisma.result.create({
            data: {
              examId: exam.id,
              studentId: student.id,
              classId: studentClass.id,
              totalMarks: totalMarks,
              maxTotalMarks: maxTotalMarks,
              percentage: totalPercentage,
              cgpa: cgpa,
              grade: grade,
              isPass: totalPercentage >= 50,
              publishedAt: new Date(),
              publishedBy: seedData.users.schoolAdmins[schoolId] || "seed",
              schoolId: schoolId,
              createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
            },
          });
        }
      }

      logger.info(`Created marks and results for exam: ${exam.name}`);
    }
  }
}

/**
 * Seed Leave Types
 */
async function seedLeaveTypes() {
  logger.info("Seeding leave types...");

  const leaveTypes = [
    { name: "Casual Leave", maxLeaves: 12 },
    { name: "Sick Leave", maxLeaves: 10 },
    { name: "Earned Leave", maxLeaves: 15 },
    { name: "Emergency Leave", maxLeaves: 5 },
  ];

  for (const schoolId of seedData.schools) {
    let createdCount = 0;
    for (const leaveType of leaveTypes) {
      const existing = await prisma.leaveType.findFirst({
        where: {
          name: leaveType.name,
          schoolId: schoolId,
          deletedAt: null,
        },
      });

      if (!existing) {
        await prisma.leaveType.create({
          data: {
            name: leaveType.name,
            maxLeaves: leaveType.maxLeaves,
            schoolId: schoolId,
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });
        createdCount++;
      }
    }

    logger.info(`Processed ${leaveTypes.length} leave types (${createdCount} created) for school: ${schoolId}`);
  }
}

/**
 * Seed Leave Requests
 */
async function seedLeaveRequests() {
  logger.info("Seeding leave requests...");

  for (const schoolId of seedData.schools) {
    const teachers = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.TEACHER },
        deletedAt: null,
      },
      take: 3,
    });

    const staff = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STAFF },
        deletedAt: null,
      },
      take: 2,
    });

    const users = [...teachers, ...staff];
    if (users.length === 0) continue;

    const leaveTypes = await prisma.leaveType.findMany({
      where: { schoolId: schoolId, deletedAt: null },
    });

    if (leaveTypes.length === 0) continue;

    const schoolAdmin = await prisma.user.findFirst({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.SCHOOL_ADMIN },
        deletedAt: null,
      },
    });

    for (const user of users) {
      const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 3) + 1);

      const statuses = [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.REJECTED];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.leaveRequest.create({
        data: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          startDate: startDate,
          endDate: endDate,
          reason: "Personal work",
          status: status,
          approvedBy: status === LeaveStatus.APPROVED ? (schoolAdmin?.id || "seed") : null,
          approvedAt: status === LeaveStatus.APPROVED ? new Date() : null,
          schoolId: schoolId,
          createdBy: user.id,
        },
      });

      // Create leave balance (check if it exists)
      const year = new Date().getFullYear();
      const existingBalance = await prisma.leaveBalance.findFirst({
        where: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          year: year,
          deletedAt: null,
        },
      });

      if (!existingBalance) {
        await prisma.leaveBalance.create({
          data: {
            userId: user.id,
            leaveTypeId: leaveType.id,
            totalLeaves: leaveType.maxLeaves || 10,
            usedLeaves: Math.floor(Math.random() * 5),
            remainingLeaves: (leaveType.maxLeaves || 10) - Math.floor(Math.random() * 5),
            year: year,
            schoolId: schoolId,
            createdBy: user.id,
          },
        });
      }
    }

    logger.info(`Created leave requests for ${users.length} users for school: ${schoolId}`);
  }
}

/**
 * Seed Communication (Conversations, Messages, Notifications)
 */
async function seedCommunication() {
  logger.info("Seeding communication data...");

  for (const schoolId of seedData.schools) {
    const teachers = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.TEACHER },
        deletedAt: null,
      },
      take: 2,
    });

    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 3,
    });

    if (teachers.length === 0 || students.length === 0) continue;

    // Create direct conversations
    for (const teacher of teachers) {
      for (const student of students.slice(0, 2)) {
        const conversation = await prisma.conversation.create({
          data: {
            participants: [teacher.id, student.id],
            type: ConversationType.DIRECT,
            schoolId: schoolId,
            createdBy: teacher.id,
          },
        });

        // Create messages
        for (let i = 0; i < 3; i++) {
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              senderId: i % 2 === 0 ? teacher.id : student.id,
              content: `Message ${i + 1} in conversation`,
              attachments: [],
              readBy: i < 2 ? [teacher.id, student.id] : [],
              sentAt: new Date(Date.now() - (3 - i) * 3600000),
              createdBy: i % 2 === 0 ? teacher.id : student.id,
            },
          });
        }
      }
    }

    // Create notifications
    for (const student of students) {
      const notificationTypes = [NotificationType.ATTENDANCE, NotificationType.HOMEWORK, NotificationType.EXAM, NotificationType.FEE, NotificationType.ANNOUNCEMENT];
      for (let i = 0; i < 5; i++) {
        await prisma.notification.create({
          data: {
            userId: student.id,
            title: `Notification ${i + 1}`,
            content: `This is a ${notificationTypes[i % notificationTypes.length]} notification`,
            type: notificationTypes[i % notificationTypes.length],
            isRead: Math.random() > 0.5,
            schoolId: schoolId,
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });
      }
    }

    logger.info(`Created communication data for school: ${schoolId}`);
  }
}

// ============================================
// PHASE 2: SUPPORTING MODULES
// ============================================

/**
 * Seed Library (LibraryBook, LibraryIssue, LibraryReservation)
 */
async function seedLibrary() {
  logger.info("Seeding library data...");

  const bookTitles = [
    { title: "Mathematics for Class 10", author: "NCERT", category: "Academic", isbn: "978-81-7450-100-1" },
    { title: "English Grammar", author: "Wren & Martin", category: "Academic", isbn: "978-81-7450-101-2" },
    { title: "Science Experiments", author: "Dr. R. Sharma", category: "Academic", isbn: "978-81-7450-102-3" },
    { title: "History of India", author: "Romila Thapar", category: "Academic", isbn: "978-81-7450-103-4" },
    { title: "Computer Basics", author: "Tech Publications", category: "Reference", isbn: "978-81-7450-104-5" },
    { title: "General Knowledge 2024", author: "Arihant", category: "Reference", isbn: "978-81-7450-105-6" },
    { title: "Story Tales", author: "Various", category: "Fiction", isbn: "978-81-7450-106-7" },
    { title: "Dictionary", author: "Oxford", category: "Reference", isbn: "978-81-7450-107-8" },
  ];

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const books = [];

    for (const b of bookTitles) {
      const existing = await prisma.libraryBook.findFirst({
        where: { schoolId, title: b.title, deletedAt: null },
      });
      if (existing) continue;

      const book = await prisma.libraryBook.create({
        data: {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          category: b.category,
          totalCopies: randomInt(2, 5),
          availableCopies: randomInt(1, 4),
          language: "English",
          schoolId,
          createdBy,
        },
      });
      books.push(book);
    }

    // Issue a few books to students
    const students = await prisma.user.findMany({
      where: { schoolId, role: { name: RoleName.STUDENT }, deletedAt: null },
      take: 3,
    });
    const allBooks = await prisma.libraryBook.findMany({
      where: { schoolId, deletedAt: null, availableCopies: { gt: 0 } },
      take: 5,
    });
    for (let i = 0; i < Math.min(3, students.length, allBooks.length); i++) {
      const issueExists = await prisma.libraryIssue.findFirst({
        where: { bookId: allBooks[i].id, userId: students[i].id, status: LibraryIssueStatus.ISSUED, deletedAt: null },
      });
      if (issueExists) continue;
      const due = new Date();
      due.setDate(due.getDate() + 14);
      await prisma.libraryIssue.create({
        data: {
          bookId: allBooks[i].id,
          userId: students[i].id,
          issuedDate: new Date(),
          dueDate: due,
          status: LibraryIssueStatus.ISSUED,
          schoolId,
          createdBy,
        },
      });
      await prisma.libraryBook.update({
        where: { id: allBooks[i].id },
        data: { availableCopies: { decrement: 1 } },
      });
    }

    logger.info(`Created ${books.length} library books and issues for school: ${schoolId}`);
  }
}

/**
 * Seed Notes and Syllabus
 */
async function seedNotesAndSyllabus() {
  logger.info("Seeding notes and syllabus...");

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const classIds = seedData.classes[schoolId] || [];
    const subjectIds = seedData.subjects[schoolId] || [];
    if (classIds.length === 0 || subjectIds.length === 0) continue;

    const noteTitles = [
      "Algebra Basics", "Quadratic Equations", "Trigonometry Introduction",
      "Essay Writing", "Comprehension Tips", "Grammar Rules",
      "Physics Motion", "Chemistry Basics", "Biology Cells",
    ];
    for (let i = 0; i < noteTitles.length; i++) {
      const existing = await prisma.note.findFirst({
        where: { schoolId, title: noteTitles[i], deletedAt: null },
      });
      if (existing) continue;
      await prisma.note.create({
        data: {
          title: noteTitles[i],
          description: `Study notes for ${noteTitles[i]}. Use for revision.`,
          subjectId: subjectIds[i % subjectIds.length],
          classId: classIds[i % classIds.length],
          chapter: `Chapter ${(i % 5) + 1}`,
          topic: "Overview",
          schoolId,
          createdBy,
        },
      });
    }

    const syllabusTitles = ["Mathematics Syllabus 2024-25", "Science Syllabus 2024-25", "English Syllabus 2024-25"];
    for (let i = 0; i < syllabusTitles.length; i++) {
      const existing = await prisma.syllabus.findFirst({
        where: { schoolId, title: syllabusTitles[i], deletedAt: null },
      });
      if (existing) continue;
      await prisma.syllabus.create({
        data: {
          title: syllabusTitles[i],
          description: `Full syllabus for academic year 2024-25`,
          subjectId: subjectIds[i % subjectIds.length],
          classId: classIds[0],
          academicYear: "2024-25",
          chapters: ["Ch1", "Ch2", "Ch3", "Ch4", "Ch5"],
          schoolId,
          createdBy,
        },
      });
    }

    logger.info(`Created notes and syllabi for school: ${schoolId}`);
  }
}

/**
 * Seed Gallery (Gallery + GalleryImage; creates minimal File records for images)
 */
async function seedGallery() {
  logger.info("Seeding gallery data...");

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const classIds = seedData.classes[schoolId] || [];
    const events = await prisma.event.findMany({ where: { schoolId, deletedAt: null }, take: 2 });

    const galleryTitles = ["Annual Day 2024", "Sports Day", "Science Exhibition", "Class Photos"];
    for (let i = 0; i < galleryTitles.length; i++) {
      const existing = await prisma.gallery.findFirst({
        where: { schoolId, title: galleryTitles[i], deletedAt: null },
      });
      if (existing) continue;

      const gallery = await prisma.gallery.create({
        data: {
          title: galleryTitles[i],
          description: `${galleryTitles[i]} - School events gallery`,
          eventId: events[i % events.length]?.id || null,
          privacy: i === 0 ? GalleryPrivacy.PUBLIC : GalleryPrivacy.SCHOOL_ONLY,
          classId: classIds[i % classIds.length] || null,
          schoolId,
          createdBy,
        },
      });

      // Create a minimal file record for each gallery image (seed placeholder)
      for (let j = 0; j < 2; j++) {
        const file = await prisma.file.create({
          data: {
            extension: "jpg",
            name: `gallery-${gallery.id}-${j}.jpg`,
            contentType: "image/jpeg",
            size: 1024,
            createdBy,
          },
        });
        await prisma.galleryImage.create({
          data: {
            galleryId: gallery.id,
            fileId: file.id,
            caption: `Image ${j + 1}`,
            order: j,
            schoolId,
            createdBy,
          },
        });
      }
    }

    logger.info(`Created galleries for school: ${schoolId}`);
  }
}

/**
 * Seed Circulars
 */
async function seedCirculars() {
  logger.info("Seeding circulars...");

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const classIds = seedData.classes[schoolId] || [];

    const circulars = [
      { title: "School Reopening Notice", content: "School reopens on 1st June. All students must report by 8 AM.", status: CircularStatus.PUBLISHED },
      { title: "Parent-Teacher Meeting", content: "PTM scheduled for 15th of this month. Please attend.", status: CircularStatus.PUBLISHED },
      { title: "Holiday List 2024-25", content: "Please find the list of holidays for the academic year.", status: CircularStatus.DRAFT },
      { title: "Exam Schedule", content: "Unit test schedule will be shared shortly.", status: CircularStatus.PUBLISHED },
    ];

    for (const c of circulars) {
      const existing = await prisma.circular.findFirst({
        where: { schoolId, title: c.title, deletedAt: null },
      });
      if (existing) continue;
      await prisma.circular.create({
        data: {
          title: c.title,
          content: c.content,
          status: c.status,
          targetRoles: ["TEACHER", "STAFF", "STUDENT"],
          targetUserIds: [],
          classIds: classIds.slice(0, 2),
          attachments: [],
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          publishedAt: c.status === CircularStatus.PUBLISHED ? new Date() : null,
          schoolId,
          createdBy,
        },
      });
    }

    logger.info(`Created circulars for school: ${schoolId}`);
  }
}

/**
 * Seed FAQs (school-specific and global)
 */
async function seedFAQs() {
  logger.info("Seeding FAQs...");

  const globalFaqs = [
    { question: "How do I check my attendance?", answer: "Go to Dashboard > Attendance to view your attendance summary." },
    { question: "Where can I see homework?", answer: "Homework is listed under Homework section. Submit before the due date." },
    { question: "How to view exam results?", answer: "Results are published under Results after the exam. Check Marks for subject-wise breakdown." },
    { question: "How to pay fees online?", answer: "Go to Finance > Fees and use the Pay option for pending installments." },
    { question: "How do I apply for leave?", answer: "Go to Leave > My Leaves and submit a new leave request with dates and reason." },
  ];

  for (const faq of globalFaqs) {
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question, schoolId: null, deletedAt: null },
    });
    if (existing) continue;
    await prisma.fAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: "General",
        keywords: ["help", "faq"],
        schoolId: null,
        createdBy: "seed",
      },
    });
  }

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const schoolFaqs = [
      { question: "What are the school timings?", answer: "School timings are 8:00 AM to 2:30 PM. Refer to the timetable for period details." },
      { question: "How to collect transfer certificate?", answer: "Submit a written application at the admin office. TC will be issued within 5 working days." },
    ];
    for (const faq of schoolFaqs) {
      const existing = await prisma.fAQ.findFirst({
        where: { schoolId, question: faq.question, deletedAt: null },
      });
      if (existing) continue;
      await prisma.fAQ.create({
        data: {
          question: faq.question,
          answer: faq.answer,
          category: "School",
          schoolId,
          createdBy,
        },
      });
    }
  }

  logger.info("Created global and school FAQs.");
}

/**
 * Seed Routes and Vehicle Maintenance (for transports)
 */
async function seedRoutesAndMaintenance() {
  logger.info("Seeding routes and vehicle maintenance...");

  for (const schoolId of seedData.schools) {
    const createdBy = seedData.users.schoolAdmins[schoolId] || "seed";
    const transports = seedData.transports[schoolId] || [];
    if (transports.length === 0) continue;

    const transportIds = seedData.transports[schoolId] || [];

    for (let i = 0; i < Math.min(2, transportIds.length); i++) {
      const routeName = `Route ${i + 1} - Main`;
      const existingRoute = await prisma.route.findFirst({
        where: { schoolId, name: routeName, deletedAt: null },
      });
      if (existingRoute) continue;

      const route = await prisma.route.create({
        data: {
          name: routeName,
          transportId: transportIds[i],
          startPoint: "School Main Gate",
          endPoint: i === 0 ? "Central Station" : "North Colony",
          distance: 5.5 + i,
          estimatedTime: 25 + i * 10,
          schoolId,
          createdBy,
        },
      });

      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          name: "Stop 1 - Market",
          address: "Near Central Market",
          sequence: 1,
          arrivalTime: "08:15",
          schoolId,
          createdBy,
        },
      });
      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          name: "Stop 2 - Junction",
          sequence: 2,
          arrivalTime: "08:25",
          schoolId,
          createdBy,
        },
      });
    }

    for (const transportId of transportIds.slice(0, 2)) {
      const existing = await prisma.vehicleMaintenance.findFirst({
        where: { transportId, deletedAt: null },
      });
      if (existing) continue;
      const maintDate = new Date();
      maintDate.setMonth(maintDate.getMonth() - 1);
      await prisma.vehicleMaintenance.create({
        data: {
          transportId,
          maintenanceType: "General Service",
          description: "Oil change, brake check, tyre inspection",
          cost: 3500,
          maintenanceDate: maintDate,
          nextMaintenanceDate: new Date(maintDate.getTime() + 90 * 24 * 60 * 60 * 1000),
          serviceProvider: "Authorized Service Center",
          schoolId,
          createdBy,
        },
      });
    }
  }

  logger.info("Created routes and vehicle maintenance records.");
}

// ============================================
// PHASE 3: ADDITIONAL FEATURES
// ============================================

/**
 * Seed Parent-Child Links
 */
async function seedParentChildLinks() {
  logger.info("Seeding parent-child links...");

  for (const schoolId of seedData.schools) {
    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 10,
    });

    if (students.length === 0) continue;

    // Note: Parent role may not exist in schema yet
    // For now, we'll skip creating parent users if the role doesn't exist
    // This will be updated when Parent role is added to the schema
    logger.info("Parent role not found in schema, skipping parent user creation...");
    
    // If Parent role exists, uncomment the following:
    /*
    const relationships = ["FATHER", "MOTHER", "GUARDIAN"];
    const parents = [];

    for (let i = 0; i < Math.min(5, students.length); i++) {
      const relationship = relationships[i % relationships.length];
      const parentEmail = `parent${i + 1}@${schoolId}.edu`;
      
      const parent = await prisma.user.create({
        data: {
          email: parentEmail,
          password: await bcryptjs.hash("Parent@123", 10),
          name: `${relationship} ${i + 1}`,
          userType: UserType.SCHOOL,
          schoolId: schoolId,
          role: {
            connect: { name: RoleName.PARENT },
          },
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });

      parents.push({ parent, relationship });
    }
    */
    
    const parents = []; // Empty for now

    // Link parents to students (if parents exist)
    if (parents.length > 0) {
      for (let i = 0; i < students.length; i++) {
        const parentData = parents[i % parents.length];
        await prisma.parentChildLink.create({
          data: {
            parentId: parentData.parent.id,
            childId: students[i].id,
            relationship: parentData.relationship,
            isPrimary: i % 2 === 0,
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });
      }
      logger.info(`Created ${parents.length} parent accounts and linked them to students for school: ${schoolId}`);
    } else {
      logger.info(`Skipping parent-child links for school: ${schoolId} (Parent role not available)`);
    }
  }
}

/**
 * Seed Transfer Certificates
 */
async function seedTransferCertificates() {
  logger.info("Seeding transfer certificates...");

  for (const schoolId of seedData.schools) {
    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 2, // Only a few students have TCs
    });

    if (students.length === 0) continue;

    for (const student of students) {
      const tcNumber = `TC-${schoolId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const statuses = [TCStatus.ISSUED, TCStatus.COLLECTED, TCStatus.CANCELLED];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.transferCertificate.create({
        data: {
          studentId: student.id,
          schoolId: schoolId,
          tcNumber: tcNumber,
          reason: "Transfer to another school",
          transferDate: new Date(),
          destinationSchool: "Another School Name",
          remarks: "Student transferred successfully",
          status: status,
          createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
        },
      });
    }

    logger.info(`Created transfer certificates for ${students.length} students for school: ${schoolId}`);
  }
}

/**
 * Seed Emergency Contacts
 */
async function seedEmergencyContacts() {
  logger.info("Seeding emergency contacts...");

  for (const schoolId of seedData.schools) {
    const students = await prisma.user.findMany({
      where: {
        schoolId: schoolId,
        role: { name: RoleName.STUDENT },
        deletedAt: null,
      },
      take: 10,
    });

    if (students.length === 0) continue;

    const relationships = ["FATHER", "MOTHER", "GUARDIAN", "RELATIVE", "OTHER"];

    for (const student of students) {
      // Create 2-3 emergency contacts per student
      const numContacts = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numContacts; i++) {
        const relationship = relationships[i % relationships.length];
        await prisma.emergencyContact.create({
          data: {
            studentId: student.id,
            schoolId: schoolId,
            name: `${relationship} of ${[student.firstName, student.lastName].filter(Boolean).join(" ")}`,
            relationship: relationship,
            contact: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            alternateContact: i === 0 ? `+91${Math.floor(Math.random() * 9000000000) + 1000000000}` : null,
            address: `Address for ${relationship}`,
            isPrimary: i === 0,
            createdBy: seedData.users.schoolAdmins[schoolId] || "seed",
          },
        });
      }
    }

    logger.info(`Created emergency contacts for ${students.length} students for school: ${schoolId}`);
  }
}

/**
 * Main seed function
 */
async function main() {
  try {
    logger.info("Starting database seeding...");
    logger.info("=".repeat(60));

    await seedRoles();
    await seedRegionsAndLocations();
    await seedSchools();
    await seedClassesAndSubjects();
    await seedUsers();
    await seedTransport();
    await seedFees();
    await seedExams();
    await seedCalendarItems();
    await seedReceipts();
    await seedLicenses();
    await seedVendors();
    await seedSettings();
    try {
      await seedIdCards();
    } catch (error) {
      logger.warn(`Skipping ID cards seed: ${error.message}`);
    }
    await seedGrievances();
    await seedSalaries();
    
    // Phase 1: Academic & Administrative Modules
    try {
      await seedAttendancePeriods();
    } catch (error) {
      logger.warn(`Skipping attendance periods: ${error.message}`);
    }
    try {
      await seedAttendance();
    } catch (error) {
      logger.warn(`Skipping attendance: ${error.message}`);
    }
    try {
      await seedTimetables();
    } catch (error) {
      logger.warn(`Skipping timetables: ${error.message}`);
    }
    try {
      await seedHomeworks();
    } catch (error) {
      logger.warn(`Skipping homeworks: ${error.message}`);
    }
    try {
      await seedMarks();
    } catch (error) {
      logger.warn(`Skipping marks: ${error.message}`);
    }
    try {
      await seedLeaveTypes();
    } catch (error) {
      logger.warn(`Skipping leave types: ${error.message}`);
    }
    try {
      await seedLeaveRequests();
    } catch (error) {
      logger.warn(`Skipping leave requests: ${error.message}`);
    }
    try {
      await seedCommunication();
    } catch (error) {
      logger.warn(`Skipping communication: ${error.message}`);
    }
    
    // Phase 2: Supporting Modules
    try {
      await seedLibrary();
    } catch (error) {
      logger.warn(`Skipping library: ${error.message}`);
    }
    try {
      await seedNotesAndSyllabus();
    } catch (error) {
      logger.warn(`Skipping notes and syllabus: ${error.message}`);
    }
    try {
      await seedGallery();
    } catch (error) {
      logger.warn(`Skipping gallery: ${error.message}`);
    }
    try {
      await seedCirculars();
    } catch (error) {
      logger.warn(`Skipping circulars: ${error.message}`);
    }
    try {
      await seedFAQs();
    } catch (error) {
      logger.warn(`Skipping FAQs: ${error.message}`);
    }
    try {
      await seedRoutesAndMaintenance();
    } catch (error) {
      logger.warn(`Skipping routes and maintenance: ${error.message}`);
    }
    
    // Phase 3: Additional Features
    try {
      await seedParentChildLinks();
    } catch (error) {
      logger.warn(`Skipping parent-child links: ${error.message}`);
    }
    try {
      await seedTransferCertificates();
    } catch (error) {
      logger.warn(`Skipping transfer certificates: ${error.message}`);
    }
    try {
      await seedEmergencyContacts();
    } catch (error) {
      logger.warn(`Skipping emergency contacts: ${error.message}`);
    }

    // Sync all roles to default permissions and clear role cache (so API/dashboard see new permissions)
    const roleService = (await import("../src/services/role.service.js")).default;
    await roleService.updateRolePermissions();
    logger.info("Synced role permissions and cleared role cache.");

    logger.info("=".repeat(60));
    logger.info("Database seeding completed successfully!");
    logger.info("");
    logger.info("Default Login Credentials:");
    logger.info("Super Admin: admin@schooliat.com / Admin@123");
    logger.info("Employee: john.doe@schooliat.com / Employee@123");
    logger.info("School Admin: admin@gis001.edu / Admin@123");
    logger.info("Teacher: teacher1@gis001.edu / Teacher@123");
    logger.info("Student: student1@gis001.edu / Student@123");
    logger.info("Staff: staff1@gis001.edu / Staff@123");
  } catch (error) {
    logger.error("Error seeding database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

