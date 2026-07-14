import {
  BILLING_COMPANY_ADDRESS,
  BILLING_COMPANY_GST_NUMBER,
  BILLING_DEFAULT_INVOICE_DESCRIPTION,
} from "./billing.constants.js";
import {
  escapeHtml,
  formatAddressHtmlLines,
  formatAmountInr,
  getGstColumnLayout,
  numberToWordsIndian,
  resolveNotesHtml,
} from "./billing.helpers.js";
import { loadInvoiceTemplate } from "./billing.templates.js";

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

/**
 * @param {object} invoice — prisma row with school and/or vendor populated
 * @param {string} [notes]
 */
export function buildInvoiceHtmlDocument(invoice, notes) {
  const template = loadInvoiceTemplate();

  const issueDate = new Date(invoice.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dueDateStr = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const recipient = invoice.school || invoice.vendor;
  const recipientName = recipient?.name || "N/A";
  const recipientAddressHtml = recipient?.address
    ? formatAddressHtmlLines(recipient.address)
    : "N/A";

  const recipientPhone = recipient?.phone || recipient?.contact || "N/A";
  const recipientEmail = recipient?.email || "N/A";

  const billTo = `<strong>${escapeHtml(recipientName)}</strong><br>${recipientAddressHtml}`;

  const tax = getGstColumnLayout(invoice);

  const replacements = {
    "{{INVOICE_NO}}": invoice.invoiceNumber
      ? escapeHtml(invoice.invoiceNumber)
      : "DRAFT",
    "{{ISSUE_DATE}}": issueDate,
    "{{DUE_DATE}}": dueDateStr,
    "{{BILL_TO}}": billTo,
    "{{SHIP_TO}}": recipientAddressHtml,
    "{{RECIPIENT_PHONE}}": escapeHtml(recipientPhone),
    "{{RECIPIENT_EMAIL}}": escapeHtml(recipientEmail),
    "{{DESCRIPTION}}":
      escapeHtml(invoice.description) || BILLING_DEFAULT_INVOICE_DESCRIPTION,
    "{{TAXABLE_VALUE}}": formatAmountInr(invoice.baseAmount),
    "{{PRICE}}": formatAmountInr(invoice.baseAmount),
    "{{TAX_1}}": tax.tax1Name,
    "{{TAX_2}}": tax.tax2Name,
    "{{TAX_1_PERCENTAGE}}": tax.tax1Percent + "%",
    "{{TAX_2_PERCENTAGE}}": tax.tax2Percent + "%",
    "{{TAX_1_AMOUNT}}": formatAmountInr(tax.tax1Amount),
    "{{TAX_2_AMOUNT}}": formatAmountInr(tax.tax2Amount),
    "{{AMOUNT}}": formatAmountInr(invoice.amount),
    "{{AMOUNT_IN_WORDS}}": numberToWordsIndian(parseFloat(invoice.amount)),
    "{{NOTES}}": resolveNotesHtml(notes),
    "{{COMPANY_ADDRESS}}": BILLING_COMPANY_ADDRESS,
    "{{GST_NUMBER}}": BILLING_COMPANY_GST_NUMBER,
  };

  const html = applyReplacements(template, replacements).trim();
  const base64HTML = Buffer.from(html).toString("base64");
  return {
    html,
    printUrl: `data:text/html;base64,${base64HTML}`,
  };
}
