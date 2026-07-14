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
    useUpdateLicense,
    type License,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface EditLicenseDialogProps {
    license: License | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditLicenseDialog({ license, isOpen, onOpenChange }: EditLicenseDialogProps) {
    const { toast } = useToast();
    const updateLicense = useUpdateLicense();

    const [formData, setFormData] = useState({
        name: "",
        issuer: "",
        issueDate: "",
        expiryDate: "",
        certificateNumber: "",
        documentUrl: "",
    });

    // Initialize form data when license or isOpen changes
    useEffect(() => {
        if (license && isOpen) {
            setFormData({
                name: license.name || "",
                issuer: license.issuer || "",
                issueDate: license.issueDate
                    ? new Date(license.issueDate).toISOString().split("T")[0]
                    : "",
                expiryDate: license.expiryDate
                    ? new Date(license.expiryDate).toISOString().split("T")[0]
                    : "",
                certificateNumber: license.certificateNumber || "",
                documentUrl: license.documentUrl || "",
            });
        }
    }, [license, isOpen]);

    const handleUpdate = async () => {
        if (!license) return;

        if (!formData.name || !formData.issuer || !formData.issueDate || !formData.expiryDate || !formData.certificateNumber) {
            toast({
                title: "Validation Error",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateLicense.mutateAsync({
                id: license.id,
                name: formData.name,
                issuer: formData.issuer,
                issueDate: formData.issueDate,
                expiryDate: formData.expiryDate,
                certificateNumber: formData.certificateNumber,
                documentUrl: formData.documentUrl || undefined,
            });
            toast({
                title: "Success",
                description: "License updated successfully",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update license",
                variant: "destructive",
            });
        }
    };

    if (!license) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit License</DialogTitle>
                    <DialogDescription>
                        Update license information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>License Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Issuer *</Label>
                            <Input
                                value={formData.issuer}
                                onChange={(e) =>
                                    setFormData({ ...formData, issuer: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Issue Date *</Label>
                            <Input
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, issueDate: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Expiry Date *</Label>
                            <Input
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, expiryDate: e.target.value })
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Certificate Number *</Label>
                            <Input
                                value={formData.certificateNumber}
                                onChange={(e) =>
                                    setFormData({ ...formData, certificateNumber: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Document URL</Label>
                            <Input
                                placeholder="https://..."
                                value={formData.documentUrl}
                                onChange={(e) =>
                                    setFormData({ ...formData, documentUrl: e.target.value })
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
                        disabled={updateLicense.isPending}
                    >
                        {updateLicense.isPending ? "Updating..." : "Update License"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
