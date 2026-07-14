/**
 * Consistent calendar-day bounds for attendance queries (local timezone).
 * @param {Date|string|number} input
 * @returns {{ start: Date, end: Date }}
 */
export function getLocalDayBounds(input) {
  const d = new Date(input);
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * @param {Date|string|number} onDate
 * @param {string|Date|null|undefined} timeOrDate
 * @returns {Date|null}
 */
export function resolveLateArrivalDateTime(onDate, timeOrDate) {
  if (timeOrDate == null || timeOrDate === "") return null;
  if (typeof timeOrDate === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(timeOrDate.trim())) {
    const base = new Date(onDate);
    const [h, m, s = "0"] = timeOrDate.trim().split(/[:]/);
    base.setHours(Number(h), Number(m), Number(s) || 0, 0);
    return base;
  }
  const parsed = new Date(timeOrDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Hours after end of attendance day after which marks/edits are blocked */
export const ATTENDANCE_EDIT_WINDOW_MS = 48 * 60 * 60 * 1000;

/**
 * Throws if attendance date is outside the allowed edit window (48h after end of that calendar day).
 * @param {Date|string|number} attendanceDateInput
 */
export function assertAttendanceDateEditable(attendanceDateInput) {
  const { end: endOfDay } = getLocalDayBounds(attendanceDateInput);
  const now = Date.now();
  if (now - endOfDay.getTime() > ATTENDANCE_EDIT_WINDOW_MS) {
    throw new Error(
      "Attendance cannot be marked or edited more than 48 hours after the attendance date."
    );
  }
}
