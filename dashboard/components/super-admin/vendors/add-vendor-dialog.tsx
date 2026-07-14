"use client";

import { useState } from "react";
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
    useCreateVendor,
    useRegions,
    useEmployees,
    type Region,
    type Employee,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface AddVendorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddVendorDialog({ isOpen, onOpenChange }: AddVendorDialogProps) {
    const { toast } = useToast();
    const createVendor = useCreateVendor();
    const { data: regionsData } = useRegions();
    const { data: employeesData } = useEmployees();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        address: [] as string[],
        comments: "",
        regionId: "",
        employeeId: undefined as string | undefined,
    });

    const regions = (regionsData?.data || []) as Region[];
    const employees = (employeesData?.data || []) as Employee[];

    const handleCreate = async () => {
        if (!formData.name || !formData.contact || !formData.regionId) {
            toast({
                title: "Validation Error",
                description: "Name, contact, and region are required fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            await createVendor.mutateAsync(formData);
            toast({
                title: "Success",
                description: "Vendor created successfully",
            });
            setFormData({
                name: "",
                email: "",
                contact: "",
                address: [],
                comments: "",
                regionId: "",
                employeeId: undefined,
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create vendor",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Vendor</DialogTitle>
                    <DialogDescription>
                        Create a new vendor lead and assign it to an employee.
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
                                placeholder="Enter vendor name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Number *</Label>
                            <Input
                                value={formData.contact}
                                onChange={(e) =>
                                    setFormData({ ...formData, contact: e.target.value })
                                }
                                placeholder="Enter contact number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="Enter email address (optional)"
                        />
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
                            placeholder="Enter full address (one line per address part)"
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
                                    <SelectValue placeholder="Select employee to assign" />
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
                            placeholder="Add any additional notes (optional)"
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
                        onClick={handleCreate}
                        disabled={createVendor.isPending}
                    >
                        {createVendor.isPending ? "Creating..." : "Create Vendor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
