import prisma from "../prisma/client.js";
import logger from "../config/logger.js";

const QUOTATION_INCLUDE = {
  items: { orderBy: { sortOrder: "asc" } },
  versions: { orderBy: { createdAt: "desc" }, take: 10 },
  comments: { orderBy: { createdAt: "desc" }, take: 20 },
};

async function getNextQuotationNumber(schoolId) {
  const settings = await prisma.settings.findFirst({
    where: { schoolId, deletedAt: null },
  });
  const prefix = settings?.quotationPrefix || "QUO";
  const nextSeq = settings?.quotationNextSequence || 1;
  const number = `${prefix}-${String(nextSeq).padStart(4, "0")}`;
  await prisma.settings.update({
    where: { id: settings.id },
    data: { quotationNextSequence: nextSeq + 1 },
  });
  return number;
}

const createQuotation = async (data) => {
  const quotationNumber = await getNextQuotationNumber(data.schoolId);
  const items = data.items || [];

  let subtotal = 0;
  let totalTax = 0;
  const processedItems = items.map((item, idx) => {
    const qty = item.quantity || 1;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const taxPct = parseFloat(item.taxPercent) || 0;
    const lineSubtotal = unitPrice * qty;
    const lineTax = lineSubtotal * (taxPct / 100);
    subtotal += lineSubtotal;
    totalTax += lineTax;
    return {
      description: item.description,
      quantity: qty,
      unitPrice,
      taxPercent: taxPct,
      taxAmount: lineTax,
      totalAmount: lineSubtotal + lineTax,
      sortOrder: idx,
    };
  });

  const discountPct = parseFloat(data.discountPercent) || 0;
  const discountAmt = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxPct = parseFloat(data.taxPercent) || 0;
  const taxAmt = afterDiscount * (taxPct / 100);
  const totalAmount = afterDiscount + taxAmt;

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber,
      schoolId: data.schoolId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      customerAddress: data.customerAddress || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      description: data.description || null,
      subtotal,
      discountPercent: discountPct,
      discountAmount: discountAmt,
      taxPercent: taxPct,
      taxAmount: taxAmt,
      totalAmount,
      notes: data.notes || null,
      termsAndConditions: data.termsAndConditions || null,
      createdBy: data.createdBy,
      items: { create: processedItems },
    },
    include: QUOTATION_INCLUDE,
  });

  // Create initial version snapshot
  await prisma.quotationVersion.create({
    data: {
      quotationId: quotation.id,
      version: 1,
      snapshot: JSON.parse(JSON.stringify(quotation)),
      changedById: data.createdBy,
      changeNote: "Quotation created",
    },
  });

  return quotation;
};

const getQuotations = async (schoolId, options = {}) => {
  const { page = 1, limit = 20, status, search, sortBy = "createdAt", sortOrder = "desc" } = options;
  const skip = (page - 1) * limit;

  const where = { schoolId, deletedAt: null };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { quotationNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: {
        items: { select: { id: true, description: true, totalAmount: true } },
        _count: { select: { items: true, comments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.quotation.count({ where }),
  ]);

  return {
    quotations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const getQuotationById = async (id, schoolId) => {
  return prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: QUOTATION_INCLUDE,
  });
};

const getQuotationByNumber = async (quotationNumber, schoolId) => {
  return prisma.quotation.findFirst({
    where: { quotationNumber, schoolId, deletedAt: null },
    include: QUOTATION_INCLUDE,
  });
};

const updateQuotation = async (id, schoolId, data) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");
  if (existing.status !== "DRAFT" && existing.status !== "SENT") {
    throw new Error("Can only edit quotations in DRAFT or SENT status");
  }

  const items = data.items;
  let updateData = {
    updatedBy: data.updatedBy,
    version: existing.version + 1,
  };

  if (data.customerName !== undefined) updateData.customerName = data.customerName;
  if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
  if (data.customerAddress !== undefined) updateData.customerAddress = data.customerAddress;
  if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.termsAndConditions !== undefined) updateData.termsAndConditions = data.termsAndConditions;
  if (data.discountPercent !== undefined) updateData.discountPercent = parseFloat(data.discountPercent) || 0;
  if (data.taxPercent !== undefined) updateData.taxPercent = parseFloat(data.taxPercent) || 0;

  // Recalculate totals
  if (items && Array.isArray(items)) {
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
    let subtotal = 0;
    let totalTax = 0;
    const processedItems = items.map((item, idx) => {
      const qty = item.quantity || 1;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const taxPct = parseFloat(item.taxPercent) || 0;
      const lineSubtotal = unitPrice * qty;
      const lineTax = lineSubtotal * (taxPct / 100);
      subtotal += lineSubtotal;
      totalTax += lineTax;
      return {
        quotationId: id,
        description: item.description,
        quantity: qty,
        unitPrice,
        taxPercent: taxPct,
        taxAmount: lineTax,
        totalAmount: lineSubtotal + lineTax,
        sortOrder: idx,
      };
    });
    await prisma.quotationItem.createMany({ data: processedItems });

    const discountPct = updateData.discountPercent ?? (parseFloat(existing.discountPercent) || 0);
    const discountAmt = subtotal * (discountPct / 100);
    const afterDiscount = subtotal - discountAmt;
    const taxPct = updateData.taxPercent ?? (parseFloat(existing.taxPercent) || 0);
    const taxAmt = afterDiscount * (taxPct / 100);

    updateData.subtotal = subtotal;
    updateData.discountAmount = discountAmt;
    updateData.taxAmount = taxAmt;
    updateData.totalAmount = afterDiscount + taxAmt;
  }

  const updated = await prisma.quotation.update({
    where: { id },
    data: updateData,
    include: QUOTATION_INCLUDE,
  });

  // Create version snapshot
  await prisma.quotationVersion.create({
    data: {
      quotationId: id,
      version: updated.version,
      snapshot: JSON.parse(JSON.stringify(updated)),
      changedById: data.updatedBy,
      changeNote: data.changeNote || "Quotation updated",
    },
  });

  return updated;
};

const deleteQuotation = async (id, schoolId, userId) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");
  if (existing.status === "CONVERTED") {
    throw new Error("Cannot delete a converted quotation");
  }

  return prisma.quotation.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: userId },
  });
};

const approveQuotation = async (id, schoolId, userId) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");
  if (!["DRAFT", "SENT"].includes(existing.status)) {
    throw new Error("Can only approve DRAFT or SENT quotations");
  }

  return prisma.quotation.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedById: userId,
      approvedAt: new Date(),
      rejectionReason: null,
    },
    include: QUOTATION_INCLUDE,
  });
};

const rejectQuotation = async (id, schoolId, reason) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");

  return prisma.quotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: reason || "Rejected",
    },
    include: QUOTATION_INCLUDE,
  });
};

const cancelQuotation = async (id, schoolId, comment, userId) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");
  if (existing.status === "CONVERTED") {
    throw new Error("Cannot cancel a converted quotation");
  }

  return prisma.quotation.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelComment: comment || "Cancelled",
      cancelledById: userId,
      cancelledAt: new Date(),
    },
    include: QUOTATION_INCLUDE,
  });
};

const closeQuotation = async (id, schoolId, comment, userId) => {
  const existing = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
  });
  if (!existing) throw new Error("Quotation not found");

  return prisma.quotation.update({
    where: { id },
    data: {
      status: "CLOSED",
      closeComment: comment || "Closed",
      closedById: userId,
      closedAt: new Date(),
    },
    include: QUOTATION_INCLUDE,
  });
};

const convertToInvoice = async (id, schoolId, userId) => {
  const quotation = await prisma.quotation.findFirst({
    where: { id, schoolId, deletedAt: null },
    include: { items: true },
  });
  if (!quotation) throw new Error("Quotation not found");
  if (!["APPROVED", "ACCEPTED"].includes(quotation.status)) {
    throw new Error("Can only convert APPROVED or ACCEPTED quotations");
  }

  // Generate invoice number
  const settings = await prisma.settings.findFirst({
    where: { schoolId, deletedAt: null },
  });
  const prefix = settings?.invoicePrefix || "INV";
  const nextSeq = settings?.invoiceNextSequence || 1;
  const invoiceNumber = `${prefix}-${String(nextSeq).padStart(4, "0")}`;
  await prisma.settings.update({
    where: { id: settings.id },
    data: { invoiceNextSequence: nextSeq + 1 },
  });

  const description = quotation.items
    .map((item) => `${item.description} (x${item.quantity})`)
    .join(", ");

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      schoolId,
      amount: quotation.totalAmount,
      baseAmount: quotation.subtotal,
      description: description || quotation.description || "Quotation conversion",
      status: "DRAFT",
      createdBy: userId,
    },
  });

  // Link quotation to invoice
  await prisma.quotation.update({
    where: { id },
    data: {
      status: "CONVERTED",
      invoiceId: invoice.id,
    },
  });

  return { invoice, quotationNumber: quotation.quotationNumber };
};

const getQuotationStats = async (schoolId) => {
  const [total, draft, sent, approved, rejected, accepted, converted, cancelled, closed] =
    await Promise.all([
      prisma.quotation.count({ where: { schoolId, deletedAt: null } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "DRAFT" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "SENT" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "APPROVED" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "REJECTED" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "ACCEPTED" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "CONVERTED" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "CANCELLED" } }),
      prisma.quotation.count({ where: { schoolId, deletedAt: null, status: "CLOSED" } }),
    ]);

  const totalValue = await prisma.quotation.aggregate({
    where: { schoolId, deletedAt: null },
    _sum: { totalAmount: true },
  });

  const convertedValue = await prisma.quotation.aggregate({
    where: { schoolId, deletedAt: null, status: "CONVERTED" },
    _sum: { totalAmount: true },
  });

  return {
    total, draft, sent, approved, rejected, accepted, converted, cancelled, closed,
    totalValue: totalValue._sum.totalAmount || 0,
    convertedValue: convertedValue._sum.totalAmount || 0,
    conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
  };
};

const getQuotationVersions = async (quotationId) => {
  return prisma.quotationVersion.findMany({
    where: { quotationId },
    orderBy: { version: "desc" },
  });
};

const addComment = async (quotationId, authorId, authorName, content) => {
  return prisma.quotationComment.create({
    data: {
      quotationId,
      authorId,
      authorName: authorName || "Unknown",
      content,
    },
  });
};

const quotationService = {
  createQuotation,
  getQuotations,
  getQuotationById,
  getQuotationByNumber,
  updateQuotation,
  deleteQuotation,
  approveQuotation,
  rejectQuotation,
  cancelQuotation,
  closeQuotation,
  convertToInvoice,
  getQuotationStats,
  getQuotationVersions,
  addComment,
};

export default quotationService;
