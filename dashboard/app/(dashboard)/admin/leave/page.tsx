"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLeaveBalance, useLeaveHistory, fetchLeaveHistoryExport } from "@/lib/hooks/use-leave";
import { useAllClasses } from "@/lib/hooks/use-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminLeaveTracker } from "@/components/leave/admin-leave-tracker";
import { AdminLeaveTypesSetup } from "@/components/leave/admin-leave-types-setup";

/** GET /leave/balance returns `{ data: LeaveBalance[] }` with totalLeaves / usedLeaves / remainingLeaves. */
type LeaveBalanceRow = {
  id: string;
  totalLeaves: number;
  usedLeaves: number;
  remainingLeaves: number;
  year?: number;
  leaveType?: { id?: string; name?: string };
};

const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

function buildLeaveHistoryCsv(rows: Array<Record<string, unknown>>): string {
  const headers = [
    "Requester",
    "Leave type",
    "Start date",
    "End date",
    "Days",
    "Reason",
    "Status",
    "Applied on",
  ];
  const lines = [headers.join(",")];
  for (const request of rows) {
    const start = new Date(String(request.startDate));
    const end = new Date(String(request.endDate));
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const leaveType = request.leaveType as { name?: string } | undefined;
    const reason = String(request.reason ?? "").replace(/"/g, '""');
    const cells = [
      `"${String(request.requesterName ?? "").replace(/"/g, '""')}"`,
      `"${String(leaveType?.name ?? "").replace(/"/g, '""')}"`,
      format(start, "yyyy-MM-dd"),
      format(end, "yyyy-MM-dd"),
      String(days),
      `"${reason}"`,
      String(request.status ?? ""),
      format(new Date(String(request.createdAt)), "yyyy-MM-dd"),
    ];
    lines.push(cells.join(","));
  }
  return lines.join("\r\n");
}

export default function LeavePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"history" | "balance" | "tracker" | "settings">("history");
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);

  const [balanceYear, setBalanceYear] = useState(() => new Date().getFullYear());

  const { data: classesData, isLoading: classesLoading } = useAllClasses();
  const classes = classesData?.data ?? [];

  const historyQuery = useMemo(
    () => ({
      userId: "all" as const,
      page,
      limit: 15,
      ...(statusFilter !== "all" ? { status: statusFilter } : {}),
      ...(dateFrom && dateTo ? { startDate: dateFrom, endDate: dateTo } : {}),
      ...(classFilter !== "all" ? { classId: classFilter } : {}),
    }),
    [page, statusFilter, dateFrom, dateTo, classFilter]
  );

  const { data: balanceData, isLoading: balanceLoading } = useLeaveBalance({ year: balanceYear });
  const { data: historyData, isLoading: historyLoading, isFetching: historyFetching } =
    useLeaveHistory(historyQuery);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFrom, dateTo, classFilter]);

  const balanceRows: LeaveBalanceRow[] = Array.isArray(balanceData?.data) ? balanceData.data : [];
  const history = historyData?.data || [];
  const totalPages = historyData?.pagination?.totalPages || 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-primary hover:bg-schooliat-primary-dark">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownloadCsv = async () => {
    if (dateFrom && !dateTo) {
      toast.error("Select both “Date from” and “Date to”, or clear both to export all dates.");
      return;
    }
    if (!dateFrom && dateTo) {
      toast.error("Select both “Date from” and “Date to”, or clear both to export all dates.");
      return;
    }
    setExporting(true);
    try {
      const res = await fetchLeaveHistoryExport({
        status: statusFilter !== "all" ? statusFilter : undefined,
        startDate: dateFrom && dateTo ? dateFrom : undefined,
        endDate: dateFrom && dateTo ? dateTo : undefined,
        classId: classFilter !== "all" ? classFilter : undefined,
        limit: 8000,
      });
      const rows = res?.data ?? [];
      if (rows.length === 0) {
        toast.info("No rows match the current filters.");
        return;
      }
      const csv = buildLeaveHistoryCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leave-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${rows.length} row(s).`);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: string }).message)
          : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1];
  }, []);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Leave Management</h1>
        <Button onClick={() => router.push("/admin/leave/approvals")} variant="outline" className="gap-2">
          <CheckCircle2 className="h-4 w-4" />
          Leave Approvals
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="history">Leave history</TabsTrigger>
          <TabsTrigger value="balance">Leave balance</TabsTrigger>
          <TabsTrigger value="tracker">School tracker</TabsTrigger>
          <TabsTrigger value="settings">Leave types</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School leave history</CardTitle>
              <CardDescription>
                All leave requests in your school. Filter by status, date range (both required to filter by dates), or
                class (students in that class only). Export applies the same filters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
                <div className="space-y-1.5 min-w-[160px]">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTERS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="leave-dfrom">Date from</Label>
                  <Input
                    id="leave-dfrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="leave-dto">Date to</Label>
                  <Input
                    id="leave-dto"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 min-w-[200px]">
                  <Label>Class</Label>
                  {classesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classes.map((c: { id: string; grade?: string; division?: string | null }) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.grade}
                            {c.division ? `-${c.division}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 lg:ml-auto"
                  disabled={exporting || historyLoading}
                  onClick={() => void handleDownloadCsv()}
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download CSV
                </Button>
              </div>

              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="overflow-x-auto relative">
                  {historyFetching && !historyLoading ? (
                    <div className="absolute top-0 right-0 text-xs text-muted-foreground">Updating…</div>
                  ) : null}
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-schooliat-tint">
                        <TableHead>Requester</TableHead>
                        <TableHead>Leave type</TableHead>
                        <TableHead>Start date</TableHead>
                        <TableHead>End date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied on</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No leave requests match these filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        history.map((request: Record<string, unknown>) => {
                          const start = new Date(String(request.startDate));
                          const end = new Date(String(request.endDate));
                          const days =
                            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                          const leaveType = request.leaveType as { name?: string } | undefined;
                          return (
                            <TableRow key={String(request.id)}>
                              <TableCell className="font-medium whitespace-nowrap">
                                {String(request.requesterName ?? "—")}
                              </TableCell>
                              <TableCell>{leaveType?.name || "N/A"}</TableCell>
                              <TableCell>{format(start, "MMM dd, yyyy")}</TableCell>
                              <TableCell>{format(end, "MMM dd, yyyy")}</TableCell>
                              <TableCell>
                                {days} day{days !== 1 ? "s" : ""}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {String(request.reason ?? "")}
                              </TableCell>
                              <TableCell>{getStatusBadge(String(request.status ?? ""))}</TableCell>
                              <TableCell>
                                {format(new Date(String(request.createdAt)), "MMM dd, yyyy")}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your leave balance</CardTitle>
              <CardDescription>
                <strong>Applicable (annual)</strong> is how many days you may take per leave type for the selected year;{" "}
                <strong>remaining</strong> is what you can still book. Teachers and staff see the same breakdown in the
                Schooliat mobile app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Label htmlFor="leave-year" className="shrink-0">
                  Calendar year
                </Label>
                <Select
                  value={String(balanceYear)}
                  onValueChange={(v) => setBalanceYear(Number.parseInt(v, 10))}
                >
                  <SelectTrigger id="leave-year" className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {balanceLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : balanceRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No leave balance for {balanceYear}. Balances are created when leave types are assigned to your role,
                  or after approved leave movements.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {balanceRows.map((row) => {
                    const title = row.leaveType?.name ?? "Leave";
                    const applicable = row.totalLeaves ?? 0;
                    const used = row.usedLeaves ?? 0;
                    const remaining = row.remainingLeaves ?? 0;
                    return (
                      <Card key={row.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            Year {row.year ?? balanceYear}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Applicable (annual)</span>
                              <span className="font-semibold tabular-nums">{applicable}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Used</span>
                              <span className="font-semibold text-red-600 tabular-nums">{used}</span>
                            </div>
                            <div className="flex items-center justify-between border-t pt-2">
                              <span className="text-sm font-medium text-foreground">Remaining</span>
                              <span className="font-bold text-primary tabular-nums text-lg">{remaining}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracker" className="space-y-6">
          <AdminLeaveTracker />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminLeaveTypesSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
}
