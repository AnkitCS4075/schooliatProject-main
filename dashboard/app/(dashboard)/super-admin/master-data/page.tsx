import { Suspense } from "react";
import MasterDataWorkspace from "@/components/super-admin/master-data/master-data-workspace";

function MasterDataFallback() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      <div className="h-10 w-full max-w-md animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function MasterDataPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<MasterDataFallback />}>
        <MasterDataWorkspace />
      </Suspense>
    </div>
  );
}
