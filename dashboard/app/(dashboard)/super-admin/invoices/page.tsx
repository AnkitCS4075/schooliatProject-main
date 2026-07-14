import { redirect } from "next/navigation";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";

export default function InvoicesPage() {
  redirect(BILLING_ROUTES.invoicesTab);
}
