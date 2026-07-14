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
import { useCreateLicense } from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";

interface AddLicenseDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const initialFormData = {
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    documentUrl: "",
};

export function AddLicenseDialog({ isOpen, onOpenChange }: AddLicenseDialogProps) {
    const { toast } = useToast();
    const createLicense = useCreateLicense();
    const [formData, setFormData] = useState(initialFormData);

    const handleCreate = async () => {
        if (!formData.name || !formData.issuer || !formData.issueDate || !formData.expiryDate || !formData.certificateNumber) {
            toast({
                title: "Validation Error",
                description: "Please fill all required fields",
                variant: "destructive",
            });
            return;
        }

        try {
            await createLicense.mutateAsync({
                name: formData.name,
                issuer: formData.issuer,
                issueDate: formData.issueDate,
                expiryDate: formData.expiryDate,
                certificateNumber: formData.certificateNumber,
                documentUrl: formData.documentUrl || undefined,
            });
            toast({
                title: "Success",
                description: "License created successfully",
            });
            setFormData(initialFormData);
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create license",
                variant: "destructive",
            });
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setFormData(initialFormData);
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add License</DialogTitle>
                    <DialogDescription>
                        Add a new license or certification
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>License Name *</Label>
                            <Input
                                placeholder="e.g. GST Registration"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Issuer *</Label>
                            <Input
                                placeholder="e.g. Government of India"
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
                                placeholder="e.g. CERT-2025-001"
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
                        onClick={() => handleClose(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={createLicense.isPending}
                    >
                        {createLicense.isPending ? "Creating..." : "Create License"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
