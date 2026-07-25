"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationSchema, type QuotationFormData } from "@/lib/schemas/quotation-schema";
import { useCreateQuotation } from "@/lib/hooks/use-quotations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function AddQuotationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createQuotation = useCreateQuotation();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema) as any,
    defaultValues: {
      items: [{ name: "", description: "", quantity: 1, unitPrice: 0, taxPercent: 0, discountPercent: 0 }],
      discountPercent: 0,
      taxPercent: 18,
      validityDays: 30,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items") || [];
  const discountPct = watch("discountPercent") || 0;
  const taxPct = watch("taxPercent") || 0;

  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = afterDiscount * (taxPct / 100);
  const total = afterDiscount + taxAmt;

  const onSubmit = async (formData: QuotationFormData) => {
    try {
      await createQuotation.mutateAsync(formData);
      toast({ title: "Success", description: "Quotation created!" });
      router.push("/admin/quotations");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Create failed", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New Quotation</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Details */}
        <Card>
          <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input {...register("customerName")} placeholder="Customer name" />
                {errors.customerName && <p className="text-sm text-red-500">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input {...register("customerEmail")} placeholder="customer@example.com" />
                {errors.customerEmail && <p className="text-sm text-red-500">{errors.customerEmail.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...register("customerPhone")} placeholder="+91-XXXXXXXXXX" />
              </div>
              <div>
                <label className="text-sm font-medium">GSTIN</label>
                <Input {...register("customerGstin")} placeholder="GSTIN" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea {...register("customerAddress")} placeholder="Full address" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", description: "", quantity: 1, unitPrice: 0, taxPercent: 0, discountPercent: 0 })}>
                <Plus className="mr-1 h-4 w-4" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium">Name *</label>
                    <Input {...register(`items.${index}.name`)} placeholder="Item name" />
                    {errors.items?.[index]?.name && <p className="text-xs text-red-500">{errors.items?.[index]?.name?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium">Qty *</label>
                    <Input type="number" {...register(`items.${index}.quantity`)} min="1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Unit Price (₹) *</label>
                    <Input type="number" {...register(`items.${index}.unitPrice`)} min="0" step="0.01" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium">Description</label>
                  <Input {...register(`items.${index}.description`)} placeholder="Item description" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing & Terms */}
        <Card>
          <CardHeader><CardTitle>Pricing & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <Input type="number" {...register("discountPercent")} min="0" max="100" step="0.1" />
              </div>
              <div>
                <label className="text-sm font-medium">Tax % (GST)</label>
                <Input type="number" {...register("taxPercent")} min="0" max="100" step="0.1" />
              </div>
              <div>
                <label className="text-sm font-medium">Validity (Days)</label>
                <Input type="number" {...register("validityDays")} min="1" />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Payment Terms</label>
                <Input {...register("paymentTerms")} placeholder="e.g. Net 30" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea {...register("notes")} placeholder="Additional notes" rows={2} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Terms & Conditions</label>
              <Textarea {...register("terms")} placeholder="Terms and conditions" rows={3} />
            </div>

            <Separator />

            {/* Summary */}
            <div className="space-y-2 text-right max-w-xs ml-auto">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              {discountPct > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({discountPct}%)</span><span>-₹{discountAmt.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between text-sm"><span>Tax ({taxPct}%)</span><span>₹{taxAmt.toLocaleString("en-IN")}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={createQuotation.isPending}>
            {createQuotation.isPending ? "Creating..." : "Create Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
