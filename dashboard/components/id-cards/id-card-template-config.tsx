"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Check, Settings } from "lucide-react";
import { useTemplates, useSaveIdCardConfig, useIdCardConfig } from "@/lib/hooks/use-id-cards";
import { toast } from "sonner";

interface IdCardTemplateConfigProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function IdCardTemplateConfig({ open, onOpenChange }: IdCardTemplateConfigProps) {
    const { data: templatesData, isLoading: templatesLoading } = useTemplates("ID_CARD");
    const { data: configData } = useIdCardConfig();
    const saveConfig = useSaveIdCardConfig();

    const templates = templatesData?.data || [];
    const currentConfig = configData?.data;

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

    useEffect(() => {
        if (currentConfig?.templateId) {
            setSelectedTemplateId(currentConfig.templateId);
        } else if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [currentConfig, templates, selectedTemplateId]);

    const handleSave = async () => {
        if (!selectedTemplateId) {
            toast.error("Please select a template");
            return;
        }
        try {
            await saveConfig.mutateAsync({
                templateId: selectedTemplateId,
                config: {},
            });
            toast.success("ID card template configured successfully!");
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error?.message || "Failed to save template config");
        }
    };

    const selectedTemplate = templates.find((t: any) => t.id === selectedTemplateId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configure ID Card Template
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {templatesLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 space-y-3">
                            <p className="font-medium">No ID card templates available</p>
                            <p className="text-sm">
                                Layouts are supplied by Schooliat. If none appear here, contact support or check{" "}
                                <Link
                                    href="/admin/settings?tab=templates"
                                    className="text-primary underline underline-offset-2"
                                >
                                    School Settings → Templates
                                </Link>{" "}
                                after templates are published for your account.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-2">
                                <Label>Select Template</Label>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {templates.map((template: any) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedTemplate && (
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium text-sm mb-2">Template Preview</h4>
                                    <div className="text-sm text-gray-600">
                                        <p><strong>Name:</strong> {selectedTemplate.title}</p>
                                        <p><strong>Path:</strong> {selectedTemplate.path}</p>
                                        {selectedTemplate.imageId && (
                                            <p className="mt-2 text-primary">✓ Preview image available</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentConfig?.templateId && (
                                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                                    <Check className="w-4 h-4" />
                                    <span>
                                        Current template: <strong>{templates.find((t: any) => t.id === currentConfig.templateId)?.title || "Unknown"}</strong>
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={saveConfig.isPending || !selectedTemplateId || templates.length === 0}
                    >
                        {saveConfig.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Save Configuration
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
