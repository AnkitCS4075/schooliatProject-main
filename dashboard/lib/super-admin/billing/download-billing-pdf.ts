"use client";

import { downloadFromApi } from "@/lib/api/client";

function sanitizeFilenameBase(raw: string): string {
  return raw.replace(/[^\w.-]+/g, "_").replace(/_+/g, "_").slice(0, 80);
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Super-admin: GET /invoices/:id/pdf → save as .pdf */
export async function downloadInvoicePdf(params: {
  invoiceId: string;
  notes?: string;
  filenameBase?: string;
}): Promise<void> {
  const { invoiceId, notes, filenameBase } = params;
  const blob = await downloadFromApi(`/invoices/${invoiceId}/pdf`, {
    query: notes ? { notes } : undefined,
  });
  const base = sanitizeFilenameBase(filenameBase || `invoice-${invoiceId.slice(0, 8)}`);
  triggerBlobDownload(blob, `${base}.pdf`);
}

/** Super-admin: GET /receipts/:id/pdf → save as .pdf */
export async function downloadReceiptPdf(params: {
  receiptId: string;
  notes?: string;
  filenameBase?: string;
}): Promise<void> {
  const { receiptId, notes, filenameBase } = params;
  const blob = await downloadFromApi(`/receipts/${receiptId}/pdf`, {
    query: notes ? { notes } : undefined,
  });
  const base = sanitizeFilenameBase(filenameBase || `receipt-${receiptId.slice(0, 8)}`);
  triggerBlobDownload(blob, `${base}.pdf`);
}
