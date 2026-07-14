"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Eye, Download, Loader2 } from "lucide-react";
import {
  useTemplates,
  useTemplateDefaults,
  type Template,
} from "@/lib/hooks/use-templates";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { downloadFromApi } from "@/lib/api/client";

interface TemplateWithUrls extends Template {
  previewUrl?: string;
  downloadUrl?: string;
}

function TemplatePreviewFrame({ templateId }: { templateId: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!templateId) return;

    const fetchPreview = async () => {
      try {
        const blob = await downloadFromApi(`/templates/${templateId}/preview`);
        const text = await blob.text();
        setHtml(text);
        setError(false);
      } catch {
        setError(true);
      }
    };

    fetchPreview();
  }, [templateId]);

  if (error || !html) {
    return (
      <div className="flex items-center justify-center h-full">
        <FileText className="w-16 h-16 text-gray-400" />
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      title="Template Preview"
      className="w-full h-full border-0 pointer-events-none"
      style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
      sandbox="allow-same-origin"
    />
  );
}

function TemplateFullPreview({ templateId }: { templateId: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateId) return;

    const fetchPreview = async () => {
      setLoading(true);
      try {
        const blob = await downloadFromApi(`/templates/${templateId}/preview`);
        const text = await blob.text();
        setHtml(text);
      } catch {
        setHtml(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Preview not available
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      title="Template Preview"
      className="w-full h-full border-0"
      sandbox="allow-same-origin"
    />
  );
}

export type TemplatesCatalogVariant = "page" | "embedded";

export type TemplatesCatalogProps = {
  /** `embedded`: used inside Settings (no page-level title). `page`: standalone route. */
  variant?: TemplatesCatalogVariant;
};

export function TemplatesCatalog({ variant = "page" }: TemplatesCatalogProps) {
  const embedded = variant === "embedded";
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithUrls | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const { data, isLoading } = useTemplates(filterType === "all" ? undefined : filterType);
  const { data: defaultsData } = useTemplateDefaults(selectedTemplate?.id || "");

  const templates = (data?.data || []) as TemplateWithUrls[];
  const filteredTemplates = templates.filter((template: TemplateWithUrls) =>
    template.title?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const templateTypes = Array.from(new Set(templates.map((t: TemplateWithUrls) => t.type)));

  const handleDownload = async (template: TemplateWithUrls) => {
    setIsDownloading(true);
    try {
      const blob = await downloadFromApi(`/templates/${template.id}/download`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.title || "template"}-sample.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Error",
        description: "Failed to download template sample",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const openPreview = (template: TemplateWithUrls) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-4">
      {!embedded && (
        <div>
          <h1 className="text-xl font-bold">Templates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Browse layouts for ID cards, result cards, fee receipts, and other school documents. Your school
            selects these when configuring features such as ID cards or printing. This library is read-only;
            new templates are provided by Schooliat.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>{embedded ? "Document templates" : "Available templates"}</CardTitle>
              {embedded && (
                <p className="text-sm text-muted-foreground mt-1">
                  Layouts used across the app (ID cards, results, receipts, and more). Choose a template where
                  each feature offers configuration—for example ID Cards uses the ID_CARD type here.
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {templateTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || filterType !== "all"
                ? "No templates found matching your filters"
                : "No templates found"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: TemplateWithUrls) => (
                <Card key={template.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <TemplatePreviewFrame templateId={template.id} />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{template.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                    {template.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openPreview(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(template)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>Template Type: {selectedTemplate?.type}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTemplate && (
              <div
                className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
                style={{ height: "500px" }}
              >
                <TemplateFullPreview templateId={selectedTemplate.id} />
              </div>
            )}
            {selectedTemplate?.description && (
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
            )}
            {defaultsData?.data && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Default Configuration</h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(defaultsData.data, null, 2)}
                </pre>
              </div>
            )}
            {selectedTemplate && (
              <Button
                className="w-full"
                onClick={() => handleDownload(selectedTemplate)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Sample PDF
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
