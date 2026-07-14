import { format } from "date-fns";

export type RowAttendance = {
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  lateArrivalTime?: string;
  absenceReason?: string;
};

/**
 * Pick the attendance row to show for a student when GET /attendance may return
 * multiple rows (daily `periodId` null vs per-period rows).
 */
export function resolveStudentAttendanceRow(
  records: unknown[] | undefined,
  studentId: string,
  periodId: string | null
): RowAttendance | undefined {
  if (!Array.isArray(records) || records.length === 0) return undefined;
  const list = records.filter(
    (r): r is Record<string, unknown> =>
      !!r && typeof r === "object" && (r as Record<string, unknown>).studentId === studentId
  );
  if (list.length === 0) return undefined;

  let row: Record<string, unknown> | undefined;
  if (periodId) {
    row = list.find((a) => a.periodId === periodId) ?? list[0];
  } else {
    const daily = list.find((a) => a.periodId == null);
    row = daily ?? list[0];
  }

  if (!row?.status) return undefined;
  const status = row.status as RowAttendance["status"];
  let lateArrivalTime: string | undefined;
  if (row.lateArrivalTime) {
    try {
      lateArrivalTime = format(new Date(String(row.lateArrivalTime)), "HH:mm");
    } catch {
      lateArrivalTime = undefined;
    }
  }
  return {
    status,
    lateArrivalTime,
    absenceReason: row.absenceReason ? String(row.absenceReason) : undefined,
  };
}
