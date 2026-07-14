/** Must match Backend `ATTENDANCE_EDIT_WINDOW_MS` (48h after end of attendance day). */
export const ATTENDANCE_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * True when marks/edits are no longer allowed for this calendar date (server enforces the same rule).
 */
export function isAttendanceDateLocked(dateStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return true;
  const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
  return Date.now() - endOfDay.getTime() > ATTENDANCE_EDIT_WINDOW_MS;
}
