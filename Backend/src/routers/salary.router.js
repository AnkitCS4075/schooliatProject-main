import { Router } from "express";
import prisma from "../prisma/client.js";
import withPermission from "../middlewares/with-permission.middleware.js";
import {
  Permission,
  RoleName,
  UserType,
  SalaryComponentFrequency,
  SalaryComponentValueType,
  SalaryComponentType,
  NotificationType,
} from "../prisma/generated/index.js";
import roleService from "../services/role.service.js";
import paginateUtil from "../utils/paginate.util.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fileService from "../services/file.service.js";
import { uploadFile } from "../config/storage/index.js";
import logger from "../config/logger.js";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Convert number to words (Indian format)
const numberToWords = (num) => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero Rupees Only";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  const intPart = Math.floor(num);
  let words = "";
  let remaining = intPart;

  if (remaining >= 10000000) {
    words +=
      convertLessThanThousand(Math.floor(remaining / 10000000)) + " Crore ";
    remaining = remaining % 10000000;
  }

  if (remaining >= 100000) {
    words += convertLessThanThousand(Math.floor(remaining / 100000)) + " Lakh ";
    remaining = remaining % 100000;
  }

  if (remaining >= 1000) {
    words +=
      convertLessThanThousand(Math.floor(remaining / 1000)) + " Thousand ";
    remaining = remaining % 1000;
  }

  if (remaining > 0) {
    words += convertLessThanThousand(remaining);
  }

  return words.trim() + " Rupees Only";
};

// Generate receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SAL-${timestamp}-${random}`;
};

// Load salary slip template
const getSalarySlipTemplate = () => {
  const templatePath = join(
    __dirname,
    "../templates/receipts/salary/1/template.html",
  );
  const stylePath = join(__dirname, "../templates/receipts/salary/1/styles.css");

  const template = readFileSync(templatePath, "utf-8");
  const styles = readFileSync(stylePath, "utf-8");

  // Inject styles inline
  return template.replace(
    '<link rel="stylesheet" href="styles.css">',
    `<style>${styles}</style>`,
  );
};

// Upload file and create DB entry
const uploadAndCreateFileEntry = async (
  buffer,
  name,
  extension,
  contentType,
  createdBy,
) => {
  const fileId = crypto.randomUUID();
  const key = `${fileId}.${extension}`;

  await uploadFile({ buffer, key, contentType });

  const file = await prisma.file.create({
    data: {
      id: fileId,
      name,
      extension,
      contentType,
      size: buffer.length,
      createdBy,
    },
  });

  return file.id;
};

// Generate salary slip HTML
const generateSalarySlipHTML = async (
  salaryPayment,
  employee,
  school,
  grossAmount,
  amountPaid,
) => {
  const template = getSalarySlipTemplate();

  const receiptDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const schoolAddress = school.address ? school.address.join(", ") : "N/A";
  const logoId = school.logoId || null;
  const logoSrc = logoId
    ? fileService.attachFileURL({ id: logoId, extension: "jpg" }).url
    : "";

  const employeeName = `${employee.firstName} ${employee.lastName || ""}`.trim();

  // Replace all placeholders
  let html = template;

  // School placeholders
  html = html.replace(/\{\{school\.logoSrc\}\}/g, logoSrc);
  html = html.replace(/\{\{school\.name\}\}/g, school.name || "School");
  html = html.replace(/\{\{school\.address\}\}/g, schoolAddress);

  // Receipt placeholders
  html = html.replace(/\{\{receipt\.date\}\}/g, receiptDate);

  // Salary placeholders
  const [year, month] = salaryPayment.month.split("-");
  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long" });
  html = html.replace(/\{\{salary\.month\}\}/g, `${monthName} ${year}`);
  html = html.replace(/\{\{salary\.grossAmount\}\}/g, grossAmount.toLocaleString("en-IN"));
  html = html.replace(/\{\{salary\.amountPaid\}\}/g, amountPaid.toLocaleString("en-IN"));

  html = html.replace(/\{\{salary\.status\}\}/g, "PAID");
  html = html.replace(/\{\{salary\.statusClass\}\}/g, "paid");

  // Employee placeholders
  html = html.replace(
    /\{\{employee\.publicId\}\}/g,
    employee.publicUserId || "N/A",
  );
  html = html.replace(/\{\{employee\.name\}\}/g, employeeName);
  html = html.replace(/\{\{employee\.role\}\}/g, employee.role?.name || "Employee");

  html = html.replace(
    /\{\{salary\.amountInWords\}\}/g,
    numberToWords(amountPaid),
  );

  return html;
};

const router = Router();

// Helper function to calculate component amount
function calculateComponentAmount(component, basePay) {
  if (component.valueType === SalaryComponentValueType.ABSOLUTE) {
    return component.value;
  } else if (component.valueType === SalaryComponentValueType.PERCENTAGE) {
    return Math.round((component.value * basePay) / 100);
  }
  return 0;
}

// Helper function to calculate monthly amounts from components
function calculateMonthlyAmounts(components, basePay) {
  const monthlyComponents = components.filter(
    (c) => c.frequency === SalaryComponentFrequency.MONTHLY,
  );
  let gross = 0;
  let net = 0;

  for (const component of monthlyComponents) {
    const amount = calculateComponentAmount(component, basePay);
    if (component.type === SalaryComponentType.GROSS) {
      gross += amount;
    }
    if (component.type === SalaryComponentType.NET) {
      net += amount;
    }
  }

  // grossMonthlyAmount includes both GROSS and NET components
  return {
    grossMonthlyAmount: gross + net,
    netMonthlyAmount: net,
  };
}

// GET /salary-structures - List all salary structures
router.get("/", async (req, res) => {
  const { schoolId } = req.query;

  const where = {
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  const salaryStructures = await prisma.salaryStructure.findMany({
    where,
    include: {
      components: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...paginateUtil.getPaginationParams(req),
  });

  return res.json({
    message: "Salary structures fetched!",
    data: salaryStructures,
  });
});

// GET /salary-structures/:id - Get salary structure by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const salaryStructure = await prisma.salaryStructure.findUnique({
    where: { id },
  });

  if (!salaryStructure || salaryStructure.deletedAt) {
    return res.status(404).json({
      message: "Salary structure not found",
    });
  }

  // Fetch components
  const components = await prisma.salaryStructureComponent.findMany({
    where: {
      salaryStructureId: id,
      deletedAt: null,
    },
  });

  return res.json({
    message: "Salary structure fetched!",
    data: {
      ...salaryStructure,
      components,
    },
  });
});

// POST /salary-structures - Create salary structure
router.post("/", async (req, res) => {
  const request = req.body?.request;
  const currentUser = req.context.user;

  if (!request || !request.schoolId || !request.components || !Array.isArray(request.components)) {
    return res.status(400).json({
      message: "Request must include request.schoolId and request.components (array). See API docs for structure.",
    });
  }

  // Validate school exists
  const school = await prisma.school.findUnique({
    where: { id: request.schoolId },
  });
  if (!school) {
    return res.status(404).json({
      message: "School not found",
    });
  }

  // Validate base pay component exists and has correct constraints
  const basePayComponent = request.components.find(
    (c) => c.isBasePayComponent === true,
  );

  if (!basePayComponent) {
    return res.status(400).json({
      message: "Base pay component is required (isBasePayComponent: true)",
    });
  }

  if (
    basePayComponent.frequency !== SalaryComponentFrequency.MONTHLY ||
    basePayComponent.valueType !== SalaryComponentValueType.ABSOLUTE
  ) {
    return res.status(400).json({
      message:
        "Base pay component must have frequency=MONTHLY and valueType=ABSOLUTE",
    });
  }

  const basePay = basePayComponent.value;

  // Calculate monthly amounts
  const { grossMonthlyAmount, netMonthlyAmount } = calculateMonthlyAmounts(
    request.components,
    basePay,
  );

  // Create salary structure
  const newSalaryStructure = await prisma.salaryStructure.create({
    data: {
      name: request.name,
      schoolId: request.schoolId,
      grossMonthlyAmount,
      netMonthlyAmount,
      createdBy: currentUser.id,
    },
  });

  // Create components
  const components = await prisma.salaryStructureComponent.createMany({
    data: request.components.map((component) => ({
      salaryStructureId: newSalaryStructure.id,
      schoolId: request.schoolId,
      name: component.name,
      type: component.type,
      value: component.value,
      valueType: component.valueType,
      frequency: component.frequency,
      isBasePayComponent: component.isBasePayComponent || false,
      createdBy: currentUser.id,
    })),
  });

  // Fetch created components
  const createdComponents = await prisma.salaryStructureComponent.findMany({
    where: {
      salaryStructureId: newSalaryStructure.id,
      deletedAt: null,
    },
  });

  return res.status(201).json({
    message: "Salary structure created!",
    data: {
      ...newSalaryStructure,
      components: createdComponents,
    },
  });
});

// PATCH /salary-structures/:id - Update salary structure
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const request = req.body.request;
  const currentUser = req.context.user;

  // Fetch existing salary structure
  const existingStructure = await prisma.salaryStructure.findUnique({
    where: { id },
  });

  if (!existingStructure || existingStructure.deletedAt) {
    return res.status(404).json({
      message: "Salary structure not found",
    });
  }

  // Fetch existing components
  const existingComponents = await prisma.salaryStructureComponent.findMany({
    where: {
      salaryStructureId: id,
      deletedAt: null,
    },
  });

  const updateData = {
    updatedBy: currentUser.id,
  };

  if (request.name) {
    updateData.name = request.name;
  }

  // Handle component updates
  let componentsChanged = false;
  let basePay = null;

  // Find existing base pay component to recalculate amounts if needed
  const existingBasePayComponent = existingComponents.find(
    (c) => c.isBasePayComponent === true,
  );

  if (existingBasePayComponent) {
    basePay = existingBasePayComponent.value;
  }

  // Handle component creations
  if (request.componentsToCreate && request.componentsToCreate.length > 0) {
    componentsChanged = true;

    // Validate base pay component if being created
    const newBasePayComponent = request.componentsToCreate.find(
      (c) => c.isBasePayComponent === true,
    );

    if (newBasePayComponent) {
      if (
        newBasePayComponent.frequency !== SalaryComponentFrequency.MONTHLY ||
        newBasePayComponent.valueType !== SalaryComponentValueType.ABSOLUTE
      ) {
        return res.status(400).json({
          message:
            "Base pay component must have frequency=MONTHLY and valueType=ABSOLUTE",
        });
      }
      basePay = newBasePayComponent.value;
    }

    await prisma.salaryStructureComponent.createMany({
      data: request.componentsToCreate.map((component) => ({
        salaryStructureId: id,
        schoolId: existingStructure.schoolId,
        name: component.name,
        type: component.type,
        value: component.value,
        valueType: component.valueType,
        frequency: component.frequency,
        isBasePayComponent: component.isBasePayComponent || false,
        createdBy: currentUser.id,
      })),
    });
  }

  // Handle component updates
  if (request.componentsToUpdate && request.componentsToUpdate.length > 0) {
    componentsChanged = true;

    for (const componentUpdate of request.componentsToUpdate) {
      const existingComponent = existingComponents.find(
        (c) => c.id === componentUpdate.id,
      );

      if (!existingComponent) {
        continue;
      }

      // Validate base pay component constraints if being updated
      if (
        componentUpdate.isBasePayComponent === true ||
        (componentUpdate.isBasePayComponent === undefined &&
          existingComponent.isBasePayComponent === true)
      ) {
        const finalFrequency =
          componentUpdate.frequency || existingComponent.frequency;
        const finalValueType =
          componentUpdate.valueType || existingComponent.valueType;

        if (
          finalFrequency !== SalaryComponentFrequency.MONTHLY ||
          finalValueType !== SalaryComponentValueType.ABSOLUTE
        ) {
          return res.status(400).json({
            message:
              "Base pay component must have frequency=MONTHLY and valueType=ABSOLUTE",
          });
        }

        if (componentUpdate.value !== undefined) {
          basePay = componentUpdate.value;
        }
      }

      await prisma.salaryStructureComponent.update({
        where: { id: componentUpdate.id },
        data: {
          ...(componentUpdate.name !== undefined && {
            name: componentUpdate.name,
          }),
          ...(componentUpdate.type !== undefined && {
            type: componentUpdate.type,
          }),
          ...(componentUpdate.value !== undefined && {
            value: componentUpdate.value,
          }),
          ...(componentUpdate.valueType !== undefined && {
            valueType: componentUpdate.valueType,
          }),
          ...(componentUpdate.frequency !== undefined && {
            frequency: componentUpdate.frequency,
          }),
          ...(componentUpdate.isBasePayComponent !== undefined && {
            isBasePayComponent: componentUpdate.isBasePayComponent,
          }),
          updatedBy: currentUser.id,
        },
      });
    }
  }

  // Handle component deletions (soft delete)
  if (request.componentsToDelete && request.componentsToDelete.length > 0) {
    componentsChanged = true;

    await prisma.salaryStructureComponent.updateMany({
      where: {
        id: {
          in: request.componentsToDelete,
        },
      },
      data: {
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      },
    });
  }

  // Recalculate amounts if components changed
  if (componentsChanged && basePay !== null) {
    const allComponents = await prisma.salaryStructureComponent.findMany({
      where: {
        salaryStructureId: id,
        deletedAt: null,
      },
    });

    const { grossMonthlyAmount, netMonthlyAmount } = calculateMonthlyAmounts(
      allComponents,
      basePay,
    );

    updateData.grossMonthlyAmount = grossMonthlyAmount;
    updateData.netMonthlyAmount = netMonthlyAmount;
  }

  // Update salary structure
  const updatedStructure = await prisma.salaryStructure.update({
    where: { id },
    data: updateData,
  });

  // Fetch updated components
  const components = await prisma.salaryStructureComponent.findMany({
    where: {
      salaryStructureId: id,
      deletedAt: null,
    },
  });

  return res.json({
    message: "Salary structure updated!",
    data: {
      ...updatedStructure,
      components,
    },
  });
});

// Separate router for salary payments to avoid route conflicts
const paymentRouter = Router();

// GET /salary-payments - Get salary payments by month
paymentRouter.get("/", async (req, res) => {
  const { month, schoolId: schoolIdQuery, userId } = req.query;
  const currentUser = req.context.user;

  const where = {
    deletedAt: null,
  };

  // School-bound users always see their school only (ignore forged query schoolId).
  if (currentUser.schoolId) {
    where.schoolId = currentUser.schoolId;
  } else if (schoolIdQuery) {
    where.schoolId = schoolIdQuery;
  }

  if (month) {
    where.month = month;
  }

  if (userId) {
    where.userId = userId;
  }

  const salaryPayments = await prisma.salaryPayments.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          publicUserId: true,
          role: {
            select: {
              name: true,
            },
          },
          teacherProfile: {
            select: {
              id: true,
              userId: true,
              basicSalary: true,
            },
          },
          staffProfile: {
            select: {
              id: true,
              userId: true,
              basicSalary: true,
            },
          },
        },
      },
    },
    ...paginateUtil.getPaginationParams(req),
  });

  const transformedData = salaryPayments.map((payment) => {
    let slipUrl = null;
    if (payment.slipId) {
      slipUrl = fileService.attachFileURL({
        id: payment.slipId,
        extension: "html",
      }).url;
    }

    return {
      ...payment,
      /** Alias for dashboard (expects `amount`) */
      amount: payment.totalAmount,
      slipUrl,
    };
  });

  return res.json({
    message: "Salary payments fetched!",
    data: transformedData,
  });
});

// POST /salary-payments/generate - Generate monthly salary payments
paymentRouter.post("/generate", async (req, res) => {
  const request = req.body.request;
  const currentUser = req.context.user;

  if (!request || typeof request.month !== "string") {
    return res.status(400).json({
      message: "Invalid request: month (YYYY-MM) is required",
    });
  }

  // Resolve school: school admins/staff use JWT schoolId; platform users without a school
  // may pass request.schoolId (e.g. super-admin tooling).
  let schoolId = currentUser.schoolId || null;
  if (!schoolId && request.schoolId != null && String(request.schoolId).trim() !== "") {
    schoolId = String(request.schoolId).trim();
  }
  if (!schoolId) {
    return res.status(400).json({
      message: "School context is required to generate salary payments",
    });
  }

  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(request.month)) {
    return res.status(400).json({
      message: "Invalid month format. Expected YYYY-MM",
    });
  }

  // Parse month to get start and end dates
  const [year, month] = request.month.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  // Get teacher and staff roles
  const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
  const staffRole = await roleService.getRoleByName(RoleName.STAFF);

  // Get all teachers and staff users for the school
  const users = await prisma.user.findMany({
    where: {
      schoolId,
      userType: UserType.SCHOOL,
      roleId: {
        in: [teacherRole.id, staffRole.id],
      },
      deletedAt: null,
    },
    include: {
      role: true,
      school: true,
      teacherProfile: true,
      staffProfile: true,
    }
  });

  const createdPayments = [];

  // Use transaction for atomicity
  await prisma.$transaction(async (tx) => {
    for (const user of users) {
      // Check if payment already exists for this month and user
      const existingPayment = await tx.salaryPayments.findFirst({
        where: {
          userId: user.id,
          schoolId,
          month: request.month,
          deletedAt: null,
        },
      });

      if (existingPayment) {
        continue;
      }

      const profileBasicSalary = user.teacherProfile?.basicSalary || user.staffProfile?.basicSalary;
      let totalAmount = 0;
      let grossMonthlyAmount = 0;
      let netMonthlyAmount = 0;
      let componentAmounts = {};

      if (profileBasicSalary) {
        // Calculate based on Basic Salary & Leaves
        const basePay = profileBasicSalary;
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        const approvedLeaves = await tx.leaveRequest.findMany({
          where: {
            userId: user.id,
            schoolId,
            status: "APPROVED",
            startDate: { lte: monthEnd },
            endDate: { gte: monthStart },
            deletedAt: null
          }
        });

        let leaveDays = 0;
        for (const leave of approvedLeaves) {
          const start = new Date(Math.max(leave.startDate.getTime(), monthStart.getTime()));
          const end = new Date(Math.min(leave.endDate.getTime(), monthEnd.getTime()));
          const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
          leaveDays += days;
        }

        const workingDays = Math.max(0, totalDaysInMonth - leaveDays);
        totalAmount = Math.round((basePay / totalDaysInMonth) * workingDays);
        grossMonthlyAmount = basePay;
        netMonthlyAmount = totalAmount;
        componentAmounts = { "BASIC_SALARY": totalAmount };

      } else {
        // Find effective salary structure for this user in the given month
        const salaryAssignment = await tx.salary.findFirst({
          where: {
            userId: user.id,
            schoolId,
            from: { lte: monthStart },
            till: { gte: monthEnd },
            deletedAt: null,
          },
          orderBy: { createdAt: "desc" },
        });

        if (!salaryAssignment) {
          continue;
        }

        const components = await tx.salaryStructureComponent.findMany({
          where: {
            salaryStructureId: salaryAssignment.salaryStructureId,
            frequency: "MONTHLY",
            deletedAt: null,
          },
        });

        const basePayComponent = components.find((c) => c.isBasePayComponent);
        if (!basePayComponent) continue;

        const basePay = basePayComponent.value;
        for (const component of components) {
          const amount = calculateComponentAmount(component, basePay);
          componentAmounts[component.id] = amount;
          totalAmount += amount;
        }

        const calculated = calculateMonthlyAmounts(components, basePay);
        grossMonthlyAmount = calculated.grossMonthlyAmount;
        netMonthlyAmount = calculated.netMonthlyAmount;
      }

      // Generate html for receipt
      let slipId = null;
      try {
        const receiptHTML = await generateSalarySlipHTML(
          { month: request.month },
          user,
          user.school,
          grossMonthlyAmount,
          totalAmount,
        );

        slipId = await uploadAndCreateFileEntry(
          Buffer.from(receiptHTML, "utf-8"),
          `salary-slip-${user.id}-${Date.now()}`,
          "html",
          "text/html",
          currentUser.id,
        );
      } catch (error) {
        logger.error(`Failed to generate salary slip: ${error.message}`, error);
      }

      // Create salary payment record
      const salaryPayment = await tx.salaryPayments.create({
        data: {
          schoolId,
          userId: user.id,
          month: request.month,
          totalAmount,
          componentAmounts,
          slipId: slipId,
          createdBy: currentUser.id,
        },
      });

      // Dispatch notification
      await tx.notification.create({
        data: {
          userId: user.id,
          schoolId,
          title: "Salary Slip Generated",
          content: `Your salary slip for ${request.month} has been generated and is ready to view.`,
          type: NotificationType.GENERAL,
          createdBy: currentUser.id,
        }
      });

      createdPayments.push(salaryPayment);
    }
  });

  return res.status(201).json({
    message: "Salary payments generated!",
    data: createdPayments,
  });
});

// Separate router for salary assignments (Salary model - mapping structure to user)
const salaryAssignmentRouter = Router();

// GET /salaries - List salary assignments
salaryAssignmentRouter.get("/", async (req, res) => {
  const { schoolId, userId, salaryStructureId } = req.query;

  const where = {
    deletedAt: null,
  };

  if (schoolId) {
    where.schoolId = schoolId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (salaryStructureId) {
    where.salaryStructureId = salaryStructureId;
  }

  const salaries = await prisma.salary.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    ...paginateUtil.getPaginationParams(req),
  });

  // Fetch related user and salary structure info
  const salariesWithDetails = await Promise.all(
    salaries.map(async (salary) => {
      const user = await prisma.user.findUnique({
        where: { id: salary.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          publicUserId: true,
        },
      });

      const salaryStructure = await prisma.salaryStructure.findUnique({
        where: { id: salary.salaryStructureId },
        select: {
          id: true,
          name: true,
          grossMonthlyAmount: true,
          netMonthlyAmount: true,
        },
      });

      return {
        ...salary,
        user,
        salaryStructure,
      };
    }),
  );

  return res.json({
    message: "Salary assignments fetched!",
    data: salariesWithDetails,
  });
});

// GET /salaries/:id - Get salary assignment by ID
salaryAssignmentRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  const salary = await prisma.salary.findUnique({
    where: { id },
  });

  if (!salary || salary.deletedAt) {
    return res.status(404).json({
      message: "Salary assignment not found",
    });
  }

  // Fetch related user and salary structure info
  const user = await prisma.user.findUnique({
    where: { id: salary.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      publicUserId: true,
    },
  });

  const salaryStructure = await prisma.salaryStructure.findUnique({
    where: { id: salary.salaryStructureId },
    select: {
      id: true,
      name: true,
      grossMonthlyAmount: true,
      netMonthlyAmount: true,
    },
  });

  return res.json({
    message: "Salary assignment fetched!",
    data: {
      ...salary,
      user,
      salaryStructure,
    },
  });
});

// POST /salaries - Create salary assignment
salaryAssignmentRouter.post("/", async (req, res) => {
  const request = req.body?.request;
  const currentUser = req.context.user;

  if (!request || !request.schoolId || !request.userId || !request.salaryStructureId || !request.from || !request.till) {
    return res.status(400).json({
      message: "Request must include request.schoolId, request.userId, request.salaryStructureId, request.from, request.till. See API docs.",
    });
  }

  // Validate school exists
  const school = await prisma.school.findUnique({
    where: { id: request.schoolId },
  });
  if (!school) {
    return res.status(404).json({
      message: "School not found",
    });
  }

  // Validate user exists and is a teacher or staff
  const user = await prisma.user.findUnique({
    where: { id: request.userId },
  });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  // Validate user belongs to the school
  if (user.schoolId !== request.schoolId) {
    return res.status(400).json({
      message: "User does not belong to the specified school",
    });
  }

  // Validate user is a teacher or staff
  const teacherRole = await roleService.getRoleByName(RoleName.TEACHER);
  const staffRole = await roleService.getRoleByName(RoleName.STAFF);

  if (user.roleId !== teacherRole.id && user.roleId !== staffRole.id) {
    return res.status(400).json({
      message: "User must be a teacher or staff member",
    });
  }

  // Validate salary structure exists and belongs to the school
  const salaryStructure = await prisma.salaryStructure.findUnique({
    where: { id: request.salaryStructureId },
  });

  if (!salaryStructure || salaryStructure.schoolId !== request.schoolId) {
    return res.status(400).json({
      message: "Salary structure not found or does not belong to the specified school",
    });
  }

  // Validate date range
  if (new Date(request.from) >= new Date(request.till)) {
    return res.status(400).json({
      message: "Invalid date range. 'from' must be before 'till'",
    });
  }

  // Create salary assignment
  const newSalary = await prisma.salary.create({
    data: {
      schoolId: request.schoolId,
      userId: request.userId,
      salaryStructureId: request.salaryStructureId,
      from: new Date(request.from),
      till: new Date(request.till),
      createdBy: currentUser.id,
    },
  });

  // Fetch created salary with related info
  const userData = await prisma.user.findUnique({
    where: { id: newSalary.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      publicUserId: true,
    },
  });

  const salaryStructureData = await prisma.salaryStructure.findUnique({
    where: { id: newSalary.salaryStructureId },
    select: {
      id: true,
      name: true,
      grossMonthlyAmount: true,
      netMonthlyAmount: true,
    },
  });

  return res.status(201).json({
    message: "Salary assignment created!",
    data: {
      ...newSalary,
      user: userData,
      salaryStructure: salaryStructureData,
    },
  });
});

// PATCH /salaries/:id - Update salary assignment
salaryAssignmentRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const request = req.body.request;
  const currentUser = req.context.user;

  // Fetch existing salary assignment
  const existingSalary = await prisma.salary.findUnique({
    where: { id },
  });

  if (!existingSalary || existingSalary.deletedAt) {
    return res.status(404).json({
      message: "Salary assignment not found",
    });
  }

  const updateData = {
    updatedBy: currentUser.id,
  };

  // Update fields if provided
  if (request.salaryStructureId) {
    // Validate salary structure exists
    const salaryStructure = await prisma.salaryStructure.findUnique({
      where: { id: request.salaryStructureId },
    });

    if (!salaryStructure) {
      return res.status(404).json({
        message: "Salary structure not found",
      });
    }

    // Validate salary structure belongs to the same school
    if (salaryStructure.schoolId !== existingSalary.schoolId) {
      return res.status(400).json({
        message: "Salary structure does not belong to the same school",
      });
    }

    updateData.salaryStructureId = request.salaryStructureId;
  }

  if (request.from) {
    updateData.from = new Date(request.from);
  }

  if (request.till) {
    updateData.till = new Date(request.till);
  }

  // Validate date range if both dates are being updated or one is updated
  const fromDate = updateData.from || existingSalary.from;
  const tillDate = updateData.till || existingSalary.till;

  if (fromDate >= tillDate) {
    return res.status(400).json({
      message: "Invalid date range. 'from' must be before 'till'",
    });
  }

  // Update salary assignment
  const updatedSalary = await prisma.salary.update({
    where: { id },
    data: updateData,
  });

  // Fetch updated salary with related info
  const user = await prisma.user.findUnique({
    where: { id: updatedSalary.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      publicUserId: true,
    },
  });

  const salaryStructure = await prisma.salaryStructure.findUnique({
    where: { id: updatedSalary.salaryStructureId },
    select: {
      id: true,
      name: true,
      grossMonthlyAmount: true,
      netMonthlyAmount: true,
    },
  });

  return res.json({
    message: "Salary assignment updated!",
    data: {
      ...updatedSalary,
      user,
      salaryStructure,
    },
  });
});

export {
  paymentRouter,
  salaryAssignmentRouter,
  router as salaryStructureRouter,
};
export default router;
