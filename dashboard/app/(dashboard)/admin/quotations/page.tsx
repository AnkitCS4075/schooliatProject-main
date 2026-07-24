"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useQuotationsPage,
  useDeleteQuotation,
  useQuotationStats,
} from "@/lib/hooks/use-quotations";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Plus, Eye, Pencil, Trash2, FileText } from "lucide-react";

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

export default function QuotationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const limit = 15;

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuotationsPage(page, limit, statusFilter === "all" ? undefined : statusFilter);
  const { data: stats } = useQuotationStats();
  const deleteQuotation = useDeleteQuotation();

  const quotations = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this quotation?")) return;
      try {
        await deleteQuotation.mutateAsync(id);
        toast({ title: "Success", description: "Quotation deleted" });
        refetch();
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
      }
    },
    [deleteQuotation, toast, refetch]
  );

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotations...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error?.message || "Failed to load quotations"}</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold">{stats.data.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.data.draft}</p>
              <p className="text-xs text-muted-foreground">Draft</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.data.sent}</p>
              <p className="text-xs text-muted-foreground">Sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.data.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.data.converted}</p>
              <p className="text-xs text-muted-foreground">Converted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {stats.data.conversionRate}%
              </p>
              <p className="text-xs text-muted-foreground">Conv. Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground text-sm">Manage and track all quotations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => router.push("/admin/quotations/add")}>
            <Plus className="mr-2 h-4 w-4" /> New Quotation
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No quotations found
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q: any) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      <FileText className="inline h-4 w-4 mr-1 text-muted-foreground" />
                      {q.quotationNumber}
                    </TableCell>
                    <TableCell>{q.customerName}</TableCell>
                    <TableCell>₹{Number(q.totalAmount).toLocaleString("en-IN")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_COLORS[q.status] || ""}>
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(q.createdAt).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/quotations/${q.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/quotations/${q.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
