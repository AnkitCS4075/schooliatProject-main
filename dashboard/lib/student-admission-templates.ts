/**
 * Printable / downloadable blanks for admissions and class attendance register (school admin).
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Blank admission form: matches main fields in the “New admission” dialog (for offline use). */
export function getBlankAdmissionFormHtml(): string {
  const rows: [string, string][] = [
    ["First name", ""],
    ["Last name", ""],
    ["Gender", "Male / Female"],
    ["Date of birth", "dd/mm/yyyy"],
    ["Class", ""],
    ["Roll number", ""],
    ["Aadhaar number", ""],
    ["Apaar ID", ""],
    ["Blood group", ""],
    ["Student mobile (10 digits)", ""],
    ["Email (optional)", ""],
    ["Area & street", ""],
    ["Location", ""],
    ["District", ""],
    ["Pincode", ""],
    ["State", ""],
    ["Father name", ""],
    ["Mother name", ""],
    ["Father contact", ""],
    ["Mother contact", ""],
    ["Father occupation", ""],
    ["Annual income", ""],
    ["Accommodation", "Day scholar / Hosteller"],
    ["Transport", "Yes / No — route details"],
  ];
  const tableRows = rows
    .map(
      ([label, ph]) =>
        `<tr><td class="label">${escapeHtml(label)}</td><td class="field">${escapeHtml(ph)}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>New admission — blank form</title>
  <style>
    @media print {
      body { margin: 12mm; }
      .no-print { display: none !important; }
    }
    body { font-family: system-ui, Segoe UI, sans-serif; color: #111; max-width: 720px; margin: 24px auto; }
    h1 { font-size: 1.35rem; margin-bottom: 4px; }
    .sub { color: #555; font-size: 0.9rem; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    td { border: 1px solid #ccc; padding: 6px 10px; vertical-align: top; }
    td.label { width: 38%; font-weight: 600; background: #f8faf8; }
    td.field { min-height: 22px; }
    .photo { border: 1px dashed #999; height: 120px; width: 100px; float: right; margin: 0 0 12px 16px; text-align: center; padding-top: 40px; font-size: 0.75rem; color: #888; }
    .toolbar { margin-bottom: 16px; }
    button { padding: 8px 14px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <button type="button" onclick="window.print()">Print</button>
  </div>
  <div class="photo">Photo</div>
  <h1>New admission</h1>
  <p class="sub">Blank form — fill in ink and submit to the office. Email may be left blank.</p>
  <table>
    <tbody>${tableRows}</tbody>
  </table>
  <p style="margin-top: 20px; font-size: 0.85rem; color: #555;">Declaration / signature: _________________________ &nbsp; Date: __________</p>
</body>
</html>`;
}

export function downloadBlankAdmissionFormHtml(): void {
  const blob = new Blob([getBlankAdmissionFormHtml()], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "new-admission-blank-form.html";
  a.click();
  URL.revokeObjectURL(url);
}

export function openBlankAdmissionFormPrint(): void {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) return;
  w.document.write(getBlankAdmissionFormHtml());
  w.document.close();
}

/**
 * Attendance register blank: requested layout — class|roll no|date|day; summary row; then roll|name|present|absent|late.
 */
export function getAttendanceRegisterBlankCsv(): string {
  const lines = [
    "Class,Roll no,Date,Day",
    ",,,",
    "Absent,Present,Late",
    "Roll no,Name,Present,Absent,Late",
    ",,,,",
    ",,,,",
    ",,,,",
    ",,,,",
    ",,,,",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function downloadAttendanceRegisterBlankCsv(): void {
  const blob = new Blob([getAttendanceRegisterBlankCsv()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "class-attendance-register-blank.csv";
  a.click();
  URL.revokeObjectURL(url);
}
