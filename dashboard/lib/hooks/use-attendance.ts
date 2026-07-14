"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch attendance data
function fetchAttendance(params: {
  studentId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  page?: number;
  limit?: number;
  periodId?: string;
}) {
  return get("/attendance", params);
}

// Fetch attendance statistics
function fetchAttendanceStatistics(params: {
  studentId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  periodId?: string;
}) {
  return get("/attendance/statistics", params);
}

// Fetch attendance periods
function fetchAttendancePeriods() {
  return get("/attendance/periods");
}

// Fetch attendance report
function fetchAttendanceReport(params: {
  studentId?: string;
  classId?: string;
  schoolId?: string;
  startDate: string;
  endDate: string;
  status?: string;
  format?: string;
}) {
  return get("/attendance/report", params);
}

// Mark attendance
function markAttendanceApi(data: {
  studentId: string;
  classId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  periodId?: string;
  lateArrivalTime?: string;
  absenceReason?: string;
}) {
  return post("/attendance/mark", { request: data });
}

// Mark bulk attendance
function markBulkAttendanceApi(data: {
  attendances: Array<{
    studentId: string;
    classId: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
    periodId?: string;
    lateArrivalTime?: string;
    absenceReason?: string;
  }>;
}) {
  return post("/attendance/mark-bulk", { request: data });
}

// Create attendance period
function createAttendancePeriodApi(data: {
  name: string;
  startTime: string;
  endTime: string;
}) {
  return post("/attendance/periods", { request: data });
}

// Hooks
export function useAttendance(params: {
  studentId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  page?: number;
  limit?: number;
  periodId?: string;
}) {
  const enabled =
    !!params.studentId ||
    !!(params.classId && params.date) ||
    !!(params.startDate && params.endDate);

  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => fetchAttendance(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useAttendanceStatistics(params: {
  studentId?: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  periodId?: string;
}) {
  return useQuery({
    queryKey: ["attendance-statistics", params],
    queryFn: () => fetchAttendanceStatistics(params),
    staleTime: 60 * 1000,
  });
}

export function useAttendancePeriods() {
  return useQuery({
    queryKey: ["attendance-periods"],
    queryFn: () => fetchAttendancePeriods(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAttendanceReport(params: {
  studentId?: string;
  classId?: string;
  schoolId?: string;
  startDate: string;
  endDate: string;
  status?: string;
  format?: string;
}) {
  return useQuery({
    queryKey: ["attendance-report", params],
    queryFn: () => fetchAttendanceReport(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 60 * 1000,
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      studentId: string;
      classId: string;
      date: string;
      status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
      periodId?: string;
      lateArrivalTime?: string;
      absenceReason?: string;
    }) => markAttendanceApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-statistics"] });
    },
  });
}

export function useMarkBulkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      attendances: Array<{
        studentId: string;
        classId: string;
        date: string;
        status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
        periodId?: string;
        lateArrivalTime?: string;
        absenceReason?: string;
      }>;
    }) => markBulkAttendanceApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["staffMember"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
}

export function useCreateAttendancePeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      startTime: string;
      endTime: string;
    }) => createAttendancePeriodApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-periods"] });
    },
  });
}

