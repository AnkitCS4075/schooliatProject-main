import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import { renderBillingHtmlToPdfBuffer, safeBillingFilenamePart } from "../billing/billing-html-to-pdf.service.js";
import { buildPlatformQuotationHtmlDocument, getPlatformQuotationBranding } from "../billing/billing.platform-quotation-html.js";
import emailService from "../services/email.service.js";
import onboardingService from "../services/school-onboarding.service.js";

const DEFAULT_VALIDITY_DAYS = 30;

function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function computeTotals(items, discountPercent, taxPercent) {
  const subtotal = round2(
    (items || []).reduce((sum, item) => {
      return sum + Number(item.unitPrice || 0) * Number(item.quantity || 1);
    }, 0),
  );
  const discountAmount = round2((subtotal * Number(discountPercent || 0)) / 100);
  const taxable = subtotal - discountAmount;
  const taxAmount = round2((taxable * Number(taxPercent || 0)) / 100);
  const totalAmount = round2(taxable + taxAmount);
  return { subtotal, discountAmount, taxAmount, totalAmount };
}

function buildValidUntil(validityDays, providedDate) {
  if (providedDate) return new Date(providedDate);
  return new Date(Date.now() + Number(validityDays || DEFAULT_VALIDITY_DAYS) * 24 * 60 * 60 * 1000);
}

async function generateQuotationNumber() {
  const settings = await prisma.settings.findFirst({
    where: { schoolId: null, deletedAt: null },
  });

  if (settings) {
    const prefix = settings.quotationPrefix || "PQ";
    const next = Number(settings.quotationNextSequence || 0) + 1;
    await prisma.settings.update({
      where: { id: settings.id },
      data: { quotationNextSequence: next },
    });
    return `${prefix}-${String(next).padStart(4, "0")}`;
  }

  const last = await prisma.platformQuotation.findFirst({
    where: { deletedAt: null },
    orderBy: { quotationNumber: "desc" },
  });
  const lastSeq = last ? parseInt(String(last.quotationNumber).split("-").pop(), 10) || 0 : 0;
  return `PQ-${String(lastSeq + 1).padStart(4, "0")}`;
}

async function autoExpireOverdue() {
  try {
    await prisma.platformQuotation.updateMany({
      where: {
        status: { in: ["DRAFT", "SENT"] },
        validUntil: { not: null, lt: new Date() },
        deletedAt: null,
      },
      data: { status: "EXPIRED" },
    });
  } catch (error) {
    logger.error({ error: error.message }, "Failed to auto-expire platform quotations");
  }
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, idx) => ({
      moduleName: String(item.moduleName || item.name || "").trim(),
      description: item.description ? String(item.description).trim() : null,
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      unitPrice: round2(Number(item.unitPrice || item.price || 0)),
      sortOrder: parseInt(item.sortOrder, 10) || idx + 1,
    }))
    .filter((item) => item.moduleName);
}

async function create(data, userId) {
  const schoolName = String(data.schoolName || "").trim();
  if (!schoolName) throw new Error("schoolName is required");

  const items = sanitizeItems(data.items);
  const discountPercent = round2(Number(data.discountPercent || 0));
  const taxPercent = round2(Number(data.taxPercent || 0));
  const { subtotal, discountAmount, taxAmount, totalAmount } = computeTotals(items, discountPercent, taxPercent);
  const validityDays = Math.max(1, parseInt(data.validityDays, 10) || DEFAULT_VALIDITY_DAYS);
  const validUntil = buildValidUntil(validityDays, data.validUntil);
  const quotationNumber = await generateQuotationNumber();

  const quotation = await prisma.platformQuotation.create({
    data: {
      quotationNumber,
      schoolName,
      contactPerson: data.contactPerson ? String(data.contactPerson).trim() : null,
      contactEmail: data.contactEmail ? String(data.contactEmail).trim() : null,
      contactPhone: data.contactPhone ? String(data.contactPhone).trim() : null,
      modulesSelected: Array.isArray(data.modulesSelected) && data.modulesSelected.length ? data.modulesSelected : (items.length ? items.map((i) => i.moduleName) : null),
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      totalAmount,
      validityDays,
      validUntil,
      termsAndConditions: data.termsAndConditions ? String(data.termsAndConditions).trim() : null,
      notes: data.notes ? String(data.notes).trim() : null,
      status: "DRAFT",
      createdBy: userId,
      items: {
        create: items.map((item) => ({
          moduleName: item.moduleName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: round2(item.unitPrice * item.quantity),
          sortOrder: item.sortOrder,
        })),
      },
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  logger.info({ quotationId: quotation.id }, "Platform quotation created");
  return quotation;
}

async function getById(id) {
  await autoExpireOverdue();
  const quotation = await prisma.platformQuotation.findFirst({
    where: { id, deletedAt: null },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      onboarding: {
        select: { id: true, schoolName: true, status: true, createdAt: true },
      },
    },
  });
  return quotation;
}

async function list(filters = {}, options = {}) {
  await autoExpireOverdue();
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { deletedAt: null };
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { schoolName: { contains: filters.search, mode: "insensitive" } },
      { contactEmail: { contains: filters.search, mode: "insensitive" } },
      { quotationNumber: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.platformQuotation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        onboarding: { select: { id: true, status: true } },
      },
    }),
    prisma.platformQuotation.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function stats() {
  await autoExpireOverdue();
  const rows = await prisma.platformQuotation.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { _all: true },
  });
  const counts = { DRAFT: 0, SENT: 0, ACCEPTED: 0, REJECTED: 0, EXPIRED: 0 };
  for (const row of rows) counts[row.status] = row._count._all;
  return counts;
}

async function update(id, data, userId) {
  const existing = await getById(id);
  if (!existing) throw new Error("Platform quotation not found");
  if (!["DRAFT", "SENT"].includes(existing.status)) {
    throw new Error(`Cannot edit a quotation in status: ${existing.status}`);
  }

  const items = data.items ? sanitizeItems(data.items) : existing.items.map((i) => ({
    moduleName: i.moduleName,
    description: i.description,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    sortOrder: i.sortOrder,
  }));

  const discountPercent = round2(data.discountPercent !== undefined ? Number(data.discountPercent) : Number(existing.discountPercent));
  const taxPercent = round2(data.taxPercent !== undefined ? Number(data.taxPercent) : Number(existing.taxPercent));
  const { subtotal, discountAmount, taxAmount, totalAmount } = computeTotals(items, discountPercent, taxPercent);
  const validityDays = Math.max(1, parseInt(data.validityDays, 10) || existing.validityDays || DEFAULT_VALIDITY_DAYS);
  const validUntil = data.validUntil ? new Date(data.validUntil) : existing.validUntil;

  const updated = await prisma.$transaction(async (tx) => {
    const quotation = await tx.platformQuotation.update({
      where: { id },
      data: {
        schoolName: data.schoolName !== undefined ? String(data.schoolName).trim() : undefined,
        contactPerson: data.contactPerson !== undefined ? String(data.contactPerson).trim() : undefined,
        contactEmail: data.contactEmail !== undefined ? String(data.contactEmail).trim() : undefined,
        contactPhone: data.contactPhone !== undefined ? String(data.contactPhone).trim() : undefined,
        modulesSelected: data.modulesSelected !== undefined ? data.modulesSelected : undefined,
        validityDays,
        validUntil,
        termsAndConditions: data.termsAndConditions !== undefined ? String(data.termsAndConditions).trim() : undefined,
        notes: data.notes !== undefined ? String(data.notes).trim() : undefined,
        discountPercent,
        taxPercent,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        updatedBy: userId,
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (data.items) {
      await tx.platformQuotationItem.deleteMany({ where: { platformQuotationId: id } });
      await tx.platformQuotationItem.createMany({
        data: items.map((item) => ({
          platformQuotationId: id,
          moduleName: item.moduleName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: round2(item.unitPrice * item.quantity),
          sortOrder: item.sortOrder,
        })),
      });
    }

    return tx.platformQuotation.findFirst({
      where: { id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
  });

  return updated;
}

async function getPdfBuffer(id) {
  const quotation = await getById(id);
  if (!quotation) throw new Error("Platform quotation not found");
  const branding = await getPlatformQuotationBranding();
  const { html } = await buildPlatformQuotationHtmlDocument(quotation, branding);
  const pdfBuffer = await renderBillingHtmlToPdfBuffer(html);
  return { pdfBuffer, quotation, filename: `${safeBillingFilenamePart(quotation.quotationNumber)}.pdf` };
}

async function getPreview(id) {
  const quotation = await getById(id);
  if (!quotation) throw new Error("Platform quotation not found");
  const branding = await getPlatformQuotationBranding();
  return buildPlatformQuotationHtmlDocument(quotation, branding);
}

async function sendEmail(id, payload, userId) {
  const { pdfBuffer, quotation } = await getPdfBuffer(id);
  const to = payload.to || quotation.contactEmail;
  if (!to) throw new Error("No email address provided");

  const branding = await getPlatformQuotationBranding();
  await emailService.sendEmail({
    to,
    subject: payload.subject || `Quotation ${quotation.quotationNumber} from ${branding.companyName || "Schooliat"}`,
    html: `<p>Dear ${quotation.contactPerson || "School Administrator"},</p>
<p>Please find attached quotation <strong>${quotation.quotationNumber}</strong> for <strong>${quotation.schoolName}</strong>.</p>
<p>Total amount: ₹${Number(quotation.totalAmount).toLocaleString("en-IN")}</p>
<p>Valid until: ${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "N/A"}</p>
<p>Please feel free to reach out for any clarifications. We look forward to partnering with your school.</p>
<p>Thank you,<br>${branding.companyName || "Schooliat"}</p>`,
    attachments: [{
      filename: `${safeBillingFilenamePart(quotation.quotationNumber)}.pdf`,
      content: pdfBuffer,
      contentType: "application/pdf",
    }],
  });

  const updated = await prisma.platformQuotation.update({
    where: { id },
    data: { status: "SENT", sentAt: new Date(), updatedBy: userId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return updated;
}

async function markAccepted(id, userId) {
  const existing = await getById(id);
  if (!existing) throw new Error("Platform quotation not found");
  if (existing.status === "ACCEPTED") return existing;
  if (!["DRAFT", "SENT"].includes(existing.status)) {
    throw new Error(`Cannot accept a quotation in status: ${existing.status}`);
  }

  const onboarding = await onboardingService.create(
    {
      schoolName: existing.schoolName,
      schoolAddress: existing.contactPerson ? `${existing.schoolName}, ${existing.contactPerson}` : existing.schoolName,
      schoolContactNumber: existing.contactPhone || "",
      pointOfContactName: existing.contactPerson || null,
      concernedEmail: existing.contactEmail || "",
      pricingPerStudent: null,
      pricingPerMonth: null,
      notes: `Created automatically from accepted platform quotation ${existing.quotationNumber}`,
    },
    userId,
  );

  const updated = await prisma.platformQuotation.update({
    where: { id },
    data: { status: "ACCEPTED", acceptedAt: new Date(), onboardingId: onboarding.id, updatedBy: userId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  return updated;
}

async function markRejected(id, reason, userId) {
  const existing = await getById(id);
  if (!existing) throw new Error("Platform quotation not found");
  if (!["DRAFT", "SENT"].includes(existing.status)) {
    throw new Error(`Cannot reject a quotation in status: ${existing.status}`);
  }
  return prisma.platformQuotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: reason ? String(reason).trim() : null,
      rejectedAt: new Date(),
      updatedBy: userId,
    },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

async function markExpired(id, userId) {
  const existing = await getById(id);
  if (!existing) throw new Error("Platform quotation not found");
  if (!["DRAFT", "SENT"].includes(existing.status)) {
    throw new Error(`Cannot expire a quotation in status: ${existing.status}`);
  }
  return prisma.platformQuotation.update({
    where: { id },
    data: { status: "EXPIRED", updatedBy: userId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

const platformQuotationService = {
  create,
  getById,
  list,
  stats,
  update,
  getPdfBuffer,
  getPreview,
  sendEmail,
  markAccepted,
  markRejected,
  markExpired,
};

export default platformQuotationService;
