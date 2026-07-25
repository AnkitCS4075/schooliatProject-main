"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuotation, useApproveQuotation, useRejectQuotation, useCancelQuotation, useConvertToInvoice, useDownloadQuotationPdf, useSendQuotationEmail } from "@/lib/hooks/use-quotations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Pencil, Download, Send, Check, X, RefreshCw } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  CONVERTED: "bg-purple-100 text-purple-700",
  CANCELLED: "bg-yellow-100 text-yellow-700",
  CLOSED: "bg-slate-100 text-slate-700",
};

export default function QuotationDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id as string;
  const { toast } = useToast();
  const { data, isLoading, refetch } = useQuotation(id);
  const approveQuotation = useApproveQuotation();
  const rejectQuotation = useRejectQuotation();
  const cancelQuotation = useCancelQuotation();
  const convertToInvoice = useConvertToInvoice();
  const downloadPdf = useDownloadQuotationPdf();
  const sendEmail = useSendQuotationEmail();

  const quotation = data?.data;
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  }
  if (!quotation) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-red-600">Quotation not found</p></div>;
  }

  const items = quotation.items || [];

  const handleAction = async (action: string) => {
    try {
      if (action === "approve") {
        await (approveQuotation.mutateAsync as any)({ id, data: { comments: "Approved" } });
        toast({ title: "Approved", description: "Quotation approved" });
      } else if (action === "reject") {
        await (rejectQuotation.mutateAsync as any)({ id, data: { reason: "Rejected by admin" } });
        toast({ title: "Rejected", description: "Quotation rejected" });
      } else if (action === "cancel") {
        await (cancelQuotation.mutateAsync as any)({ id });
        toast({ title: "Cancelled", description: "Quotation cancelled" });
      } else if (action === "convert") {
        await convertToInvoice.mutateAsync(id);
        toast({ title: "Converted", description: "Quotation converted to invoice" });
      }
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadPdf.mutateAsync(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${quotation.quotationNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quotation.quotationNumber}</h1>
            <Badge variant="outline" className={STATUS_COLORS[quotation.status] || ""}>
              {quotation.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {quotation.status === "DRAFT" && (
            <>
              <Button variant="outline" onClick={() => router.push(`/admin/quotations/${id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={downloadPdf.isPending}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </>
          )}
          {quotation.status === "SENT" && (
            <>
              <Button variant="default" onClick={() => handleAction("approve")} disabled={approveQuotation.isPending}>
                <Check className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button variant="destructive" onClick={() => handleAction("reject")} disabled={rejectQuotation.isPending}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
            </>
          )}
          {quotation.status === "APPROVED" && (
            <Button variant="default" onClick={() => handleAction("convert")} disabled={convertToInvoice.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" /> Convert to Invoice
            </Button>
          )}
          {!["CONVERTED", "CANCELLED", "CLOSED"].includes(quotation.status) && (
            <Button variant="outline" onClick={() => handleAction("cancel")} disabled={cancelQuotation.isPending}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Name:</span> {quotation.customerName}</div>
          <div><span className="text-muted-foreground">Email:</span> {quotation.customerEmail || "-"}</div>
          <div><span className="text-muted-foreground">Phone:</span> {quotation.customerPhone || "-"}</div>
          <div><span className="text-muted-foreground">GSTIN:</span> {quotation.customerGstin || "-"}</div>
          <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {quotation.customerAddress || "-"}</div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any, idx: number) => (
                <TableRow key={item.id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{Number(item.unitPrice).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right">{item.taxPercent || 0}%</TableCell>
                  <TableCell className="text-right font-medium">₹{Number(item.totalAmount).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-right max-w-xs ml-auto">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{Number(quotation.subtotal).toLocaleString("en-IN")}</span></div>
            {Number(quotation.discountAmount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{Number(quotation.discountAmount).toLocaleString("en-IN")}</span></div>}
            {Number(quotation.taxAmount) > 0 && <div className="flex justify-between text-sm"><span>Tax</span><span>₹{Number(quotation.taxAmount).toLocaleString("en-IN")}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{Number(quotation.totalAmount).toLocaleString("en-IN")}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Notes */}
      {(quotation.paymentTerms || quotation.notes || quotation.terms) && (
        <Card>
          <CardContent className="pt-6 space-y-3 text-sm">
            {quotation.paymentTerms && <div><span className="font-medium">Payment Terms:</span> {quotation.paymentTerms}</div>}
            {quotation.notes && <div><span className="font-medium">Notes:</span> {quotation.notes}</div>}
            {quotation.terms && <div><span className="font-medium">Terms:</span> {quotation.terms}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
