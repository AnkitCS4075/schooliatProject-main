"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useStudentFees, useStudentFeeLedger } from "@/lib/hooks/use-fees";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DownloadCloud } from "lucide-react";
import { resolvePublicFileUrl } from "@/lib/utils/resolve-public-file-url";

function formatCurrency(num: number | string | null | undefined): string {
  return `₹${Number(num || 0).toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

interface FeeDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  studentId: string | null;
}

export function FeeDetailsModal({ visible, onClose, studentId }: FeeDetailsModalProps) {
  const { data, isLoading } = useStudentFees(studentId || "", {
    enabled: !!studentId && visible,
  });
  const { data: ledgerRes, isLoading: loadingLedger } = useStudentFeeLedger(
    studentId || "",
    { enabled: !!studentId && visible, limit: 300 }
  );

  const fees = data?.data || null;
  const ledgerEntries = ledgerRes?.data?.entries ?? [];

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Fee Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : fees ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{" "}
                    {[fees.student?.firstName, fees.student?.lastName]
                      .filter(Boolean)
                      .join(" ") || "—"}
                    {studentId ? (
                      <>
                        {" "}
                        <Link
                          href={`/admin/students/${studentId}`}
                          className="text-primary font-medium hover:underline text-sm"
                        >
                          View profile
                        </Link>
                      </>
                    ) : null}
                  </div>
                  <div>
                    <span className="text-gray-600">Class:</span>{" "}
                    {fees.student?.class?.grade || "—"}
                  </div>
                </div>
              </div>

              {fees.fee?.feeComponents &&
              Array.isArray(fees.fee.feeComponents) &&
              fees.fee.feeComponents.length > 0 ? (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Annual fee structure (plan snapshot)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Plan total {formatCurrency(fees.fee.totalAmount)} — breakdown at the time this fee
                    plan was created.
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Component</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(fees.fee.feeComponents as { label?: string; amount?: number }[]).map(
                        (row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">{String(row.label ?? "—")}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {formatCurrency(row.amount)}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : null}

              <Tabs defaultValue="installments">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="installments">Installments</TabsTrigger>
                  <TabsTrigger value="ledger">Payment history</TabsTrigger>
                </TabsList>
                <TabsContent value="installments" className="mt-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Installments</h3>
                    <div className="space-y-2">
                      {fees.installments?.map((installment: any, index: number) => {
                        const statusLabel =
                          installment.paymentStatus === "PAID"
                            ? "Paid"
                            : installment.paymentStatus === "PARTIALLY_PAID"
                              ? "Partially Paid"
                              : installment.paymentStatus === "CANCELLED"
                                ? "Cancelled"
                                : installment.paymentStatus === "WAIVED"
                                  ? "Waived"
                                  : "Pending";
                        const statusClass =
                          installment.paymentStatus === "PAID"
                            ? "bg-schooliat-tint text-primary"
                            : installment.paymentStatus === "PARTIALLY_PAID"
                              ? "bg-amber-100 text-amber-800"
                              : installment.paymentStatus === "CANCELLED"
                                ? "bg-slate-200 text-slate-800"
                                : installment.paymentStatus === "WAIVED"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-orange-100 text-orange-800";
                        return (
                          <div
                            key={installment.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">Installment {index + 1}</div>
                              <div className="text-sm text-gray-600">
                                Amount: {formatCurrency(installment.amount)} | Paid:{" "}
                                {formatCurrency(installment.paidAmount)} | Remaining:{" "}
                                {formatCurrency(installment.remainingAmount)}
                              </div>
                              {installment.lastReceiptNumber ? (
                                <div className="text-xs text-gray-500">
                                  Last receipt: {installment.lastReceiptNumber}
                                </div>
                              ) : null}
                              {installment.paidAt && (
                                <div className="text-xs text-gray-500">
                                  Paid at: {formatDate(installment.paidAt)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                              {installment.receiptFileUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 gap-1 text-primary"
                                  onClick={() =>
                                    window.open(
                                      resolvePublicFileUrl(installment.receiptFileUrl),
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                  title="Download receipt"
                                >
                                  <DownloadCloud className="h-4 w-4" />
                                  Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="ledger" className="mt-4">
                  <div className="border rounded-lg p-2">
                    {loadingLedger ? (
                      <Skeleton className="h-32 w-full" />
                    ) : ledgerEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4">
                        No ledger entries yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto max-h-[40vh]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>When</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">₹</TableHead>
                              <TableHead>Receipt</TableHead>
                              <TableHead />
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ledgerEntries.map((e: any) => (
                              <TableRow key={e.id}>
                                <TableCell className="text-sm whitespace-nowrap">
                                  {formatDateTime(e.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-normal">
                                    {e.entryType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right tabular-nums text-sm">
                                  {Number(e.amount || 0).toLocaleString("en-IN")}
                                </TableCell>
                                <TableCell className="text-sm max-w-[100px] truncate">
                                  {e.receiptNumber || "—"}
                                </TableCell>
                                <TableCell>
                                  {e.receiptFileUrl ? (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-8 px-1"
                                      onClick={() =>
                                        window.open(
                                          resolvePublicFileUrl(e.receiptFileUrl),
                                          "_blank",
                                          "noopener,noreferrer"
                                        )
                                      }
                                    >
                                      Open
                                    </Button>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fee details available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

