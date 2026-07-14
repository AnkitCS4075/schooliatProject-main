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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useBulkDeleteInventoryItems,
  InventoryItem,
} from "@/lib/hooks/use-inventory";
import { toast } from "sonner";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

type InventoryOtpTarget =
  | { mode: "one"; id: string }
  | { mode: "bulk"; ids: string[] };

const CATEGORY_OPTIONS = ["All Categories", "Electronics", "Stationery", "Furniture", "Lab Equipment", "Sports"];
const UNIT_OPTIONS = ["All Units", "Pieces", "Boxes", "Kits", "Sets", "Bottles"];
const CONDITION_OPTIONS = ["All Conditions", "NEW", "GOOD", "FAIR", "POOR"];

const EMPTY_FORM: {
  itemName: string;
  itemCode: string;
  category: string;
  unit: string;
  type: InventoryItem["type"];
  totalStock: number;
  condition: InventoryItem["condition"];
} = {
  itemName: "",
  itemCode: "",
  category: "Electronics",
  unit: "Pieces",
  type: "NON_CONSUMABLE",
  totalStock: 0,
  condition: "NEW",
};

export function InventoryManagement() {
  const [page, setPage] = useState(0);
  const itemsPerPage = 15;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("NON_CONSUMABLE");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [unitFilter, setUnitFilter] = useState("All Units");
  const [conditionFilter, setConditionFilter] = useState("All Conditions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [inventoryOtpTarget, setInventoryOtpTarget] = useState<InventoryOtpTarget | null>(null);

  // API hooks
  const { data, isLoading, isError, refetch } = useInventory({
    type: activeTab,
    category: categoryFilter !== "All Categories" ? categoryFilter : undefined,
    unit: unitFilter !== "All Units" ? unitFilter : undefined,
    condition: conditionFilter !== "All Conditions" ? conditionFilter : undefined,
    search: searchQuery || undefined,
    limit: 200,
  });
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const bulkDeleteItems = useBulkDeleteInventoryItems();

  const items: InventoryItem[] = data?.data || [];

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, items.length);
  const numberOfPages = Math.ceil(items.length / itemsPerPage);
  const paginatedData = items.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, activeTab, categoryFilter, unitFilter, conditionFilter]);

  const toggleRowSelection = (itemId: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((item) => item.id)));
    }
  };

  const allSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;

  const openCreateDialog = () => {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, type: activeTab as any });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      itemName: item.itemName,
      itemCode: item.itemCode,
      category: item.category,
      unit: item.unit,
      type: item.type as InventoryItem["type"],
      totalStock: item.totalStock,
      condition: item.condition as InventoryItem["condition"],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.itemName || !form.itemCode || !form.category || !form.unit) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      if (editItem) {
        await updateItem.mutateAsync({ id: editItem.id, data: form });
        toast.success("Item updated successfully!");
      } else {
        await createItem.mutateAsync(form);
        toast.success("Item created successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to save item");
    }
  };

  const handleDelete = (id: string) => {
    setInventoryOtpTarget({ mode: "one", id });
  };

  const handleDeleteSelected = () => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;
    setInventoryOtpTarget({ mode: "bulk", ids });
  };

  const conditionLabel = (c: string) => {
    return c.charAt(0) + c.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Inventory Management</h1>
        <Button className="gap-2" onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("NON_CONSUMABLE")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "NON_CONSUMABLE"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Non Consumable
        </button>
        <button
          onClick={() => setActiveTab("CONSUMABLE")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === "CONSUMABLE"
            ? "border-primary text-primary"
            : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
        >
          Consumable
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Item Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONDITION_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt === "All Conditions" ? opt : conditionLabel(opt)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-700">
            {selectedRows.size} item(s) selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-32">Unit</TableHead>
                <TableHead className="w-32">Total Stock</TableHead>
                <TableHead>Issued To</TableHead>
                <TableHead className="w-32">Issued Qty</TableHead>
                <TableHead className="w-40">Last Issued</TableHead>
                <TableHead className="w-32">Available</TableHead>
                <TableHead className="w-32">Condition</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    {isLoading ? "Loading..." : isError ? "Failed to load inventory" : "No inventory items found"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, idx) => {
                  const isSelected = selectedRows.has(item.id);
                  const available = item.totalStock - item.issuedQty;
                  return (
                    <TableRow
                      key={item.id}
                      className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleRowSelection(item.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {String(from + idx + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.itemCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{item.totalStock}</TableCell>
                      <TableCell>{item.issuedTo || "—"}</TableCell>
                      <TableCell className="text-right">{item.issuedQty}</TableCell>
                      <TableCell>
                        {item.lastIssuedDate
                          ? new Date(item.lastIssuedDate).toLocaleDateString("en-IN")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">{available}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.condition === "NEW"
                              ? "bg-schooliat-tint text-primary border-primary/30"
                              : item.condition === "GOOD"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : item.condition === "FAIR"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                          }
                        >
                          {conditionLabel(item.condition)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id)}
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

      {/* Pagination */}
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Name *</Label>
              <Input
                className="col-span-3"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                placeholder="Item name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Code *</Label>
              <Input
                className="col-span-3"
                value={form.itemCode}
                onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
                placeholder="INV001"
                disabled={!!editItem}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter((o) => o !== "All Categories").map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Unit *</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.filter((o) => o !== "All Units").map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Stock</Label>
              <Input
                className="col-span-3"
                type="number"
                value={form.totalStock}
                onChange={(e) => setForm({ ...form, totalStock: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right mb-0">Condition</Label>
              <Select value={form.condition} onValueChange={(v: any) => setForm({ ...form, condition: v })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createItem.isPending || updateItem.isPending}
            >
              {(createItem.isPending || updateItem.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeletionOtpDialog
        open={!!inventoryOtpTarget}
        onOpenChange={(open) => !open && setInventoryOtpTarget(null)}
        audience="school-admin"
        title={
          inventoryOtpTarget?.mode === "bulk"
            ? `Delete ${inventoryOtpTarget.ids.length} item(s)`
            : "Delete inventory item"
        }
        description="Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.INVENTORY_ITEM}
        entityId={
          inventoryOtpTarget?.mode === "one"
            ? inventoryOtpTarget.id
            : inventoryOtpTarget
              ? `bulk:${inventoryOtpTarget.ids.length}`
              : ""
        }
        isDeleting={deleteItem.isPending || bulkDeleteItems.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!inventoryOtpTarget) return;
          if (inventoryOtpTarget.mode === "one") {
            await deleteItem.mutateAsync({ id: inventoryOtpTarget.id, otp });
            toast.success("Item deleted!");
          } else {
            const res = await bulkDeleteItems.mutateAsync({
              itemIds: inventoryOtpTarget.ids,
              otp,
            });
            const n =
              (res as { data?: { count?: number } })?.data?.count ??
              inventoryOtpTarget.ids.length;
            toast.success(`${n} item(s) deleted!`);
            setSelectedRows(new Set());
          }
          refetch();
        }}
      />
    </div>
  );
}
