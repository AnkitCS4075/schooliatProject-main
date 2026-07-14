import { Suspense } from "react";
import BillingManagement from "@/components/super-admin/billing/billing-management";

function BillingFallback() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full max-w-md animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<BillingFallback />}>
        <BillingManagement />
      </Suspense>
    </div>
  );
}
