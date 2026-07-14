"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToCSV<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T; header: string }[]): string {
  const header = columns.map((c) => c.header).join(",");
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = rows.map((row) => columns.map((c) => escape(row[c.key])).join(","));
  return [header, ...lines].join("\n");
}

export type ReportTab = "attendance" | "fees" | "academic" | "salary";

interface ExportReportMenuProps {
  tab: ReportTab;
  attendanceData?: Array<{ date?: string; status?: string; studentId?: string }>;
  feeData?: Array<{ amount?: number; paidAmount?: number; paymentStatus?: string; createdAt?: string }>;
  academicData?: Array<{ percentage?: number; marksObtained?: number; student?: { firstName?: string; lastName?: string } }>;
  salaryData?: Array<{ employeeName?: string; amount?: number; month?: string }>;
}

export function ExportReportMenu({
  tab,
  attendanceData = [],
  feeData = [],
  academicData = [],
  salaryData = [],
}: ExportReportMenuProps) {
  const handleExportCSV = () => {
    const date = new Date().toISOString().slice(0, 10);
    let csv: string;
    let name: string;

    switch (tab) {
      case "attendance":
        csv = exportToCSV(attendanceData, [
          { key: "date", header: "Date" },
          { key: "status", header: "Status" },
          { key: "studentId", header: "Student ID" },
        ]);
        name = `attendance-report-${date}.csv`;
        break;
      case "fees":
        csv = exportToCSV(feeData, [
          { key: "amount", header: "Amount" },
          { key: "paidAmount", header: "Paid Amount" },
          { key: "paymentStatus", header: "Status" },
          { key: "createdAt", header: "Created At" },
        ]);
        name = `fee-analytics-${date}.csv`;
        break;
      case "academic":
        csv = exportToCSV(
          academicData.map((m) => ({
            studentName: [m.student?.firstName, m.student?.lastName].filter(Boolean).join(" "),
            percentage: m.percentage,
            marksObtained: m.marksObtained,
          })),
          [
            { key: "studentName", header: "Student" },
            { key: "percentage", header: "Percentage" },
            { key: "marksObtained", header: "Marks Obtained" },
          ]
        );
        name = `academic-report-${date}.csv`;
        break;
      case "salary":
        csv = exportToCSV(salaryData, [
          { key: "employeeName", header: "Employee" },
          { key: "amount", header: "Amount" },
          { key: "month", header: "Month" },
        ]);
        name = `salary-report-${date}.csv`;
        break;
      default:
        return;
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, name);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>Export as CSV</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
