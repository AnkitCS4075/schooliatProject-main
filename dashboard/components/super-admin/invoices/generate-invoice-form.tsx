"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
    useSchools,
    useVendors,
    useCreateInvoice,
} from "@/lib/hooks/use-super-admin";
import { downloadInvoicePdf } from "@/lib/super-admin/billing/download-billing-pdf";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const invoiceSchema = z.object({
    recipientType: z.enum(["school", "vendor"]),
    recipientId: z.string().min(1, "Please select a recipient"),
    baseAmount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Please enter a valid amount"),
    description: z.string().min(1, "Description is required"),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
    sgstPercent: z.string().optional(),
    cgstPercent: z.string().optional(),
    igstPercent: z.string().optional(),
    ugstPercent: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function GenerateInvoiceForm({ onSuccess }: { onSuccess?: () => void }) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [gstType, setGstType] = useState<"cgst-sgst" | "igst" | "cgst-ugst" | "none">("none");

    const { data: schoolsData } = useSchools();
    const { data: vendorsData } = useVendors();
    const createInvoice = useCreateInvoice();

    const form = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            recipientType: "school",
            recipientId: "",
            baseAmount: "",
            description: "Schooliat Annual Subscription",
            notes: "",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            sgstPercent: "",
            cgstPercent: "",
            igstPercent: "",
            ugstPercent: "",
        },
    });

    const recipientType = form.watch("recipientType");

    const recipients = useMemo(() => {
        if (recipientType === "school") {
            return schoolsData?.data?.map((s: any) => ({ id: s.id, name: s.name, info: s.code })) || [];
        } else {
            return vendorsData?.data?.map((v: any) => ({ id: v.id, name: v.name, info: v.contact })) || [];
        }
    }, [recipientType, schoolsData, vendorsData]);

    const handleGstTypeChange = (type: typeof gstType) => {
        setGstType(type);
        form.setValue("sgstPercent", "");
        form.setValue("cgstPercent", "");
        form.setValue("igstPercent", "");
        form.setValue("ugstPercent", "");
    };

    const onSubmit = async (values: InvoiceFormData) => {
        setIsGenerating(true);
        try {
            const payload = {
                schoolId: values.recipientType === "school" ? values.recipientId : undefined,
                vendorId: values.recipientType === "vendor" ? values.recipientId : undefined,
                baseAmount: values.baseAmount,
                description: values.description,
                dueDate: values.dueDate,
                sgstPercent: values.sgstPercent || undefined,
                cgstPercent: values.cgstPercent || undefined,
                igstPercent: values.igstPercent || undefined,
                ugstPercent: values.ugstPercent || undefined,
            };

            const result = await createInvoice.mutateAsync(payload);
            const invoiceId = result?.data?.id;

            if (invoiceId) {
                await downloadInvoicePdf({
                    invoiceId,
                    notes: values.notes?.trim() || undefined,
                    filenameBase: result?.data?.invoiceNumber,
                });
                toast({
                    title: "Success",
                    description: "Invoice created and PDF download started.",
                });
                onSuccess?.();
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to generate invoice",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Recipient Type</Label>
                        <Select
                            value={recipientType}
                            onValueChange={(val: any) => {
                                form.setValue("recipientType", val);
                                form.setValue("recipientId", "");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="school">School</SelectItem>
                                <SelectItem value="vendor">External Vendor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Select {recipientType === "school" ? "School" : "Vendor"}</Label>
                        <Select
                            value={form.watch("recipientId")}
                            onValueChange={(val) => form.setValue("recipientId", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={`Select ${recipientType}...`} />
                            </SelectTrigger>
                            <SelectContent>
                                {recipients.map((r: any) => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.name} ({r.info})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.recipientId && (
                            <p className="text-xs text-destructive">{form.formState.errors.recipientId.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Base Amount (₹)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...form.register("baseAmount")}
                        />
                        {form.formState.errors.baseAmount && (
                            <p className="text-xs text-destructive">{form.formState.errors.baseAmount.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" {...form.register("dueDate")} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Item Description</Label>
                        <Input placeholder="e.g. Annual Subscription" {...form.register("description")} />
                        {form.formState.errors.description && (
                            <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>GST Type</Label>
                        <div className="flex flex-wrap gap-2">
                            {(["none", "cgst-sgst", "igst", "cgst-ugst"] as const).map((type) => (
                                <Button
                                    key={type}
                                    type="button"
                                    variant={gstType === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleGstTypeChange(type)}
                                    className="capitalize"
                                >
                                    {type.replace("-", " + ")}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {gstType === "cgst-sgst" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CGST %</Label>
                                <Input type="number" step="0.01" {...form.register("cgstPercent")} />
                            </div>
                            <div className="space-y-2">
                                <Label>SGST %</Label>
                                <Input type="number" step="0.01" {...form.register("sgstPercent")} />
                            </div>
                        </div>
                    )}

                    {gstType === "igst" && (
                        <div className="space-y-2">
                            <Label>IGST %</Label>
                            <Input type="number" step="0.01" {...form.register("igstPercent")} />
                        </div>
                    )}

                    {gstType === "cgst-ugst" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>CGST %</Label>
                                <Input type="number" step="0.01" {...form.register("cgstPercent")} />
                            </div>
                            <div className="space-y-2">
                                <Label>UGST %</Label>
                                <Input type="number" step="0.01" {...form.register("ugstPercent")} />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Notes (Optional)</Label>
                        <Textarea rows={2} placeholder="Add any extra notes..." {...form.register("notes")} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-top">
                <Button
                    type="submit"
                    disabled={isGenerating || createInvoice.isPending}
                    className="w-full sm:w-auto min-w-[150px]"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        "Generate Invoice"
                    )}
                </Button>
            </div>
        </form>
    );
}
