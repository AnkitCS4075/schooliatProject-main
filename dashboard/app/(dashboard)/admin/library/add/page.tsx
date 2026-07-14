"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateBook } from "@/lib/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const addBookSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  author: z.string().min(1, "Author is required").max(100),
  isbn: z.string().optional(),
  category: z.string().optional(),
  publisher: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(2100).optional(),
  description: z.string().optional(),
  totalCopies: z.number().int().min(1, "At least 1 copy required"),
});

type AddBookFormData = z.infer<typeof addBookSchema>;

export default function LibraryAddPage() {
  const router = useRouter();
  const createBook = useCreateBook();

  const form = useForm<AddBookFormData>({
    resolver: zodResolver(addBookSchema),
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

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createBook.mutateAsync({
        title: values.title,
        author: values.author,
        isbn: values.isbn || undefined,
        category: values.category || undefined,
        publisher: values.publisher || undefined,
        publishedYear: values.publishedYear ?? undefined,
        description: values.description || undefined,
        totalCopies: values.totalCopies,
        availableCopies: values.totalCopies,
      });
      toast.success("Book added successfully.");
      router.push("/admin/library");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to add book.";
      toast.error(msg);
    }
  });

  return (
    <div className="space-y-6 pb-8">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/library")}
        className="gap-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Book</CardTitle>
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
                  setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)),
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
              <Button type="submit" disabled={createBook.isPending}>
                {createBook.isPending ? "Adding..." : "Add Book"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/library")}
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
