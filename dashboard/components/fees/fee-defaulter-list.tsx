"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, AlertCircle, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { useFeeDefaulters } from "@/lib/hooks/use-fees";

function formatCurrency(num: number | string | null | undefined): string {
  return `\u20B9${Number(num || 0).toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "\u2014";
  }
}

export function FeeDefaulterList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useFeeDefaulters(page, limit);

  const defaulters = data?.data || [];
  const pagination = data?.pagination;

  const filtered = defaulters.filter((d: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const student = d.student;
    return (
      student?.firstName?.toLowerCase().includes(s) ||
      student?.lastName?.toLowerCase().includes(s) ||
      student?.publicUserId?.toLowerCase().includes(s) ||
      student?.studentProfile?.rollNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fee Defaulters</h1>
          <p className="text-muted-foreground text-sm">
            Students with pending or partially paid fee installments
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or roll number..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Unpaid Installments
            {pagination && (
              <Badge variant="secondary" className="ml-2">
                {pagination.total} total
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p>No fee defaulters found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Pending Installments</TableHead>
                      <TableHead className="text-right">Total Due</TableHead>
                      <TableHead className="text-right">Total Paid</TableHead>
                      <TableHead className="text-right">Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((defaulter: any) => {
                      const student = defaulter.student;
                      const cls = student?.studentProfile?.class;
                      return (
                        <TableRow key={student?.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {student?.firstName} {student?.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student?.publicUserId}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {cls
                              ? `${cls.grade}${cls.division ? ` - ${cls.division}` : ""}`
                              : "\u2014"}
                          </TableCell>
                          <TableCell>{student?.studentProfile?.rollNumber || "\u2014"}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {defaulter.pendingInstallments?.slice(0, 3).map((inst: any) => (
                                <Badge
                                  key={inst.id}
                                  variant={inst.paymentStatus === "PENDING" ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  #{inst.installementNumber} - {formatCurrency(inst.remainingAmount)}
                                </Badge>
                              ))}
                              {defaulter.pendingInstallments?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{defaulter.pendingInstallments.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(defaulter.totalDue)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(defaulter.totalPaid)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-red-600">
                            {formatCurrency(defaulter.totalRemaining)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
