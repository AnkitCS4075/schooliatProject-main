"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  usePlatformQuotation,
  usePlatformQuotationPreview,
  useDownloadPlatformQuotationPdf,
  useSendPlatformQuotationEmail,
  useAcceptPlatformQuotation,
  useRejectPlatformQuotation,
  useExpirePlatformQuotation,
  useUpdatePlatformQuotation,
} from "@/lib/hooks/use-platform-quotations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Download,
  Send,
  Check,
  X,
  Eye,
  Pencil,
  Timer,
  FileText,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-yellow-100 text-yellow-700",
};

export default function PlatformQuotationDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams.id as string;
  const { toast } = useToast();

  const [showEmail, setShowEmail] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [editForm, setEditForm] = useState<any>(null);

  const { data, isLoading, refetch } = usePlatformQuotation(id);
  const preview = usePlatformQuotationPreview(id);
  const downloadPdf = useDownloadPlatformQuotationPdf();
  const sendEmail = useSendPlatformQuotationEmail();
  const acceptQuote = useAcceptPlatformQuotation();
  const rejectQuote = useRejectPlatformQuotation();
  const expireQuote = useExpirePlatformQuotation();
  const updateQuote = useUpdatePlatformQuotation();

  const quotation = data?.data;
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  }
  if (!quotation) {
    return <div className="flex items-center justify-center min-h-[400px]"><p className="text-red-600">Quotation not found</p></div>;
  }

  const items = quotation.items || [];
  const previewData = preview.data?.data;

  const handlePreview = () => {
    if (previewData?.printUrl) {
      window.open(previewData.printUrl, "_blank");
    } else {
      toast({ title: "Preview not ready", description: "Could not load quotation preview." });
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

  const openEdit = () => {
    setEditForm({
      schoolName: quotation.schoolName || "",
      contactPerson: quotation.contactPerson || "",
      contactEmail: quotation.contactEmail || "",
      contactPhone: quotation.contactPhone || "",
      discountPercent: String(quotation.discountPercent || 0),
      taxPercent: String(quotation.taxPercent || 0),
      validityDays: String(quotation.validityDays || 30),
      termsAndConditions: quotation.termsAndConditions || "",
      notes: quotation.notes || "",
      items: (quotation.items || []).map((it: any) => ({
        moduleName: it.moduleName || "",
        description: it.description || "",
        quantity: String(it.quantity || 1),
        unitPrice: String(it.unitPrice || 0),
      })),
    });
    setShowEdit(true);
  };

  const handleSendEmail = async () => {
    try {
      await sendEmail.mutateAsync({
        id,
        data: { to: emailTo.trim() || quotation.contactEmail || "" },
      });
      toast({ title: "Sent", description: "Quotation sent via email" });
      setShowEmail(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async () => {
    try {
      await rejectQuote.mutateAsync({ id, reason: rejectReason || "Rejected" });
      toast({ title: "Rejected", description: "Quotation rejected" });
      setShowReject(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAccept = async () => {
    try {
      const result = await acceptQuote.mutateAsync(id);
      toast({ title: "Accepted", description: "Quotation accepted — school onboarding created" });
      if (result.data?.onboardingId) {
        router.push(`/super-admin/onboarding`);
      } else {
        refetch();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExpire = async () => {
    try {
      await expireQuote.mutateAsync(id);
      toast({ title: "Expired", description: "Quotation marked as expired" });
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEditSave = async () => {
    try {
      const itemsPayload = (editForm.items || [])
        .map((m: any) => ({
          moduleName: (m.moduleName || "").trim(),
          description: (m.description || "").trim(),
          quantity: Number(m.quantity) || 1,
          unitPrice: Number(m.unitPrice) || 0,
        }))
        .filter((m: any) => m.moduleName);
      const payload: any = {
        schoolName: editForm.schoolName.trim(),
        contactPerson: editForm.contactPerson.trim() || undefined,
        contactEmail: editForm.contactEmail.trim() || undefined,
        contactPhone: editForm.contactPhone.trim() || undefined,
        discountPercent: Number(editForm.discountPercent) || 0,
        taxPercent: Number(editForm.taxPercent) || 0,
        validityDays: Number(editForm.validityDays) || 30,
        termsAndConditions: editForm.termsAndConditions.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
        items: itemsPayload,
      };
      await updateQuote.mutateAsync({ id, data: payload });
      toast({ title: "Updated", description: "Quotation updated" });
      setShowEdit(false);
      refetch();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateEditModule = (idx: number, key: string, value: string) => {
    const modules = editForm.items.map((m: any, i: number) => (i === idx ? { ...m, [key]: value } : m));
    setEditForm({ ...editForm, items: modules });
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
          <Button variant="outline" onClick={handlePreview} disabled={!previewData?.printUrl}>
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={downloadPdf.isPending}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          {["DRAFT", "SENT"].includes(quotation.status) && (
            <>
              <Button variant="outline" onClick={openEdit}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="default" onClick={() => { setEmailTo(quotation.contactEmail || ""); setShowEmail(true); }}>
                <Send className="mr-2 h-4 w-4" /> Send
              </Button>
            </>
          )}
          {["DRAFT", "SENT"].includes(quotation.status) && (
            <>
              <Button variant="default" onClick={handleAccept} disabled={acceptQuote.isPending}>
                <Check className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button variant="destructive" onClick={() => setShowReject(true)} disabled={rejectQuote.isPending}>
                <X className="mr-2 h-4 w-4" /> Reject
              </Button>
              <Button variant="outline" onClick={handleExpire} disabled={expireQuote.isPending}>
                <Timer className="mr-2 h-4 w-4" /> Expire
              </Button>
            </>
          )}
        </div>
      </div>

      {quotation.onboarding && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <FileText className="h-4 w-4" />
          Onboarding created for this accepted quotation
          {quotation.onboarding.status && <Badge variant="outline">{quotation.onboarding.status}</Badge>}
        </div>
      )}

      {quotation.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <span className="font-medium">Rejection reason:</span> {quotation.rejectionReason}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Prospective School</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">School:</span> {quotation.schoolName}</div>
          <div><span className="text-muted-foreground">Contact Person:</span> {quotation.contactPerson || "-"}</div>
          <div><span className="text-muted-foreground">Email:</span> {quotation.contactEmail || "-"}</div>
          <div><span className="text-muted-foreground">Phone:</span> {quotation.contactPhone || "-"}</div>
          <div><span className="text-muted-foreground">Valid Until:</span> {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString("en-IN") : "-"}</div>
          <div><span className="text-muted-foreground">Issued On:</span> {new Date(quotation.createdAt).toLocaleDateString("en-IN")}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Modules & Pricing</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Module</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: any, idx: number) => (
                <TableRow key={item.id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.moduleName}</div>
                    {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{Number(item.unitPrice).toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-right font-medium">₹{Number(item.totalAmount).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 text-right max-w-xs ml-auto">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{Number(quotation.subtotal).toLocaleString("en-IN")}</span></div>
            {Number(quotation.discountAmount) > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount ({quotation.discountPercent}%)</span><span>-₹{Number(quotation.discountAmount).toLocaleString("en-IN")}</span></div>}
            {Number(quotation.taxAmount) > 0 && <div className="flex justify-between text-sm"><span>Tax ({quotation.taxPercent}%)</span><span>₹{Number(quotation.taxAmount).toLocaleString("en-IN")}</span></div>}
            <Separator />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{Number(quotation.totalAmount).toLocaleString("en-IN")}</span></div>
          </div>
        </CardContent>
      </Card>

      {(quotation.termsAndConditions || quotation.notes) && (
        <Card>
          <CardContent className="pt-6 space-y-3 text-sm">
            {quotation.termsAndConditions && <div><span className="font-medium">Terms &amp; Conditions:</span><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{quotation.termsAndConditions}</p></div>}
            {quotation.notes && <div><span className="font-medium">Notes:</span><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{quotation.notes}</p></div>}
          </CardContent>
        </Card>
      )}

      <Dialog open={showEmail} onOpenChange={setShowEmail}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Quotation by Email</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Recipient Email</Label>
            <Input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
            <p className="text-xs text-muted-foreground">The quotation PDF is attached. Status will move to SENT.</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEmail(false)}>Cancel</Button>
            <Button onClick={handleSendEmail} disabled={sendEmail.isPending}>{sendEmail.isPending ? "Sending..." : "Send"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Quotation</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <Label>Reason</Label>
            <Textarea rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. School chose a competitor" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectQuote.isPending}>{rejectQuote.isPending ? "Rejecting..." : "Reject"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Quotation</DialogTitle></DialogHeader>
          {editForm && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>School Name *</Label><Input value={editForm.schoolName} onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })} /></div>
                <div className="space-y-1"><Label>Contact Person</Label><Input value={editForm.contactPerson} onChange={(e) => setEditForm({ ...editForm, contactPerson: e.target.value })} /></div>
                <div className="space-y-1"><Label>Contact Email</Label><Input type="email" value={editForm.contactEmail} onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })} /></div>
                <div className="space-y-1"><Label>Contact Phone</Label><Input value={editForm.contactPhone} onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Modules & Pricing</Label>
                {editForm.items.map((m: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center rounded-lg border p-2">
                    <div className="col-span-12 md:col-span-5"><Input placeholder="Module name" value={m.moduleName} onChange={(e) => updateEditModule(idx, "moduleName", e.target.value)} /></div>
                    <div className="col-span-12 md:col-span-4"><Input placeholder="Description" value={m.description} onChange={(e) => updateEditModule(idx, "description", e.target.value)} /></div>
                    <div className="col-span-4 md:col-span-1"><Input type="number" placeholder="Qty" value={m.quantity} onChange={(e) => updateEditModule(idx, "quantity", e.target.value)} /></div>
                    <div className="col-span-8 md:col-span-2"><Input type="number" placeholder="Price" value={m.unitPrice} onChange={(e) => updateEditModule(idx, "unitPrice", e.target.value)} /></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Discount (%)</Label><Input type="number" value={editForm.discountPercent} onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value })} /></div>
                <div className="space-y-1"><Label>Tax (%)</Label><Input type="number" value={editForm.taxPercent} onChange={(e) => setEditForm({ ...editForm, taxPercent: e.target.value })} /></div>
                <div className="space-y-1"><Label>Validity (days)</Label><Input type="number" value={editForm.validityDays} onChange={(e) => setEditForm({ ...editForm, validityDays: e.target.value })} /></div>
              </div>
              <div className="space-y-1"><Label>Terms &amp; Conditions</Label><Textarea rows={3} value={editForm.termsAndConditions} onChange={(e) => setEditForm({ ...editForm, termsAndConditions: e.target.value })} /></div>
              <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={updateQuote.isPending}>{updateQuote.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
