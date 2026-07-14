"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useUpdateVendor,
    useRegions,
    useEmployees,
    type Vendor,
    type Region,
    type Employee,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface EditVendorDialogProps {
    vendor: Vendor | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditVendorDialog({ vendor, isOpen, onOpenChange }: EditVendorDialogProps) {
    const { toast } = useToast();
    const updateVendor = useUpdateVendor();
    const { data: regionsData } = useRegions();
    const { data: employeesData } = useEmployees();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        address: [] as string[],
        comments: "",
        status: "NEW" as "NEW" | "HOT" | "COLD" | "FOLLOW_UP" | "CONVERTED",
        regionId: "",
        employeeId: undefined as string | undefined,
    });

    const regions = (regionsData?.data || []) as Region[];
    const employees = (employeesData?.data || []) as Employee[];

    // Initialize form data when vendor or isOpen changes
    useEffect(() => {
        if (vendor && isOpen) {
            setFormData({
                name: vendor.name || "",
                email: vendor.email || "",
                contact: vendor.contact || "",
                address: vendor.address || [],
                comments: vendor.comments || "",
                status: vendor.status || "NEW",
                regionId: vendor.regionId || "",
                employeeId: vendor.employeeId || undefined,
            });
        }
    }, [vendor, isOpen]);

    const handleUpdate = async () => {
        if (!vendor) return;
        try {
            await updateVendor.mutateAsync({
                id: vendor.id,
                ...formData,
            });
            toast({
                title: "Success",
                description: "Vendor updated successfully",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update vendor",
                variant: "destructive",
            });
        }
    };

    if (!vendor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Vendor</DialogTitle>
                    <DialogDescription>
                        Update vendor information and lead status
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vendor Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, status: value as any })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="HOT">Hot</SelectItem>
                                    <SelectItem value="COLD">Cold</SelectItem>
                                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                                    <SelectItem value="CONVERTED">Converted</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Contact Number *</Label>
                            <Input
                                value={formData.contact}
                                onChange={(e) =>
                                    setFormData({ ...formData, contact: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea
                            value={formData.address.join("\n")}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value.split("\n").filter(Boolean),
                                })
                            }
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Region *</Label>
                            <Select
                                value={formData.regionId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, regionId: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    {regions.map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Employee</Label>
                            <Select
                                value={formData.employeeId || "none"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, employeeId: value === "none" ? undefined : value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {`${emp.firstName} ${emp.lastName || ""}`.trim()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Comments</Label>
                        <Textarea
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({ ...formData, comments: e.target.value })
                            }
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={updateVendor.isPending}
                    >
                        {updateVendor.isPending ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
