"use client";

import { useState, useCallback } from "react";
import {
    useLeaveTypes,
    useCreateLeaveType,
    useUpdateLeaveType,
    useDeleteLeaveType,
} from "@/lib/hooks/use-leave";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";

export function AdminLeaveTypesSetup() {
    const { data: response, isLoading } = useLeaveTypes();
    const createLeaveType = useCreateLeaveType();
    const updateLeaveType = useUpdateLeaveType();
    const deleteLeaveType = useDeleteLeaveType();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [leaveTypeOtpId, setLeaveTypeOtpId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<any>(null);

    const [name, setName] = useState("");
    const [maxLeaves, setMaxLeaves] = useState("");

    const leaveTypes = response?.data || [];
    const isProcessing = createLeaveType.isPending || updateLeaveType.isPending || deleteLeaveType.isPending;

    const openAddDialog = () => {
        setSelectedType(null);
        setName("");
        setMaxLeaves("");
        setIsDialogOpen(true);
    };

    const openEditDialog = (type: any) => {
        setSelectedType(type);
        setName(type.name || "");
        setMaxLeaves(type.maxLeaves?.toString() || "");
        setIsDialogOpen(true);
    };

    const openDeleteDialog = useCallback((type: any) => {
        setLeaveTypeOtpId(type.id);
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Leave type name is required");
            return;
        }

        const payload = {
            name: name.trim(),
            maxLeaves: maxLeaves ? parseInt(maxLeaves, 10) : null,
        };

        try {
            if (selectedType) {
                await updateLeaveType.mutateAsync({ id: selectedType.id, data: payload });
                toast.success("Leave type updated successfully");
            } else {
                await createLeaveType.mutateAsync(payload);
                toast.success("Leave type created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to save leave type");
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5" />
                        Leave Types Configuration
                    </CardTitle>
                    <CardDescription>
                        Manage leave categories (e.g., Casual Leave, Sick Leave) and their annual limits.
                    </CardDescription>
                </div>
                <Button onClick={openAddDialog} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Leave Type
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                ) : (
                    <div className="overflow-x-auto border rounded-xl">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-schooliat-tint">
                                    <TableHead>Type Name</TableHead>
                                    <TableHead>Max Leaves (Annual)</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveTypes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                            No leave types configured.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leaveTypes.map((type: any) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell>{type.maxLeaves ?? "Unlimited"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(type)}
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(type)}
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedType ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
                        <DialogDescription>
                            Set the name and annual limit for this type of leave.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Leave Type Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="e.g. Casual Leave"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxLeaves">Annual Limit (Days)</Label>
                            <Input
                                id="maxLeaves"
                                type="number"
                                min="0"
                                placeholder="Leave blank for unlimited"
                                value={maxLeaves}
                                onChange={(e) => setMaxLeaves(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isProcessing}>
                            {isProcessing ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeletionOtpDialog
                open={!!leaveTypeOtpId}
                onOpenChange={(open) => !open && setLeaveTypeOtpId(null)}
                audience="school-admin"
                title="Delete leave type"
                description="It cannot be deleted if there are existing requests using this type. Confirm with the code sent to your deletion email."
                entityType={SCHOOL_DELETION_ENTITY.LEAVE_TYPE}
                entityId={leaveTypeOtpId ?? ""}
                isDeleting={deleteLeaveType.isPending}
                onDeleteWithOtp={async (otp) => {
                    if (!leaveTypeOtpId) return;
                    await deleteLeaveType.mutateAsync({ id: leaveTypeOtpId, otp });
                    toast.success("Leave type deleted successfully");
                }}
            />
        </Card>
    );
}
