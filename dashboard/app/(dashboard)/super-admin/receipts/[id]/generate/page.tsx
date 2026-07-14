import { redirect } from "next/navigation";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";

export default async function LegacyEditReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(BILLING_ROUTES.receiptEdit(id));
}
