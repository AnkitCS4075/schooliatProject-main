"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Banknote, Download, Eye, Plus, Trash2 } from "lucide-react";
import {
    useInvoices,
    useGenerateInvoice,
    useGenerateReceipt,
    useDeleteInvoice,
    useCreateReceipt,
    Invoice,
} from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { GenerateInvoiceForm } from "./generate-invoice-form";
import { SuperAdminDeletionOtpDialog } from "@/components/super-admin/deletion-otp-dialog";
import { SUPER_ADMIN_DELETION_ENTITY } from "@/lib/super-admin/deletion-entity-types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BILLING_PAYMENT_METHOD_LABELS } from "@/lib/super-admin/billing/constants";
import {
    downloadInvoicePdf,
    downloadReceiptPdf,
} from "@/lib/super-admin/billing/download-billing-pdf";

const STATUS_OPTIONS = ["All", "DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"];

export default function InvoicesManagement({ embedded }: { embedded?: boolean }) {
    const { toast } = useToast();
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
    const [recordPaymentFor, setRecordPaymentFor] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
    const [paymentNotes, setPaymentNotes] = useState("");
    const itemsPerPage = 10;

    const { data, isLoading, error } = useInvoices({
        status: statusFilter !== "All" ? statusFilter : undefined,
    });

    const generateInvoice = useGenerateInvoice();
    const generateReceipt = useGenerateReceipt();
    const deleteInvoice = useDeleteInvoice();
    const createReceipt = useCreateReceipt();

    const invoices = useMemo((): Invoice[] => {
        if (!data?.data) return [];
        let filtered: Invoice[] = data.data as Invoice[];

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (invoice) =>
                    invoice.school?.name?.toLowerCase().includes(searchLower) ||
                    invoice.vendor?.name?.toLowerCase().includes(searchLower) ||
                    invoice.invoiceNumber?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [data, searchQuery]);

    const numberOfPages = Math.ceil(invoices.length / itemsPerPage);
    const paginatedInvoices = invoices.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    useEffect(() => {
        setPage(0);
    }, [searchQuery, statusFilter]);

    /** HTML preview in a new tab (may be blocked by the browser popup policy). */
    const handlePreviewInvoiceHtml = async (invoiceId: string) => {
        try {
            const response = await generateInvoice.mutateAsync({ invoiceId });
            if (response?.data?.html && typeof window !== "undefined") {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                    printWindow.document.write(response.data.html);
                    printWindow.document.close();
                    printWindow.focus();
                } else {
                    toast({
                        title: "Popup blocked",
                        description: "Allow popups for this site, or use Download PDF instead.",
                        variant: "destructive",
                    });
                }
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to load invoice preview",
                variant: "destructive",
            });
        }
    };

    const handleDownloadInvoicePdf = async (
        invoiceId: string,
        filenameBase?: string,
    ) => {
        try {
            await downloadInvoicePdf({ invoiceId, filenameBase });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to download invoice PDF",
                variant: "destructive",
            });
        }
    };

    const handlePreviewReceiptHtml = async (receiptId: string) => {
        try {
            const response = await generateReceipt.mutateAsync({ receiptId });
            if (response?.data?.html && typeof window !== "undefined") {
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                    printWindow.document.write(response.data.html);
                    printWindow.document.close();
                    printWindow.focus();
                } else {
                    toast({
                        title: "Popup blocked",
                        description: "Allow popups for this site, or use Download PDF instead.",
                        variant: "destructive",
                    });
                }
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to load receipt preview",
                variant: "destructive",
            });
        }
    };

    const handleDownloadReceiptPdf = async (
        receiptId: string,
        filenameBase?: string,
    ) => {
        try {
            await downloadReceiptPdf({ receiptId, filenameBase });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to download receipt PDF",
                variant: "destructive",
            });
        }
    };

    const openRecordPayment = (invoice: Invoice) => {
        setPaymentMethod("Bank Transfer");
        setPaymentNotes("");
        setRecordPaymentFor(invoice);
    };

    const submitRecordPayment = async () => {
        if (!recordPaymentFor) return;
        try {
            const created = await createReceipt.mutateAsync({
                invoiceId: recordPaymentFor.id,
                paymentMethod,
                description: paymentNotes.trim() || undefined,
            });
            const createdData = (created as { data?: { id?: string; receiptNumber?: string } })
                ?.data;
            const receiptId = createdData?.id;
            if (receiptId) {
                await downloadReceiptPdf({
                    receiptId,
                    notes: paymentNotes.trim() || undefined,
                    filenameBase: createdData?.receiptNumber,
                });
            }
            toast({
                title: "Payment recorded",
                description: "Receipt was created and the invoice is marked paid.",
            });
            setRecordPaymentFor(null);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err?.message || "Failed to record payment",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div className="py-10 text-center">Loading invoices...</div>;
    if (error) return <div className="py-10 text-center text-red-500">Error loading invoices</div>;

    return (
        <div className="space-y-6">
            {!embedded && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Invoices</h1>
                        <p className="text-gray-600 mt-1">Generate and manage invoices for schools and vendors</p>
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Generate Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Generate New Invoice</DialogTitle>
                            </DialogHeader>
                            <GenerateInvoiceForm onSuccess={() => setIsCreateOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            )}
            {embedded && (
                <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Generate Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Generate New Invoice</DialogTitle>
                            </DialogHeader>
                            <GenerateInvoiceForm onSuccess={() => setIsCreateOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <div className="flex gap-4">
                <Input
                    placeholder="Search by school, vendor or invoice #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Recipient</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Receipt</TableHead>
                            <TableHead className="w-40 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedInvoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedInvoices.map((invoice) => {
                                const linked = invoice.receipts?.[0];
                                const canRecordPayment =
                                    invoice.status !== "CANCELLED" &&
                                    invoice.status !== "PAID" &&
                                    !(invoice.receipts && invoice.receipts.length > 0);
                                return (
                                <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{invoice.invoiceNumber || "DRAFT"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-primary">
                                                {invoice.school?.name || invoice.vendor?.name || "Unknown"}
                                            </span>
                                            <span className="text-xs text-muted-foreground capitalize">
                                                {invoice.school ? "School" : "Vendor"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">₹{Number(invoice.amount).toLocaleString()}</TableCell>
                                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                invoice.status === "PAID"
                                                    ? "bg-green-100 text-green-800 border-green-200"
                                                    : invoice.status === "DRAFT"
                                                        ? "bg-gray-100 text-gray-800 border-gray-200"
                                                        : "bg-blue-100 text-blue-800 border-blue-200"
                                            }
                                        >
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {linked?.receiptNumber ? (
                                            <span className="font-medium text-foreground">{linked.receiptNumber}</span>
                                        ) : (
                                            "—"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                title="Download invoice PDF"
                                                onClick={() =>
                                                    void handleDownloadInvoicePdf(
                                                        invoice.id,
                                                        invoice.invoiceNumber || undefined,
                                                    )
                                                }
                                            >
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                title="Preview invoice in browser"
                                                onClick={() => void handlePreviewInvoiceHtml(invoice.id)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {linked?.id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                        title="Download receipt PDF"
                                                        onClick={() =>
                                                            void handleDownloadReceiptPdf(
                                                                linked.id,
                                                                linked.receiptNumber || undefined,
                                                            )
                                                        }
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        title="Preview receipt in browser"
                                                        onClick={() =>
                                                            void handlePreviewReceiptHtml(linked.id)
                                                        }
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : null}
                                            {canRecordPayment ? (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50" title="Record payment" onClick={() => openRecordPayment(invoice)}>
                                                    <Banknote className="w-4 h-4" />
                                                </Button>
                                            ) : null}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Delete invoice" onClick={() => setInvoiceToDelete(invoice)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {numberOfPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Page {page + 1} of {numberOfPages}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(numberOfPages - 1, p + 1))} disabled={page >= numberOfPages - 1}>Next</Button>
                    </div>
                </div>
            )}

            <Dialog
                open={!!recordPaymentFor}
                onOpenChange={(open) => {
                    if (!open) setRecordPaymentFor(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record payment</DialogTitle>
                    </DialogHeader>
                    {recordPaymentFor ? (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Create a receipt for{" "}
                                <span className="font-medium text-foreground">
                                    {recordPaymentFor.invoiceNumber || "Draft invoice"}
                                </span>{" "}
                                (₹{Number(recordPaymentFor.amount).toLocaleString()}). The invoice will be marked paid.
                            </p>
                            <div className="space-y-2">
                                <Label>Payment method</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BILLING_PAYMENT_METHOD_LABELS.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes (optional)</Label>
                                <Textarea
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                    placeholder="Shown on the receipt description if provided"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setRecordPaymentFor(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => void submitRecordPayment()}
                                    disabled={createReceipt.isPending}
                                >
                                    {createReceipt.isPending ? "Saving…" : "Confirm"}
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>

            <SuperAdminDeletionOtpDialog
                open={!!invoiceToDelete}
                onOpenChange={(open) => {
                    if (!open) setInvoiceToDelete(null);
                }}
                title="Delete invoice"
                description={
                    invoiceToDelete
                        ? `Remove invoice ${invoiceToDelete.invoiceNumber || invoiceToDelete.id.slice(0, 8)} permanently.`
                        : ""
                }
                entityType={SUPER_ADMIN_DELETION_ENTITY.INVOICE}
                entityId={invoiceToDelete?.id ?? ""}
                isDeleting={deleteInvoice.isPending}
                onDeleteWithOtp={async (otp) => {
                    if (!invoiceToDelete) return;
                    await deleteInvoice.mutateAsync({ id: invoiceToDelete.id, otp });
                    toast({ title: "Success", description: "Invoice deleted successfully" });
                    setInvoiceToDelete(null);
                }}
            />
        </div>
    );
}
