"use client";

import { Suspense } from "react";
import { SchoolSettingsManagement } from "@/components/settings/settings-management";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-12 w-full max-w-3xl" />
      <Skeleton className="min-h-[24rem] w-full rounded-md" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <Suspense fallback={<SettingsFallback />}>
        <SchoolSettingsManagement />
      </Suspense>
    </div>
  );
}
