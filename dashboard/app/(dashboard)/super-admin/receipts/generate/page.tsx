import { redirect } from "next/navigation";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";

export default function LegacyGenerateReceiptPage() {
  redirect(BILLING_ROUTES.standaloneReceiptGenerate);
}
