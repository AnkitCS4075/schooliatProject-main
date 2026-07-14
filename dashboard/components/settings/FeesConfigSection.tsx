"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FormCard } from "@/components/forms/form-card";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { feesConfigSchema, type FeesConfigFormData } from "@/lib/schemas/settings-schema";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function numToFormString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && v !== null && "toString" in v) {
    return String((v as { toString: () => string }).toString());
  }
  return String(v);
}

export function FeesConfigSection() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<FeesConfigFormData>({
    resolver: zodResolver(feesConfigSchema),
    defaultValues: {
      studentFeeInstallments: "",
      studentFeeAmount: "",
      feeReceiptNumberPrefix: "REC",
      feeReceiptNextSequence: "1",
      feeReceiptUseGst: false,
      feeReceiptCgstPercent: "",
      feeReceiptSgstPercent: "",
      feeReceiptPanCardNumber: "",
    },
  });

  useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data as Record<string, unknown>;
      form.setValue("studentFeeInstallments", s.studentFeeInstallments?.toString() ?? "");
      form.setValue("studentFeeAmount", s.studentFeeAmount?.toString() ?? "");
      form.setValue(
        "feeReceiptNumberPrefix",
        (s.feeReceiptNumberPrefix as string)?.toString?.() || "REC",
      );
      form.setValue(
        "feeReceiptNextSequence",
        (s.feeReceiptNextSequence ?? 1).toString(),
      );
      form.setValue("feeReceiptUseGst", Boolean(s.feeReceiptUseGst));
      form.setValue("feeReceiptCgstPercent", numToFormString(s.feeReceiptCgstPercent));
      form.setValue("feeReceiptSgstPercent", numToFormString(s.feeReceiptSgstPercent));
      form.setValue(
        "feeReceiptPanCardNumber",
        (s.feeReceiptPanCardNumber as string) || "",
      );
    }
  }, [settingsData, form]);

  const useGst = form.watch("feeReceiptUseGst");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateSettings.mutateAsync({
        request: {
          studentFeeInstallments: Number(values.studentFeeInstallments),
          studentFeeAmount: Number(values.studentFeeAmount),
          feeReceiptNumberPrefix: values.feeReceiptNumberPrefix.trim(),
          feeReceiptNextSequence: Number(values.feeReceiptNextSequence),
          feeReceiptUseGst: values.feeReceiptUseGst,
          feeReceiptCgstPercent:
            values.feeReceiptCgstPercent === "" || values.feeReceiptCgstPercent === undefined
              ? null
              : Number(values.feeReceiptCgstPercent),
          feeReceiptSgstPercent:
            values.feeReceiptSgstPercent === "" || values.feeReceiptSgstPercent === undefined
              ? null
              : Number(values.feeReceiptSgstPercent),
          feeReceiptPanCardNumber:
            values.feeReceiptPanCardNumber?.trim() || null,
        },
      });
      toast({ title: "Success", description: "Fees configuration updated successfully." });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update fees configuration.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <FormCard title="Fees Configuration" icon={<IndianRupee className="h-5 w-5" />}>
        <Skeleton className="h-40 w-full" />
      </FormCard>
    );
  }

  return (
    <FormCard title="Fees Configuration" icon={<IndianRupee className="h-5 w-5" />}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="studentFeeInstallments">Student fee installments</Label>
          <Input
            id="studentFeeInstallments"
            type="number"
            min={1}
            placeholder="e.g. 12"
            {...form.register("studentFeeInstallments")}
            error={form.formState.errors.studentFeeInstallments?.message}
          />
          {form.formState.errors.studentFeeInstallments && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.studentFeeInstallments.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="studentFeeAmount">Default student fee amount (₹)</Label>
          <Input
            id="studentFeeAmount"
            type="number"
            min={0}
            placeholder="e.g. 50000"
            {...form.register("studentFeeAmount")}
            error={form.formState.errors.studentFeeAmount?.message}
          />
          {form.formState.errors.studentFeeAmount && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.studentFeeAmount.message}
            </p>
          )}
        </div>

        <div className="pt-2 border-t space-y-3">
          <p className="text-sm font-medium">Fee receipts</p>
          <div>
            <Label htmlFor="feeReceiptNumberPrefix">Receipt number prefix</Label>
            <Input
              id="feeReceiptNumberPrefix"
              placeholder="REC"
              {...form.register("feeReceiptNumberPrefix")}
            />
            {form.formState.errors.feeReceiptNumberPrefix && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.feeReceiptNumberPrefix.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="feeReceiptNextSequence">Next receipt sequence</Label>
            <Input
              id="feeReceiptNextSequence"
              type="number"
              min={1}
              {...form.register("feeReceiptNextSequence")}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Increments automatically on each payment. Adjust when starting a new financial year if needed.
            </p>
            {form.formState.errors.feeReceiptNextSequence && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.feeReceiptNextSequence.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border p-3">
            <div>
              <Label htmlFor="feeReceiptUseGst" className="cursor-pointer mb-0">
                Show GST breakdown on receipts
              </Label>
              <p className="text-xs text-muted-foreground">
                Uses school GSTIN from school profile. Set CGST/SGST % below.
              </p>
            </div>
            <Switch
              id="feeReceiptUseGst"
              checked={useGst}
              onCheckedChange={(c) => form.setValue("feeReceiptUseGst", c)}
            />
          </div>
          {useGst ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="feeReceiptCgstPercent">CGST %</Label>
                <Input
                  id="feeReceiptCgstPercent"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="e.g. 9"
                  {...form.register("feeReceiptCgstPercent")}
                />
              </div>
              <div>
                <Label htmlFor="feeReceiptSgstPercent">SGST %</Label>
                <Input
                  id="feeReceiptSgstPercent"
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  placeholder="e.g. 9"
                  {...form.register("feeReceiptSgstPercent")}
                />
              </div>
            </div>
          ) : null}
          <div>
            <Label htmlFor="feeReceiptPanCardNumber">PAN on receipt (optional)</Label>
            <Input
              id="feeReceiptPanCardNumber"
              placeholder="School / trust PAN"
              maxLength={20}
              {...form.register("feeReceiptPanCardNumber")}
            />
          </div>
        </div>

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save fees config"}
        </Button>
      </form>
    </FormCard>
  );
}
