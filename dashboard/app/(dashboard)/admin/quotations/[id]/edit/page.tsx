"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationSchema, type QuotationFormData } from "@/lib/schemas/quotation-schema";
import { useQuotation, useUpdateQuotation } from "@/lib/hooks/use-quotations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function EditQuotationPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id as string;
  const { toast } = useToast();
  const { data: quotationData, isLoading } = useQuotation(id);
  const updateQuotation = useUpdateQuotation();

  const quotation = quotationData?.data;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
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

  useEffect(() => {
    if (quotation) {
      reset({
        customerName: quotation.customerName || "",
        customerEmail: quotation.customerEmail || "",
        customerPhone: quotation.customerPhone || "",
        customerAddress: quotation.customerAddress || "",
        customerGstin: quotation.customerGstin || "",
        customerState: quotation.customerState || "",
        items: quotation.items?.map((item: any) => ({
          name: item.name || "",
          description: item.description || "",
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          taxPercent: Number(item.taxPercent) || 0,
          discountPercent: Number(item.discountPercent) || 0,
        })) || [],
        discountPercent: Number(quotation.discountPercent) || 0,
        taxPercent: Number(quotation.taxPercent) || 18,
        paymentTerms: quotation.paymentTerms || "",
        notes: quotation.notes || "",
        terms: quotation.terms || "",
        validityDays: Number(quotation.validityDays) || 30,
      });
    }
  }, [quotation, reset]);

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
      await updateQuotation.mutateAsync({ id, data: formData });
      toast({ title: "Success", description: "Quotation updated!" });
      router.push("/admin/quotations");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Update failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  }

  if (!quotation) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-red-600">Quotation not found</p></div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit {quotation.quotationNumber}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input {...register("customerName")} />
                {errors.customerName && <p className="text-sm text-red-500">{errors.customerName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input {...register("customerEmail")} />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...register("customerPhone")} />
              </div>
              <div>
                <label className="text-sm font-medium">GSTIN</label>
                <Input {...register("customerGstin")} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea {...register("customerAddress")} rows={2} />
            </div>
          </CardContent>
        </Card>

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
                    <Input {...register(`items.${index}.name`)} />
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
                  <Input {...register(`items.${index}.description`)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

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
                <Input {...register("paymentTerms")} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea {...register("notes")} rows={2} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Terms & Conditions</label>
              <Textarea {...register("terms")} rows={3} />
            </div>
            <Separator />
            <div className="space-y-2 text-right max-w-xs ml-auto">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              {discountPct > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({discountPct}%)</span><span>-₹{discountAmt.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between text-sm"><span>Tax ({taxPct}%)</span><span>₹{taxAmt.toLocaleString("en-IN")}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={updateQuotation.isPending}>
            {updateQuotation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
