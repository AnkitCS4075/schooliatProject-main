"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  useBooks,
  useLibraryDashboard,
  useLibraryHistory,
  useDeleteBook,
  useIssueBook,
  useReturnBook,
  useBulkUploadBooks,
} from "@/lib/hooks/use-library";
import { DeletionOtpDialog } from "@/components/deletion/deletion-otp-dialog";
import { SCHOOL_DELETION_ENTITY } from "@/lib/deletion/school-deletion-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Search,
  BookCheck,
  BookX,
  Library,
  Upload,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LibraryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"books" | "history" | "dashboard">("books");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "author" | "isbn">("title");
  const [bookOtpId, setBookOtpId] = useState<string | null>(null);
  const limit = 15;

  const { data: booksData, isLoading: booksLoading, refetch: refetchBooks } = useBooks({
    page,
    limit,
    ...(searchQuery && searchType === "title" && { title: searchQuery }),
    ...(searchQuery && searchType === "author" && { author: searchQuery }),
    ...(searchQuery && searchType === "isbn" && { isbn: searchQuery }),
  });

  const { data: dashboardData, isLoading: dashboardLoading } = useLibraryDashboard();
  const { data: historyData, isLoading: historyLoading } = useLibraryHistory({
    page,
    limit,
  });

  const deleteBook = useDeleteBook();
  const issueBook = useIssueBook();
  const returnBook = useReturnBook();
  const bulkUpload = useBulkUploadBooks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const books = booksData?.data || [];
  const history = historyData?.data || [];
  const dashboard = dashboardData?.data || {};
  const totalPages = booksData?.pagination?.totalPages || 1;
  const historyTotalPages = historyData?.pagination?.totalPages || 1;

  const handleView = useCallback(
    (book: any) => {
      router.push(`/admin/library/${book.id}`);
    },
    [router]
  );

  const handleEdit = useCallback(
    (book: any) => {
      router.push(`/admin/library/${book.id}/edit`);
    },
    [router]
  );

  const handleDelete = useCallback((bookId: string) => {
    setBookOtpId(bookId);
  }, []);

  const handleAddNew = useCallback(() => {
    router.push("/admin/library/add");
  }, [router]);

  const handleIssue = useCallback(
    async (book: any) => {
      router.push(`/admin/library/${book.id}/issue`);
    },
    [router]
  );

  const handleBulkUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV file must have a header row and at least one data row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const titleIdx = headers.findIndex((h) => h.includes("title"));
      const authorIdx = headers.findIndex((h) => h.includes("author"));

      if (titleIdx === -1 || authorIdx === -1) {
        toast.error("CSV must have 'title' and 'author' columns");
        return;
      }

      const isbnIdx = headers.findIndex((h) => h.includes("isbn"));
      const publisherIdx = headers.findIndex((h) => h.includes("publisher"));
      const categoryIdx = headers.findIndex((h) => h.includes("category"));
      const copiesIdx = headers.findIndex((h) => h.includes("copies") || h.includes("quantity"));
      const locationIdx = headers.findIndex((h) => h.includes("location"));
      const languageIdx = headers.findIndex((h) => h.includes("language"));
      const yearIdx = headers.findIndex((h) => h.includes("year"));

      const books = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          title: cols[titleIdx] || "",
          author: cols[authorIdx] || "",
          isbn: isbnIdx >= 0 ? cols[isbnIdx] || undefined : undefined,
          publisher: publisherIdx >= 0 ? cols[publisherIdx] || undefined : undefined,
          category: categoryIdx >= 0 ? cols[categoryIdx] || undefined : undefined,
          totalCopies: copiesIdx >= 0 ? parseInt(cols[copiesIdx]) || 1 : 1,
          location: locationIdx >= 0 ? cols[locationIdx] || undefined : undefined,
          language: languageIdx >= 0 ? cols[languageIdx] || undefined : undefined,
          publishedYear: yearIdx >= 0 ? parseInt(cols[yearIdx]) || undefined : undefined,
        };
      }).filter((b) => b.title && b.author);

      if (books.length === 0) {
        toast.error("No valid book entries found in CSV");
        return;
      }

      try {
        const result = await bulkUpload.mutateAsync({ books });
        toast.success(result?.message || `${books.length} books uploaded successfully`);
        refetchBooks();
      } catch (error: any) {
        toast.error(error?.message || "Failed to upload books");
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [bulkUpload, refetchBooks]
  );

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0;
    if (percentage === 0) {
      return <Badge variant="destructive">Unavailable</Badge>;
    } else if (percentage < 30) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Low Stock</Badge>;
    } else {
      return <Badge className="bg-primary hover:bg-schooliat-primary-dark">Available</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ISSUED":
        return <Badge className="bg-primary/80 hover:bg-primary">Issued</Badge>;
      case "RETURNED":
        return <Badge className="bg-primary hover:bg-schooliat-primary-dark">Returned</Badge>;
      case "OVERDUE":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library Management</h1>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleBulkUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2"
            disabled={bulkUpload.isPending}
          >
            <Upload className="h-4 w-4" />
            {bulkUpload.isPending ? "Uploading..." : "Bulk Upload"}
          </Button>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Select value={searchType} onValueChange={(v) => setSearchType(v as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="author">Author</SelectItem>
                    <SelectItem value="isbn">ISBN</SelectItem>
                  </SelectContent>
                </Select>
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Books Table */}
          <Card>
            <CardHeader>
              <CardTitle>Library Books</CardTitle>
            </CardHeader>
            <CardContent>
              {booksLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-schooliat-tint">
                          <TableHead className="w-16">No</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>ISBN</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Availability</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="w-40">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No books found
                            </TableCell>
                          </TableRow>
                        ) : (
                          books.map((book: any, index: number) => (
                            <TableRow key={book.id}>
                              <TableCell className="font-medium">
                                {String((page - 1) * limit + index + 1).padStart(2, "0")}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-gray-400" />
                                  {book.title}
                                </div>
                              </TableCell>
                              <TableCell>{book.author || "N/A"}</TableCell>
                              <TableCell>{book.isbn || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{book.category || "General"}</Badge>
                              </TableCell>
                              <TableCell>
                                {getAvailabilityBadge(
                                  book.availableCopies || 0,
                                  book.totalCopies || 0
                                )}
                              </TableCell>
                              <TableCell>
                                {book.availableCopies || 0} / {book.totalCopies || 0}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(book)}
                                    className="h-8 w-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(book)}
                                    className="h-8 w-8"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {book.availableCopies > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleIssue(book)}
                                      className="h-8 w-8 text-primary"
                                      title="Issue Book"
                                    >
                                      <BookCheck className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(book.id)}
                                    disabled={deleteBook.isPending}
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue History</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-schooliat-tint">
                          <TableHead>Book</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Return Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Fine</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              No history found
                            </TableCell>
                          </TableRow>
                        ) : (
                          history.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.book?.title || "N/A"}
                              </TableCell>
                              <TableCell>
                                {item.user?.firstName || ""} {item.user?.lastName || ""}
                              </TableCell>
                              <TableCell>
                                {item.issuedDate
                                  ? new Date(item.issuedDate).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {item.dueDate
                                  ? new Date(item.dueDate).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>
                                {item.returnDate
                                  ? new Date(item.returnDate).toLocaleDateString()
                                  : "N/A"}
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                              <TableCell>
                                {item.fineAmount ? `₹${item.fineAmount}` : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {historyTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Page {page} of {historyTotalPages}
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
                          disabled={page === historyTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Library className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{dashboard.totalBooks || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Available Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{dashboard.availableBooks || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Issued Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookCheck className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{dashboard.issuedBooks || 0}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Overdue Books
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookX className="h-8 w-8 text-red-600" />
                    <div className="text-3xl font-bold">{dashboard.overdueBooks || 0}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DeletionOtpDialog
        open={!!bookOtpId}
        onOpenChange={(open) => !open && setBookOtpId(null)}
        audience="school-admin"
        title="Delete book"
        description="This removes the book from your library catalog. Confirm with the code sent to your deletion email."
        entityType={SCHOOL_DELETION_ENTITY.LIBRARY_BOOK}
        entityId={bookOtpId ?? ""}
        isDeleting={deleteBook.isPending}
        onDeleteWithOtp={async (otp) => {
          if (!bookOtpId) return;
          await deleteBook.mutateAsync({ id: bookOtpId, otp });
          toast.success("Book deleted successfully!");
          refetchBooks();
        }}
      />
    </div>
  );
}

