"use client";

import { useState } from "react";
import { useReportTypes, useReportData, useDownloadReportExcel, useDownloadReportPdf, useDownloadReportCsv } from "@/lib/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, FileText, FileDown } from "lucide-react";

export default function ReportsPage() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { data: typesData, isLoading: typesLoading } = useReportTypes();
  const { data: reportData, isLoading: dataLoading, refetch } = useReportData(selectedType, filters, !!selectedType);
  const downloadExcel = useDownloadReportExcel();
  const downloadPdf = useDownloadReportPdf();
  const downloadCsv = useDownloadReportCsv();

  const types = typesData?.data || [];
  const reportRows = reportData?.data || [];
  const statistics = reportData?.statistics || {};

  const handleExport = async (format: "excel" | "pdf" | "csv") => {
    if (!selectedType) return;
    try {
      const downloader = format === "excel" ? downloadExcel : format === "pdf" ? downloadPdf : downloadCsv;
      const blob = await downloader.mutateAsync({ type: selectedType, filters: Object.keys(filters).length ? filters : undefined });
      const ext = format === "excel" ? "xlsx" : format;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedType.replace(/\//g, "-")}-report.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: `Report downloaded as ${ext.toUpperCase()}` });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    }
  };

  const columns = reportRows.length > 0 ? Object.keys(reportRows[0]).filter(k => k !== "id" && k !== "deletedAt" && k !== "deletedBy").slice(0, 8) : [];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground text-sm">Generate and export school reports</p>
      </div>

      {/* Report Type Selector + Filters */}
      <Card>
        <CardHeader><CardTitle>Select Report</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setFilters({}); }}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Choose a report type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedType && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport("excel")} disabled={downloadExcel.isPending}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")} disabled={downloadPdf.isPending}>
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport("csv")} disabled={downloadCsv.isPending}>
                  <FileDown className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            )}
          </div>
          {selectedType && (
            <div className="flex flex-wrap gap-3">
              <Input placeholder="Start Date" type="date" className="w-[170px]" onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))} />
              <Input placeholder="End Date" type="date" className="w-[170px]" onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))} />
              <Button variant="ghost" size="sm" onClick={() => { setFilters({}); refetch(); }}>Clear Filters</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedType && statistics && Object.keys(statistics).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(statistics).map(([key, val]) => (
            <Card key={key}>
              <CardContent className="pt-4 text-center">
                <p className="text-xl font-bold">{typeof val === "number" ? val.toLocaleString("en-IN") : String(val)}</p>
                <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Data Table */}
      {selectedType && (
        <Card>
          <CardContent className="p-0">
            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : reportRows.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No data available for this report</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col} className="text-xs capitalize">
                        {col.replace(/\./g, " > ").replace(/([A-Z])/g, " $1")}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportRows.slice(0, 50).map((row: any, idx: number) => (
                    <TableRow key={row.id || idx}>
                      {columns.map((col) => {
                        let val = row[col];
                        if (val && typeof val === "object" && val !== null) val = JSON.stringify(val);
                        if (typeof val === "boolean") val = val ? "Yes" : "No";
                        if (col.includes("amount") || col.includes("price") || col.includes("Amount") || col.includes("Price")) {
                          val = `₹${Number(val || 0).toLocaleString("en-IN")}`;
                        }
                        return <TableCell key={col} className="text-xs">{String(val ?? "-")}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
