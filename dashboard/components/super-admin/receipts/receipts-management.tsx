"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Download, Eye, Plus } from "lucide-react";
import { useReceipts, useGenerateReceipt, Receipt } from "@/lib/hooks/use-super-admin";
import { useToast } from "@/hooks/use-toast";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";
import { downloadReceiptPdf } from "@/lib/super-admin/billing/download-billing-pdf";

const STATUS_OPTIONS = ["All", "GENERATED", "PENDING", "PAID", "CANCELLED"];

interface ReceiptDisplay {
  id: string;
  receiptNumber: string;
  recipientName: string;
  recipientSub: string;
  amount: number;
  date: string;
  status: string;
  invoiceLabel: string | null;
}

export function ReceiptsManagement({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const itemsPerPage = 10;

  const { data, isLoading, error } = useReceipts({
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const generateReceipt = useGenerateReceipt();

  const receipts = useMemo<ReceiptDisplay[]>(() => {
    if (!data?.data) return [];
    let filtered = data.data;

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (receipt: Receipt) =>
          receipt.school?.name?.toLowerCase().includes(searchLower) ||
          receipt.vendor?.name?.toLowerCase().includes(searchLower) ||
          receipt.receiptNumber?.toLowerCase().includes(searchLower)
      );
    }

    return filtered.map((receipt: Receipt) => ({
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      recipientName: receipt.school?.name || receipt.vendor?.name || "N/A",
      recipientSub: receipt.school?.code || (receipt.vendor ? "Vendor" : "N/A"),
      amount: parseFloat(String(receipt.amount)) || 0,
      date: new Date(receipt.createdAt).toISOString().split("T")[0],
      status: receipt.status || "GENERATED",
      invoiceLabel: receipt.invoice?.invoiceNumber || (receipt.invoice?.id ? receipt.invoice.id.slice(0, 8) : null),
    }));
  }, [data, searchQuery]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, receipts.length);
  const numberOfPages = Math.ceil(receipts.length / itemsPerPage);
  const paginatedReceipts = receipts.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter]);

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
            description: "Allow popups, or use Download PDF.",
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
    receiptNumber?: string,
  ) => {
    try {
      await downloadReceiptPdf({
        receiptId,
        filenameBase: receiptNumber,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to download receipt PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Failed to load receipts</p>
          <p className="text-sm text-gray-600 mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Receipts Management</h1>
            <p className="text-gray-600 mt-1">
              View receipts, including those created from invoice payments
            </p>
          </div>
          <Button
            onClick={() => router.push(BILLING_ROUTES.standaloneReceiptGenerate)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Receipt
          </Button>
        </div>
      )}
      {embedded && (
        <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
          <Button
            onClick={() => router.push(BILLING_ROUTES.standaloneReceiptGenerate)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Standalone receipt
          </Button>
        </div>
      )}

      <div className="flex gap-4">
        <Input
          placeholder="Search receipts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead>Receipt Number</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceipts.map((receipt) => (
                  <TableRow key={receipt.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{receipt.recipientName}</div>
                        <div className="text-sm text-gray-500">
                          {receipt.recipientSub}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {receipt.invoiceLabel || "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{receipt.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{receipt.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          receipt.status === "PAID"
                            ? "bg-schooliat-tint text-primary border-primary/30"
                            : receipt.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                        }
                      >
                        {receipt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Download receipt PDF"
                          onClick={() =>
                            void handleDownloadReceiptPdf(
                              receipt.id,
                              receipt.receiptNumber,
                            )
                          }
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Preview in browser"
                          onClick={() => void handlePreviewReceiptHtml(receipt.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {numberOfPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {numberOfPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(numberOfPages - 1, page + 1))}
              disabled={page >= numberOfPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

