"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const companySchema = z.object({
  companyName: z.string().optional().default(""),
  companyGstin: z.string().optional().default(""),
  companyPan: z.string().optional().default(""),
  companyCin: z.string().optional().default(""),
  companyPhone: z.string().optional().default(""),
  companyEmail: z.string().optional().default(""),
  companyWebsite: z.string().optional().default(""),
  companyAddress: z.string().optional().default(""),
  companyBankName: z.string().optional().default(""),
  companyBankAccount: z.string().optional().default(""),
  companyBankIfsc: z.string().optional().default(""),
  companyBankBranch: z.string().optional().default(""),
  companyBankQrUrl: z.string().optional().default(""),
  signatureImageUrl: z.string().optional().default(""),
  signatureName: z.string().optional().default(""),
  signatureDesignation: z.string().optional().default(""),
  stampImageUrl: z.string().optional().default(""),
  quotationPrefix: z.string().optional().default("QUO"),
  defaultQuotationTerms: z.string().optional().default(""),
  defaultQuotationNotes: z.string().optional().default(""),
  quotationValidityDays: z.coerce.number().min(1).optional().default(30),
  invoicePrefix: z.string().optional().default("INV"),
  taxConfigGstPercent: z.coerce.number().min(0).max(100).optional().default(18),
  taxConfigCgstPercent: z.coerce.number().min(0).max(100).optional().default(9),
  taxConfigSgstPercent: z.coerce.number().min(0).max(100).optional().default(9),
  taxConfigIgstPercent: z.coerce.number().min(0).max(100).optional().default(18),
  themePrimaryColor: z.string().optional().default("#1e40af"),
  themeSecondaryColor: z.string().optional().default("#3b82f6"),
  themeAccentColor: z.string().optional().default("#f59e0b"),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyConfigSection() {
  const { toast } = useToast();
  const { data: settingsData, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const settings = settingsData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName || "",
        companyGstin: settings.companyGstin || "",
        companyPan: settings.companyPan || "",
        companyCin: settings.companyCin || "",
        companyPhone: settings.companyPhone || "",
        companyEmail: settings.companyEmail || "",
        companyWebsite: settings.companyWebsite || "",
        companyAddress: settings.companyAddress || "",
        companyBankName: settings.companyBankName || "",
        companyBankAccount: settings.companyBankAccount || "",
        companyBankIfsc: settings.companyBankIfsc || "",
        companyBankBranch: settings.companyBankBranch || "",
        companyBankQrUrl: settings.companyBankQrUrl || "",
        signatureImageUrl: settings.signatureImageUrl || "",
        signatureName: settings.signatureName || "",
        signatureDesignation: settings.signatureDesignation || "",
        stampImageUrl: settings.stampImageUrl || "",
        quotationPrefix: settings.quotationPrefix || "QUO",
        defaultQuotationTerms: settings.defaultQuotationTerms || "",
        defaultQuotationNotes: settings.defaultQuotationNotes || "",
        quotationValidityDays: settings.quotationValidityDays || 30,
        invoicePrefix: settings.invoicePrefix || "INV",
        taxConfigGstPercent: settings.taxConfigGstPercent || 18,
        taxConfigCgstPercent: settings.taxConfigCgstPercent || 9,
        taxConfigSgstPercent: settings.taxConfigSgstPercent || 9,
        taxConfigIgstPercent: settings.taxConfigIgstPercent || 18,
        themePrimaryColor: settings.themePrimaryColor || "#1e40af",
        themeSecondaryColor: settings.themeSecondaryColor || "#3b82f6",
        themeAccentColor: settings.themeAccentColor || "#f59e0b",
      });
    }
  }, [settings, reset]);

  const onSubmit = async (data: CompanyFormData) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({ title: "Saved", description: "Company settings updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const field = (label: string, name: keyof CompanyFormData, opts?: { type?: string; placeholder?: string; rows?: number }) => (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {opts?.rows ? (
        <Textarea {...register(name)} placeholder={opts.placeholder} rows={opts.rows} />
      ) : (
        <Input type={opts?.type || "text"} {...register(name)} placeholder={opts.placeholder} />
      )}
      {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Company Details */}
      <Card>
        <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("Company Name", "companyName", { placeholder: "Your Company Name" })}
          {field("Email", "companyEmail", { placeholder: "info@company.com" })}
          {field("Phone", "companyPhone", { placeholder: "+91-XXXXXXXXXX" })}
          {field("Website", "companyWebsite", { placeholder: "https://company.com" })}
          {field("GSTIN", "companyGstin", { placeholder: "22AAAAA0000A1Z5" })}
          {field("PAN", "companyPan", { placeholder: "AAAAA0000A" })}
          {field("CIN", "companyCin" })}
          <div className="md:col-span-2">
            {field("Address", "companyAddress", { placeholder: "Full registered address", rows: 2 })}
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("Bank Name", "companyBankName")}
          {field("Account Number", "companyBankAccount")}
          {field("IFSC Code", "companyBankIfsc")}
          {field("Branch", "companyBankBranch")}
          {field("QR Code URL", "companyBankQrUrl", { placeholder: "https://..." })}
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader><CardTitle>Tax Configuration (GST)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {field("GST %", "taxConfigGstPercent", { type: "number" })}
          {field("CGST %", "taxConfigCgstPercent", { type: "number" })}
          {field("SGST %", "taxConfigSgstPercent", { type: "number" })}
          {field("IGST %", "taxConfigIgstPercent", { type: "number" })}
        </CardContent>
      </Card>

      {/* Quotation & Invoice Config */}
      <Card>
        <CardHeader><CardTitle>Quotation & Invoice</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field("Quotation Prefix", "quotationPrefix", { placeholder: "QUO" })}
          {field("Invoice Prefix", "invoicePrefix", { placeholder: "INV" })}
          {field("Validity (Days)", "quotationValidityDays", { type: "number" })}
          <div className="md:col-span-3">
            {field("Default Terms", "defaultQuotationTerms", { rows: 2 })}
          </div>
          <div className="md:col-span-3">
            {field("Default Notes", "defaultQuotationNotes", { rows: 2 })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardHeader><CardTitle>Theme Colors</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field("Primary", "themePrimaryColor", { placeholder: "#1e40af" })}
          {field("Secondary", "themeSecondaryColor", { placeholder: "#3b82f6" })}
          {field("Accent", "themeAccentColor", { placeholder: "#f59e0b" })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending || !isDirty}>
          {updateSettings.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
