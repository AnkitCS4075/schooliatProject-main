"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGenerateLetterhead,
  useLetterheadHistory,
  useIssueLetterhead,
  useReprintLetterhead,
} from "@/lib/hooks/use-super-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Bold,
  Italic,
  Underline,
  RefreshCw,
  Printer,
  Save,
  Search,
  Send,
  Copy,
  Loader2,
} from "lucide-react";
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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-800" },
  ISSUED: { label: "Issued", className: "bg-green-100 text-green-800" },
};

function printHtml(html: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast.error("Popup blocked. Please allow popups for this site.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}

export function LetterheadManagement() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState("generate");
  const [documentType, setDocumentType] = useState("LETTER");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const generateLetterhead = useGenerateLetterhead();
  const issueMutation = useIssueLetterhead();
  const reprintMutation = useReprintLetterhead();

  const { data: historyData, isLoading: historyLoading } = useLetterheadHistory({
    page,
    limit: 20,
    search: search || undefined,
  });

  const historyItems = historyData?.data?.items || [];
  const pagination = historyData?.data?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

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

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + markers.length,
          end + markers.length
        );
      }, 0);
    }
  };

  const buildPayload = (values: LetterheadFormData, isDraft: boolean) => ({
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
    isDraft,
    documentType,
  });

  const onGenerate = form.handleSubmit(async (values) => {
    try {
      const response = await generateLetterhead.mutateAsync(
        buildPayload(values, false)
      );
      if (response?.data?.html) {
        printHtml(response.data.html);
        toast.success(
          response.data.serialNumber
            ? `Letterhead issued (${response.data.serialNumber})`
            : "Letterhead generated successfully!"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate letterhead";
      toast.error(errorMessage);
    }
  });

  const onSaveDraft = form.handleSubmit(async (values) => {
    try {
      const response = await generateLetterhead.mutateAsync(
        buildPayload(values, true)
      );
      toast.success("Letterhead draft saved!");
      setActiveTab("history");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save draft";
      toast.error(errorMessage);
    }
  });

  const handleIssue = async (id: string) => {
    try {
      const res = await issueMutation.mutateAsync(id);
      toast.success(
        `Letterhead issued (${res?.data?.serial_number || "serial assigned"})`
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to issue letterhead");
    }
  };

  const handleReprint = async (id: string) => {
    try {
      const res = await reprintMutation.mutateAsync(id);
      if (res?.data?.html) {
        printHtml(res.data.html);
        toast.success("Reprint generated with DUPLICATE watermark");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reprint letterhead");
    }
  };

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

  const runSearch = () => {
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6">
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
              <h1 className="text-3xl font-bold mb-1">Letterhead Management</h1>
              <p className="text-sm opacity-90">
                Create, save drafts, issue with serial numbers and reprint with
                DUPLICATE watermark
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="generate">Generate Letterhead</TabsTrigger>
          <TabsTrigger value="history">
            History & Issued
            {pagination.total > 0 && (
              <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                {pagination.total}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Generate tab ─────────────────────────────────────────── */}
        <TabsContent value="generate" className="space-y-6">
          <form onSubmit={onGenerate} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Letterhead Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 pb-6 mb-2 border-b">
                  <h3 className="font-semibold text-lg text-primary">
                    Company Branding & Theme
                  </h3>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="documentType">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LETTER">Letter</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                        <SelectItem value="NOTICE">Notice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      {...form.register("date")}
                      error={form.formState.errors.date?.message}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    {...form.register("subject")}
                    placeholder="e.g., Regarding Annual Meeting"
                    error={form.formState.errors.subject?.message}
                  />
                </div>

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
                    type="button"
                    variant="secondary"
                    disabled={generateLetterhead.isPending}
                    onClick={onSaveDraft}
                    className="flex-1"
                  >
                    {generateLetterhead.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save as Draft
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
                        <Send className="w-4 h-4 mr-2" />
                        Generate & Issue
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* ── History tab ──────────────────────────────────────────── */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Letterhead History
              </CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  placeholder="Search subject, content, created by..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  className="md:w-72"
                />
                <Button type="button" onClick={runSearch} variant="outline">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Loading history...
                </div>
              ) : historyItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mb-3 opacity-40" />
                  <p className="font-medium">No letterheads yet</p>
                  <p className="text-sm">
                    Generate or save a draft from the "Generate Letterhead" tab.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item: any) => {
                      const badge = STATUS_BADGE[item.status] || {
                        label: item.status || "Unknown",
                        className: "bg-gray-100 text-gray-800",
                      };
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-[220px] truncate">
                            {item.subject || "—"}
                          </TableCell>
                          <TableCell>
                            {item.date_value
                              ? new Date(item.date_value).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.document_type || "LETTER"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={badge.className}>
                              {badge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {item.serial_number || "—"}
                          </TableCell>
                          <TableCell>{item.created_by_name || "—"}</TableCell>
                          <TableCell>{item.issued_by_name || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                title="View & Print"
                                onClick={() => printHtml(item.generated_html)}
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              {item.status === "DRAFT" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  title="Issue & assign serial number"
                                  disabled={issueMutation.isPending}
                                  onClick={() => handleIssue(item.id)}
                                >
                                  <Send className="w-4 h-4" />
                                  Issue
                                </Button>
                              )}
                              {item.status === "ISSUED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Reprint with DUPLICATE watermark"
                                  disabled={reprintMutation.isPending}
                                  onClick={() => handleReprint(item.id)}
                                >
                                  <Copy className="w-4 h-4" />
                                  Reprint
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages} ·{" "}
                    {pagination.total} total
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
