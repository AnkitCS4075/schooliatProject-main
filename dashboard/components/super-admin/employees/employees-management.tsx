"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Store, Plus, Edit } from "lucide-react";
import { useEmployees, Employee } from "@/lib/hooks/use-super-admin";
import { EditEmployeeDialog } from "./edit-employee-dialog";

export function EmployeesManagement() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  const { data, isLoading, error } = useEmployees(searchQuery || undefined);

  interface EmployeeDisplay {
    id: string;
    name: string;
    email: string;
    assignedRegion: string;
    regionId?: string;
    totalLocations: number;
    totalVendors: number;
    status: string;
    _raw: Employee;
  }

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const employees = useMemo<EmployeeDisplay[]>(() => {
    if (!data?.data) return [];
    let filtered = data.data;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp: Employee) =>
          (emp.firstName || "").toLowerCase().includes(searchLower) ||
          (emp.lastName || "").toLowerCase().includes(searchLower) ||
          (emp.email || "").toLowerCase().includes(searchLower)
      );
    }

    return filtered.map((emp: Employee) => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName || ""}`.trim(),
      email: emp.email,
      assignedRegion: emp.assignedRegion?.name || "N/A",
      regionId: emp.assignedRegionId,
      totalLocations: emp.totalLocations || 0,
      totalVendors: emp.totalVendors || 0,
      status: emp.status || "Active",
      _raw: emp,
    }));
  }, [data, searchQuery]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, employees.length);
  const numberOfPages = Math.ceil(employees.length / itemsPerPage);
  const paginatedEmployees = employees.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Failed to load employees</p>
          <p className="text-sm text-gray-600 mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Employee Management</h1>
          <p className="text-gray-600 mt-1">
            Manage app employees, their locations, and vendors
          </p>
        </div>
        <Button
          onClick={() => router.push("/super-admin/employees/add")}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead>Employee Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Locations</TableHead>
                <TableHead className="text-right">Vendors</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-semibold">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.assignedRegion}</TableCell>
                    <TableCell className="text-right font-medium">
                      {employee.totalLocations}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {employee.totalVendors}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => setEditingEmployee(employee._raw)}
                          title="Edit Employee"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            router.push(
                              `/super-admin/employees/${employee.id}/manage`
                            )
                          }
                          title="Employee Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            router.push(
                              `/super-admin/employees/${employee.id}/vendors`
                            )
                          }
                          title="Assigned Vendors"
                        >
                          <Store className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {numberOfPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {numberOfPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(numberOfPages - 1, page + 1))}
              disabled={page >= numberOfPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        employee={editingEmployee}
        isOpen={editingEmployee !== null}
        onOpenChange={(open) => {
          if (!open) setEditingEmployee(null);
        }}
      />
    </div>
  );
}

