import { BILLING_DEFAULT_NOTES } from "./billing.constants.js";

export function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/** Join address lines with <br>, each line escaped. */
export function formatAddressHtmlLines(address) {
  if (!address?.length) return "N/A";
  return address.map((line) => escapeHtml(String(line))).join("<br>");
}

export function numberToWordsIndian(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const convertLessThanThousand = (n) => {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    }
    return (
      ones[Math.floor(n / 100)] +
      " Hundred" +
      (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
    );
  };

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let words = "";
  let n = intPart;

  if (n >= 10000000) {
    words += convertLessThanThousand(Math.floor(n / 10000000)) + " Crore ";
    n = n % 10000000;
  }

  if (n >= 100000) {
    words += convertLessThanThousand(Math.floor(n / 100000)) + " Lakh ";
    n = n % 100000;
  }

  if (n >= 1000) {
    words += convertLessThanThousand(Math.floor(n / 1000)) + " Thousand ";
    n = n % 1000;
  }

  if (n > 0) {
    words += convertLessThanThousand(n);
  }

  words = words.trim() + " Rupees";

  if (decPart > 0) {
    words += " and " + convertLessThanThousand(decPart) + " Paise";
  }

  return words + " Only";
}

export function formatAmountInr(amt) {
  const num = parseFloat(amt) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Display label for Prisma PaymentMethod enum or string. */
export function formatPaymentMethodDisplay(paymentMethod) {
  const raw =
    paymentMethod && typeof paymentMethod === "string"
      ? paymentMethod
      : String(paymentMethod || "");
  return raw
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * GST line layout for invoice/receipt rows (same field names on both models).
 * @param {object} row — entity with *Percent and *Amount tax fields
 */
export function getGstColumnLayout(row) {
  const sgstVal = parseFloat(row.sgstPercent) || 0;
  const cgstVal = parseFloat(row.cgstPercent) || 0;
  const igstVal = parseFloat(row.igstPercent) || 0;
  const ugstVal = parseFloat(row.ugstPercent) || 0;

  if (cgstVal > 0 && sgstVal > 0) {
    return {
      tax1Name: "CGST",
      tax2Name: "SGST",
      tax1Percent: row.cgstPercent || "0",
      tax2Percent: row.sgstPercent || "0",
      tax1Amount: row.cgstAmount || "0",
      tax2Amount: row.sgstAmount || "0",
    };
  }
  if (igstVal > 0) {
    return {
      tax1Name: "IGST",
      tax2Name: "—",
      tax1Percent: row.igstPercent || "0",
      tax2Percent: "0",
      tax1Amount: row.igstAmount || "0",
      tax2Amount: "0",
    };
  }
  if (cgstVal > 0 && ugstVal > 0) {
    return {
      tax1Name: "CGST",
      tax2Name: "UGST",
      tax1Percent: row.cgstPercent || "0",
      tax2Percent: row.ugstPercent || "0",
      tax1Amount: row.cgstAmount || "0",
      tax2Amount: row.ugstAmount || "0",
    };
  }
  return {
    tax1Name: "CGST",
    tax2Name: "SGST",
    tax1Percent: "0",
    tax2Percent: "0",
    tax1Amount: "0",
    tax2Amount: "0",
  };
}

export function resolveNotesHtml(notes) {
  const trimmed = notes && String(notes).trim();
  return escapeHtml(trimmed) || BILLING_DEFAULT_NOTES;
}
