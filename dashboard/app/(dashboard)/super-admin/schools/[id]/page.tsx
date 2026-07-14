"use client";

import { use } from "react";
import { SchoolDetailsView } from "@/components/super-admin/schools/school-details-view";

export default function SchoolDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <SchoolDetailsView schoolId={id} />;
}

