"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormCard } from "@/components/forms/form-card";
import { HelpCircle, MessageSquare, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { post } from "@/lib/api/client";
import { useFAQs } from "@/lib/hooks/use-ai";
import { Skeleton } from "@/components/ui/skeleton";

const helpQuerySchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type HelpQueryFormData = z.infer<typeof helpQuerySchema>;

interface HelpCenterProps {
  showQueryForm?: boolean;
}

export function HelpCenter({ showQueryForm = true }: HelpCenterProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: faqResponse, isLoading: faqsLoading, isError: faqsError } =
    useFAQs({ limit: 50, page: 1 });

  const faqs = (faqResponse?.data ?? []) as Array<{
    id: string;
    question: string;
    answer: string;
    category?: string | null;
  }>;

  const form = useForm<HelpQueryFormData>({
    resolver: zodResolver(helpQuerySchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await post("/grievances", {
        request: {
          title: `[Support] ${values.subject}`,
          description: values.message,
          priority: "MEDIUM",
        },
      });
      form.reset();
      toast({
        title: "Success",
        description: "Your query has been submitted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.message || "Failed to submit query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Help Center</h1>
        <p className="text-gray-600 mt-2">
          {showQueryForm
            ? "Find answers to common questions or submit a query"
            : "Find answers to common questions"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <BookOpen className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Documentation</h3>
            <p className="text-sm text-gray-600">
              FAQs below are managed for your school and platform. Use Submit a
              Query for anything not listed.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <MessageSquare className="w-6 h-6 text-primary mb-2" />
            <h3 className="font-semibold">Support</h3>
            <p className="text-sm text-gray-600">
              Submit a query and the SchooliAT team will respond via your
              grievance thread.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <FormCard title="Frequently Asked Questions">
            <div className="space-y-4">
              {faqsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : faqsError ? (
                <p className="text-sm text-muted-foreground">
                  Could not load FAQs. You can still submit a query below.
                </p>
              ) : faqs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No published FAQs yet. Your administrator can add them under
                  AI / FAQ management, or use Submit a Query for help.
                </p>
              ) : (
                faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border-b pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <h4 className="font-semibold">{faq.question}</h4>
                    </div>
                    <p className="text-sm text-gray-600 ml-7 whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                ))
              )}
            </div>
          </FormCard>

          {showQueryForm && (
            <FormCard title="Submit a Query">
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What do you need help with?"
                    {...form.register("subject")}
                    error={form.formState.errors.subject?.message}
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or question..."
                    rows={6}
                    {...form.register("message")}
                    error={form.formState.errors.message?.message}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                      Submitting…
                    </>
                  ) : (
                    "Submit Query"
                  )}
                </Button>
              </form>
            </FormCard>
          )}
        </div>
      </div>
    </div>
  );
}
