"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const schema = z.object({
  deletionOtpEmail: z
    .string()
    .optional()
    .refine((v) => !v?.trim() || z.string().email().safeParse(v.trim()).success, {
      message: "Invalid email",
    }),
});

type FormValues = z.infer<typeof schema>;

export function DeletionOtpEmailSection() {
  const { data, isLoading } = useSettings();
  const update = useUpdateSettings();
  const settings = data?.data;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { deletionOtpEmail: "" },
  });

  useEffect(() => {
    const raw = settings?.deletionOtpEmail;
    form.reset({
      deletionOtpEmail: typeof raw === "string" ? raw : "",
    });
  }, [settings?.deletionOtpEmail, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const trimmed = values.deletionOtpEmail?.trim() ?? "";
      await update.mutateAsync({
        request: {
          deletionOtpEmail: trimmed === "" ? null : trimmed,
        },
      });
      toast.success("Deletion email saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5" />
          Deletion verification email
        </CardTitle>
        <CardDescription>
          When staff delete records (students, classes, fees-related data, etc.), a one-time code is sent
          here. Leave blank to send codes to your own admin login email instead.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="deletionOtpEmail">Email for delete OTPs</Label>
              <Input
                id="deletionOtpEmail"
                type="email"
                autoComplete="email"
                placeholder="e.g. principal@school.edu"
                {...form.register("deletionOtpEmail")}
              />
              {form.formState.errors.deletionOtpEmail ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.deletionOtpEmail.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
