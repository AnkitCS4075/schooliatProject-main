"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, User as UserIcon, ChevronRight } from "lucide-react";
import {
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion,
  useEmployees,
  type Region,
  type Employee,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { SuperAdminDeletionOtpDialog } from "@/components/super-admin/deletion-otp-dialog";
import { SUPER_ADMIN_DELETION_ENTITY } from "@/lib/super-admin/deletion-entity-types";
import { MASTER_DATA_ROUTES } from "@/lib/super-admin/master-data/routes";

export function RegionsManagementPanel() {
  const { data, isLoading } = useRegions();
  const { data: employeesData } = useEmployees();
  const createRegion = useCreateRegion();
  const updateRegion = useUpdateRegion();
  const deleteRegion = useDeleteRegion();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ name: "", zoneHeadId: "none" });

  const regions = (data?.data || []) as Region[];
  const employees = (employeesData?.data || []) as Employee[];
  const filteredRegions = regions.filter((region: Region) =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Region name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createRegion.mutateAsync({
        name: formData.name,
        zoneHeadId: formData.zoneHeadId === "none" ? undefined : formData.zoneHeadId,
      });
      toast({
        title: "Success",
        description: "Region created successfully",
      });
      setIsCreateOpen(false);
      setFormData({ name: "", zoneHeadId: "none" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create region",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedRegion || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Region name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRegion.mutateAsync({
        id: selectedRegion.id,
        name: formData.name,
        zoneHeadId: formData.zoneHeadId === "none" ? undefined : formData.zoneHeadId,
      });
      toast({
        title: "Success",
        description: "Region updated successfully",
      });
      setIsEditOpen(false);
      setSelectedRegion(null);
      setFormData({ name: "", zoneHeadId: "none" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update region",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (region: Region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      zoneHeadId: region.zoneHeadId || "none"
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Regions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create regions, assign zone heads, and open a region to see its schools.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Region
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Region</DialogTitle>
              <DialogDescription>
                Add a new region to organize schools and vendors geographically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Region Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., North Region"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneHead">Zone Head (Optional)</Label>
                <Select
                  value={formData.zoneHeadId}
                  onValueChange={(value) => setFormData({ ...formData, zoneHeadId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Zone Head" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createRegion.isPending}>
                {createRegion.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All regions</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredRegions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No regions found matching your search" : "No regions found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region Name</TableHead>
                  <TableHead>Zone Head</TableHead>
                  <TableHead className="w-[1%] whitespace-nowrap">Schools</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRegions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>
                      {region.zoneHead ? (
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <span>{region.zoneHead.firstName} {region.zoneHead.lastName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <Link href={MASTER_DATA_ROUTES.regionSchools(region.id)}>
                          Open
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(region)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(region)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Region</DialogTitle>
            <DialogDescription>
              Update the region name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Region Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-zoneHead">Zone Head (Optional)</Label>
              <Select
                value={formData.zoneHeadId}
                onValueChange={(value) => setFormData({ ...formData, zoneHeadId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Zone Head" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateRegion.isPending}>
              {updateRegion.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuperAdminDeletionOtpDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setSelectedRegion(null);
        }}
        title="Delete region"
        description={
          selectedRegion
            ? `Remove "${selectedRegion.name}" permanently. This cannot be undone.`
            : ""
        }
        entityType={SUPER_ADMIN_DELETION_ENTITY.REGION}
        entityId={selectedRegion?.id ?? ""}
        isDeleting={deleteRegion.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!selectedRegion) return;
          await deleteRegion.mutateAsync({ id: selectedRegion.id, otp });
          toast({
            title: "Success",
            description: "Region deleted successfully",
          });
          setSelectedRegion(null);
        }}
      />
    </div>
  );
}

