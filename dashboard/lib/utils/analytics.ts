/**
 * Analytics utilities: date presets, safe formatting, aggregation for charts.
 */

import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  isValid,
} from "date-fns";
import type { ReportDatePreset, ReportDateRange } from "@/lib/types/reports";

const DATE_FORMAT = "yyyy-MM-dd";

export function getDateRangeForPreset(preset: ReportDatePreset): ReportDateRange {
  const now = new Date();
  switch (preset) {
    case "today": {
      const d = startOfDay(now);
      return { startDate: format(d, DATE_FORMAT), endDate: format(endOfDay(now), DATE_FORMAT), preset: "today" };
    }
    case "last7": {
      const start = startOfDay(subDays(now, 6));
      return { startDate: format(start, DATE_FORMAT), endDate: format(now, DATE_FORMAT), preset: "last7" };
    }
    case "last30": {
      const start = startOfDay(subDays(now, 29));
      return { startDate: format(start, DATE_FORMAT), endDate: format(now, DATE_FORMAT), preset: "last30" };
    }
    case "thisMonth": {
      return {
        startDate: format(startOfMonth(now), DATE_FORMAT),
        endDate: format(endOfMonth(now), DATE_FORMAT),
        preset: "thisMonth",
      };
    }
    case "lastMonth": {
      const last = subMonths(now, 1);
      return {
        startDate: format(startOfMonth(last), DATE_FORMAT),
        endDate: format(endOfMonth(last), DATE_FORMAT),
        preset: "lastMonth",
      };
    }
    case "thisQuarter": {
      return {
        startDate: format(startOfQuarter(now), DATE_FORMAT),
        endDate: format(endOfQuarter(now), DATE_FORMAT),
        preset: "thisQuarter",
      };
    }
    default:
      return {
        startDate: format(startOfMonth(subMonths(now, 1)), DATE_FORMAT),
        endDate: format(endOfMonth(now), DATE_FORMAT),
        preset: "custom",
      };
  }
}

export function safeFormatDate(value: string | Date | null | undefined, fmt: string): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return isValid(d) ? format(d, fmt) : "—";
}

export function formatCurrency(amount: number, currency = "₹"): string {
  if (typeof amount !== "number" || Number.isNaN(amount)) return `${currency}0`;
  return `${currency}${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "0%";
  return `${value.toFixed(1)}%`;
}

/** Aggregate attendance records by date for line/area charts */
export function aggregateAttendanceByDate(
  records: Array<{ date?: string | Date; status?: string }>
): Array<{ date: string; present: number; absent: number; late: number }> {
  const byDate: Record<string, { present: number; absent: number; late: number }> = {};
  for (const item of records) {
    const dateKey = item.date
      ? typeof item.date === "string"
        ? item.date.slice(0, 10)
        : (item.date as Date).toISOString?.()?.slice(0, 10) ?? ""
      : "";
    if (!dateKey) continue;
    if (!byDate[dateKey]) byDate[dateKey] = { present: 0, absent: 0, late: 0 };
    const status = (item.status || "").toUpperCase();
    if (status === "PRESENT") byDate[dateKey].present += 1;
    else if (status === "ABSENT") byDate[dateKey].absent += 1;
    else if (status === "LATE" || status === "HALF_DAY") byDate[dateKey].late += 1;
  }
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, counts]) => ({
      date: safeFormatDate(dateKey, "MMM dd"),
      ...counts,
    }));
}

/** Aggregate fee installments by month for bar/area charts */
export function aggregateFeesByMonth(
  installments: Array<{ createdAt?: string; paidAt?: string; amount?: number; paidAmount?: number; paymentStatus?: string }>
): Array<{ period: string; paid: number; pending: number; cancelled: number; amount: number }> {
  const byMonth: Record<string, { paid: number; pending: number; cancelled: number; amount: number }> = {};
  for (const item of installments) {
    const raw = item.createdAt || item.paidAt || "";
    const dateKey = raw ? raw.slice(0, 7) : ""; // YYYY-MM
    if (!dateKey) continue;
    if (!byMonth[dateKey]) {
      byMonth[dateKey] = { paid: 0, pending: 0, cancelled: 0, amount: 0 };
    }
    const amt = Number(item.amount ?? 0);
    byMonth[dateKey].amount += amt;
    if (item.paymentStatus === "PAID") {
      byMonth[dateKey].paid += Number(item.paidAmount ?? item.amount ?? 0);
    } else if (item.paymentStatus === "CANCELLED") {
      byMonth[dateKey].cancelled += amt;
    } else {
      byMonth[dateKey].pending += amt;
    }
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      period: safeFormatDate(key + "-01", "MMM yyyy"),
      ...v,
    }));
}

/** Distribution for pie/donut: e.g. present vs absent vs late */
export function attendanceDistribution(stats: { presentCount?: number; absentCount?: number; lateCount?: number }) {
  const present = Number(stats.presentCount ?? 0);
  const absent = Number(stats.absentCount ?? 0);
  const late = Number(stats.lateCount ?? 0);
  return [
    { name: "Present", value: present },
    { name: "Absent", value: absent },
    { name: "Late", value: late },
  ].filter((d) => d.value > 0);
}

/** Fee status distribution (rupee amounts; cancelled = gross face value of cancelled rows) */
export function feeStatusDistribution(stats: {
  totalPaid?: number;
  totalPending?: number;
  cancelledAmountGross?: number;
}) {
  const paid = Number(stats.totalPaid ?? 0);
  const pending = Number(stats.totalPending ?? 0);
  const cancelled = Number(stats.cancelledAmountGross ?? 0);
  return [
    { name: "Collected", value: paid },
    { name: "Pending", value: pending },
    { name: "Cancelled (gross)", value: cancelled },
  ].filter((d) => d.value > 0);
}

export const CHART_COLORS = {
  primary: "#84cc16",
  secondary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  muted: "#64748b",
  present: "#84cc16",
  absent: "#ef4444",
  late: "#f59e0b",
  paid: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#64748b",
} as const;
