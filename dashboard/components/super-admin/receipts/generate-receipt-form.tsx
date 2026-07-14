"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { FormCard } from "@/components/forms/form-card";
import {
  useSchools,
  useVendors,
  useReceipt,
  useCreateReceipt,
  useUpdateReceipt,
  School,
} from "@/lib/hooks/use-super-admin";
import { downloadReceiptPdf } from "@/lib/super-admin/billing/download-billing-pdf";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Receipt } from "lucide-react";
import {
  BILLING_PAYMENT_METHOD_LABELS,
  BILLING_ROUTES,
} from "@/lib/super-admin/billing/constants";

const receiptSchema = z.object({
  recipientType: z.enum(["school", "vendor"]),
  recipientId: z.string().min(1, "Please select a recipient"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Please enter a valid amount"),
  description: z.string().min(1, "Description is required"),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  sgstPercent: z.string().optional(),
  cgstPercent: z.string().optional(),
  igstPercent: z.string().optional(),
  ugstPercent: z.string().optional(),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;

export function GenerateReceiptForm({ receiptId }: { receiptId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!receiptId;
  const [isGenerating, setIsGenerating] = useState(false);
  const [gstType, setGstType] = useState<"cgst-sgst" | "igst" | "cgst-ugst" | null>(null);

  const { data: schoolsData } = useSchools();
  const { data: vendorsData } = useVendors();
  const { data: receiptData } = useReceipt(receiptId || "");
  const createReceipt = useCreateReceipt();
  const updateReceipt = useUpdateReceipt();

  interface SchoolOption {
    id: string;
    name: string;
    code: string;
  }
  interface VendorOption {
    id: string;
    name: string;
    contact?: string;
  }

  const schools = useMemo<SchoolOption[]>(() => {
    if (!schoolsData?.data) return [];
    return schoolsData.data.map((school: School) => ({
      id: school.id,
      name: school.name,
      code: school.code,
    }));
  }, [schoolsData]);

  const vendors = useMemo<VendorOption[]>(() => {
    if (!vendorsData?.data) return [];
    return vendorsData.data.map((v: VendorOption) => ({
      id: v.id,
      name: v.name,
      contact: v.contact,
    }));
  }, [vendorsData]);

  const form = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      recipientType: "school",
      recipientId: "",
      amount: "",
      description: "",
      notes: "",
      paymentMethod: "Bank Transfer",
      sgstPercent: "",
      cgstPercent: "",
      igstPercent: "",
      ugstPercent: "",
    },
  });

  const recipientType = form.watch("recipientType");

  useEffect(() => {
    if (isEditMode && receiptData?.data) {
      const receipt = receiptData.data as { schoolId?: string; vendorId?: string; amount?: number; description?: string; paymentMethod?: string };
      const type = receipt.vendorId ? "vendor" : "school";
      const id = (receipt.vendorId || receipt.schoolId) || "";
      form.reset({
        recipientType: type,
        recipientId: id,
        amount: receipt.amount?.toString() || "",
        description: receipt.description || "",
        paymentMethod: receipt.paymentMethod || "Bank Transfer",
        sgstPercent: "",
        cgstPercent: "",
        igstPercent: "",
        ugstPercent: "",
      });
    }
  }, [isEditMode, receiptData, form]);

  const handleGstTypeChange = (type: "cgst-sgst" | "igst" | "cgst-ugst") => {
    setGstType(type);
    if (type === "cgst-sgst") {
      form.setValue("igstPercent", "");
      form.setValue("ugstPercent", "");
    } else if (type === "igst") {
      form.setValue("sgstPercent", "");
      form.setValue("cgstPercent", "");
      form.setValue("ugstPercent", "");
    } else if (type === "cgst-ugst") {
      form.setValue("sgstPercent", "");
      form.setValue("igstPercent", "");
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setIsGenerating(true);
    try {
      let currentReceiptId = receiptId;
      let newReceiptNumber: string | undefined;

      const payload = {
        baseAmount: parseFloat(values.amount),
        description: values.description,
        paymentMethod: values.paymentMethod,
        sgstPercent: values.sgstPercent ? parseFloat(values.sgstPercent) : null,
        cgstPercent: values.cgstPercent ? parseFloat(values.cgstPercent) : null,
        igstPercent: values.igstPercent ? parseFloat(values.igstPercent) : null,
        ugstPercent: values.ugstPercent ? parseFloat(values.ugstPercent) : null,
      };
      if (isEditMode && receiptId) {
        await updateReceipt.mutateAsync({
          id: receiptId,
          ...(values.recipientType === "school" ? { schoolId: values.recipientId } : { vendorId: values.recipientId }),
          amount: parseFloat(values.amount),
          ...payload,
        });
      } else {
        const result = await createReceipt.mutateAsync({
          ...(values.recipientType === "school" ? { schoolId: values.recipientId } : { vendorId: values.recipientId }),
          ...payload,
        });
        currentReceiptId = result?.data?.id;
        newReceiptNumber = result?.data?.receiptNumber;
      }

      if (currentReceiptId) {
        const receiptRow = receiptData?.data as { receiptNumber?: string } | undefined;
        const filenameBase = isEditMode
          ? receiptRow?.receiptNumber
          : newReceiptNumber;
        await downloadReceiptPdf({
          receiptId: currentReceiptId,
          notes: values.notes?.trim() || undefined,
          filenameBase,
        });
        toast({
          title: "Success",
          description: isEditMode
            ? "Receipt updated; PDF download started."
            : "Receipt created; PDF download started.",
        });
        router.push(BILLING_ROUTES.receiptsTab);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate receipt",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">
            {isEditMode ? "Edit Receipt" : "Generate Receipt"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? "Update receipt details" : "Create and generate a new receipt"}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <FormCard title="Receipt Information" icon={<Receipt className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <Label>Recipient Type *</Label>
              <Select
                value={recipientType}
                onValueChange={(value: "school" | "vendor") => {
                  form.setValue("recipientType", value);
                  form.setValue("recipientId", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recipientId">{recipientType === "school" ? "School" : "Vendor"} *</Label>
              <Select
                value={form.watch("recipientId")}
                onValueChange={(value) => form.setValue("recipientId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={recipientType === "school" ? "Select a school" : "Select a vendor"} />
                </SelectTrigger>
                <SelectContent>
                  {recipientType === "school"
                    ? schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name} ({school.code})
                        </SelectItem>
                      ))
                    : vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} {v.contact ? `(${v.contact})` : ""}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {form.formState.errors.recipientId && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.recipientId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...form.register("amount")}
                  error={form.formState.errors.amount?.message}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={form.watch("paymentMethod") || "Bank Transfer"}
                  onValueChange={(value) => form.setValue("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_PAYMENT_METHOD_LABELS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Item Description *</Label>
              <Input
                id="description"
                placeholder="e.g. Schooliat Annual Subscription"
                {...form.register("description")}
                error={form.formState.errors.description?.message}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes for the receipt..."
                rows={3}
                {...form.register("notes")}
              />
            </div>

            <div>
              <Label>GST Type (Optional)</Label>
              <div className="flex gap-4 mb-4 flex-wrap">
                <Button
                  type="button"
                  variant={gstType === "cgst-sgst" ? "default" : "outline"}
                  onClick={() => handleGstTypeChange("cgst-sgst")}
                >
                  CGST + SGST
                </Button>
                <Button
                  type="button"
                  variant={gstType === "igst" ? "default" : "outline"}
                  onClick={() => handleGstTypeChange("igst")}
                >
                  IGST
                </Button>
                <Button
                  type="button"
                  variant={gstType === "cgst-ugst" ? "default" : "outline"}
                  onClick={() => handleGstTypeChange("cgst-ugst")}
                >
                  CGST + UGST
                </Button>
              </div>

              {gstType === "cgst-sgst" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cgstPercent">CGST %</Label>
                    <Input
                      id="cgstPercent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("cgstPercent")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sgstPercent">SGST %</Label>
                    <Input
                      id="sgstPercent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("sgstPercent")}
                    />
                  </div>
                </div>
              )}

              {gstType === "igst" && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="igstPercent">IGST %</Label>
                    <Input
                      id="igstPercent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("igstPercent")}
                    />
                  </div>
                </div>
              )}

              {gstType === "cgst-ugst" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cgstPercent">CGST %</Label>
                    <Input
                      id="cgstPercent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("cgstPercent")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ugstPercent">UGST %</Label>
                    <Input
                      id="ugstPercent"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...form.register("ugstPercent")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </FormCard>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isGenerating || createReceipt.isPending || updateReceipt.isPending}
            className="flex-1"
          >
            {isGenerating
              ? "Generating..."
              : isEditMode
                ? "Update & Generate"
                : "Generate Receipt"}
          </Button>
        </div>
      </form>
    </div>
  );
}

