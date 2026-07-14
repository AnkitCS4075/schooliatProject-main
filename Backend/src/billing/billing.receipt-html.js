import {
  BILLING_COMPANY_ADDRESS,
  BILLING_COMPANY_GST_NUMBER,
  BILLING_DEFAULT_RECEIPT_DESCRIPTION,
} from "./billing.constants.js";
import {
  escapeHtml,
  formatAddressHtmlLines,
  formatAmountInr,
  formatPaymentMethodDisplay,
  getGstColumnLayout,
  numberToWordsIndian,
  resolveNotesHtml,
} from "./billing.helpers.js";
import { loadReceiptTemplate } from "./billing.templates.js";

/**
 * @param {object} receipt — prisma row with school and/or vendor populated
 * @param {string} [notes]
 */
export function buildReceiptHtmlDocument(receipt, notes) {
  const template = loadReceiptTemplate();

  const issueDate = new Date(receipt.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const paymentMethodDisplay = formatPaymentMethodDisplay(receipt.paymentMethod);

  let billTo;
  let shipTo;
  if (receipt.vendor) {
    const vendorAddressHtml = formatAddressHtmlLines(receipt.vendor.address);
    billTo = `<strong>${escapeHtml(receipt.vendor.name)}</strong><br>${vendorAddressHtml}`;
    shipTo = vendorAddressHtml;
  } else if (receipt.school) {
    const schoolAddressHtml = formatAddressHtmlLines(receipt.school.address);
    billTo = `<strong>${escapeHtml(receipt.school.name)}</strong><br>${schoolAddressHtml}`;
    shipTo = schoolAddressHtml;
  } else {
    billTo = "N/A";
    shipTo = "N/A";
  }

  const baseAmount = parseFloat(receipt.baseAmount) || 0;
  const totalAmount = parseFloat(receipt.amount) || 0;
  const tax = getGstColumnLayout(receipt);

  let receiptHTML = template;

  receiptHTML = receiptHTML.replace(
    /\{\{RECEIPT_NO\}\}/g,
    escapeHtml(receipt.receiptNumber),
  );
  receiptHTML = receiptHTML.replace(/\{\{BILL_TO\}\}/g, billTo);
  receiptHTML = receiptHTML.replace(/\{\{SHIP_TO\}\}/g, shipTo);
  receiptHTML = receiptHTML.replace(/\{\{ISSUE_DATE\}\}/g, issueDate);
  receiptHTML = receiptHTML.replace(
    /\{\{PAYMENT_METHOD\}\}/g,
    paymentMethodDisplay,
  );
  receiptHTML = receiptHTML.replace(/\{\{TAX_1\}\}/g, tax.tax1Name);
  receiptHTML = receiptHTML.replace(/\{\{TAX_2\}\}/g, tax.tax2Name);
  receiptHTML = receiptHTML.replace(
    /\{\{TAX_1_PERCENTAGE\}\}/g,
    tax.tax1Percent + "%",
  );
  receiptHTML = receiptHTML.replace(
    /\{\{TAX_2_PERCENTAGE\}\}/g,
    tax.tax2Percent + "%",
  );
  receiptHTML = receiptHTML.replace(
    /\{\{TAX_1_AMOUNT\}\}/g,
    formatAmountInr(tax.tax1Amount),
  );
  receiptHTML = receiptHTML.replace(
    /\{\{TAX_2_AMOUNT\}\}/g,
    formatAmountInr(tax.tax2Amount),
  );
  receiptHTML = receiptHTML.replace(/\{\{PRICE\}\}/g, formatAmountInr(baseAmount));
  receiptHTML = receiptHTML.replace(
    /\{\{TAXABLE_VALUE\}\}/g,
    formatAmountInr(baseAmount),
  );
  receiptHTML = receiptHTML.replace(
    /\{\{AMOUNT\}\}/g,
    formatAmountInr(totalAmount),
  );
  receiptHTML = receiptHTML.replace(
    /\{\{AMOUNT_IN_WORDS\}\}/g,
    numberToWordsIndian(totalAmount),
  );
  receiptHTML = receiptHTML.replace(/\{\{NOTES\}\}/g, resolveNotesHtml(notes));
  receiptHTML = receiptHTML.replace(
    /\{\{DESCRIPTION\}\}/g,
    escapeHtml(receipt.description) || BILLING_DEFAULT_RECEIPT_DESCRIPTION,
  );
  receiptHTML = receiptHTML.replace(
    /\{\{COMPANY_ADDRESS\}\}/g,
    BILLING_COMPANY_ADDRESS,
  );
  receiptHTML = receiptHTML.replace(
    /\{\{GST_NUMBER\}\}/g,
    BILLING_COMPANY_GST_NUMBER,
  );

  const html = receiptHTML.trim();
  const base64HTML = Buffer.from(html).toString("base64");
  return {
    html,
    printUrl: `data:text/html;base64,${base64HTML}`,
    receipt,
  };
}
