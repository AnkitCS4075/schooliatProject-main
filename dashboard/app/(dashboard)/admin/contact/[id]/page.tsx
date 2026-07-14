"use client";

import { use } from "react";
import { GrievanceDetailView } from "@/components/contact/grievance-detail-view";

export default function GrievanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <GrievanceDetailView grievanceId={id} />
    </div>
  );
}
