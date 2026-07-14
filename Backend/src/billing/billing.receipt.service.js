import prisma from "../prisma/client.js";
import {
  PaymentMethod,
  ReceiptStatus,
  InvoiceStatus,
} from "../prisma/generated/index.js";
import {
  computeGstTotals,
  toReceiptAmountFields,
} from "./billing.amounts.js";
import { parsePaymentMethodString } from "./billing.payment-method.js";
import {
  receiptIncludeForDetail,
  receiptIncludeForGenerate,
  receiptIncludeForList,
} from "./billing.includes.js";

/**
 * @param {object} request — body.request
 * @param {string} userId
 */
export async function createReceiptFromRequest(request, userId) {
  const {
    schoolId,
    vendorId,
    invoiceId,
    receiptNumber: providedReceiptNumber,
    baseAmount,
    sgstPercent,
    cgstPercent,
    igstPercent,
    ugstPercent,
    description,
    paymentMethod,
  } = request;

  if (invoiceId) {
    if (schoolId || vendorId) {
      return {
        ok: false,
        status: 400,
        message:
          "Do not send schoolId or vendorId when invoiceId is set; they are taken from the invoice.",
      };
    }
    if (!paymentMethod) {
      return {
        ok: false,
        status: 400,
        message:
          "paymentMethod is required when recording payment for an invoice.",
      };
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, deletedAt: null },
    });
    if (!invoice) {
      return { ok: false, status: 404, message: "Invoice not found." };
    }
    if (invoice.status === InvoiceStatus.CANCELLED) {
      return {
        ok: false,
        status: 400,
        message: "Cannot record payment for a cancelled invoice.",
      };
    }
    if (invoice.status === InvoiceStatus.PAID) {
      return {
        ok: false,
        status: 400,
        message: "Invoice is already marked paid.",
      };
    }

    const existingReceipt = await prisma.receipt.findFirst({
      where: { invoiceId, deletedAt: null },
    });
    if (existingReceipt) {
      return {
        ok: false,
        status: 400,
        message: "A receipt is already linked to this invoice.",
      };
    }

    let totals;
    try {
      totals = computeGstTotals({
        baseAmount: invoice.baseAmount,
        sgstPercent: invoice.sgstPercent,
        cgstPercent: invoice.cgstPercent,
        igstPercent: invoice.igstPercent,
        ugstPercent: invoice.ugstPercent,
      });
    } catch (e) {
      return {
        ok: false,
        status: 400,
        message: e.message || "Invalid invoice amounts",
      };
    }

    const amountFields = toReceiptAmountFields(totals);
    const descriptionText =
      (description && String(description).trim()) ||
      `Payment received for invoice ${invoice.invoiceNumber || invoiceId}`;

    const newReceipt = await prisma.$transaction(async (tx) => {
      const created = await tx.receipt.create({
        data: {
          ...(providedReceiptNumber && { receiptNumber: providedReceiptNumber }),
          schoolId: invoice.schoolId,
          vendorId: invoice.vendorId,
          invoiceId,
          ...amountFields,
          description: descriptionText,
          paymentMethod: parsePaymentMethodString(paymentMethod),
          status: ReceiptStatus.GENERATED,
          createdBy: userId,
        },
      });
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: InvoiceStatus.PAID, updatedBy: userId },
      });
      return created;
    });

    return { ok: true, data: newReceipt, linkedInvoice: true };
  }

  if (schoolId && vendorId) {
    return {
      ok: false,
      status: 400,
      message: "Provide either schoolId or vendorId, not both.",
    };
  }
  if (!schoolId && !vendorId) {
    return {
      ok: false,
      status: 400,
      message: "Either schoolId or vendorId is required.",
    };
  }

  if (schoolId) {
    await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
  } else {
    await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
  }

  let totals;
  try {
    totals = computeGstTotals({
      baseAmount,
      sgstPercent,
      cgstPercent,
      igstPercent,
      ugstPercent,
    });
  } catch (e) {
    return {
      ok: false,
      status: 400,
      message: e.message || "Invalid amounts",
    };
  }

  const amountFields = toReceiptAmountFields(totals);

  const receiptData = {
    ...(providedReceiptNumber && { receiptNumber: providedReceiptNumber }),
    ...(schoolId && { schoolId }),
    ...(vendorId && { vendorId }),
    ...amountFields,
    description,
    paymentMethod:
      paymentMethod != null && String(paymentMethod).trim() !== ""
        ? parsePaymentMethodString(paymentMethod)
        : PaymentMethod.BANK_TRANSFER,
    status: ReceiptStatus.GENERATED,
    createdBy: userId,
  };

  const newReceipt = await prisma.receipt.create({
    data: receiptData,
  });

  return { ok: true, data: newReceipt, linkedInvoice: false };
}

export async function listReceiptsForApi(where, paginationParams) {
  return prisma.receipt.findMany({
    where,
    include: receiptIncludeForList(),
    orderBy: { createdAt: "desc" },
    ...paginationParams,
  });
}

export async function getReceiptByIdForApi(id) {
  return prisma.receipt.findUniqueOrThrow({
    where: { id },
    include: receiptIncludeForDetail(),
  });
}

export async function getReceiptForGenerate(id) {
  return prisma.receipt.findUniqueOrThrow({
    where: { id },
    include: receiptIncludeForGenerate(),
  });
}

/**
 * @returns {{ ok: true, data: object } | { ok: false, status: number, message: string }}
 */
export async function updateReceiptFromRequest(id, request, userId) {
  const {
    schoolId,
    vendorId,
    receiptNumber,
    baseAmount,
    sgstPercent,
    cgstPercent,
    igstPercent,
    ugstPercent,
    description,
    paymentMethod,
    status,
  } = request;

  const updateData = {
    updatedBy: userId,
  };

  if (schoolId !== undefined) {
    if (schoolId) {
      await prisma.school.findUniqueOrThrow({ where: { id: schoolId } });
      updateData.schoolId = schoolId;
      updateData.vendorId = null;
    } else {
      updateData.schoolId = null;
    }
  }
  if (vendorId !== undefined) {
    if (vendorId) {
      await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } });
      updateData.vendorId = vendorId;
      updateData.schoolId = null;
    } else {
      updateData.vendorId = null;
    }
  }

  if (receiptNumber) {
    updateData.receiptNumber = receiptNumber;
  }

  if (
    baseAmount !== undefined ||
    sgstPercent !== undefined ||
    cgstPercent !== undefined ||
    igstPercent !== undefined ||
    ugstPercent !== undefined
  ) {
    const currentReceipt = await prisma.receipt.findUniqueOrThrow({
      where: { id },
    });

    const base =
      baseAmount !== undefined
        ? parseFloat(baseAmount)
        : parseFloat(currentReceipt.baseAmount);

    const sgst =
      sgstPercent !== undefined
        ? sgstPercent
          ? parseFloat(sgstPercent)
          : 0
        : currentReceipt.sgstPercent
          ? parseFloat(currentReceipt.sgstPercent)
          : 0;

    const cgst =
      cgstPercent !== undefined
        ? cgstPercent
          ? parseFloat(cgstPercent)
          : 0
        : currentReceipt.cgstPercent
          ? parseFloat(currentReceipt.cgstPercent)
          : 0;

    const igst =
      igstPercent !== undefined
        ? igstPercent
          ? parseFloat(igstPercent)
          : 0
        : currentReceipt.igstPercent
          ? parseFloat(currentReceipt.igstPercent)
          : 0;

    const ugst =
      ugstPercent !== undefined
        ? ugstPercent
          ? parseFloat(ugstPercent)
          : 0
        : currentReceipt.ugstPercent
          ? parseFloat(currentReceipt.ugstPercent)
          : 0;

    let totals;
    try {
      totals = computeGstTotals({
        baseAmount: base,
        sgstPercent: sgst,
        cgstPercent: cgst,
        igstPercent: igst,
        ugstPercent: ugst,
      });
    } catch (e) {
      return {
        ok: false,
        status: 400,
        message: e.message || "Invalid amounts",
      };
    }
    Object.assign(updateData, toReceiptAmountFields(totals));
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (paymentMethod) {
    updateData.paymentMethod = parsePaymentMethodString(paymentMethod);
  }

  if (status) {
    updateData.status = status;
  }

  const updatedReceipt = await prisma.receipt.update({
    where: { id },
    data: updateData,
  });

  return { ok: true, data: updatedReceipt };
}

export async function softDeleteReceiptById(id, userId) {
  const receipt = await prisma.receipt.findUniqueOrThrow({
    where: { id },
  });

  await prisma.$transaction(async (tx) => {
    await tx.receipt.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });
    if (receipt.invoiceId) {
      const inv = await tx.invoice.findFirst({
        where: { id: receipt.invoiceId, deletedAt: null },
      });
      if (inv && inv.status === InvoiceStatus.PAID) {
        await tx.invoice.update({
          where: { id: receipt.invoiceId },
          data: {
            status: InvoiceStatus.SENT,
            updatedBy: userId,
          },
        });
      }
    }
  });
}
