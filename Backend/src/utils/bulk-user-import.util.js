/**
 * Shared normalization for POST /users/teachers/bulk and /users/students/bulk.
 * Required per row: person name + 10-digit contact. Other fields are optional with defaults.
 */

import crypto from "node:crypto";

/** Used when DateOfBirth is missing or unparsable (User.dateOfBirth is required). */
export const BULK_IMPORT_DEFAULT_DOB = new Date("2000-01-01T00:00:00.000Z");

/**
 * Unique placeholder email for bulk-created users when CSV has no email.
 * Must stay globally unique (User.email is @unique).
 */
export function bulkPlaceholderEmail(schoolId, roleTag) {
  const sid = String(schoolId || "x").replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
  const id = crypto.randomUUID().replace(/-/g, "");
  return `bulk.${roleTag}.${sid}.${id}@schooliat.local`;
}

/**
 * Normalize a 10-digit Indian mobile from CSV (Contact / Phone / Mobile / etc.).
 */
export function normalizeBulkContact(row) {
  const raw = String(
    row.contact ?? row.phone ?? row.mobile ?? row.mobilenumber ?? row.phonenumber ?? "",
  ).trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "";
}

/**
 * First name + last name from FirstName/LastName or a single "Name" column.
 */
export function normalizeBulkPersonName(row) {
  let first = String(row.firstname ?? "").trim();
  let last = String(row.lastname ?? "").trim();
  if (!first) {
    const full = String(row.name ?? "").trim();
    if (full) {
      const parts = full.split(/\s+/).filter(Boolean);
      first = parts[0] ?? "";
      last = parts.slice(1).join(" ") || "";
    }
  }
  return { firstName: first, lastName: last };
}

export function parseBulkDateOfBirth(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return BULK_IMPORT_DEFAULT_DOB;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return BULK_IMPORT_DEFAULT_DOB;
  return d;
}

/**
 * Roll number for StudentProfile.rollNumber (Int). Matches single-student create behavior:
 * empty → 0; non-numeric / partial text → 0 (never NaN).
 */
export function parseRollNumberFromValue(value) {
  if (value === undefined || value === null || String(value).trim() === "") return 0;
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * @param {Record<string, string>} row
 */
export function parseBulkRollNumber(row) {
  const raw = row.rollnumber ?? row.roll_number ?? row.roll ?? "";
  return parseRollNumberFromValue(raw);
}

/**
 * Turn Prisma / validation failures into short messages for bulk row `errors[]`
 * (avoid dumping full `Invalid prisma.xxx invocation` blobs to the UI).
 */
export function formatBulkImportError(error) {
  if (!error) return "Unknown error.";
  const code = error.code;

  if (code === "P2002") {
    const target = error?.meta?.target;
    const t = Array.isArray(target) ? String(target[0]) : target != null ? String(target) : "";
    if (t.includes("apaar") || t === "apaar_id") {
      return "APAAR ID is already used by another student. Use a different value or leave the column empty.";
    }
    if (t.includes("email")) {
      return "Email is already in use. Use a different email or leave empty for a generated address.";
    }
    if (t.includes("public_user") || t.includes("publicUserId")) {
      return "Login ID conflict. Try the upload again in a moment.";
    }
    if (t.includes("aadhaar")) {
      return "Aadhaar is already registered to another account.";
    }
    return "This row conflicts with existing data (duplicate unique value).";
  }

  const msg = String(error.message || "");

  if (/Invalid `prisma\./i.test(msg) || msg.includes("prisma.")) {
    if (msg.includes("rollNumber") || msg.includes("roll_number") || /\bNaN\b/.test(msg)) {
      return "Invalid roll number. Use a whole number (e.g. 1, 12) or leave the Roll column empty for 0.";
    }
    if (msg.includes("Argument `class`")) {
      return "Could not save the class link. Check ClassName matches a class in this school and try again.";
    }
    return "Could not save this row. Check class, roll number, APAAR ID, and email for invalid or duplicate values.";
  }

  if (msg.length > 300) {
    const first = msg.split("\n")[0].trim();
    return first.length > 280 ? `${first.slice(0, 277)}…` : first;
  }

  return msg;
}

/**
 * Aadhaar from CSV (User.aadhaarId is globally @unique). Normalizes to 12 digits;
 * empty / placeholder (e.g. all zeros) → null. Invalid length → row error object.
 *
 * @param {Record<string, string>} row
 * @returns {{ value: string | null } | { error: string }}
 */
export function parseBulkAadhaarId(row) {
  const raw = row.aadhaarid ?? row.aadhaar_id ?? row.aadhaar ?? "";
  const s = String(raw).trim();
  if (!s) return { value: null };

  const digits = s.replace(/\D/g, "");
  if (digits.length === 12) {
    if (/^0{12}$/.test(digits)) return { value: null };
    return { value: digits };
  }

  return {
    error:
      "Aadhaar must be exactly 12 digits (optional). Leave the column empty or enter a valid number without letters.",
  };
}

/**
 * Parse ClassName into grade + division (e.g. "10A", "10 A", "10-A", "12 Science").
 */
function parseClassNameInput(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const m = s.match(/^(\d+)\s*[-]?\s*(.+)$/);
  if (!m) return null;
  const division = m[2].trim();
  if (!division) return null;
  return { grade: m[1], division };
}

function matchClassCompact(classes, inputName) {
  const key = inputName.replace(/\s+/g, "").replace(/-/g, "").toLowerCase();
  if (!key) return null;
  return classes.find((c) => {
    const g = String(c.grade ?? "").trim();
    const d = String(c.division ?? "").trim();
    return `${g}${d}`.toLowerCase() === key;
  });
}

function matchClassGradeDivision(classes, inputName) {
  const parsed = parseClassNameInput(inputName);
  if (!parsed) return null;
  const g = String(parsed.grade).trim();
  const d = parsed.division;
  return classes.find((c) => {
    const cg = String(c.grade ?? "").trim();
    const cd = String(c.division ?? "").trim();
    return cg === g && cd.toLowerCase() === d.toLowerCase();
  });
}

/** Legacy: exact "grade division" or "grade-division" (case-insensitive). */
function matchClassLegacyExact(classes, inputName) {
  const lower = inputName.toLowerCase().trim();
  return classes.find((c) => {
    const div = c.division ?? "";
    const a = `${c.grade} ${div}`.toLowerCase().trim();
    const b = `${c.grade}-${div}`.toLowerCase();
    return a === lower || b === lower;
  });
}

/**
 * Resolve class for bulk student row. If ClassName is empty, use first class (grade, then division).
 */
export function resolveStudentClassForBulk(row, classes) {
  const raw = String(row.classname ?? "").trim();

  const formatClassHint = () => {
    if (!classes.length) return "";
    const samples = classes
      .slice(0, 6)
      .map((c) => {
        const div = c.division != null && String(c.division).trim() !== "" ? ` ${c.division}` : "";
        return `${c.grade}${div}`.trim();
      })
      .filter(Boolean);
    return samples.length ? ` Available examples: ${samples.join(", ")}.` : "";
  };

  if (raw) {
    const found =
      matchClassCompact(classes, raw) ||
      matchClassGradeDivision(classes, raw) ||
      matchClassLegacyExact(classes, raw);
    if (!found) {
      return {
        ok: false,
        error: `Class "${raw}" not found.${formatClassHint()} Use "10 A", "10-A", "10A", or leave ClassName empty to use the school's first class.`,
      };
    }
    return { ok: true, classEntity: found };
  }

  if (!classes.length) {
    return {
      ok: false,
      error:
        "No classes exist for this school. Create a class first, or add a ClassName column once classes exist.",
    };
  }

  const sorted = [...classes].sort((a, b) => {
    const ga = Number(a.grade);
    const gb = Number(b.grade);
    if (ga !== gb) return ga - gb;
    return String(a.division).localeCompare(String(b.division));
  });

  return { ok: true, classEntity: sorted[0], defaultedClass: true };
}
