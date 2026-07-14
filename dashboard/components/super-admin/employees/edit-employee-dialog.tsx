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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    useUpdateEmployee,
    useRegions,
    type Employee,
    type Region,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface EditEmployeeDialogProps {
    employee: Employee | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({ employee, isOpen, onOpenChange }: EditEmployeeDialogProps) {
    const { toast } = useToast();
    const updateEmployee = useUpdateEmployee();
    const { data: regionsData } = useRegions();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        gender: "OTHER" as "MALE" | "FEMALE" | "OTHER",
        dateOfBirth: "",
        address: [] as string[],
        aadhaarId: "",
        assignedRegionId: undefined as string | undefined,
    });

    const regions = (regionsData?.data || []) as Region[];

    // Initialize form data when employee or isOpen changes
    useEffect(() => {
        if (employee && isOpen) {
            setFormData({
                firstName: employee.firstName || "",
                lastName: employee.lastName || "",
                email: employee.email || "",
                contact: (employee as any).contact || "",
                gender: (employee as any).gender || "OTHER",
                dateOfBirth: (employee as any).dateOfBirth ? new Date((employee as any).dateOfBirth).toISOString().split("T")[0] : "",
                address: (employee as any).address || [],
                aadhaarId: (employee as any).aadhaarId || "",
                assignedRegionId: employee.assignedRegionId || undefined,
            });
        }
    }, [employee, isOpen]);

    const handleUpdate = async () => {
        if (!employee) return;
        try {
            await updateEmployee.mutateAsync({
                id: employee.id,
                ...formData,
            });
            toast({
                title: "Success",
                description: "Employee updated successfully",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update employee",
                variant: "destructive",
            });
        }
    };

    if (!employee) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name *</Label>
                            <Input
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firstName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name *</Label>
                            <Input
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({ ...formData, lastName: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact</Label>
                            <Input
                                value={formData.contact}
                                onChange={(e) =>
                                    setFormData({ ...formData, contact: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, gender: value as "MALE" | "FEMALE" | "OTHER" })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) =>
                                    setFormData({ ...formData, dateOfBirth: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Select
                                value={formData.assignedRegionId || "none"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, assignedRegionId: value === "none" ? undefined : value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {regions.map((region) => (
                                        <SelectItem key={region.id} value={region.id}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Aadhaar ID</Label>
                            <Input
                                value={formData.aadhaarId}
                                onChange={(e) =>
                                    setFormData({ ...formData, aadhaarId: e.target.value })
                                }
                            />
                        </div>
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
                        disabled={updateEmployee.isPending}
                    >
                        {updateEmployee.isPending ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
