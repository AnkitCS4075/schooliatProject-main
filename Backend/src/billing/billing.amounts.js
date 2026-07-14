/**
 * GST line math shared by invoices and receipts (persisted field shapes differ per model).
 */

export function parsePercent(value) {
  if (value === undefined || value === null || value === "") return 0;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function parseBaseAmount(value) {
  if (value === undefined || value === null || value === "") return 0;
  const n = parseFloat(String(value));
  return Number.isFinite(n) ? n : NaN;
}

/**
 * @param {{ baseAmount: unknown, sgstPercent?: unknown, cgstPercent?: unknown, igstPercent?: unknown, ugstPercent?: unknown }} input
 */
export function computeGstTotals(input) {
  const base = parseBaseAmount(input.baseAmount);
  if (Number.isNaN(base)) {
    throw new Error("Invalid base amount");
  }
  const sgst = parsePercent(input.sgstPercent);
  const cgst = parsePercent(input.cgstPercent);
  const igst = parsePercent(input.igstPercent);
  const ugst = parsePercent(input.ugstPercent);

  const sgstAmount = sgst > 0 ? (base * sgst) / 100 : 0;
  const cgstAmount = cgst > 0 ? (base * cgst) / 100 : 0;
  const igstAmount = igst > 0 ? (base * igst) / 100 : 0;
  const ugstAmount = ugst > 0 ? (base * ugst) / 100 : 0;
  const totalGst = sgstAmount + cgstAmount + igstAmount + ugstAmount;
  const totalAmount = base + totalGst;

  return {
    base,
    sgst,
    cgst,
    igst,
    ugst,
    sgstAmount,
    cgstAmount,
    igstAmount,
    ugstAmount,
    totalGst,
    totalAmount,
  };
}

/** Prisma invoice numeric fields (Decimal strings, 2 dp). */
export function toInvoiceAmountFields(t) {
  return {
    baseAmount: t.base.toFixed(2),
    sgstPercent: t.sgst > 0 ? t.sgst.toFixed(2) : null,
    cgstPercent: t.cgst > 0 ? t.cgst.toFixed(2) : null,
    igstPercent: t.igst > 0 ? t.igst.toFixed(2) : null,
    ugstPercent: t.ugst > 0 ? t.ugst.toFixed(2) : null,
    sgstAmount: t.sgstAmount > 0 ? t.sgstAmount.toFixed(2) : null,
    cgstAmount: t.cgstAmount > 0 ? t.cgstAmount.toFixed(2) : null,
    igstAmount: t.igstAmount > 0 ? t.igstAmount.toFixed(2) : null,
    ugstAmount: t.ugstAmount > 0 ? t.ugstAmount.toFixed(2) : null,
    totalGst: t.totalGst > 0 ? t.totalGst.toFixed(2) : null,
    amount: t.totalAmount.toFixed(2),
  };
}

/** Receipt create/update (string decimals, historical API shape). */
export function toReceiptAmountFields(t) {
  return {
    baseAmount: t.base.toString(),
    sgstPercent: t.sgst > 0 ? t.sgst.toString() : null,
    cgstPercent: t.cgst > 0 ? t.cgst.toString() : null,
    igstPercent: t.igst > 0 ? t.igst.toString() : null,
    ugstPercent: t.ugst > 0 ? t.ugst.toString() : null,
    sgstAmount: t.sgstAmount > 0 ? t.sgstAmount.toString() : null,
    cgstAmount: t.cgstAmount > 0 ? t.cgstAmount.toString() : null,
    igstAmount: t.igstAmount > 0 ? t.igstAmount.toString() : null,
    ugstAmount: t.ugstAmount > 0 ? t.ugstAmount.toString() : null,
    totalGst: t.totalGst > 0 ? t.totalGst.toString() : null,
    amount: t.totalAmount.toString(),
  };
}
