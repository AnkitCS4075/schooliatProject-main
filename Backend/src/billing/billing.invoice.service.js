import prisma from "../prisma/client.js";
import { InvoiceStatus } from "../prisma/generated/index.js";
import {
  computeGstTotals,
  toInvoiceAmountFields,
} from "./billing.amounts.js";
import { invoiceReceiptSummaryInclude } from "./billing.includes.js";

/**
 * @param {object} request — body.request from API
 * @param {string} userId
 * @returns {{ ok: true, data: object } | { ok: false, status: number, message: string }}
 */
export async function createInvoiceFromRequest(request, userId) {
  const {
    schoolId,
    vendorId,
    baseAmount,
    sgstPercent,
    cgstPercent,
    igstPercent,
    ugstPercent,
    description,
    dueDate,
  } = request;

  if (!schoolId && !vendorId) {
    return {
      ok: false,
      status: 400,
      message: "Either schoolId or vendorId is required",
    };
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

  const invoiceData = {
    schoolId: schoolId || null,
    vendorId: vendorId || null,
    ...toInvoiceAmountFields(totals),
    description,
    dueDate: dueDate ? new Date(dueDate) : null,
    status: InvoiceStatus.DRAFT,
    createdBy: userId,
  };

  const newInvoice = await prisma.invoice.create({
    data: invoiceData,
  });

  return { ok: true, data: newInvoice };
}

export async function listInvoicesForApi(where, paginationParams) {
  return prisma.invoice.findMany({
    where,
    include: {
      school: {
        select: { name: true, code: true },
      },
      vendor: {
        select: { name: true, email: true },
      },
      receipts: invoiceReceiptSummaryInclude,
    },
    orderBy: { createdAt: "desc" },
    ...paginationParams,
  });
}

export async function getInvoiceByIdForApi(id) {
  return prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      school: true,
      vendor: true,
      receipts: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          receiptNumber: true,
          amount: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getInvoiceForGenerate(id) {
  return prisma.invoice.findUniqueOrThrow({
    where: { id, deletedAt: null },
    include: {
      school: true,
      vendor: true,
    },
  });
}
