"use client";

import { use } from "react";
import { EmployeeVendorsView } from "@/components/super-admin/employees/employee-vendors-view";

export default function EmployeeVendorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <EmployeeVendorsView employeeId={id} />
    </div>
  );
}
