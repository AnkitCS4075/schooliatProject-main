"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useVendors, useVendorStats, useDeleteVendor, Vendor } from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { EditVendorDialog } from "./edit-vendor-dialog";
import { AddVendorDialog } from "./add-vendor-dialog";
import { SuperAdminDeletionOtpDialog } from "@/components/super-admin/deletion-otp-dialog";
import { SUPER_ADMIN_DELETION_ENTITY } from "@/lib/super-admin/deletion-entity-types";

const LEAD_STATUS_CONFIG = {
  NEW: { label: "New", color: "#3498db", bgColor: "#e8f4fd" },
  HOT: { label: "Hot", color: "#e74c3c", bgColor: "#fdeaea" },
  COLD: { label: "Cold", color: "#95a5a6", bgColor: "#f4f6f7" },
  FOLLOW_UP: { label: "Follow Up", color: "#f39c12", bgColor: "#fef5e7" },
  CONVERTED: { label: "Converted", color: "#27ae60", bgColor: "#e8f8ef" },
};

export function VendorsManagement() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const itemsPerPage = 10;

  const { data: statsData } = useVendorStats();
  const { data, isLoading, error } = useVendors({
    status: statusFilter,
    search: searchQuery || undefined,
  });
  const deleteVendor = useDeleteVendor();

  const vendors = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data]);

  const stats = statsData?.data || {
    total: 0,
    new: 0,
    hot: 0,
    cold: 0,
    followUp: 0,
    converted: 0,
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, vendors.length);
  const numberOfPages = Math.ceil(vendors.length / itemsPerPage);
  const paginatedVendors = vendors.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Failed to load vendors</p>
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
          <h1 className="text-2xl font-semibold">Vendor Management</h1>
          <p className="text-gray-600 mt-1">
            Manage leads, track status, and assign to employees
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddingVendor(true)}>
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${!statusFilter ? "border-purple-500 bg-purple-50" : "bg-white"
            }`}
          onClick={() => setStatusFilter(undefined)}
        >
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
          <div
            key={key}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${statusFilter === key ? "border-purple-500 bg-purple-50" : "bg-white"
              }`}
            style={{ backgroundColor: statusFilter === key ? config.bgColor : undefined }}
            onClick={() => setStatusFilter(statusFilter === key ? undefined : key)}
          >
            <p className="text-2xl font-bold" style={{ color: config.color }}>
              {stats[key.toLowerCase() as keyof typeof stats] || 0}
            </p>
            <p className="text-sm text-gray-600">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comments</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVendors.map((vendor: Vendor) => {
                  const statusConfig =
                    LEAD_STATUS_CONFIG[vendor.status as keyof typeof LEAD_STATUS_CONFIG] ||
                    LEAD_STATUS_CONFIG.NEW;
                  return (
                    <TableRow key={vendor.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-semibold">{vendor.name}</div>
                          {vendor.email && (
                            <div className="text-sm text-gray-500">
                              {vendor.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{vendor.contact}</TableCell>
                      <TableCell>{vendor.region?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                            borderColor: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {vendor.comments || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => setEditingVendor(vendor)}
                            title="Edit Vendor"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setVendorToDelete(vendor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* Edit Vendor Dialog */}
      <EditVendorDialog
        vendor={editingVendor}
        isOpen={editingVendor !== null}
        onOpenChange={(open) => {
          if (!open) setEditingVendor(null);
        }}
      />

      {/* Add Vendor Dialog */}
      <AddVendorDialog
        isOpen={isAddingVendor}
        onOpenChange={setIsAddingVendor}
      />

      <SuperAdminDeletionOtpDialog
        open={!!vendorToDelete}
        onOpenChange={(open) => {
          if (!open) setVendorToDelete(null);
        }}
        title="Delete vendor"
        description={
          vendorToDelete
            ? `Remove "${vendorToDelete.name}" permanently. This cannot be undone.`
            : ""
        }
        entityType={SUPER_ADMIN_DELETION_ENTITY.VENDOR}
        entityId={vendorToDelete?.id ?? ""}
        isDeleting={deleteVendor.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!vendorToDelete) return;
          await deleteVendor.mutateAsync({ id: vendorToDelete.id, otp });
          toast({
            title: "Success",
            description: "Vendor deleted successfully!",
          });
          setVendorToDelete(null);
        }}
      />
    </div>
  );
}

