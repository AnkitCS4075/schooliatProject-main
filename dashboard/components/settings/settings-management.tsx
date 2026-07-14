"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, IndianRupee, Bell, Key, CreditCard, FileText } from "lucide-react";
import { PlatformBankCard } from "@/components/fees/platform-bank-card";
import { SchoolProfileSection } from "./SchoolProfileSection";
import { SchoolLogoSection } from "./SchoolLogoSection";
import { FeesConfigSection } from "./FeesConfigSection";
import { NotificationsSection } from "./NotificationsSection";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { DeletionOtpEmailSection } from "./DeletionOtpEmailSection";
import { TemplatesCatalog } from "@/components/templates/templates-catalog";

const SETTINGS_TABS = [
  "general",
  "fees",
  "notifications",
  "account",
  "payments",
  "templates",
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number];

function tabFromQuery(raw: string | null): SettingsTab {
  if (raw && (SETTINGS_TABS as readonly string[]).includes(raw)) {
    return raw as SettingsTab;
  }
  return "general";
}

export function SchoolSettingsManagement() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlTab = tabFromQuery(searchParams.get("tab"));
  const [tab, setTab] = useState<SettingsTab>(urlTab);

  useEffect(() => {
    setTab(tabFromQuery(searchParams.get("tab")));
  }, [searchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      const next = tabFromQuery(value);
      setTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "general") {
        params.delete("tab");
      } else {
        params.set("tab", next);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">School Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your school profile, fees, notifications, document templates, and account
        </p>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex h-auto min-h-10 w-full flex-wrap justify-start gap-1 p-1">
          <TabsTrigger value="general" className="flex items-center gap-2 shrink-0">
            <Building2 className="h-4 w-4 shrink-0" />
            General
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2 shrink-0">
            <IndianRupee className="h-4 w-4 shrink-0" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 shrink-0">
            <Bell className="h-4 w-4 shrink-0" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2 shrink-0">
            <Key className="h-4 w-4 shrink-0" />
            Account
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 shrink-0">
            <CreditCard className="h-4 w-4 shrink-0" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 shrink-0">
            <FileText className="h-4 w-4 shrink-0" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SchoolProfileSection />
          <DeletionOtpEmailSection />
          <SchoolLogoSection />
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <FeesConfigSection />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSection />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <ChangePasswordSection />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PlatformBankCard />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesCatalog variant="embedded" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
