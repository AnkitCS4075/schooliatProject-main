"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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
import {
  Search,
  FileDown,
  Loader2,
  DownloadCloud,
  Eye,
  IndianRupee,
  Ban,
  AlertCircle,
} from "lucide-react";
import {
  useInstallments,
  useRecordPayment,
  useSchoolFeeLedger,
  buildSchoolLedgerQuery,
} from "@/lib/hooks/use-fees";
import { get, downloadFromApi } from "@/lib/api/client";
import { resolvePublicFileUrl } from "@/lib/utils/resolve-public-file-url";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeeDetailsModal } from "./fee-details-modal";
import { PaymentModal } from "./payment-modal";
import { CancelFeeInstallmentModal } from "./cancel-fee-installment-modal";
import { PaymentFormData } from "@/lib/schemas/fees-schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const STATUS_OPTIONS = ["All Status", "Paid", "Partially Paid", "Pending", "Cancelled"];
const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Installment ${i + 1}`,
}));

const LEDGER_ENTRY_TYPES = [
  { value: "ALL", label: "All types" },
  { value: "PAYMENT", label: "Payment" },
  { value: "WAIVER", label: "Waiver" },
  { value: "CANCELLATION_REVERSAL", label: "Cancellation reversal" },
] as const;

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

function normalizeStatus(
  s: string | null | undefined
): "Paid" | "Partially Paid" | "Pending" | "Cancelled" {
  if (!s) return "Pending";
  if (s === "PAID") return "Paid";
  if (s === "PARTIALLY_PAID") return "Partially Paid";
  if (s === "CANCELLED") return "Cancelled";
  return "Pending";
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildCollectionChartData(installments: any[]): { month: string; amount: number }[] {
  const buckets = MONTH_LABELS.map((m) => ({ month: m, amount: 0 }));
  for (const inst of installments || []) {
    if (inst.paymentStatus !== "PAID" || !inst.paidAt) continue;
    const d = new Date(inst.paidAt);
    if (Number.isNaN(d.getTime())) continue;
    const idx = d.getMonth();
    const paid = Number(inst.paidAmount ?? inst.amount ?? 0);
    if (idx >= 0 && idx < 12) buckets[idx].amount += paid;
  }
  return buckets;
}

interface FeesManagementProps {
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

export function FeesManagement({ onEdit, onDelete }: FeesManagementProps) {
  const { selectedYear, setSelectedYear, options: academicYearOptions } = useAcademicYear();

  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [installmentNumber, setInstallmentNumber] = useState(1);
  const [endInstallmentNumber, setEndInstallmentNumber] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [lookupStudentId, setLookupStudentId] = useState<string | null>(null);
  const [cancelInstallment, setCancelInstallment] = useState<any | null>(null);

  const [mainTab, setMainTab] = useState<"desk" | "ledger">("desk");
  const [ledgerEntryType, setLedgerEntryType] = useState<string>("ALL");
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPageSize = 25;
  const [isExportingLedger, setIsExportingLedger] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All Status");

  const {
    data: installmentsRes,
    isLoading,
    isError,
    error,
    refetch,
  } = useInstallments(installmentNumber, endInstallmentNumber, {
    enabled: true,
    academicYear: selectedYear,
  });
  const { mutateAsync: recordPayment, isPending: isRecordingPayment } = useRecordPayment();

  const schoolLedgerFilters = useMemo(
    () => ({
      academicYear: selectedYear,
      studentId: lookupStudentId || undefined,
      entryType:
        ledgerEntryType === "ALL" ? undefined : ledgerEntryType,
      page: ledgerPage,
      limit: ledgerPageSize,
    }),
    [selectedYear, lookupStudentId, ledgerEntryType, ledgerPage, ledgerPageSize]
  );

  const {
    data: schoolLedgerRes,
    isLoading: loadingSchoolLedger,
    isFetching: fetchingSchoolLedger,
    isError: schoolLedgerIsError,
    error: schoolLedgerError,
  } = useSchoolFeeLedger(schoolLedgerFilters, {
    enabled: mainTab === "ledger",
  });

  const ledgerEntries = schoolLedgerRes?.data?.entries ?? [];
  const ledgerPagination = schoolLedgerRes?.data?.pagination ?? {
    page: 1,
    limit: ledgerPageSize,
    total: 0,
    totalPages: 1,
  };

  const handleViewDetails = (item: any) => {
    setSelectedStudentId(item.studentId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedStudentId(null);
  };

  const handleRecordPayment = (item: any) => {
    setSelectedInstallment(item);
    setPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedInstallment(null);
  };

  const runStudentLookup = async () => {
    const q = lookupQuery.trim();
    if (q.length < 2) {
      toast.error("Enter at least 2 characters (name, ID, email, or phone)");
      return;
    }
    try {
      const res = await get("/fees/lookup-student", { q });
      const list = res?.data?.students ?? [];
      setLookupResults(list);
      if (list.length === 0) toast.info("No students matched");
    } catch (e: any) {
      toast.error(e?.message || "Lookup failed");
    }
  };

  const handleSubmitPayment = async (data: PaymentFormData) => {
    if (!selectedInstallment) return;

    try {
      const result = await recordPayment({
        installmentId: selectedInstallment.id,
        amount: data.isWaiver ? undefined : Math.round(Number(data.amount) || 0),
        paymentMethod: data.paymentMethod,
        isWaiver: data.isWaiver,
        transactionId: data.transactionId,
        remarks: data.remarks,
      });
      handleClosePaymentModal();
      const rawReceiptUrl = result?.data?.installment?.receiptFileUrl as
        | string
        | undefined;
      if (rawReceiptUrl) {
        const url = resolvePublicFileUrl(rawReceiptUrl);
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
        toast.success("Payment recorded. Receipt opened in a new tab.");
      } else {
        toast.success("Payment recorded.");
        toast.info(
          "Receipt file was not linked yet. Refresh the list or open fee details if you need the PDF/HTML receipt."
        );
      }
      await refetch();
    } catch (error: unknown) {
      console.error("Payment failed:", error);
      throw error;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await downloadFromApi(
        `/fees/export?academicYear=${encodeURIComponent(selectedYear)}`
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fees_report_${selectedYear.replace(/[^\w-]/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Fees report exported successfully!");
    } catch (e: any) {
      toast.error(e?.message || "Failed to export fees");
    } finally {
      setIsExporting(false);
    }
  };

  const installments = useMemo(
    () => installmentsRes?.data?.installments ?? [],
    [installmentsRes]
  );

  // Stats computed from current installment
  const feeStats = useMemo(() => {
    const paid = installments.filter(
      (i: any) => normalizeStatus(i.paymentStatus) === "Paid"
    ).length;
    const pending = installments.filter(
      (i: any) => normalizeStatus(i.paymentStatus) === "Pending"
    ).length;
    const cancelled = installments.filter(
      (i: any) => normalizeStatus(i.paymentStatus) === "Cancelled"
    ).length;
    const total = installments.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const totalPaid = installments.reduce(
      (s: number, i: any) => s + (Number(i.paidAmount) || 0),
      0
    );
    const totalRemaining = installments.reduce(
      (s: number, i: any) => s + (Number(i.remainingAmount) || 0),
      0
    );
    return {
      paid,
      pending,
      cancelled,
      totalFees: formatCurrency(total),
      totalHostel: formatCurrency(0),
      totalTransport: formatCurrency(0),
      totalPaid: formatCurrency(totalPaid),
      totalRemaining: formatCurrency(totalRemaining),
    };
  }, [installments]);

  // Filtered data
  const chartData = useMemo(
    () => buildCollectionChartData(installments),
    [installments],
  );

  const filteredData = useMemo(() => {
    return installments.filter((item: any) => {
      const q = searchQuery.trim().toLowerCase();
      const name = [item.student?.firstName, item.student?.lastName]
        .filter(Boolean)
        .join(" ");
      const matchesSearch = !q || name.toLowerCase().includes(q);
      const status = normalizeStatus(item.paymentStatus);
      const matchesStatus =
        statusFilter === "All Status" || status === statusFilter;
      const matchesLookup =
        !lookupStudentId || item.studentId === lookupStudentId;
      return matchesSearch && matchesStatus && matchesLookup;
    });
  }, [installments, searchQuery, statusFilter, lookupStudentId]);

  // Pagination
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const numberOfPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, lookupStudentId]);

  useEffect(() => {
    setLedgerPage(1);
  }, [selectedYear, lookupStudentId, ledgerEntryType]);

  const handleLedgerExport = async () => {
    setIsExportingLedger(true);
    try {
      const q = buildSchoolLedgerQuery({
        academicYear: selectedYear,
        studentId: lookupStudentId || undefined,
        entryType:
          ledgerEntryType === "ALL" ? undefined : ledgerEntryType,
      });
      const blob = await downloadFromApi(`/fees/ledger/export${q}`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fee_ledger_${selectedYear.replace(/[^\w-]/g, "_")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Ledger exported");
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Export failed";
      toast.error(message);
    } finally {
      setIsExportingLedger(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Fees Management</h1>
        <div className="flex flex-wrap gap-2">
          {mainTab === "desk" ? (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DownloadCloud className="h-4 w-4" />
              )}
              Installments CSV
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleLedgerExport}
              disabled={isExportingLedger}
              className="gap-2"
            >
              {isExportingLedger ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Ledger CSV
            </Button>
          )}
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "desk" | "ledger")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="desk">Fee desk</TabsTrigger>
          <TabsTrigger value="ledger">Transaction ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="desk" className="space-y-6 mt-6">
          <Card className="border-primary/25 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">How fee recording works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>
                Use the <strong className="text-foreground">Academic year</strong> control (in filters below) so this list matches the rest of the portal (navbar). Then find the student row and click{" "}
                <strong className="text-foreground">Record payment</strong> (₹). Receipts and ledger entries are created automatically.
              </p>
              <p>
                Switch to <strong className="text-foreground">Transaction ledger</strong> for the full school-wide audit trail (payments, waivers, cancellations).
              </p>
            </CardContent>
          </Card>

          {isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load installments</AlertTitle>
              <AlertDescription>
                {(error as Error)?.message ||
                  "Check your connection and permissions (Fees). If the problem continues, try another academic year."}
              </AlertDescription>
            </Alert>
          ) : null}

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Card */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Fees Collection (by payment month)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#4CAF50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Status Card */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Fee Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Fees</span>
              <span className="font-semibold">{feeStats.totalFees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Paid</span>
              <span className="font-semibold text-primary">{feeStats.totalPaid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Remaining</span>
              <span className="font-semibold text-red-600">{feeStats.totalRemaining}</span>
            </div>
              <div className="flex flex-wrap gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm">Paid: {feeStats.paid}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">Pending: {feeStats.pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                <span className="text-sm">Cancelled: {feeStats.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student lookup (fee desk) */}
      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <div className="text-sm font-medium">Find student for payment</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Public ID, email, phone, or name fragment"
            value={lookupQuery}
            onChange={(e) => setLookupQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runStudentLookup()}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={runStudentLookup} className="gap-2 shrink-0">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        {lookupResults.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {lookupResults.map((s: any) => (
              <Button
                key={s.id}
                type="button"
                size="sm"
                variant={lookupStudentId === s.id ? "default" : "outline"}
                onClick={() => {
                  setLookupStudentId(s.id);
                  const name = [s.firstName, s.lastName].filter(Boolean).join(" ");
                  setSearchQuery(name || s.publicUserId || "");
                }}
              >
                {s.publicUserId || s.id.slice(0, 8)} — {[s.firstName, s.lastName].filter(Boolean).join(" ")}
              </Button>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setLookupStudentId(null);
                setLookupResults([]);
              }}
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Academic year
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Student Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={String(installmentNumber)}
            onValueChange={(v: string) => setInstallmentNumber(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="From Installment" />
            </SelectTrigger>
            <SelectContent>
              {INSTALLMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  From: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(endInstallmentNumber)}
            onValueChange={(v: string) => setEndInstallmentNumber(Number(v))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="To Installment" />
            </SelectTrigger>
            <SelectContent>
              {INSTALLMENT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} disabled={Number(option.value) < installmentNumber}>
                  To: {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-16">No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="w-32">Amount</TableHead>
                <TableHead className="w-32">Paid</TableHead>
                <TableHead className="w-32">Remaining</TableHead>
                <TableHead className="w-40">Paid At</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="min-w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">No installments in this view</p>
                    <p className="text-sm">
                      Academic year <strong>{selectedYear}</strong> is applied. Try another year above, clear student filters, or ensure students have fee plans (Settings → Fees).
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item: any, index: number) => {
                  const status = normalizeStatus(item.paymentStatus);
                  const name = [item.student?.firstName, item.student?.lastName]
                    .filter(Boolean)
                    .join(" ") || "—";
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {String(from + index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <Link
                            href={`/admin/students/${item.studentId}`}
                            className="font-medium text-primary hover:underline truncate"
                          >
                            {name}
                          </Link>
                          {item.student?.publicUserId ? (
                            <span className="text-xs text-muted-foreground truncate">
                              {item.student.publicUserId}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{formatCurrency(item.amount)}</div>
                          {item.feePlan?.feeComponents &&
                          Array.isArray(item.feePlan.feeComponents) &&
                          item.feePlan.feeComponents.length > 0 ? (
                            <div className="text-xs text-muted-foreground space-y-0.5 max-w-[220px]">
                              {(item.feePlan.feeComponents as { label?: string; amount?: number }[])
                                .slice(0, 3)
                                .map((c, ci) => (
                                  <div key={ci} className="truncate" title={`${c.label}: ${formatCurrency(c.amount)}`}>
                                    {c.label}: {formatCurrency(c.amount)}
                                  </div>
                                ))}
                              {item.feePlan.feeComponents.length > 3 ? (
                                <div>+{item.feePlan.feeComponents.length - 3} more</div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(item.paidAmount)}</TableCell>
                      <TableCell>{formatCurrency(item.remainingAmount)}</TableCell>
                      <TableCell>{formatDate(item.paidAt)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "Paid" ? "default" : "secondary"}
                          className={
                            status === "Paid"
                              ? "bg-schooliat-tint text-primary"
                              : status === "Partially Paid"
                                ? "bg-amber-100 text-amber-800"
                                : status === "Cancelled"
                                  ? "bg-slate-200 text-slate-800"
                                  : "bg-orange-100 text-orange-800"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(item)}
                            className="h-8 w-8"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRecordPayment(item)}
                            disabled={
                              status === "Paid" || status === "Cancelled" || isRecordingPayment
                            }
                            className="h-8 gap-1 shrink-0"
                            title={
                              status === "Paid"
                                ? "Fully paid"
                                : status === "Cancelled"
                                  ? "Cancelled"
                                  : status === "Partially Paid"
                                    ? "Pay remaining balance (marks paid when complete)"
                                    : "Record payment — marks installment paid when balance is cleared"
                            }
                          >
                            <IndianRupee className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {status === "Partially Paid"
                                ? "Pay balance"
                                : status === "Pending"
                                  ? "Mark paid"
                                  : "Pay"}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCancelInstallment(item)}
                            disabled={status === "Cancelled"}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Cancel installment"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          {item.receiptFileUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                window.open(
                                  resolvePublicFileUrl(item.receiptFileUrl),
                                  "_blank",
                                  "noopener,noreferrer"
                                )
                              }
                              className="h-8 w-8 text-primary"
                              title="Open receipt for this installment"
                            >
                              <DownloadCloud className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {numberOfPages > 1 && (
        <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {from + 1}–{to} of {filteredData.length} records &middot; Page {page + 1} of {numberOfPages}
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
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6 mt-6">
          {schoolLedgerIsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could not load ledger</AlertTitle>
              <AlertDescription>
                {(schoolLedgerError as Error)?.message ||
                  "Check permissions and that the API is available."}
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-medium">School fee ledger</p>
            <p className="text-sm text-muted-foreground">
              Every payment, waiver, and cancellation reversal for your school. Use the same student search as on the fee desk to narrow rows, or filter by type and academic year.
            </p>
            <div className="flex flex-col lg:flex-row gap-3 flex-wrap">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ledgerEntryType} onValueChange={setLedgerEntryType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Entry type" />
                </SelectTrigger>
                <SelectContent>
                  {LEDGER_ENTRY_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lookupStudentId ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="h-9 px-3 py-1.5">
                    Filtered to selected student
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLookupStudentId(null)}
                  >
                    Clear student filter
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <div className="text-sm font-medium">Find student (same filter as fee desk)</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Public ID, email, phone, or name"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runStudentLookup()}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={runStudentLookup} className="gap-2 shrink-0">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            {lookupResults.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {lookupResults.map((s: any) => (
                  <Button
                    key={s.id}
                    type="button"
                    size="sm"
                    variant={lookupStudentId === s.id ? "default" : "outline"}
                    onClick={() => {
                      setLookupStudentId(s.id);
                      const name = [s.firstName, s.lastName].filter(Boolean).join(" ");
                      setSearchQuery(name || s.publicUserId || "");
                    }}
                  >
                    {s.publicUserId || s.id.slice(0, 8)} — {[s.firstName, s.lastName].filter(Boolean).join(" ")}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-schooliat-tint">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Inst.</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Recorded by</TableHead>
                    <TableHead className="w-24">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingSchoolLedger || fetchingSchoolLedger ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        Loading ledger…
                      </TableCell>
                    </TableRow>
                  ) : ledgerEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        No ledger entries for these filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    ledgerEntries.map((row: any) => {
                      const st = row.student;
                      const name =
                        [st?.firstName, st?.lastName].filter(Boolean).join(" ") || "—";
                      const rec = row.recordedByUser;
                      const recName =
                        [rec?.firstName, rec?.lastName].filter(Boolean).join(" ") || "—";
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {formatDateTime(row.createdAt)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {row.entryType || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium min-w-0">
                              {row.studentId ? (
                                <Link
                                  href={`/admin/students/${row.studentId}`}
                                  className="text-primary hover:underline"
                                >
                                  {name}
                                </Link>
                              ) : (
                                name
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {st?.publicUserId || row.studentId?.slice(0, 8) || ""}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(row.amount)}
                          </TableCell>
                          <TableCell className="text-sm max-w-[140px] truncate" title={row.receiptNumber}>
                            {row.receiptNumber || "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {row.installmentNumber != null ? row.installmentNumber : "—"}
                          </TableCell>
                          <TableCell className="text-sm">{row.paymentMethod || "—"}</TableCell>
                          <TableCell className="text-sm max-w-[120px] truncate" title={recName}>
                            {recName}
                          </TableCell>
                          <TableCell>
                            {row.receiptFileUrl ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-primary"
                                onClick={() =>
                                  window.open(
                                    resolvePublicFileUrl(row.receiptFileUrl),
                                    "_blank",
                                    "noopener,noreferrer"
                                  )
                                }
                              >
                                Open
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {ledgerPagination.totalPages > 1 ? (
            <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Page {ledgerPagination.page} of {ledgerPagination.totalPages} ·{" "}
                {ledgerPagination.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={ledgerPage <= 1}
                  onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={ledgerPage >= ledgerPagination.totalPages}
                  onClick={() =>
                    setLedgerPage((p) =>
                      Math.min(ledgerPagination.totalPages, p + 1)
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>

      <FeeDetailsModal
        visible={modalVisible}
        onClose={handleCloseModal}
        studentId={selectedStudentId}
      />
      <PaymentModal
        visible={paymentModalVisible}
        onClose={handleClosePaymentModal}
        onSubmit={handleSubmitPayment}
        installment={selectedInstallment}
        isSubmitting={isRecordingPayment}
      />
      <CancelFeeInstallmentModal
        visible={!!cancelInstallment}
        onClose={() => setCancelInstallment(null)}
        installment={cancelInstallment}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

