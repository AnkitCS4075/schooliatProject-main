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
    useUpdateSchool,
    useRegions,
    type School,
    type Region,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface EditSchoolDialogProps {
    school: School | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSchoolDialog({ school, isOpen, onOpenChange }: EditSchoolDialogProps) {
    const { toast } = useToast();
    const updateSchool = useUpdateSchool();
    const { data: regionsData } = useRegions();

    const [formData, setFormData] = useState({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: [] as string[],
        gstNumber: "",
        principalName: "",
        principalEmail: "",
        principalPhone: "",
        establishedYear: "",
        boardAffiliation: "",
        studentStrength: "",
        certificateLink: "",
        regionId: "" as string | null,
    });

    const regions = (regionsData?.data || []) as Region[];

    // Initialize form data when school or isOpen changes
    useEffect(() => {
        if (school && isOpen) {
            setFormData({
                name: school.name || "",
                code: school.code || "",
                email: school.email || "",
                phone: school.phone || "",
                address: school.address || [],
                gstNumber: (school as any).gstNumber || "",
                principalName: (school as any).principalName || "",
                principalEmail: (school as any).principalEmail || "",
                principalPhone: (school as any).principalPhone || "",
                establishedYear: (school as any).establishedYear?.toString() || "",
                boardAffiliation: (school as any).boardAffiliation || "",
                studentStrength: (school as any).studentStrength?.toString() || "",
                certificateLink: (school as any).certificateLink || "",
                regionId: (school as any).regionId || "",
            });
        }
    }, [school, isOpen]);

    const handleUpdate = async () => {
        if (!school) return;
        try {
            await updateSchool.mutateAsync({
                id: school.id,
                ...formData,
                regionId:
                    formData.regionId === null || formData.regionId === ""
                        ? null
                        : formData.regionId,
            });
            toast({
                title: "Success",
                description: "School updated successfully",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update school",
                variant: "destructive",
            });
        }
    };

    if (!school) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit School</DialogTitle>
                    <DialogDescription>
                        Update school information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>School Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>School Code *</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({ ...formData, code: e.target.value })
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
                            <Label>Phone *</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
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
                            <Label>GST Number</Label>
                            <Input
                                value={formData.gstNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, gstNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Region</Label>
                            <Select
                                value={formData.regionId || "none"}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, regionId: value === "none" ? (null as any) : value })
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Principal Name</Label>
                            <Input
                                value={formData.principalName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        principalName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Principal Email</Label>
                            <Input
                                type="email"
                                value={formData.principalEmail}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        principalEmail: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Principal Phone</Label>
                            <Input
                                value={formData.principalPhone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        principalPhone: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Established Year</Label>
                            <Input
                                type="number"
                                value={formData.establishedYear}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        establishedYear: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Board Affiliation</Label>
                            <Input
                                value={formData.boardAffiliation}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        boardAffiliation: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Student Strength</Label>
                            <Input
                                type="number"
                                value={formData.studentStrength}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        studentStrength: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Certificate Link</Label>
                        <Input
                            value={formData.certificateLink}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    certificateLink: e.target.value,
                                })
                            }
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
                        disabled={updateSchool.isPending}
                    >
                        {updateSchool.isPending ? "Updating..." : "Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
