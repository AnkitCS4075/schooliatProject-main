"use client";

import { useMemo, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Plus,
  Search,
  Package,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCouriers,
  useCreateCourier,
  useUpdateCourier,
  useDeleteCourier,
  type CourierApiStatus,
  type SchoolCourierRow,
} from "@/lib/hooks/use-courier";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

const STATUS_LABEL: Record<CourierApiStatus, string> = {
  DISPATCHED: "Dispatched",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
};

const STATUS_COLORS: Record<CourierApiStatus, string> = {
  DISPATCHED: "bg-blue-100 text-blue-800 border-blue-300",
  IN_TRANSIT: "bg-yellow-100 text-yellow-800 border-yellow-300",
  DELIVERED: "bg-green-100 text-green-800 border-green-300",
  RETURNED: "bg-red-100 text-red-800 border-red-300",
};

const PROVIDERS = [
  "India Post",
  "Blue Dart",
  "DTDC",
  "FedEx",
  "Professional Courier",
  "Speed Post",
  "Other",
];

type FormState = {
  trackingNumber: string;
  provider: string;
  recipient: string;
  destination: string;
  contents: string;
  status: CourierApiStatus;
};

const EMPTY_FORM: FormState = {
  trackingNumber: "",
  provider: "India Post",
  recipient: "",
  destination: "",
  contents: "",
  status: "DISPATCHED",
};

const PAGE_SIZE = 100;

export function CourierManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [courierOtpId, setCourierOtpId] = useState<string | null>(null);

  const listFilters = useMemo(
    () => ({
      search: searchQuery.trim() || undefined,
      status:
        statusFilter !== "all"
          ? (statusFilter as CourierApiStatus)
          : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [searchQuery, statusFilter, page],
  );

  const { data, isLoading, error, isFetching } = useCouriers(listFilters);
  const createMut = useCreateCourier();
  const updateMut = useUpdateCourier();
  const deleteMut = useDeleteCourier();

  const couriers: SchoolCourierRow[] = data?.data ?? [];
  const aggregates = data?.aggregates;
  const pagination = data?.pagination;

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setIsDialogOpen(true);
  };

  const openEdit = (row: SchoolCourierRow) => {
    setEditId(row.id);
    setForm({
      trackingNumber: row.trackingNumber,
      provider: row.provider,
      recipient: row.recipient,
      destination: row.destination,
      contents: row.contents || "",
      status: row.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.trackingNumber || !form.recipient || !form.destination) {
      toast.error("Tracking number, recipient, and destination are required");
      return;
    }

    try {
      if (editId) {
        await updateMut.mutateAsync({
          id: editId,
          trackingNumber: form.trackingNumber,
          provider: form.provider,
          recipient: form.recipient,
          destination: form.destination,
          contents: form.contents,
          status: form.status,
        });
        toast.success("Courier entry updated!");
      } else {
        await createMut.mutateAsync({
          trackingNumber: form.trackingNumber,
          provider: form.provider,
          recipient: form.recipient,
          destination: form.destination,
          contents: form.contents,
        });
        toast.success("Courier entry added!");
      }
      setIsDialogOpen(false);
      setPage(1);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Request failed";
      toast.error(msg);
    }
  };

  const handleDelete = (id: string) => {
    setCourierOtpId(id);
  };

  const stats = aggregates
    ? {
        total: aggregates.total,
        dispatched: aggregates.byStatus.DISPATCHED ?? 0,
        inTransit: aggregates.byStatus.IN_TRANSIT ?? 0,
        delivered: aggregates.byStatus.DELIVERED ?? 0,
      }
    : {
        total: 0,
        dispatched: 0,
        inTransit: 0,
        delivered: 0,
      };

  const busy =
    createMut.isPending || updateMut.isPending || deleteMut.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
          <p className="mt-4 text-gray-600">Loading couriers…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
        Could not load courier data. Check your connection and permissions,
        then refresh the page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Truck className="w-6 h-6" />
            Courier Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track dispatched couriers and mail (saved for your school)
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate} disabled={busy}>
          <Plus className="w-4 h-4" />
          Add Courier Entry
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <Package className="w-5 h-5 mx-auto mb-1 text-gray-500" />
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <Truck className="w-5 h-5 mx-auto mb-1 text-blue-500" />
          <div className="text-2xl font-bold text-blue-600">
            {stats.dispatched}
          </div>
          <div className="text-xs text-gray-500">Dispatched</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <MapPin className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
          <div className="text-2xl font-bold text-yellow-600">
            {stats.inTransit}
          </div>
          <div className="text-xs text-gray-500">In Transit</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-green-500" />
          <div className="text-2xl font-bold text-green-600">
            {stats.delivered}
          </div>
          <div className="text-xs text-gray-500">Delivered</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by tracking number, recipient, or destination..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {(Object.keys(STATUS_LABEL) as CourierApiStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} entries)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                pagination.page >= pagination.totalPages || isFetching
              }
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden relative">
        {isFetching && !isLoading ? (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
            <span className="text-sm text-gray-500">Updating…</span>
          </div>
        ) : null}
        <Table>
          <TableHeader>
            <TableRow className="bg-schooliat-tint">
              <TableHead className="w-16">No</TableHead>
              <TableHead>Tracking #</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Contents</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {couriers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-gray-500"
                >
                  No courier entries match your filters.
                </TableCell>
              </TableRow>
            ) : (
              couriers.map((courier, idx) => (
                <TableRow key={courier.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {String((page - 1) * PAGE_SIZE + idx + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {courier.trackingNumber}
                  </TableCell>
                  <TableCell>{courier.provider}</TableCell>
                  <TableCell>{courier.recipient}</TableCell>
                  <TableCell>{courier.destination}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {courier.contents || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_COLORS[courier.status] || ""}
                    >
                      {STATUS_LABEL[courier.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(courier.dispatchDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(courier)}
                        disabled={busy}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(courier.id)}
                        disabled={busy}
                      >
                        ✕
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Courier Entry" : "Add Courier Entry"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Tracking # *</Label>
              <Input
                className="col-span-3"
                value={form.trackingNumber}
                onChange={(e) =>
                  setForm({ ...form, trackingNumber: e.target.value })
                }
                placeholder="e.g. EE012345678IN"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Provider *</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => setForm({ ...form, provider: v })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Recipient *</Label>
              <Input
                className="col-span-3"
                value={form.recipient}
                onChange={(e) =>
                  setForm({ ...form, recipient: e.target.value })
                }
                placeholder="School or person name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Destination *</Label>
              <Input
                className="col-span-3"
                value={form.destination}
                onChange={(e) =>
                  setForm({ ...form, destination: e.target.value })
                }
                placeholder="City, State"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Contents</Label>
              <Input
                className="col-span-3"
                value={form.contents}
                onChange={(e) =>
                  setForm({ ...form, contents: e.target.value })
                }
                placeholder="e.g. ID Cards, Documents"
              />
            </div>
            {editId ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right mb-0">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v: CourierApiStatus) =>
                    setForm({ ...form, status: v })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as CourierApiStatus[]).map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={busy}>
              {editId ? "Update" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeletionOtpDialog
        open={!!courierOtpId}
        onOpenChange={(open) => !open && setCourierOtpId(null)}
        audience="school-admin"
        title="Delete courier entry"
        description="Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.COURIER}
        entityId={courierOtpId ?? ""}
        isDeleting={deleteMut.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!courierOtpId) return;
          await deleteMut.mutateAsync({ id: courierOtpId, otp });
          toast.success("Courier entry deleted!");
        }}
      />
    </div>
  );
}
