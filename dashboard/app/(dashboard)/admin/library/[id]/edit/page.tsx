"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBookById, useUpdateBook } from "@/lib/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const editBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(100),
  isbn: z.string().optional(),
  category: z.string().optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(2100).optional(),
  description: z.string().optional(),
  totalCopies: z.number().int().min(1, "At least 1 copy required"),
});

type EditBookFormData = z.infer<typeof editBookSchema>;

export default function LibraryBookEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, isLoading, error } = useBookById(id);
  const updateBook = useUpdateBook();
  const book = data?.data;

  const form = useForm<EditBookFormData>({
    resolver: zodResolver(editBookSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      category: "",
      publisher: "",
      publishedYear: undefined,
      description: "",
      totalCopies: 1,
    },
  });

  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title ?? "",
        author: book.author ?? "",
        isbn: book.isbn ?? "",
        category: book.category ?? "",
        publisher: book.publisher ?? "",
        publishedYear: book.publishedYear ?? undefined,
        description: book.description ?? "",
        totalCopies: book.totalCopies ?? 1,
      });
    }
  }, [book, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateBook.mutateAsync({
        id,
        title: values.title,
        author: values.author,
        isbn: values.isbn || undefined,
        category: values.category || undefined,
        publisher: values.publisher || undefined,
        publishedYear: values.publishedYear ?? undefined,
        description: values.description || undefined,
        totalCopies: values.totalCopies,
      });
      toast.success("Book updated successfully.");
      router.push(`/admin/library/${id}`);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update book.";
      toast.error(msg);
    }
  });

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

  return (
    <div className="space-y-6 pb-8">
      <Button
        variant="ghost"
        onClick={() => router.push(`/admin/library/${id}`)}
        className="gap-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Book
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Book title"
                className="mt-1"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...form.register("author")}
                placeholder="Author name"
                className="mt-1"
              />
              {form.formState.errors.author && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.author.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                {...form.register("isbn")}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register("category")}
                placeholder="e.g. Academic, Reference"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="publisher">Publisher</Label>
              <Input
                id="publisher"
                {...form.register("publisher")}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="publishedYear">Published year</Label>
              <Input
                id="publishedYear"
                type="number"
                {...form.register("publishedYear", {
                  setValueAs: (v) =>
                    v === "" || v === undefined ? undefined : Number(v),
                })}
                placeholder="e.g. 2024"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="totalCopies">Total copies *</Label>
              <Input
                id="totalCopies"
                type="number"
                min={1}
                {...form.register("totalCopies", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.totalCopies && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.totalCopies.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Optional"
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateBook.isPending}>
                {updateBook.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/library/${id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
