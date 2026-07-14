"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useVendors,
  useVendorStats,
  useUpdateVendor,
  type Vendor,
} from "@/lib/hooks/use-super-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Store, Plus, Search, ChevronDown, Phone, Mail, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

const LEAD_STATUS_CONFIG = {
  NEW: { label: "New", color: "#3b82f6", bgColor: "#eff6ff" },
  HOT: { label: "Hot", color: "#ef4444", bgColor: "#fef2f2" },
  COLD: { label: "Cold", color: "#6b7280", bgColor: "#f3f4f6" },
  FOLLOW_UP: { label: "Follow Up", color: "#f59e0b", bgColor: "#fffbeb" },
  CONVERTED: { label: "Converted", color: "#10b981", bgColor: "#ecfdf5" },
};

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_CONFIG).map(
  ([key, config]) => ({
    key,
    ...config,
  })
);

export default function EmployeeVendorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const { data: statsData } = useVendorStats();
  const { data, isLoading, refetch } = useVendors({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });
  const updateVendor = useUpdateVendor();

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

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedVendor) return;
    try {
      await updateVendor.mutateAsync({
        id: selectedVendor.id,
        status: newStatus as any,
      });
      toast.success("Status updated successfully");
      setShowStatusDialog(false);
      setSelectedVendor(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-gray-600">{vendors.length} total</p>
        </div>
        <Link href="/employee/add-vendor">
          <Button className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out" size="icon">
            <Plus className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          onClick={() => setStatusFilter(null)}
          className="whitespace-nowrap"
        >
          All ({stats.total})
        </Button>
        {STATUS_OPTIONS.map((option) => (
          <Button
            key={option.key}
            variant={statusFilter === option.key ? "default" : "outline"}
            onClick={() =>
              setStatusFilter(statusFilter === option.key ? null : option.key)
            }
            style={
              statusFilter === option.key
                ? {
                    backgroundColor: option.color,
                    color: "white",
                    borderColor: option.color,
                  }
                : {
                    backgroundColor: option.bgColor,
                    color: option.color,
                    borderColor: option.color,
                  }
            }
            className="whitespace-nowrap"
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Vendors List */}
      {vendors.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No vendors found</p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || statusFilter
                ? "Try adjusting your filters"
                : "Add your first vendor to get started"}
            </p>
            {!searchQuery && !statusFilter && (
              <Link href="/employee/add-vendor">
                <Button className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor: Vendor) => {
            const statusConfig =
              LEAD_STATUS_CONFIG[
                vendor.status as keyof typeof LEAD_STATUS_CONFIG
              ] || LEAD_STATUS_CONFIG.NEW;

            return (
              <Card
                key={vendor.id}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => {
                  setSelectedVendor(vendor);
                  setShowStatusDialog(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: statusConfig.bgColor }}
                    >
                      <Store
                        className="w-6 h-6"
                        style={{ color: statusConfig.color }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {vendor.name}
                        </h3>
                        <Badge
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                          className="flex items-center gap-1"
                        >
                          {statusConfig.label}
                          <ChevronDown className="w-3 h-3" />
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {vendor.region?.name || "No Region"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 ml-15">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{vendor.contact}</span>
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.address && vendor.address.length > 0 && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {vendor.address.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {vendor.comments && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {vendor.comments}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            {selectedVendor && (
              <p className="text-sm text-gray-600">{selectedVendor.name}</p>
            )}
          </DialogHeader>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = selectedVendor?.status === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => handleStatusChange(option.key)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-current"
                      : "border-transparent hover:border-gray-200"
                  }`}
                  style={{
                    backgroundColor: option.bgColor,
                    color: option.color,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: option.color }}
                      >
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowStatusDialog(false);
              setSelectedVendor(null);
            }}
            className="mt-4"
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

