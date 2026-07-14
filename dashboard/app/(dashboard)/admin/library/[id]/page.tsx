"use client";

import { useParams, useRouter } from "next/navigation";
import { useBookById } from "@/lib/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function LibraryBookViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, error } = useBookById(id);
  const book = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="space-y-6 pb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/library")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Book not found or you don’t have access to it.
          </CardContent>
        </Card>
      </div>
    );
  }

  const available = book.availableCopies ?? 0;
  const total = book.totalCopies ?? 0;
  const availabilityBadge =
    total === 0
      ? "Unavailable"
      : (available / total) * 100 < 30
        ? "Low Stock"
        : "Available";

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/library")}
          className="gap-2 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <div className="flex gap-2">
          {available > 0 && (
            <Button
              onClick={() => router.push(`/admin/library/${id}/issue`)}
              className="gap-2"
            >
              Issue Book
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/library/${id}/edit`)}
            className="gap-2"
          >
            Edit Book
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <CardTitle>{book.title}</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{book.category || "General"}</Badge>
            <Badge>{availabilityBadge}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Author</dt>
              <dd>{book.author || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">ISBN</dt>
              <dd>{book.isbn || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Publisher</dt>
              <dd>{book.publisher || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Published year</dt>
              <dd>{book.publishedYear ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Language</dt>
              <dd>{book.language || "English"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Stock</dt>
              <dd>
                {book.availableCopies ?? 0} / {book.totalCopies ?? 0} available
              </dd>
            </div>
            {book.location && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                <dd>{book.location}</dd>
              </div>
            )}
          </dl>
          {book.description && (
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">Description</dt>
              <dd className="text-sm text-muted-foreground whitespace-pre-wrap">
                {book.description}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
