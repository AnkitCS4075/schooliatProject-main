"use client";

import { FeesManagement } from "@/components/fees/fees-management";
import { PaymentInfoCard } from "@/components/fees/payment-info-card";
import { PlatformBankCard } from "@/components/fees/platform-bank-card";

export default function FeesPage() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <PlatformBankCard />
      <PaymentInfoCard />
      <FeesManagement />
    </div>
  );
}

