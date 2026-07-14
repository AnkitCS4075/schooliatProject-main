"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoicesManagement from "@/components/super-admin/invoices/invoices-management";
import { ReceiptsManagement } from "@/components/super-admin/receipts/receipts-management";
import { BILLING_BASE_PATH } from "@/lib/super-admin/billing/constants";

type BillingTab = "invoices" | "receipts";

export default function BillingManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: BillingTab = raw === "receipts" ? "receipts" : "invoices";

  const setTab = useCallback(
    (value: string) => {
      const next = value === "receipts" ? "receipts" : "invoices";
      router.replace(`${BILLING_BASE_PATH}?tab=${next}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Raise invoices for schools or vendors, record payment when money is received, and issue receipts—all in one place.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-6 focus-visible:outline-none">
          <InvoicesManagement embedded />
        </TabsContent>
        <TabsContent value="receipts" className="mt-6 focus-visible:outline-none">
          <ReceiptsManagement embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
