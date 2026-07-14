import prisma from "../prisma/client.js";
import {
  FeePaymentStatus,
  FeeLedgerEntryType,
  RoleName,
} from "../prisma/generated/index.js";
import logger from "../config/logger.js";
import notificationService from "./notification.service.js";

const MAX_FEE_COMPONENT_LABEL_LEN = 120;

/**
 * @param {unknown} raw
 * @returns {{ label: string, amount: number }[] | null}
 */
const normalizeDefaultFeeComponents = (raw) => {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const label = String(row.label ?? "")
      .trim()
      .slice(0, MAX_FEE_COMPONENT_LABEL_LEN);
    const amount = Math.round(Number(row.amount));
    if (!label || !Number.isFinite(amount) || amount < 0) continue;
    out.push({ label, amount });
  }
  return out.length > 0 ? out : null;
};

const sumFeeComponents = (components) =>
  (components || []).reduce((s, c) => s + (Number(c.amount) || 0), 0);

/**
 * Resolve annual fee total and installment count for a student (class defaults override school settings).
 * Returns feeComponents for snapshot on the Fee row (breakdown for fees management UI).
 */
const resolveFeePlanForStudent = async (studentId, schoolId) => {
  const settings = await prisma.settings.findFirst({
    where: {
      schoolId,
      deletedAt: null,
    },
  });

  if (!settings) {
    throw new Error(
      "School settings not found. Please configure settings first.",
    );
  }

  const numberOfInstallments = settings.studentFeeInstallments || 12;
  let totalAmount = settings.studentFeeAmount || 0;
  let feeComponents = null;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      class: {
        select: {
          defaultAnnualFee: true,
          defaultMonthlyFee: true,
          defaultFeeComponents: true,
        },
      },
    },
  });

  const cls = profile?.class;
  const fromComponents = normalizeDefaultFeeComponents(cls?.defaultFeeComponents);
  if (fromComponents && sumFeeComponents(fromComponents) > 0) {
    totalAmount = sumFeeComponents(fromComponents);
    feeComponents = fromComponents;
  } else if (cls) {
    if (cls.defaultAnnualFee != null && cls.defaultAnnualFee > 0) {
      totalAmount = cls.defaultAnnualFee;
      feeComponents = [{ label: "Annual fee", amount: totalAmount }];
    } else if (cls.defaultMonthlyFee != null && cls.defaultMonthlyFee > 0) {
      totalAmount = cls.defaultMonthlyFee * numberOfInstallments;
      feeComponents = [
        {
          label: "Monthly fee (× installments)",
          amount: totalAmount,
        },
      ];
    }
  }

  if (feeComponents == null && totalAmount > 0) {
    feeComponents = [{ label: "School default fee", amount: totalAmount }];
  }

  return { totalAmount, numberOfInstallments, settings, feeComponents };
};

/**
 * Creates Fee and FeeInstallements records for a student (idempotent if an active fee already exists).
 */
const createFeeInstallementsForStudent = async (
  studentId,
  schoolId,
  createdBy,
) => {
  const existingFee = await prisma.fee.findFirst({
    where: {
      studentId,
      schoolId,
      deletedAt: null,
    },
  });

  if (existingFee) {
    const installments = await prisma.feeInstallements.findMany({
      where: { feeId: existingFee.id, deletedAt: null },
      orderBy: { installementNumber: "asc" },
    });
    return { ...existingFee, installments };
  }

  const { totalAmount, numberOfInstallments, feeComponents } =
    await resolveFeePlanForStudent(studentId, schoolId);
  const currentYear = new Date().getFullYear();

  const baseInstallmentAmount = Math.floor(totalAmount / numberOfInstallments);
  const remainder = totalAmount % numberOfInstallments;

  const result = await prisma.$transaction(async (tx) => {
    const fee = await tx.fee.create({
      data: {
        schoolId,
        studentId,
        year: currentYear,
        feeComponents: feeComponents ?? null,
        totalAmount,
        totalPaidAmount: 0,
        totalRemainingAmount: totalAmount,
        createdBy,
      },
    });

    const installmentsData = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      const installmentAmount =
        i === 1 ? baseInstallmentAmount + remainder : baseInstallmentAmount;

      installmentsData.push({
        feeId: fee.id,
        schoolId,
        studentId,
        installementNumber: i,
        paymentStatus: FeePaymentStatus.PENDING,
        amount: installmentAmount,
        remainingAmount: installmentAmount,
        paidAmount: 0,
        createdBy,
      });
    }

    await tx.feeInstallements.createMany({
      data: installmentsData,
    });

    const installments = await tx.feeInstallements.findMany({
      where: { feeId: fee.id },
      orderBy: { installementNumber: "asc" },
    });

    return { ...fee, installments };
  });

  return result;
};

/**
 * If the student has no payments yet, replace the fee plan using the current class defaults.
 */
const rebuildUnpaidFeePlanForStudent = async (studentId, schoolId, updatedBy) => {
  const fee = await prisma.fee.findFirst({
    where: { studentId, schoolId, deletedAt: null },
    include: {
      installments: {
        where: { deletedAt: null },
      },
    },
  });

  if (!fee) {
    return createFeeInstallementsForStudent(studentId, schoolId, updatedBy);
  }

  const anyLockedPayment = fee.installments.some(
    (i) =>
      i.paymentStatus === FeePaymentStatus.PAID ||
      i.paymentStatus === FeePaymentStatus.PARTIALLY_PAID ||
      (i.paidAmount && i.paidAmount > 0),
  );

  if (anyLockedPayment) {
    return fee;
  }

  await prisma.$transaction(async (tx) => {
    await tx.feeInstallements.updateMany({
      where: { feeId: fee.id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedBy: updatedBy,
      },
    });
    await tx.fee.update({
      where: { id: fee.id },
      data: {
        deletedAt: new Date(),
        deletedBy: updatedBy,
      },
    });
  });

  return createFeeInstallementsForStudent(studentId, schoolId, updatedBy);
};

/**
 * Cancel a fee installment (ledger row retained). Reverts fee aggregates by prior paidAmount.
 */
const cancelFeeInstallment = async (
  installmentId,
  schoolId,
  userId,
  reason,
) => {
  const installment = await prisma.feeInstallements.findFirst({
    where: {
      id: installmentId,
      schoolId,
      deletedAt: null,
    },
    include: { fee: true },
  });

  if (!installment) {
    throw new Error("Installment not found");
  }

  if (installment.paymentStatus === FeePaymentStatus.CANCELLED) {
    throw new Error("Installment is already cancelled");
  }

  const prevPaid = Number(installment.paidAmount || 0);

  return prisma.$transaction(async (tx) => {
    await tx.feeInstallements.update({
      where: { id: installmentId },
      data: {
        paymentStatus: FeePaymentStatus.CANCELLED,
        cancellationReason: reason || null,
        cancelledAt: new Date(),
        paidAt: null,
        paidAmount: 0,
        remainingAmount: installment.amount,
        updatedBy: userId,
      },
    });

    if (prevPaid > 0 && installment.feeId) {
      await tx.fee.update({
        where: { id: installment.feeId },
        data: {
          totalPaidAmount: { decrement: prevPaid },
          totalRemainingAmount: { increment: prevPaid },
          updatedBy: userId,
        },
      });
    }

    if (prevPaid > 0) {
      await tx.feeLedgerEntry.create({
        data: {
          schoolId,
          studentId: installment.studentId,
          feeId: installment.feeId,
          installmentId,
          entryType: FeeLedgerEntryType.CANCELLATION_REVERSAL,
          amount: prevPaid,
          receiptNumber: null,
          remarks: reason || null,
          metadata: {
            reversedReceiptNumber: installment.lastReceiptNumber || null,
          },
          recordedBy: userId,
        },
      });
    }

    return { success: true };
  });
};

/**
 * GST / receipt metadata stored on ledger rows (and used for receipt HTML).
 */
const buildFeeReceiptMetadata = (settings, appliedAmountRupee, isWaiver) => {
  if (isWaiver || appliedAmountRupee <= 0) {
    return { waiver: true };
  }
  const useGst = settings?.feeReceiptUseGst;
  const cg = Number(settings?.feeReceiptCgstPercent ?? 0);
  const sg = Number(settings?.feeReceiptSgstPercent ?? 0);
  if (!useGst || cg + sg <= 0) {
    return { gst: false };
  }
  const totalPct = cg + sg;
  const base = Math.round(appliedAmountRupee / (1 + totalPct / 100));
  const cgstAmt = Math.round((base * cg) / 100);
  const sgstAmt = Math.round((base * sg) / 100);
  const drift = appliedAmountRupee - base - cgstAmt - sgstAmt;
  return {
    gst: true,
    taxableValue: base,
    cgstPercent: cg,
    sgstPercent: sg,
    cgstAmount: cgstAmt,
    sgstAmount: sgstAmt + drift,
    total: appliedAmountRupee,
  };
};

const notifyPrincipalsOfFeePayment = async (
  installment,
  amount,
  recordedBy,
  receiptNumber,
) => {
  try {
    const schoolAdmins = await prisma.user.findMany({
      where: {
        schoolId: installment.schoolId,
        role: {
          name: RoleName.SCHOOL_ADMIN,
        },
        deletedAt: null,
      },
    });

    if (schoolAdmins.length === 0) return;

    const student = await prisma.user.findUnique({
      where: { id: installment.studentId },
      select: { firstName: true, lastName: true },
    });

    const studentName = `${student?.firstName ?? ""} ${student?.lastName || ""}`.trim();
    const ref = receiptNumber ? ` Receipt ${receiptNumber}.` : "";

    for (const admin of schoolAdmins) {
      await notificationService.createNotification({
        userId: admin.id,
        title: "Fee Payment Recorded",
        content: `₹${amount} recorded for ${studentName} (Installment #${installment.installementNumber}).${ref}`,
        type: "FEE",
        schoolId: installment.schoolId,
        createdBy: recordedBy,
      });
    }
  } catch (error) {
    logger.error(
      { error, installmentId: installment.id },
      "Failed to send principal notification for fee payment",
    );
  }
};

/**
 * Allocate sequential receipt number, update installment + fee totals, append ledger row.
 * Receipt file is attached afterward via attachFeePaymentReceipt.
 */
const recordFeePaymentWithLedger = async ({
  installmentId,
  appliedAmount,
  paymentMethod,
  recordedBy,
  transactionId,
  remarks,
  isWaiver,
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const installment = await tx.feeInstallements.findUnique({
      where: { id: installmentId },
      include: { fee: true },
    });

    if (!installment) {
      throw new Error("Installment not found");
    }

    if (installment.paymentStatus === FeePaymentStatus.CANCELLED) {
      throw new Error("Cannot record payment on a cancelled installment");
    }

    if (!installment.feeId || !installment.schoolId) {
      throw new Error("Invalid installment: missing fee or school");
    }

    const lockRows = await tx.$queryRaw`
      SELECT id FROM settings
      WHERE school_id = ${installment.schoolId} AND deleted_at IS NULL
      FOR UPDATE
      LIMIT 1
    `;
    if (!Array.isArray(lockRows) || lockRows.length === 0) {
      throw new Error(
        "School fee settings not found. Configure fees in Settings before recording payments.",
      );
    }

    const settings = await tx.settings.findFirst({
      where: { schoolId: installment.schoolId, deletedAt: null },
    });
    if (!settings) {
      throw new Error(
        "School fee settings not found. Configure fees in Settings before recording payments.",
      );
    }

    const seq = settings.feeReceiptNextSequence ?? 1;
    const prefix = (settings?.feeReceiptNumberPrefix || "REC").trim() || "REC";
    const receiptNumber = `${prefix}/${String(seq).padStart(5, "0")}`;

    await tx.settings.update({
      where: { id: settings.id },
      data: { feeReceiptNextSequence: seq + 1 },
    });

    const newPaidAmount = installment.paidAmount + appliedAmount;
    const newRemainingAmount = installment.remainingAmount - appliedAmount;
    const newPaymentStatus = newRemainingAmount <= 0
      ? FeePaymentStatus.PAID
      : newPaidAmount > 0
        ? FeePaymentStatus.PARTIALLY_PAID
        : FeePaymentStatus.PENDING;

    const metadata = buildFeeReceiptMetadata(settings, appliedAmount, isWaiver);

    const ledgerRow = await tx.feeLedgerEntry.create({
      data: {
        schoolId: installment.schoolId,
        studentId: installment.studentId,
        feeId: installment.feeId,
        installmentId: installment.id,
        entryType: isWaiver
          ? FeeLedgerEntryType.WAIVER
          : FeeLedgerEntryType.PAYMENT,
        amount: appliedAmount,
        receiptNumber,
        receiptFileId: null,
        paymentMethod: isWaiver ? null : (paymentMethod || null),
        transactionId: transactionId || null,
        remarks: remarks || null,
        metadata,
        recordedBy,
      },
    });

    const updatedInstallment = await tx.feeInstallements.update({
      where: { id: installmentId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        paymentStatus: newPaymentStatus,
        paymentMethod: isWaiver
          ? undefined
          : (paymentMethod || undefined),
        paidAt:
          newRemainingAmount <= 0
            ? new Date()
            : (installment.paidAt || new Date()),
        lastReceiptNumber: receiptNumber,
        updatedBy: recordedBy,
      },
    });

    const updatedFee = await tx.fee.update({
      where: { id: installment.feeId },
      data: {
        totalPaidAmount: { increment: appliedAmount },
        totalRemainingAmount: { decrement: appliedAmount },
        updatedBy: recordedBy,
      },
    });

    return {
      installment: updatedInstallment,
      fee: updatedFee,
      receiptNumber,
      ledgerEntryId: ledgerRow.id,
      receiptConfig: {
        useGst: !!metadata?.gst,
        panCardNumber: settings.feeReceiptPanCardNumber || null,
        gst: metadata?.gst ? metadata : null,
      },
    };
  });

  await notifyPrincipalsOfFeePayment(
    result.installment,
    appliedAmount,
    recordedBy,
    result.receiptNumber,
  );

  return result;
};

/**
 * After HTML receipt upload: link file to installment and ledger row.
 */
const attachFeePaymentReceipt = async ({
  ledgerEntryId,
  installmentId,
  receiptFileId,
  recordedBy,
}) => {
  await prisma.$transaction(async (tx) => {
    await tx.feeInstallements.update({
      where: { id: installmentId },
      data: { receiptFileId, updatedBy: recordedBy },
    });
    await tx.feeLedgerEntry.update({
      where: { id: ledgerEntryId },
      data: { receiptFileId },
    });
  });
};

const getStudentFeeLedger = async (schoolId, studentId, options = {}) => {
  const limit = Math.min(Math.max(Number(options.limit) || 100, 1), 500);
  return prisma.feeLedgerEntry.findMany({
    where: { schoolId, studentId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

const buildSchoolLedgerWhere = (schoolId, filters = {}) => {
  const where = { schoolId };
  if (filters.studentId) {
    where.studentId = filters.studentId;
  }
  if (filters.entryType) {
    where.entryType = filters.entryType;
  }
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.createdAt.lte = new Date(filters.dateTo);
    }
  } else if (filters.academicYear && typeof filters.academicYear === "string") {
    const parts = filters.academicYear.split("-");
    if (parts.length === 2) {
      const startYear = parseInt(parts[0], 10);
      const endYearShort = parseInt(parts[1], 10);
      const endYear = endYearShort < 100 ? 2000 + endYearShort : endYearShort;
      if (!Number.isNaN(startYear) && !Number.isNaN(endYear)) {
        where.createdAt = {
          gte: new Date(`${startYear}-04-01T00:00:00.000Z`),
          lte: new Date(`${endYear}-03-31T23:59:59.999Z`),
        };
      }
    }
  }
  return where;
};

const enrichFeeLedgerRows = async (entries) => {
  if (entries.length === 0) {
    return [];
  }
  const studentIds = [...new Set(entries.map((e) => e.studentId))];
  const installmentIds = [
    ...new Set(entries.map((e) => e.installmentId).filter(Boolean)),
  ];
  const recorderIds = [
    ...new Set(entries.map((e) => e.recordedBy).filter(Boolean)),
  ];

  const [students, installments, recorders] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        publicUserId: true,
        studentProfile: {
          select: {
            rollNumber: true,
            class: { select: { grade: true, division: true } },
          },
        },
      },
    }),
    installmentIds.length > 0
      ? prisma.feeInstallements.findMany({
          where: { id: { in: installmentIds } },
          select: { id: true, installementNumber: true },
        })
      : [],
    recorderIds.length > 0
      ? prisma.user.findMany({
          where: { id: { in: recorderIds } },
          select: { id: true, firstName: true, lastName: true, email: true },
        })
      : [],
  ]);

  const studentMap = Object.fromEntries(students.map((s) => [s.id, s]));
  const instMap = Object.fromEntries(installments.map((i) => [i.id, i]));
  const recMap = Object.fromEntries(recorders.map((r) => [r.id, r]));

  return entries.map((e) => ({
    ...e,
    student: studentMap[e.studentId] || null,
    installmentNumber:
      e.installmentId && instMap[e.installmentId]
        ? instMap[e.installmentId].installementNumber
        : null,
    recordedByUser: e.recordedBy ? recMap[e.recordedBy] || null : null,
  }));
};

/**
 * Paginated school-wide fee ledger (payments, waivers, cancellation reversals).
 */
const getSchoolFeeLedger = async (schoolId, filters = {}) => {
  const page = Math.max(1, Number(filters.page) > 0 ? Number(filters.page) : 1);
  const limitRaw = Number(filters.limit);
  const limit = Math.min(100, Math.max(1, limitRaw > 0 ? limitRaw : 25));
  const skip = (page - 1) * limit;
  const where = buildSchoolLedgerWhere(schoolId, filters);

  const [entries, total] = await Promise.all([
    prisma.feeLedgerEntry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feeLedgerEntry.count({ where }),
  ]);

  const rows = await enrichFeeLedgerRows(entries);

  return {
    entries: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getSchoolFeeLedgerForExport = async (schoolId, filters = {}) => {
  const where = buildSchoolLedgerWhere(schoolId, filters);
  const entries = await prisma.feeLedgerEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 15000,
  });
  return enrichFeeLedgerRows(entries);
};

/**
 * Calculate late fees
 * @param {string} installmentId - Installment ID
 * @param {Object} lateFeeConfig - Late fee configuration
 * @returns {Promise<number>} - Late fee amount
 */
const calculateLateFee = async (installmentId, lateFeeConfig) => {
  const installment = await prisma.feeInstallements.findUnique({
    where: { id: installmentId },
    include: {
      fee: true,
    },
  });

  if (
    !installment ||
    installment.paymentStatus === FeePaymentStatus.PAID ||
    installment.paymentStatus === FeePaymentStatus.CANCELLED
  ) {
    return 0;
  }

  // Get due date (assuming installments are monthly, starting from academic year)
  const currentDate = new Date();
  const academicYearStart = new Date(installment.fee.year, 3, 1); // April 1st
  const dueDate = new Date(academicYearStart);
  dueDate.setMonth(dueDate.getMonth() + installment.installementNumber - 1);

  // Add grace period
  const gracePeriodDays = lateFeeConfig.gracePeriodDays || 0;
  const finalDueDate = new Date(dueDate);
  finalDueDate.setDate(finalDueDate.getDate() + gracePeriodDays);

  if (currentDate <= finalDueDate) {
    return 0; // Within grace period
  }

  // Calculate days overdue
  const daysOverdue = Math.floor((currentDate - finalDueDate) / (1000 * 60 * 60 * 24));

  // Calculate late fee
  let lateFee = 0;
  if (lateFeeConfig.type === "FIXED") {
    lateFee = lateFeeConfig.amount || 0;
  } else if (lateFeeConfig.type === "PERCENTAGE") {
    lateFee = (installment.amount * (lateFeeConfig.percentage || 0)) / 100;
  } else if (lateFeeConfig.type === "PER_DAY") {
    lateFee = (lateFeeConfig.amountPerDay || 0) * daysOverdue;
  }

  return Math.round(lateFee);
};

/**
 * Apply scholarship or discount
 * @param {string} feeId - Fee ID
 * @param {number} discountAmount - Discount amount
 * @param {string} discountType - Discount type (SCHOLARSHIP, DISCOUNT, etc.)
 * @param {string} reason - Reason for discount
 * @param {string} appliedBy - User ID applying discount
 * @returns {Promise<Object>} - Updated fee
 */
const applyDiscount = async (feeId, discountAmount, discountType, reason, appliedBy) => {
  const fee = await prisma.fee.findUnique({
    where: { id: feeId },
  });

  if (!fee) {
    throw new Error("Fee not found");
  }

  // Reduce total amount and remaining amount
  const updated = await prisma.fee.update({
    where: { id: feeId },
    data: {
      totalAmount: {
        decrement: discountAmount,
      },
      totalRemainingAmount: {
        decrement: discountAmount,
      },
      updatedBy: appliedBy,
    },
  });

  // TODO: Store discount record in a separate table for audit
  logger.info({
    feeId,
    discountAmount,
    discountType,
    reason,
    appliedBy,
  }, "Discount applied to fee");

  return updated;
};

/**
 * Get fee analytics
 * @param {string} schoolId - School ID
 * @param {number} year - Academic year
 * @returns {Promise<Object>} - Fee analytics
 */
const getFeeAnalytics = async (schoolId, year) => {
  const feeIdsForYear = await prisma.fee.findMany({
    where: { schoolId, year, deletedAt: null },
    select: { id: true },
  });
  const feeIdList = feeIdsForYear.map((f) => f.id);

  const cancelledWhere =
    feeIdList.length === 0
      ? null
      : {
        feeId: { in: feeIdList },
        paymentStatus: FeePaymentStatus.CANCELLED,
        deletedAt: null,
      };

  const [totalFees, totalPaid, totalPending, defaulterCount, cancelledSum, cancelledCount] =
    await Promise.all([
      prisma.fee.aggregate({
        where: {
          schoolId,
          year,
          deletedAt: null,
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.fee.aggregate({
        where: {
          schoolId,
          year,
          deletedAt: null,
        },
        _sum: {
          totalPaidAmount: true,
        },
      }),
      prisma.fee.aggregate({
        where: {
          schoolId,
          year,
          deletedAt: null,
        },
        _sum: {
          totalRemainingAmount: true,
        },
      }),
      prisma.fee.count({
        where: {
          schoolId,
          year,
          totalRemainingAmount: {
            gt: 0,
          },
          deletedAt: null,
        },
      }),
      cancelledWhere
        ? prisma.feeInstallements.aggregate({
          where: cancelledWhere,
          _sum: { amount: true },
        })
        : Promise.resolve({ _sum: { amount: 0 } }),
      cancelledWhere
        ? prisma.feeInstallements.count({ where: cancelledWhere })
        : Promise.resolve(0),
    ]);

  const collectionPercentage = totalFees._sum.totalAmount > 0
    ? (totalPaid._sum.totalPaidAmount / totalFees._sum.totalAmount) * 100
    : 0;

  return {
    totalFees: totalFees._sum.totalAmount || 0,
    totalPaid: totalPaid._sum.totalPaidAmount || 0,
    totalPending: totalPending._sum.totalRemainingAmount || 0,
    collectionPercentage: Math.round(collectionPercentage * 100) / 100,
    defaulterCount,
    cancelledInstallmentCount: cancelledCount,
    cancelledInstallmentAmountGross: cancelledSum._sum?.amount || 0,
  };
};

/**
 * Get defaulters list
 * @param {string} schoolId - School ID
 * @param {number} year - Academic year
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Defaulters with pagination
 */
const getDefaulters = async (schoolId, year, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [defaulters, total] = await Promise.all([
    prisma.fee.findMany({
      where: {
        schoolId,
        year,
        totalRemainingAmount: {
          gt: 0,
        },
        deletedAt: null,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            studentProfile: {
              select: {
                rollNumber: true,
                class: {
                  select: {
                    grade: true,
                    division: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        totalRemainingAmount: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.fee.count({
      where: {
        schoolId,
        year,
        totalRemainingAmount: {
          gt: 0,
        },
        deletedAt: null,
      },
    }),
  ]);

  return {
    defaulters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const feeService = {
  resolveFeePlanForStudent,
  createFeeInstallementsForStudent,
  rebuildUnpaidFeePlanForStudent,
  cancelFeeInstallment,
  recordFeePaymentWithLedger,
  attachFeePaymentReceipt,
  getStudentFeeLedger,
  getSchoolFeeLedger,
  getSchoolFeeLedgerForExport,
  calculateLateFee,
  applyDiscount,
  getFeeAnalytics,
  getDefaulters,
};

export default feeService;
