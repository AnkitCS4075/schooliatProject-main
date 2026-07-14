"use client";

import { use } from "react";
import { SuperAdminGrievanceDetailView } from "@/components/super-admin/grievances/grievance-detail-view";

export default function SuperAdminGrievanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <SuperAdminGrievanceDetailView grievanceId={id} />
    </div>
  );
}
