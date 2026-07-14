"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, Settings, Loader2, ExternalLink, Info } from "lucide-react";
import { useClassFilters } from "@/lib/hooks/use-class-filters";
import {
  useIdCardsStatus,
  useGenerateClassIdCards,
  useIdCardConfig,
  IdCardStatus,
} from "@/lib/hooks/use-id-cards";
import { toast } from "sonner";
import { BASE_URL } from "@/lib/api/config";
import { resolvePublicFileUrl } from "@/lib/utils/resolve-public-file-url";
import { format } from "date-fns";
import { IdCardTemplateConfig } from "./id-card-template-config";

export function IDCardsManagement() {
  const [page, setPage] = useState(0);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const itemsPerPage = 15;
  const { classFilter, divisionFilter } = useClassFilters();
  const [classFilterValue, setClassFilterValue] = useState(classFilter.defaultValue);
  const [divisionFilterValue, setDivisionFilterValue] = useState(divisionFilter.defaultValue);

  const { data, isLoading, isError, error, refetch } = useIdCardsStatus();
  const generateIdCards = useGenerateClassIdCards();
  const { data: configData } = useIdCardConfig();

  const idCardConfig = configData?.data;
  const hasConfig = !!idCardConfig;

  const idCardsData: IdCardStatus[] = useMemo(() => {
    const raw = data?.data ?? [];
    return raw.map((item: any) => ({
      ...item,
      status: item.idCardCollection?.status === "GENERATED" ? "Generated" : "Not generated",
      generatedOn: item.idCardCollection?.generatedAt || null,
      fileUrl: item.idCardCollection?.fileUrl || null,
      collectionId: item.idCardCollection?.id || null,
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    return idCardsData
      .map((item, index) => ({
        ...item,
        no: String(index + 1).padStart(2, "0"),
        class: item.grade,
        generatedOnFormatted: item.generatedOn
          ? format(new Date(item.generatedOn), "dd MMM yyyy")
          : "NA",
      }))
      .filter((item) => {
        const matchesClass =
          classFilterValue === classFilter.defaultValue ||
          item.grade === classFilterValue.split("-")[0];
        const matchesDivision =
          divisionFilterValue === divisionFilter.defaultValue ||
          item.division === divisionFilterValue;
        return matchesClass && matchesDivision;
      });
  }, [idCardsData, classFilterValue, divisionFilterValue, classFilter, divisionFilter]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, filteredData.length);
  const numberOfPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [classFilterValue, divisionFilterValue]);

  const handleGenerateAll = async () => {
    if (!hasConfig) {
      toast.error("Configure an ID card template first (School Settings → Templates tab, then ID Cards).");
      return;
    }

    const notGenerated = filteredData.filter(
      (item) => item.status === "Not generated"
    );
    if (notGenerated.length === 0) {
      toast.info("All ID cards have already been generated");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to generate ID cards for ${notGenerated.length} class(es)?`
      )
    ) {
      return;
    }

    try {
      for (const item of notGenerated) {
        await generateIdCards.mutateAsync(item.id);
      }
      toast.success(
        `ID cards generated successfully for ${notGenerated.length} class(es)!`
      );
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate ID cards";
      toast.error(errorMessage);
    }
  };

  const handleGenerateRow = async (item: IdCardStatus) => {
    if (!hasConfig) {
      toast.error("Configure an ID card template first (School Settings → Templates tab, then ID Cards).");
      return;
    }

    if (item.status === "Generated") {
      toast.info("ID cards for this class have already been generated");
      return;
    }

    if (!confirm(`Generate ID cards for Class ${item.grade}${item.division ? `-${item.division}` : ""}?`)) {
      return;
    }

    try {
      const result = await generateIdCards.mutateAsync(item.id);
      // If backend returned a zipFileUrl, open for download
      const zipUrl = (result as any)?.data?.zipFileUrl;
      if (zipUrl) {
        window.open(resolvePublicFileUrl(zipUrl), "_blank");
      }
      toast.success("ID cards generated successfully!");
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate ID cards. Please ensure the template is configured.";
      toast.error(errorMessage);
    }
  };

  const handleViewTemplate = () => {
    if (idCardConfig?.sampleUrl) {
      window.open(resolvePublicFileUrl(idCardConfig.sampleUrl), "_blank");
      return;
    }

    // Fallback to the auto-generated template preview image if no custom sample is saved yet
    const templateId = idCardConfig?.templateId;
    if (templateId) {
      const baseUrl = BASE_URL;
      window.open(`${baseUrl}/images/previews/id-cards/${templateId}.png`, "_blank");
      return;
    }

    toast.error("No template preview available. Please select a template first.");
  };

  const handleDownload = (fileUrl: string) => {
    window.open(resolvePublicFileUrl(fileUrl), "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading ID cards status...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error instanceof Error ? error.message : "Failed to load ID cards status"}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hasConfig && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            No ID card template is configured. Templates define the layout for student ID cards.
            Browse all layouts under School Settings → Templates, then choose one with Configure below.
            <Button
              variant="link"
              className="ml-2 h-auto p-0 text-primary font-medium"
              onClick={() => setConfigDialogOpen(true)}
            >
              Configure ID card template
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-semibold">ID Cards Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setConfigDialogOpen(true)} variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configure Template
          </Button>
          <Button onClick={handleViewTemplate} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            View Template
          </Button>
          <Button
            onClick={handleGenerateAll}
            disabled={generateIdCards.isPending}
            className="gap-2"
          >
            {generateIdCards.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generateIdCards.isPending ? "Generating..." : "Generate All"}
          </Button>
        </div>
      </div>

      {/* Size specification info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          ID cards are generated in <strong>A6 size (105 × 148 mm)</strong>. Each class generates a ZIP file containing individual PDF ID cards for all students.
          {!hasConfig && (
            <span className="text-amber-600 font-medium ml-1">
              ⚠ No template configured. Please configure a template before generating.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={classFilterValue} onValueChange={setClassFilterValue}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classFilter.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={divisionFilterValue} onValueChange={setDivisionFilterValue}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisionFilter.options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead className="w-16">No</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Division</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead className="w-48">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No ID cards found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.no}</TableCell>
                    <TableCell>{item.class}</TableCell>
                    <TableCell>{item.division || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "Generated" ? "default" : "secondary"}
                        className={
                          item.status === "Generated"
                            ? "bg-schooliat-tint text-primary"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.generatedOnFormatted}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {item.status === "Generated" && item.fileUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(item.fileUrl!)}
                            className="gap-1 text-primary"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateRow(item)}
                            disabled={generateIdCards.isPending || !hasConfig}
                            className="gap-1"
                          >
                            {generateIdCards.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            Generate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {numberOfPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {numberOfPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(numberOfPages - 1, page + 1))}
              disabled={page >= numberOfPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <IdCardTemplateConfig open={configDialogOpen} onOpenChange={setConfigDialogOpen} />
    </div>
  );
}
