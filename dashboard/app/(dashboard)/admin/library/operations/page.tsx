"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePendingLibraryReturns,
  useReturnBook,
  useLibraryDashboard,
  useCalculateFines,
} from "@/lib/hooks/use-library";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  BookCheck,
  BookX,
  Library,
  RotateCcw,
  Calculator,
  PlusCircle,
} from "lucide-react";
import { format } from "date-fns";

export default function LibraryOperationsPage() {
  const { data: pendingReturns, isLoading, refetch } = usePendingLibraryReturns();
  const { data: dashboardData } = useLibraryDashboard();
  const returnBook = useReturnBook();
  const calculateFines = useCalculateFines();

  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [remarks, setRemarks] = useState("");

  const list = Array.isArray(pendingReturns) ? pendingReturns : [];
  const dashboard = dashboardData?.data ?? {};
  const issuedCount = dashboard.issuedBooks ?? 0;
  const overdueCount = dashboard.overdueBooks ?? 0;

  const handleReturnClick = (issue: any) => {
    setSelectedIssue(issue);
    setRemarks("");
    setReturnDialogOpen(true);
  };

  const handleReturnConfirm = async () => {
    if (!selectedIssue?.id) return;
    try {
      await returnBook.mutateAsync({
        issueId: selectedIssue.id,
        remarks: remarks.trim() || undefined,
      });
      toast.success("Book returned successfully");
      setReturnDialogOpen(false);
      setSelectedIssue(null);
      setRemarks("");
      refetch();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to return book");
    }
  };

  const handleCalculateFines = async () => {
    try {
      const res = await calculateFines.mutateAsync();
      const data = res?.data ?? {};
      const count = data.updatedCount ?? data.totalOverdue ?? 0;
      toast.success(count > 0 ? `Updated ${count} overdue fine(s)` : "No overdue books to update");
      refetch();
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to calculate fines");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      case "ISSUED":
        return <Badge className="bg-primary/80 hover:bg-primary">Issued</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/library">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Library Operations</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Pending returns, issue books, and overdue fines
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCalculateFines} disabled={calculateFines.isPending}>
            <Calculator className="h-4 w-4 mr-2" />
            {calculateFines.isPending ? "Calculating..." : "Calculate overdue fines"}
          </Button>
          <Link href="/admin/library">
            <Button size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Issue a book
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Library className="h-4 w-4" />
              Total books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.totalBooks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.availableBooks ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookCheck className="h-4 w-4" />
              Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookX className="h-4 w-4" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Pending returns ({list.length})
          </CardTitle>
          <CardDescription>
            Books currently issued. Process returns and optionally add remarks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : list.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <BookCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No pending returns</p>
              <p className="text-sm mt-1">All books are returned or none issued yet.</p>
              <Link href="/admin/library">
                <Button variant="outline" className="mt-4">
                  Go to Books to issue
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-schooliat-tint">
                    <TableHead>Book</TableHead>
                    <TableHead>Borrower</TableHead>
                    <TableHead>Issue date</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fine</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((issue: any) => (
                    <TableRow key={issue.id}>
                      <TableCell className="font-medium">
                        {issue.book?.title ?? "N/A"}
                      </TableCell>
                      <TableCell>{issue.borrowerName ?? issue.userId}</TableCell>
                      <TableCell>
                        {issue.issuedDate
                          ? format(new Date(issue.issuedDate), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {issue.dueDate
                          ? format(new Date(issue.dueDate), "MMM dd, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell>{getStatusBadge(issue.status)}</TableCell>
                      <TableCell>
                        {issue.fineAmount != null && issue.fineAmount > 0
                          ? `₹${issue.fineAmount}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturnClick(issue)}
                          disabled={returnBook.isPending}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm return</DialogTitle>
            <DialogDescription>
              Record this book as returned. Optionally add remarks (e.g. condition).
            </DialogDescription>
          </DialogHeader>
          {selectedIssue && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{selectedIssue.book?.title ?? "Book"}</span>
                {" – "}
                {selectedIssue.borrowerName ?? selectedIssue.userId}
              </p>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (optional)</Label>
                <Textarea
                  id="remarks"
                  placeholder="e.g. Good condition"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnConfirm} disabled={returnBook.isPending}>
              {returnBook.isPending ? "Returning..." : "Return book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
