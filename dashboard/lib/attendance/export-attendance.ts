import { jsPDF } from "jspdf";
import { format } from "date-fns";

function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: string[][]
): void {
  const BOM = "\uFEFF";
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map((c) => escapeCsvCell(String(c ?? ""))).join(",")),
  ];
  const blob = new Blob([BOM + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadTablePdf(options: {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
  filename: string;
}): void {
  const { title, subtitle, headers, rows, filename } = options;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 14;
  doc.setFontSize(14);
  doc.text(title, 14, y);
  y += 7;
  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(subtitle, 14, y);
    y += 6;
  }
  doc.setTextColor(0);
  doc.setFontSize(9);

  const margin = 14;
  const usable = pageW - margin * 2;
  const colW = usable / Math.max(headers.length, 1);

  doc.setFillColor(240, 248, 240);
  doc.rect(margin, y - 4, usable, 7, "F");
  headers.forEach((h, i) => {
    doc.text(h, margin + 1 + i * colW, y, { maxWidth: colW - 2 });
  });
  y += 10;

  doc.setFontSize(8);
  rows.forEach((row) => {
    if (y > 185) {
      doc.addPage();
      y = 14;
    }
    row.forEach((cell, i) => {
      doc.text(String(cell ?? ""), margin + 1 + i * colW, y, {
        maxWidth: colW - 2,
      });
    });
    y += 6;
  });

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export function formatDateLabel(dateStr: string): string {
  try {
    return format(new Date(dateStr + "T12:00:00"), "MMM dd, yyyy");
  } catch {
    return dateStr;
  }
}
