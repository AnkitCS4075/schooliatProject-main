import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  escapeHtml,
  formatAmountInr,
  numberToWordsIndian,
} from "./billing.helpers.js";
import prisma from "../prisma/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadQuotationTemplate() {
  return readFileSync(
    join(__dirname, "../templates/schooliat-quotation.html"),
    "utf-8",
  );
}

function applyReplacements(template, map) {
  let html = template;
  for (const [key, value] of Object.entries(map)) {
    html = html.replace(
      new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      value,
    );
  }
  return html;
}

function buildItemsRows(items) {
  if (!items || items.length === 0) {
    return '<tr><td colspan="6" style="text-align:center;color:#999;">No items</td></tr>';
  }
  return items
    .map(
      (item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(item.description)}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td style="text-align:right">${formatAmountInr(item.unitPrice)}</td>
      <td style="text-align:right">${parseFloat(item.taxPercent) || 0}%</td>
      <td style="text-align:right">${formatAmountInr(item.totalAmount)}</td>
    </tr>`,
    )
    .join("");
}

function getStatusLabel(status) {
  const labels = {
    DRAFT: "Draft", SENT: "Sent", APPROVED: "Approved", REJECTED: "Rejected",
    ACCEPTED: "Accepted", CONVERTED: "Converted", CANCELLED: "Cancelled", CLOSED: "Closed",
  };
  return labels[status] || status;
}

export async function buildQuotationHtmlDocument(quotation, settings) {
  const template = loadQuotationTemplate();

  const issueDate = new Date(quotation.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  const validUntilStr = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "N/A";

  const companyName = settings?.companyName || "SchooliAT";
  const companyAddress = settings?.companyAddress || "";
  const gstNumber = settings?.companyGstin || "";
  const companyPhone = settings?.companyPhone || "";
  const companyEmail = settings?.companyEmail || "";
  const companyWebsite = settings?.companyWebsite || "";
  const signatureName = settings?.signatureName || "";
  const signatureDesignation = settings?.signatureDesignation || "";
  const signatureImageUrl = settings?.signatureImageUrl || "";
  const stampImageUrl = settings?.stampImageUrl || "";

  const contactParts = [];
  if (companyPhone) contactParts.push(`<p>Phone: ${escapeHtml(companyPhone)}</p>`);
  if (companyEmail) contactParts.push(`<p>Email: ${escapeHtml(companyEmail)}</p>`);
  if (companyWebsite) contactParts.push(`<p>Web: ${escapeHtml(companyWebsite)}</p>`);

  const extraInfo = [];
  if (settings?.companyPan) extraInfo.push(`<p>PAN: ${escapeHtml(settings.companyPan)}</p>`);
  if (settings?.companyCin) extraInfo.push(`<p>CIN: ${escapeHtml(settings.companyCin)}</p>`);

  const logoHtml = settings?.companyLogoUrl
    ? `<img src="${escapeHtml(settings.companyLogoUrl)}" alt="Company Logo" class="company-logo"><br>`
    : "";

  const sigImgHtml = signatureImageUrl
    ? `<img src="${escapeHtml(signatureImageUrl)}" alt="Signature" class="signature-img"><br>`
    : "";

  const stampImgHtml = stampImageUrl
    ? `<img src="${escapeHtml(stampImageUrl)}" alt="Company Stamp" class="stamp-img"><br>`
    : "";

  // Watermark
  const watermarkText = quotation.status;
  const watermarkHtml = watermarkText
    ? `<div class="status-watermark">${escapeHtml(getStatusLabel(watermarkText))}</div>`
    : "";

  const replacements = {
    "{{STATUS_WATERMARK}}": watermarkHtml,
    "{{COMPANY_LOGO}}": logoHtml,
    "{{COMPANY_NAME}}": escapeHtml(companyName),
    "{{COMPANY_ADDRESS}}": escapeHtml(companyAddress),
    "{{GST_NUMBER}}": escapeHtml(gstNumber),
    "{{COMPANY_EXTRA_INFO}}": extraInfo.join(""),
    "{{COMPANY_CONTACT_INFO}}": contactParts.join(""),
    "{{QUOTATION_NO}}": escapeHtml(quotation.quotationNumber),
    "{{BILL_TO_NAME}}": escapeHtml(quotation.customerName),
    "{{BILL_TO_ADDRESS}}": escapeHtml(quotation.customerAddress || "N/A"),
    "{{BILL_TO_PHONE}}": escapeHtml(quotation.customerPhone || "N/A"),
    "{{BILL_TO_EMAIL}}": escapeHtml(quotation.customerEmail || "N/A"),
    "{{ISSUE_DATE}}": issueDate,
    "{{VALID_UNTIL}}": validUntilStr,
    "{{STATUS_BADGE}}": `<span class="status-badge status-${quotation.status}">${getStatusLabel(quotation.status)}</span>`,
    "{{VERSION}}": String(quotation.version || 1),
    "{{ITEMS_ROWS}}": buildItemsRows(quotation.items),
    "{{SUBTOTAL}}": formatAmountInr(quotation.subtotal),
    "{{DISCOUNT_PERCENT}}": String(parseFloat(quotation.discountPercent) || 0),
    "{{DISCOUNT_AMOUNT}}": formatAmountInr(quotation.discountAmount),
    "{{TAX_PERCENT}}": String(parseFloat(quotation.taxPercent) || 0),
    "{{TAX_AMOUNT}}": formatAmountInr(quotation.taxAmount),
    "{{TOTAL_AMOUNT}}": formatAmountInr(quotation.totalAmount),
    "{{AMOUNT_IN_WORDS}}": numberToWordsIndian(parseFloat(quotation.totalAmount)),
    "{{NOTES}}": escapeHtml(quotation.notes) || "Thank you for your business.",
    "{{TERMS_AND_CONDITIONS}}": escapeHtml(quotation.termsAndConditions) || "Standard terms and conditions apply.",
    "{{SIGNATURE_IMAGE}}": sigImgHtml,
    "{{SIGNATURE_NAME}}": escapeHtml(signatureName),
    "{{SIGNATURE_DESIGNATION}}": escapeHtml(signatureDesignation),
    "{{STAMP_IMAGE}}": stampImgHtml,
    "{{COMPANY_EMAIL}}": escapeHtml(companyEmail),
  };

  const html = applyReplacements(template, replacements).trim();
  const base64HTML = Buffer.from(html).toString("base64");
  return {
    html,
    printUrl: `data:text/html;base64,${base64HTML}`,
  };
}

export async function getSettingsForQuotation(schoolId) {
  return prisma.settings.findFirst({
    where: { schoolId, deletedAt: null },
  });
}
