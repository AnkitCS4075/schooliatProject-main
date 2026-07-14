"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateLetterhead } from "@/lib/hooks/use-super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, Bold, Italic, Underline, RefreshCw, Printer } from "lucide-react";
import { toast } from "sonner";

const letterheadSchema = z.object({
  content: z.string().min(1, "Content is required"),
  subject: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  signatureName: z.string().optional(),
  signatureDesignation: z.string().optional(),
  includeSignature: z.boolean(),
  companyName: z.string().optional(),
  companyTagline: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  logoUrl: z.string().optional(),
  themeColor: z.string().optional(),
  themeColorDark: z.string().optional(),
  hideLogo: z.boolean().optional(),
});

type LetterheadFormData = z.infer<typeof letterheadSchema>;

export default function LetterHeadPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generateLetterhead = useGenerateLetterhead();

  const form = useForm<LetterheadFormData>({
    resolver: zodResolver(letterheadSchema),
    defaultValues: {
      content: "",
      subject: "",
      date: new Date().toISOString().split("T")[0],
      signatureName: "",
      signatureDesignation: "",
      includeSignature: false,
      companyName: "",
      companyTagline: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      logoUrl: "",
      themeColor: "#0f172a",
      themeColorDark: "#1e293b",
      hideLogo: false,
    },
  });

  const includeSignature = form.watch("includeSignature");
  const hideLogo = form.watch("hideLogo");

  const handleFormatText = (format: "bold" | "italic" | "underline") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const content = form.getValues("content");

    if (start === end || content.length === 0) return;

    const selectedText = content.substring(start, end);
    let markers = "";

    switch (format) {
      case "bold":
        markers = "**";
        break;
      case "italic":
        markers = "*";
        break;
      case "underline":
        markers = "__";
        break;
    }

    if (selectedText) {
      const newContent =
        content.substring(0, start) +
        markers +
        selectedText +
        markers +
        content.substring(end);
      form.setValue("content", newContent);

      // Restore selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + markers.length,
          end + markers.length
        );
      }, 0);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await generateLetterhead.mutateAsync({
        content: values.content.trim(),
        subject: values.subject?.trim() || null,
        date: values.date,
        signatureName: values.includeSignature
          ? values.signatureName?.trim() || null
          : null,
        signatureDesignation: values.includeSignature
          ? values.signatureDesignation?.trim() || null
          : null,
        companyName: values.companyName?.trim() || null,
        companyTagline: values.companyTagline?.trim() || null,
        companyEmail: values.companyEmail?.trim() || null,
        companyPhone: values.companyPhone?.trim() || null,
        companyAddress: values.companyAddress?.trim() || null,
        logoUrl: values.logoUrl?.trim() || null,
        themeColor: values.themeColor?.trim() || null,
        themeColorDark: values.themeColorDark?.trim() || null,
        hideLogo: values.hideLogo,
      });

      if (response?.data?.html) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(response.data.html);
          printWindow.document.close();
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 250);
        }
        toast.success("Letterhead generated successfully!");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate letterhead";
      toast.error(errorMessage);
    }
  });

  const handleReset = () => {
    form.reset({
      content: "",
      subject: "",
      date: new Date().toISOString().split("T")[0],
      signatureName: "",
      signatureDesignation: "",
      includeSignature: false,
      companyName: "",
      companyTagline: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      logoUrl: "",
      themeColor: "#0f172a",
      themeColorDark: "#1e293b",
      hideLogo: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-white/25 flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Letterhead Generator</h1>
              <p className="text-sm opacity-90">
                Create and print formatted letterheads
              </p>
            </div>
          </div>
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-white/25 border-white/50 text-white hover:bg-white/35"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Letterhead Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Branding Section */}
            <div className="space-y-4 pb-6 mb-2 border-b">
              <h3 className="font-semibold text-lg text-primary">Company Branding & Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" {...form.register("companyName")} placeholder="Default: SchooliAT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyTagline">Tagline</Label>
                  <Input id="companyTagline" {...form.register("companyTagline")} placeholder="Default: COMPLETE SCHOOL SOLUTION" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email Address</Label>
                  <Input id="companyEmail" {...form.register("companyEmail")} placeholder="Default: info@schooliat.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input id="companyPhone" {...form.register("companyPhone")} placeholder="Default: +91 8551919628" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Full Address</Label>
                  <Input id="companyAddress" {...form.register("companyAddress")} placeholder="e.g., 123 Education Street, NY" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="themeColor">Primary Theme Color</Label>
                  <Input id="themeColor" type="color" {...form.register("themeColor")} className="h-10 cursor-pointer p-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="themeColorDark">Secondary Theme Color</Label>
                  <Input id="themeColorDark" type="color" {...form.register("themeColorDark")} className="h-10 cursor-pointer p-1" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 py-2 shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor="hideLogo" className="text-sm border-0 font-medium pt-1">Exclude Logo</Label>
                    </div>
                    <Switch
                      id="hideLogo"
                      checked={hideLogo}
                      onCheckedChange={(checked) => form.setValue("hideLogo", checked)}
                    />
                  </div>
                  {!hideLogo && (
                    <div className="pt-1">
                      <Input id="logoUrl" {...form.register("logoUrl")} placeholder="Custom external Logo URL" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date")}
                error={form.formState.errors.date?.message}
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                {...form.register("subject")}
                placeholder="e.g., Regarding Annual Meeting"
                error={form.formState.errors.subject?.message}
              />
            </div>

            {/* Content Field with Formatting Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Enter your text *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleFormatText("bold")}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleFormatText("italic")}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleFormatText("underline")}
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                id="content"
                {...form.register("content")}
                ref={(e) => {
                  textareaRef.current = e;
                  form.register("content").ref(e);
                }}
                rows={15}
                placeholder="Enter the content for your letterhead here. Select text and use formatting buttons for bold, italic, or underline."
                error={form.formState.errors.content?.message}
              />
              <p className="text-xs text-gray-500 italic">
                Tip: Select text and click formatting buttons. Use **text** for
                bold, *text* for italic, __text__ for underline.
              </p>
            </div>

            {/* Signature Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label>Signature (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="includeSignature" className="text-sm">
                    Include Signature
                  </Label>
                  <Switch
                    id="includeSignature"
                    checked={includeSignature}
                    onCheckedChange={(checked) =>
                      form.setValue("includeSignature", checked)
                    }
                  />
                </div>
              </div>

              {includeSignature && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signatureName">Name</Label>
                    <Input
                      id="signatureName"
                      {...form.register("signatureName")}
                      placeholder="e.g., John Doe"
                      error={form.formState.errors.signatureName?.message}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signatureDesignation">Designation</Label>
                    <Input
                      id="signatureDesignation"
                      {...form.register("signatureDesignation")}
                      placeholder="e.g., Principal"
                      error={
                        form.formState.errors.signatureDesignation?.message
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Formatting Tips */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary font-semibold">
                  Formatting Tips
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Use line breaks to separate paragraphs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>
                    The content will be formatted on a professional letterhead
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>
                    Click &quot;Generate & Print&quot; to create and print your letterhead
                  </span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
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
                disabled={generateLetterhead.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                {generateLetterhead.isPending ? (
                  "Generating..."
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Generate & Print
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-primary mt-0.5">ℹ️</span>
        <p className="text-sm text-blue-800">
          The letterhead will open in a new window for printing. No data is
          saved - each letterhead is generated fresh when needed.
        </p>
      </div>
    </div>
  );
}
