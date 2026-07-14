"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useBookById, useIssueBook } from "@/lib/hooks/use-library";
import { useStudents } from "@/lib/hooks/use-students";
import { TEACHERS_MAX_PAGE_SIZE, useTeachersPage } from "@/lib/hooks/use-teachers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowerSearchSelect, type BorrowerOption } from "@/components/library/borrower-search-select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const issueBookSchema = z.object({
  userId: z.string().min(1, "Select a borrower"),
  dueDate: z.string().min(1, "Due date is required"),
});

type IssueBookFormData = z.infer<typeof issueBookSchema>;

export default function LibraryIssuePage() {
  const params = useParams();
  const router = useRouter();
  const bookId = typeof params.id === "string" ? params.id : "";

  const { data: bookData, isLoading: bookLoading, error: bookError } = useBookById(bookId);
  const { data: studentsRes, isLoading: studentsLoading } = useStudents({
    page: 1,
    limit: 500,
  });
  const { data: teachersRes, isLoading: teachersLoading } = useTeachersPage(
    1,
    TEACHERS_MAX_PAGE_SIZE
  );
  const borrowersLoading = studentsLoading || teachersLoading;

  const issueBook = useIssueBook();
  const book = bookData?.data;

  const students = studentsRes?.data ?? [];
  const teachers = teachersRes?.data ?? [];

  const borrowerOptions = useMemo((): BorrowerOption[] => {
    const list: BorrowerOption[] = [];

    students.forEach(
      (s: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        publicUserId?: string;
        studentProfile?: { rollNumber?: string | number };
      }) => {
        const name =
          [s.firstName, s.lastName].filter(Boolean).join(" ").trim() || s.id;
        const email = (s.email || "").trim();
        const pid = (s.publicUserId || "").trim();
        const roll =
          s.studentProfile?.rollNumber != null
            ? String(s.studentProfile.rollNumber)
            : "";
        const searchText = [name, email, pid, roll, "student"]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const labelParts = [`${name} (Student)`];
        if (pid) labelParts.push(pid);
        if (roll) labelParts.push(`Roll ${roll}`);
        list.push({
          id: s.id,
          label: labelParts.join(" · "),
          searchText,
        });
      }
    );

    teachers.forEach(
      (t: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        publicUserId?: string;
      }) => {
        const name =
          [t.firstName, t.lastName].filter(Boolean).join(" ").trim() || t.id;
        const email = (t.email || "").trim();
        const pid = (t.publicUserId || "").trim();
        const searchText = [name, email, pid, "teacher"]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const labelParts = [`${name} (Teacher)`];
        if (pid) labelParts.push(pid);
        list.push({
          id: t.id,
          label: labelParts.join(" · "),
          searchText,
        });
      }
    );

    return list;
  }, [students, teachers]);

  const form = useForm<IssueBookFormData>({
    resolver: zodResolver(issueBookSchema),
    defaultValues: {
      userId: "",
      dueDate: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await issueBook.mutateAsync({
        bookId,
        userId: values.userId,
        dueDate: new Date(values.dueDate).toISOString(),
      });
      toast.success("Book issued successfully.");
      router.push("/admin/library");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to issue book.";
      toast.error(msg);
    }
  });

  if (bookLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="space-y-6 pb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/library")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Book not found or not available to issue.
          </CardContent>
        </Card>
      </div>
    );
  }

  const available = book.availableCopies ?? 0;
  if (available < 1) {
    return (
      <div className="space-y-6 pb-8">
        <Button variant="ghost" onClick={() => router.push("/admin/library")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            This book has no copies available to issue.
          </CardContent>
        </Card>
      </div>
    );
  }

  const minDueDate = new Date();
  minDueDate.setDate(minDueDate.getDate() + 1);
  const minDueStr = minDueDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-8">
      <Button
        variant="ghost"
        onClick={() => router.push(`/admin/library/${bookId}`)}
        className="gap-2 w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Book
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Issue Book</CardTitle>
          <p className="text-sm text-muted-foreground">
            {book.title} — {book.author}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            <div>
              <Label className="mb-1 block">Borrower *</Label>
              <BorrowerSearchSelect
                value={form.watch("userId")}
                onChange={(userId) => form.setValue("userId", userId, { shouldValidate: true })}
                options={borrowerOptions}
                loading={borrowersLoading}
                disabled={issueBook.isPending}
                emptyHint="No students or teachers found for this school."
                error={form.formState.errors.userId?.message}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due date *</Label>
              <Input
                id="dueDate"
                type="date"
                min={minDueStr}
                {...form.register("dueDate")}
                className="mt-1"
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.dueDate.message}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={issueBook.isPending}>
                {issueBook.isPending ? "Issuing..." : "Issue Book"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/library/${bookId}`)}
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
