"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegionsManagementPanel } from "@/components/super-admin/master-data/regions-management-panel";
import { LocationsManagementPanel } from "@/components/super-admin/master-data/locations-management-panel";
import { MASTER_DATA_BASE_PATH } from "@/lib/super-admin/master-data/routes";

type MasterDataTab = "regions" | "locations";

export default function MasterDataWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("tab");
  const tab: MasterDataTab = raw === "locations" ? "locations" : "regions";

  const setTab = useCallback(
    (value: string) => {
      const next = value === "locations" ? "locations" : "regions";
      router.replace(`${MASTER_DATA_BASE_PATH}?tab=${next}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Master data</h1>
        <p className="text-muted-foreground mt-1">
          Regions and field locations. Open a region to browse schools and view each school&apos;s profile and stats.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regions">Regions &amp; schools</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="regions" className="mt-6 focus-visible:outline-none">
          <RegionsManagementPanel />
        </TabsContent>
        <TabsContent value="locations" className="mt-6 focus-visible:outline-none">
          <LocationsManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
