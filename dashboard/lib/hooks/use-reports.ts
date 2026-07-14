"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";

export function useDashboardSummary(params: { academicYear?: string } = {}) {
  const { academicYear } = params;
  return useQuery({
    queryKey: ["reports", "summary", academicYear],
    queryFn: () => get("/reports/dashboard-summary", { academicYear }),
    staleTime: 2 * 60 * 1000,
  });
}

// Exams list for academic filter
function fetchExams(params: { page?: number; limit?: number } = {}) {
  return get("/exams", { page: params.page ?? 1, limit: params.limit ?? 500 });
}

export function useExamsForReports(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["exams", "reports", params],
    queryFn: () => fetchExams(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch attendance reports
function fetchAttendanceReports(params: {
  classId?: string;
  studentId?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
  /** User who recorded the attendance */
  markedBy?: string;
}) {
  return get("/reports/attendance", params);
}

// Fetch fee analytics
function fetchFeeAnalytics(params: {
  classId?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
}) {
  return get("/reports/fees", params);
}

// Fetch academic performance reports
function fetchAcademicReports(params: {
  classId?: string;
  examId?: string;
  subjectId?: string;
  studentId?: string;
  schoolId?: string;
}) {
  return get("/reports/academic", params);
}

// Fetch salary reports
function fetchSalaryReports(params: {
  startDate?: string;
  endDate?: string;
}) {
  return get("/reports/salary", params);
}

// Hooks
export function useAttendanceReports(params: {
  classId?: string;
  studentId?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
  markedBy?: string;
} = {}) {
  return useQuery({
    queryKey: ["reports", "attendance", params],
    queryFn: () => fetchAttendanceReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeeAnalytics(params: {
  classId?: string;
  schoolId?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ["reports", "fees", params],
    queryFn: () => fetchFeeAnalytics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicReports(params: {
  classId?: string;
  examId?: string;
  subjectId?: string;
  studentId?: string;
  schoolId?: string;
} = {}) {
  return useQuery({
    queryKey: ["reports", "academic", params],
    queryFn: () => fetchAcademicReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSalaryReports(params: {
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery({
    queryKey: ["reports", "salary", params],
    queryFn: () => fetchSalaryReports(params),
    staleTime: 5 * 60 * 1000,
  });
}

