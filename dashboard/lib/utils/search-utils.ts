/**
 * Search utility functions for client-side data filtering
 */

export const searchByName = <T>(
  data: T[],
  query: string,
  getNameFields: (item: T) => string[]
): T[] => {
  const q = query.trim().toLowerCase();

  if (!q) {
    return data;
  }

  return data.filter((item) => {
    const nameFields = getNameFields(item);
    return nameFields.some((name) => {
      if (typeof name === "string") {
        return name.toLowerCase().includes(q);
      }
      return false;
    });
  });
};

export const searchStudentsByName = <T extends { firstName?: string; lastName?: string }>(
  data: T[],
  query: string
): T[] => {
  return searchByName(data, query, (student) => [
    student.firstName || "",
    student.lastName || "",
    `${student.firstName || ""} ${student.lastName || ""}`,
  ]);
};

export const searchTeachersByName = <T extends { firstName?: string; lastName?: string }>(
  data: T[],
  query: string
): T[] => {
  return searchByName(data, query, (teacher) => [
    teacher.firstName || "",
    teacher.lastName || "",
    `${teacher.firstName || ""} ${teacher.lastName || ""}`,
  ]);
};

export const searchTransportByName = <T extends {
  vehicleNumber?: string;
  licenseNumber?: string;
  driverFirstName?: string;
  driverLastName?: string;
  conductorFirstName?: string;
  conductorLastName?: string;
}>(
  data: T[],
  query: string
): T[] => {
  return searchByName(data, query, (transport) => [
    transport.vehicleNumber || "",
    transport.licenseNumber || "",
    transport.driverFirstName || "",
    transport.driverLastName || "",
    `${transport.driverFirstName || ""} ${transport.driverLastName || ""}`,
    transport.conductorFirstName || "",
    transport.conductorLastName || "",
    `${transport.conductorFirstName || ""} ${transport.conductorLastName || ""}`,
  ]);
};

export const searchInventoryByName = <T extends { itemName?: string }>(
  data: T[],
  query: string
): T[] => {
  return searchByName(data, query, (item) => [item.itemName || ""]);
};

/** Sort by displayed name: first name, then last name (case-insensitive). */
export function sortUsersAlphabetically<T extends { firstName?: string; lastName?: string | null }>(
  data: T[],
): T[] {
  return [...data].sort((a, b) => {
    const aKey = `${(a.firstName || "").trim()} ${(a.lastName || "").trim()}`.trim().toLowerCase();
    const bKey = `${(b.firstName || "").trim()} ${(b.lastName || "").trim()}`.trim().toLowerCase();
    return aKey.localeCompare(bKey, undefined, { sensitivity: "base" });
  });
}

function normalizeClassParts(classLabel: string): { gradeNum: number; gradeText: string; division: string } {
  const trimmed = (classLabel || "").trim();
  if (!trimmed) {
    return { gradeNum: Number.POSITIVE_INFINITY, gradeText: "zzz", division: "zzz" };
  }

  const compact = trimmed.replace(/\s+/g, "");
  const [rawGrade = "", rawDivision = ""] = compact.split(/[-/]/);
  const gradeNum = Number.parseInt(rawGrade, 10);

  return {
    gradeNum: Number.isFinite(gradeNum) ? gradeNum : Number.POSITIVE_INFINITY,
    gradeText: rawGrade.toLowerCase(),
    division: rawDivision.toLowerCase(),
  };
}

/** Class label for sorting/filtering (student roster). */
export function getStudentClassDisplayLabel(student: { class?: unknown; studentProfile?: { class?: unknown } }): string {
  const c = (student as { class?: unknown }).class ?? student.studentProfile?.class;
  if (!c) return "";
  if (typeof c === "string") return c.trim();
  const o = c as { grade?: string; division?: string | null };
  const g = (o.grade ?? "").toString().trim();
  const d = (o.division ?? "").toString().trim();
  if (g && d) return `${g}-${d}`;
  return g || d || "";
}

/** Class label for sorting/filtering (teacher list). */
export function getTeacherClassDisplayLabel(teacher: {
  class?: string;
  assignedClasses?: string[];
}): string {
  const direct = teacher.class;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const parts = Array.isArray(teacher.assignedClasses) ? teacher.assignedClasses.filter(Boolean) : [];
  return parts.join(", ").trim();
}

/** Sort by class first (grade/division), then user name A-Z. */
export function sortUsersByClassThenName<T extends { firstName?: string; lastName?: string | null }>(
  data: T[],
  getClassLabel: (item: T) => string,
): T[] {
  return [...data].sort((a, b) => {
    const aClass = normalizeClassParts(getClassLabel(a));
    const bClass = normalizeClassParts(getClassLabel(b));

    if (aClass.gradeNum !== bClass.gradeNum) return aClass.gradeNum - bClass.gradeNum;
    const gradeTextCmp = aClass.gradeText.localeCompare(bClass.gradeText, undefined, {
      sensitivity: "base",
    });
    if (gradeTextCmp !== 0) return gradeTextCmp;
    const divisionCmp = aClass.division.localeCompare(bClass.division, undefined, {
      sensitivity: "base",
    });
    if (divisionCmp !== 0) return divisionCmp;

    const aName = `${(a.firstName || "").trim()} ${(a.lastName || "").trim()}`.trim().toLowerCase();
    const bName = `${(b.firstName || "").trim()} ${(b.lastName || "").trim()}`.trim().toLowerCase();
    return aName.localeCompare(bName, undefined, { sensitivity: "base" });
  });
}

