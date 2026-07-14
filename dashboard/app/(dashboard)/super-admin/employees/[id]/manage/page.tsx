"use client";

import { use } from "react";
import { EmployeeManagementView } from "@/components/super-admin/employees/employee-management-view";

export default function EmployeeManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <div className="container mx-auto py-6 px-4">
      <EmployeeManagementView employeeId={id} />
    </div>
  );
}
