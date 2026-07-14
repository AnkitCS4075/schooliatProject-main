/**
 * Bulk CSV formats for POST /users/teachers/bulk and POST /users/students/bulk.
 * Backend csv.util parseCSV normalizes headers: lowercased, spaces removed
 * (e.g. "First Name" → "firstname", "Phone" → "phone").
 *
 * Required columns (per row):
 * - Teachers & students: **FirstName** (or **Name**) + **Contact** (or Phone / Mobile).
 * - All other columns are optional; missing email/DOB/etc. use server defaults.
 * - Students: **ClassName** optional — if empty, the first class (by grade, then division) is used.
 */

function escapeCsvCell(value: string): string {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build CSV text from header row + optional data rows (same length as headers). */
export function buildCsvDocument(headers: string[], dataRows: string[][]): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...dataRows.map((row) =>
      headers.map((_, i) => escapeCsvCell(row[i] ?? "")).join(","),
    ),
  ];
  return lines.join("\n");
}

export function triggerCsvDownload(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Matches user.router.js POST /users/teachers/bulk. */
export const TEACHER_BULK_CSV = {
  filename: "teachers_upload_sample.csv",
  headers: [
    "FirstName",
    "Contact",
    "LastName",
    "Email",
    "Gender",
    "DateOfBirth",
    "Designation",
    "HighestQualification",
    "University",
    "YearOfPassing",
    "Grade",
    "AadhaarId",
    "PanCardNumber",
    "Subjects",
  ],
  /** Minimal row: name + phone; other fields can be left blank. */
  sampleRow: [
    "Jane",
    "9876543210",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
} as const;

/** Matches user.router.js POST /users/students/bulk. */
export const STUDENT_BULK_CSV = {
  filename: "students_upload_sample.csv",
  headers: [
    "FirstName",
    "Contact",
    "ClassName",
    "LastName",
    "Email",
    "Gender",
    "DateOfBirth",
    "FatherName",
    "MotherName",
    "FatherContact",
    "MotherContact",
    "ApaarId",
    "RollNumber",
  ],
  /** ClassName may be empty — server assigns first class in the school. */
  sampleRow: [
    "Ravi",
    "9123456789",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ],
} as const;

export function getTeacherBulkUploadCsv(): string {
  return buildCsvDocument([...TEACHER_BULK_CSV.headers], [[...TEACHER_BULK_CSV.sampleRow]]);
}

export function getStudentBulkUploadCsv(): string {
  return buildCsvDocument([...STUDENT_BULK_CSV.headers], [[...STUDENT_BULK_CSV.sampleRow]]);
}
