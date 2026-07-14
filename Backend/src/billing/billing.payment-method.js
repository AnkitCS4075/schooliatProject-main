import { PaymentMethod } from "../prisma/generated/index.js";

export function parsePaymentMethodString(methodStr) {
  if (!methodStr) return PaymentMethod.BANK_TRANSFER;
  return (
    PaymentMethod[String(methodStr).replace(/\s+/g, "_").toUpperCase()] ||
    PaymentMethod.BANK_TRANSFER
  );
}
