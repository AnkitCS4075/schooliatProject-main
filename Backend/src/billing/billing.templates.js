import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadInvoiceTemplate() {
  return readFileSync(
    join(__dirname, "../templates/schooliat-invoice.html"),
    "utf-8",
  );
}

export function loadReceiptTemplate() {
  return readFileSync(
    join(__dirname, "../templates/schooliat-receipt.html"),
    "utf-8",
  );
}
