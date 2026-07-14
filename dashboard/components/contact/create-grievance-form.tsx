"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormCard } from "@/components/forms/form-card";
import { RadioGroup } from "@/components/forms/radio-group";
import { useCreateGrievance } from "@/lib/hooks/use-grievances";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageSquare } from "lucide-react";

const grievanceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be at most 2000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type GrievanceFormData = z.infer<typeof grievanceSchema>;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", color: "#6b7280" },
  { value: "MEDIUM", label: "Medium", color: "#3b82f6" },
  { value: "HIGH", label: "High", color: "#f59e0b" },
  { value: "URGENT", label: "Urgent", color: "#ef4444" },
];

export function CreateGrievanceForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createGrievance = useCreateGrievance();

  const form = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createGrievance.mutateAsync(values);
      toast({
        title: "Success",
        description: "Grievance submitted successfully!",
      });
      router.back();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to submit grievance",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">New Grievance</h1>
          <p className="text-gray-600 mt-1">
            Let us know about your issue and we'll help resolve it
          </p>
        </div>
      </div>

      <FormCard title="Grievance Details" icon={<MessageSquare className="w-5 h-5" />}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief summary of your issue"
              {...form.register("title")}
              error={form.formState.errors.title?.message}
            />
            <div className="text-sm text-gray-500 mt-1">
              {form.watch("title").length}/200 characters
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your issue..."
              rows={6}
              {...form.register("description")}
              error={form.formState.errors.description?.message}
            />
            <div className="text-sm text-gray-500 mt-1">
              {form.watch("description").length}/2000 characters
            </div>
          </div>

          <div>
            <Label>Priority *</Label>
            <RadioGroup
              value={form.watch("priority")}
              onChange={(value) => form.setValue("priority", value as any)}
              options={PRIORITY_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createGrievance.isPending}
              className="flex-1"
            >
              {createGrievance.isPending ? "Submitting..." : "Submit Grievance"}
            </Button>
          </div>
        </form>
      </FormCard>
    </div>
  );
}


