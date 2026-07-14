"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEmployee, useVendors } from "@/lib/hooks/use-super-admin";
import { ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";

const STATUS_CONFIG = {
  NEW: { label: "New", color: "#3b82f6" },
  HOT: { label: "Hot", color: "#ef4444" },
  COLD: { label: "Cold", color: "#6b7280" },
  FOLLOW_UP: { label: "Follow Up", color: "#f59e0b" },
  CONVERTED: { label: "Converted", color: "#10b981" },
};

export function EmployeeVendorsView({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: employeeData } = useEmployee(employeeId);
  const { data: vendorsData } = useVendors({ employeeId });

  const employee = employeeData?.data;
  const vendors = vendorsData?.data || [];

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase();
    return vendors.filter(
      (vendor: any) =>
        vendor.name?.toLowerCase().includes(q) ||
        vendor.email?.toLowerCase().includes(q) ||
        vendor.contact?.toLowerCase().includes(q)
    );
  }, [vendors, searchQuery]);

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600">Loading employee...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            Vendors - {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-600 mt-1">Manage employee vendors</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredVendors.length === 0 ? (
        <div className="border rounded-lg p-12 text-center">
          <p className="text-gray-500">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor: any) => {
            const statusConfig =
              STATUS_CONFIG[vendor.status as keyof typeof STATUS_CONFIG] ||
              STATUS_CONFIG.NEW;

            return (
              <div
                key={vendor.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: statusConfig.color,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                {vendor.email && (
                  <p className="text-sm text-gray-600 mb-1">{vendor.email}</p>
                )}
                <p className="text-sm text-gray-600">{vendor.contact}</p>
                {vendor.region && (
                  <p className="text-sm text-gray-500 mt-2">
                    Region: {vendor.region.name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

