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

const PLATFORM_DEFAULTS = Object.freeze({
  companyName: "Schooliat Technologies Private Limited",
  companyAddress: "www.schooliat.com",
  companyPhone: "+91 8551919628",
  companyEmail: "info@schooliat.com",
  companyLogoUrl: "https://schooliat.com/_next/static/media/logo.b01f5b08.png",
});

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
    return '<tr><td colspan="6" style="text-align:center;color:#999;">No modules added</td></tr>';
  }
  return items
    .map(
      (item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${escapeHtml(item.moduleName)}${item.description ? `<br><span style="color:#64748b;font-size:12px;">${escapeHtml(item.description)}</span>` : ""}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td style="text-align:right">${formatAmountInr(item.unitPrice)}</td>
      <td style="text-align:right">—</td>
      <td style="text-align:right">${formatAmountInr(item.totalAmount)}</td>
    </tr>`,
    )
    .join("");
}

function getStatusLabel(status) {
  const labels = {
    DRAFT: "Draft", SENT: "Sent", ACCEPTED: "Accepted", REJECTED: "Rejected", EXPIRED: "Expired",
  };
  return labels[status] || status;
}

export async function getPlatformQuotationBranding() {
  const settings = await prisma.settings.findFirst({
    where: { schoolId: null, deletedAt: null },
  });

  return {
    companyName: settings?.companyName || PLATFORM_DEFAULTS.companyName,
    companyAddress: settings?.companyAddress || PLATFORM_DEFAULTS.companyAddress,
    companyGstin: settings?.companyGstin || "",
    companyPhone: settings?.companyPhone || PLATFORM_DEFAULTS.companyPhone,
    companyEmail: settings?.companyEmail || PLATFORM_DEFAULTS.companyEmail,
    companyWebsite: settings?.companyWebsite || "",
    companyLogoUrl: settings?.companyLogoUrl || PLATFORM_DEFAULTS.companyLogoUrl,
    signatureName: settings?.signatureName || "",
    signatureDesignation: settings?.signatureDesignation || "",
  };
}

export async function buildPlatformQuotationHtmlDocument(quotation, branding) {
  const template = loadQuotationTemplate();

  const issueDate = new Date(quotation.createdAt).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric",
  });

  const validUntilStr = quotation.validUntil
    ? new Date(quotation.validUntil).toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "N/A";

  const companyName = branding?.companyName || PLATFORM_DEFAULTS.companyName;
  const companyAddress = branding?.companyAddress || "";
  const gstNumber = branding?.companyGstin || "";
  const companyPhone = branding?.companyPhone || "";
  const companyEmail = branding?.companyEmail || "";
  const companyWebsite = branding?.companyWebsite || "";
  const signatureName = branding?.signatureName || "";
  const signatureDesignation = branding?.signatureDesignation || "";

  const contactParts = [];
  if (companyPhone) contactParts.push(`<p>Phone: ${escapeHtml(companyPhone)}</p>`);
  if (companyEmail) contactParts.push(`<p>Email: ${escapeHtml(companyEmail)}</p>`);
  if (companyWebsite) contactParts.push(`<p>Web: ${escapeHtml(companyWebsite)}</p>`);

  const logoHtml = branding?.companyLogoUrl
    ? `<img src="${escapeHtml(branding.companyLogoUrl)}" alt="Company Logo" class="company-logo"><br>`
    : "";

  const billToPhone = quotation.contactPhone
    ? `<p>${escapeHtml(quotation.contactPhone)}</p>`
    : "";
  const billToEmail = quotation.contactEmail
    ? `<p>${escapeHtml(quotation.contactEmail)}</p>`
    : "";

  const replacements = {
    "{{STATUS_WATERMARK}}": `<div class="status-watermark">${escapeHtml(getStatusLabel(quotation.status))}</div>`,
    "{{COMPANY_LOGO}}": logoHtml,
    "{{COMPANY_NAME}}": escapeHtml(companyName),
    "{{COMPANY_ADDRESS}}": escapeHtml(companyAddress),
    "{{GST_NUMBER}}": escapeHtml(gstNumber),
    "{{COMPANY_EXTRA_INFO}}": "",
    "{{COMPANY_CONTACT_INFO}}": contactParts.join(""),
    "{{QUOTATION_NO}}": escapeHtml(quotation.quotationNumber),
    "{{BILL_TO_NAME}}": escapeHtml(quotation.schoolName || "Prospective School"),
    "{{BILL_TO_ADDRESS}}": escapeHtml(quotation.contactPerson ? `Attn: ${quotation.contactPerson}` : "N/A"),
    "{{BILL_TO_PHONE}}": billToPhone,
    "{{BILL_TO_EMAIL}}": billToEmail,
    "{{ISSUE_DATE}}": issueDate,
    "{{VALID_UNTIL}}": validUntilStr,
    "{{STATUS_BADGE}}": `<span class="status-badge status-${quotation.status}">${getStatusLabel(quotation.status)}</span>`,
    "{{VERSION}}": "1",
    "{{ITEMS_ROWS}}": buildItemsRows(quotation.items),
    "{{SUBTOTAL}}": formatAmountInr(quotation.subtotal),
    "{{DISCOUNT_PERCENT}}": String(parseFloat(quotation.discountPercent) || 0),
    "{{DISCOUNT_AMOUNT}}": formatAmountInr(quotation.discountAmount),
    "{{TAX_PERCENT}}": String(parseFloat(quotation.taxPercent) || 0),
    "{{TAX_AMOUNT}}": formatAmountInr(quotation.taxAmount),
    "{{TOTAL_AMOUNT}}": formatAmountInr(quotation.totalAmount),
    "{{AMOUNT_IN_WORDS}}": numberToWordsIndian(parseFloat(quotation.totalAmount)),
    "{{NOTES}}": escapeHtml(quotation.notes) || "Thank you for considering Schooliat for your school.",
    "{{TERMS_AND_CONDITIONS}}": escapeHtml(quotation.termsAndConditions) || "Standard terms and conditions apply.",
    "{{SIGNATURE_IMAGE}}": "",
    "{{SIGNATURE_NAME}}": escapeHtml(signatureName),
    "{{SIGNATURE_DESIGNATION}}": escapeHtml(signatureDesignation),
    "{{STAMP_IMAGE}}": "",
    "{{COMPANY_EMAIL}}": escapeHtml(companyEmail),
  };

  const html = applyReplacements(template, replacements).trim();
  const base64HTML = Buffer.from(html).toString("base64");
  return {
    html,
    printUrl: `data:text/html;base64,${base64HTML}`,
  };
}
