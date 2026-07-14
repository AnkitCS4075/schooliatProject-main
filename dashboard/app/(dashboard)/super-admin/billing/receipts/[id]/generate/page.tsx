"use client";

import { use } from "react";
import { GenerateReceiptForm } from "@/components/super-admin/receipts/generate-receipt-form";

export default function BillingEditReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <GenerateReceiptForm receiptId={id} />
    </div>
  );
}
