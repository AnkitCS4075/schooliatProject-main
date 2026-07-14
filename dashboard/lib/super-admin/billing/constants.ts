/** Super-admin billing: routes and form options (kept in sync with API payment method parsing). */

export const BILLING_BASE_PATH = "/super-admin/billing";

export const BILLING_ROUTES = {
  workspace: BILLING_BASE_PATH,
  invoicesTab: `${BILLING_BASE_PATH}?tab=invoices`,
  receiptsTab: `${BILLING_BASE_PATH}?tab=receipts`,
  standaloneReceiptGenerate: `${BILLING_BASE_PATH}/receipts/generate`,
  receiptEdit: (id: string) => `${BILLING_BASE_PATH}/receipts/${id}/generate`,
} as const;

/** Labels must map to backend `PaymentMethod` via space → underscore + uppercase. */
export const BILLING_PAYMENT_METHOD_LABELS = [
  "Bank Transfer",
  "Cash",
  "Cheque",
  "UPI",
  "Credit Card",
  "Debit Card",
] as const;
