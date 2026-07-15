import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

/**
 * Create a fee discount / scholarship rule
 */
const createDiscount = async (data) => {
  return await prisma.feeDiscount.create({
    data: {
      schoolId: data.schoolId,
      name: data.name,
      description: data.description || null,
      type: data.type,
      value: data.value,
      isPercentage: data.isPercentage || false,
      classId: data.classId || null,
      isActive: data.isActive ?? true,
      createdBy: data.createdBy,
    },
  });
};

/**
 * List discounts for a school
 */
const getDiscounts = async (schoolId, options = {}) => {
  const { page = 1, limit = 20, isActive, type, classId } = options;
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };
  if (isActive !== undefined) where.isActive = isActive;
  if (type) where.type = type;
  if (classId) where.classId = classId;

  const [discounts, total] = await Promise.all([
    prisma.feeDiscount.findMany({
      where,
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feeDiscount.count({ where }),
  ]);

  return {
    discounts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get a single discount by ID
 */
const getDiscountById = async (id, schoolId) => {
  return await prisma.feeDiscount.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: {
      applications: {
        orderBy: { appliedAt: "desc" },
        take: 20,
      },
    },
  });
};

/**
 * Update a discount
 */
const updateDiscount = async (id, schoolId, data) => {
  const existing = await prisma.feeDiscount.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Discount not found");

  return await prisma.feeDiscount.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      type: data.type ?? existing.type,
      value: data.value ?? existing.value,
      isPercentage: data.isPercentage ?? existing.isPercentage,
      classId: data.classId !== undefined ? data.classId : existing.classId,
      isActive: data.isActive ?? existing.isActive,
      updatedBy: data.updatedBy,
    },
  });
};

/**
 * Delete a discount (soft)
 */
const deleteDiscount = async (id, schoolId, deletedBy) => {
  const existing = await prisma.feeDiscount.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Discount not found");

  await prisma.feeDiscount.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy },
  });
};

/**
 * Apply a discount to a student's fee installment
 */
const applyDiscount = async (data) => {
  const { discountId, studentId, installmentId, reason, appliedBy, schoolId } = data;

  const discount = await prisma.feeDiscount.findFirst({
    where: { id: discountId, schoolId, deletedAt: null, isActive: true },
  });
  if (!discount) throw new Error("Discount not found or inactive");

  const installment = await prisma.feeInstallements.findUnique({
    where: { id: installmentId },
  });
  if (!installment) throw new Error("Installment not found");

  let discountAmount;
  if (discount.isPercentage) {
    discountAmount = Math.round((Number(installment.amount) * Number(discount.value)) / 100);
  } else {
    discountAmount = Math.min(Number(discount.value), Number(installment.amount));
  }

  const application = await prisma.$transaction(async (tx) => {
    const app = await tx.feeDiscountApplication.create({
      data: {
        discountId,
        studentId,
        installmentId,
        amount: discountAmount,
        reason: reason || discount.name,
        appliedBy,
      },
    });

    // Reduce the installment amount
    await tx.feeInstallements.update({
      where: { id: installmentId },
      data: {
        amount: { decrement: discountAmount },
        remainingAmount: { decrement: discountAmount },
      },
    });

    // Update fee totals if fee exists
    if (installment.feeId) {
      await tx.fee.update({
        where: { id: installment.feeId },
        data: {
          totalAmount: { decrement: discountAmount },
          totalRemainingAmount: { decrement: discountAmount },
        },
      });
    }

    return app;
  });

  logger.info({ discountId, studentId, installmentId, discountAmount }, "Discount applied to installment");
  return application;
};

/**
 * Calculate and apply late fees for all overdue installments in a school
 */
const calculateLateFees = async (schoolId, calculatedBy) => {
  const rule = await prisma.lateFeeRule.findFirst({
    where: { schoolId, deletedAt: null, isActive: true },
  });
  if (!rule) throw new Error("No active late fee rule configured. Please set up a late fee rule first.");

  const currentDate = new Date();
  const gracePeriodDays = rule.gracePeriodDays || 0;

  // Find unpaid installments
  const overdueInstallments = await prisma.feeInstallements.findMany({
    where: {
      schoolId,
      deletedAt: null,
      paymentStatus: "UNPAID",
    },
    include: {
      fee: { select: { id: true, year: true } },
    },
  });

  let updatedCount = 0;
  let totalLateFeeApplied = 0;

  for (const installment of overdueInstallments) {
    // Calculate due date based on installment number and academic year
    const academicYearStart = new Date(installment.fee?.year || new Date().getFullYear(), 3, 1);
    const dueDate = new Date(academicYearStart);
    dueDate.setMonth(dueDate.getMonth() + installment.installementNumber - 1);
    dueDate.setDate(dueDate.getDate() + gracePeriodDays);

    if (currentDate <= dueDate) continue; // Not overdue yet

    const daysOverdue = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));

    let lateFee = 0;
    if (rule.calculationType === "FIXED") {
      lateFee = Number(rule.fixedAmount) || 0;
    } else if (rule.calculationType === "PERCENTAGE") {
      lateFee = Math.round((Number(installment.amount) * Number(rule.percentage)) / 100);
    } else if (rule.calculationType === "PER_DAY") {
      lateFee = Math.round((Number(rule.amountPerDay) || 0) * daysOverdue);
    }

    // Cap at max if set
    if (rule.maxLateFee && lateFee > Number(rule.maxLateFee)) {
      lateFee = Number(rule.maxLateFee);
    }

    if (lateFee > 0) {
      // Add late fee as additional amount to the installment
      await prisma.feeInstallements.update({
        where: { id: installment.id },
        data: {
          amount: { increment: lateFee },
          remainingAmount: { increment: lateFee },
        },
      });

      if (installment.feeId) {
        await prisma.fee.update({
          where: { id: installment.feeId },
          data: {
            totalAmount: { increment: lateFee },
            totalRemainingAmount: { increment: lateFee },
          },
        });
      }

      updatedCount++;
      totalLateFeeApplied += lateFee;
    }
  }

  return {
    processedInstallments: updatedCount,
    totalLateFeeApplied,
    ruleUsed: rule.name,
  };
};

/**
 * Get discount statistics for a school
 */
const getDiscountStats = async (schoolId) => {
  const [totalDiscounts, activeDiscounts, totalApplications] = await Promise.all([
    prisma.feeDiscount.count({ where: { schoolId, deletedAt: null } }),
    prisma.feeDiscount.count({ where: { schoolId, deletedAt: null, isActive: true } }),
    prisma.feeDiscountApplication.count({
      where: { discount: { schoolId, deletedAt: null } },
    }),
  ]);

  const totalDiscountAmount = await prisma.feeDiscountApplication.aggregate({
    where: { discount: { schoolId, deletedAt: null } },
    _sum: { amount: true },
  });

  return {
    totalDiscounts,
    activeDiscounts,
    totalApplications,
    totalDiscountAmount: Number(totalDiscountAmount._sum.amount || 0),
  };
};

const feeDiscountService = {
  createDiscount,
  getDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
  applyDiscount,
  calculateLateFees,
  getDiscountStats,
};

export default feeDiscountService;
