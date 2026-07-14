"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEmployee, useUpdateEmployeePermissions } from "@/lib/hooks/use-super-admin";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AVAILABLE_PERMISSIONS = [
  { id: "CREATE_VENDOR", label: "Create Vendor" },
  { id: "GET_VENDORS", label: "View Vendors" },
  { id: "EDIT_VENDOR", label: "Edit Vendor" },
  { id: "DELETE_VENDOR", label: "Delete Vendor" },
  { id: "CREATE_SCHOOL", label: "Create School" },
  { id: "GET_SCHOOLS", label: "View Schools" },
  { id: "EDIT_SCHOOL", label: "Edit School" },
  { id: "DELETE_SCHOOL", label: "Delete School" },
];

export function EmployeeManagementView({ employeeId }: { employeeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data, isLoading, error } = useEmployee(employeeId);
  const updatePermissions = useUpdateEmployeePermissions();
  const employee = data?.data;

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (employee?.permissions) {
      setSelectedPermissions(employee.permissions);
      setIsChanged(false);
    }
  }, [employee]);

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId];
      setIsChanged(true);
      return newPermissions;
    });
  };

  const handleSavePermissions = async () => {
    try {
      await updatePermissions.mutateAsync({
        id: employeeId,
        permissions: selectedPermissions,
      });
      setIsChanged(false);
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Employee Not Found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
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
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-gray-600 mt-1">Employee Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Employee Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
            {employee.assignedRegion && (
              <div>
                <p className="text-sm text-gray-600">Assigned Region</p>
                <p className="font-medium">{employee.assignedRegion.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">{employee.status}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Statistics</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Total Locations</p>
              <p className="font-medium text-2xl">{employee.totalLocations || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <p className="font-medium text-2xl">{employee.totalVendors || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/super-admin/employees/${employeeId}/vendors`)}
        >
          View Vendors
        </Button>
      </div>

      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Feature Access</h2>
            <p className="text-sm text-gray-500">Manage what this employee can do in the system</p>
          </div>
          <Button
            onClick={handleSavePermissions}
            disabled={!isChanged || updatePermissions.isPending}
            className="flex items-center gap-2"
          >
            {updatePermissions.isPending ? "Saving..." : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {AVAILABLE_PERMISSIONS.map((permission) => (
            <label
              key={permission.id}
              className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedPermissions.includes(permission.id) ? "border-purple-600 bg-purple-50" : "hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handleTogglePermission(permission.id)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-600"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{permission.label}</span>
                <span className="text-xs text-gray-500 font-mono mt-1">{permission.id}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

