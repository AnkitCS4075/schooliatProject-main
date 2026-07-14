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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, DownloadCloud } from "lucide-react";
import { useSalaryPayments, useGenerateSalaryPayments } from "@/lib/hooks/use-salary";
import { toast } from "sonner";

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Convert month name to YYYY-MM for API (backend expects YYYY-MM). */
function monthNameToYYYYMM(monthName: string, year?: number): string {
  const y = year ?? new Date().getFullYear();
  const monthNames = MONTH_OPTIONS;
  const i = monthNames.indexOf(monthName);
  if (i === -1) return `${y}-01`;
  const month = String(i + 1).padStart(2, "0");
  return `${y}-${month}`;
}

const STATUS_OPTIONS = ["All Status", "Paid", "Pending"];

function formatCurrency(num: number | string | null | undefined): string {
  return `₹${Number(num || 0).toLocaleString("en-IN")}`;
}

interface SalaryDistributionProps {
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
}

export function SalaryDistribution({ onEdit, onDelete }: SalaryDistributionProps) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState(
    new Date().toLocaleString("en-US", { month: "long" })
  );
  const [statusFilter, setStatusFilter] = useState("All Status");

  const monthApi = monthNameToYYYYMM(monthFilter);
  const { data: salaryData, isLoading, refetch } = useSalaryPayments(monthApi);
  const { mutateAsync: generatePayments, isPending: isGenerating } =
    useGenerateSalaryPayments();

  const payments = salaryData?.data || [];

  // Stats
  const salaryStats = useMemo(() => {
    const paid = payments.filter(
      (p: any) => p.status === "PAID" || p.status === "Paid"
    ).length;
    const pending = payments.filter(
      (p: any) => p.status === "PENDING" || p.status === "Pending"
    ).length;
    const totalPaid = payments
      .filter((p: any) => p.status === "PAID" || p.status === "Paid")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
    const totalPending = payments
      .filter((p: any) => p.status === "PENDING" || p.status === "Pending")
      .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

    return {
      teacherCount: payments.filter(
        (p: any) => p.user?.role?.name === "TEACHER"
      ).length,
      staffCount: payments.filter(
        (p: any) => p.user?.role?.name === "STAFF"
      ).length,
      paidAmount: formatCurrency(totalPaid),
      pendingAmount: formatCurrency(totalPending),
      paid,
      pending,
    };
  }, [payments]);

  // Filtered data
  const filteredData = useMemo(() => {
    return payments.filter((item: any) => {
      const q = searchQuery.trim().toLowerCase();
      const name = [item.user?.firstName, item.user?.lastName]
        .filter(Boolean)
        .join(" ");
      const matchesSearch = !q || name.toLowerCase().includes(q) || item.employeeId?.toLowerCase().includes(q);
      const status = item.status === "PAID" || item.status === "Paid" ? "Paid" : "Pending";
      const matchesStatus =
        statusFilter === "All Status" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  // Pagination
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const numberOfPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, monthFilter]);

  const handleGeneratePayments = async () => {
    if (!confirm(`Generate salary payments for ${monthFilter}?`)) {
      return;
    }

    try {
      await generatePayments(monthApi);
      toast.success("Salary payments generated successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate salary payments");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">Salary Distribution</h1>
        <Button onClick={handleGeneratePayments} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Payments"}
        </Button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Teachers</p>
          <p className="text-2xl font-bold">{salaryStats.teacherCount}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Staff</p>
          <p className="text-2xl font-bold">{salaryStats.staffCount}</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Paid</p>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <p className="text-xl font-bold text-primary">{salaryStats.paidAmount}</p>
          <p className="text-xs text-gray-500 mt-1">{salaryStats.paid} employees</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          </div>
          <p className="text-xl font-bold text-orange-600">{salaryStats.pendingAmount}</p>
          <p className="text-xs text-gray-500 mt-1">{salaryStats.pending} employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by Name or Employee ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_OPTIONS.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-16">No</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="w-40">Employee ID</TableHead>
                <TableHead className="w-32">Role</TableHead>
                <TableHead className="w-32">Salary</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No salary payments found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item: any, index: number) => {
                  const status = item.status === "PAID" || item.status === "Paid" ? "Paid" : "Pending";
                  const name = [item.user?.firstName, item.user?.lastName]
                    .filter(Boolean)
                    .join(" ") || "—";
                  const initials = name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <TableRow key={item.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {String(index + 1).padStart(2, "0")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={item.user?.photoLink || undefined} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <span>{name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.employeeId || "—"}</TableCell>
                      <TableCell>
                        {item.user?.role?.name
                          ? item.user.role.name.replace("_", " ")
                          : "—"}
                      </TableCell>
                      <TableCell>{formatCurrency(item.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status === "Paid" ? "default" : "secondary"}
                          className={
                            status === "Paid"
                              ? "bg-schooliat-tint text-primary"
                              : "bg-orange-100 text-orange-800"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.slipUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(item.slipUrl, "_blank")}
                              className="h-8 w-8"
                              title="Download Salary Slip"
                            >
                              <DownloadCloud className="w-4 h-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(item)}
                              className="h-8 w-8"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDelete(item.id)}
                              className="h-8 w-8"
                            >
                              <Trash2 className="w-4 h-4" />
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

