"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch timetable
function fetchTimetable(params: {
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  date?: string;
  timetableId?: string;
}) {
  return get("/timetables", params);
}

// Fetch single timetable
function fetchTimetableById(timetableId: string) {
  return get(`/timetables/${timetableId}`);
}

// Create timetable
function createTimetableApi(data: {
  name: string;
  classId?: string;
  effectiveFrom: string;
  effectiveTill?: string;
  slots: Array<{
    dayOfWeek: number;
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
  }>;
}) {
  return post("/timetables", { request: data });
}

// Update timetable
function updateTimetableApi(timetableId: string, data: {
  name?: string;
  classId?: string;
  effectiveFrom?: string;
  effectiveTill?: string;
  slots?: Array<{
    dayOfWeek: number;
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
  }>;
}) {
  return put(`/timetables/${timetableId}`, { request: data });
}

// Delete timetable
function deleteTimetableApi(timetableId: string, otp: string) {
  return del(`/timetables/${timetableId}`, { request: { otp } });
}

// Check conflicts
function checkConflictsApi(data: {
  slots: Array<{
    dayOfWeek: number;
    periodNumber: number;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
  }>;
  classId?: string;
  excludeTimetableId?: string;
}) {
  return post("/timetables/check-conflicts", { request: data });
}

// Hooks
export function useTimetable(params: {
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  date?: string;
  timetableId?: string;
} = {}) {
  return useQuery({
    queryKey: ["timetable", params],
    queryFn: () => fetchTimetable(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTimetableById(timetableId: string) {
  return useQuery({
    queryKey: ["timetable", timetableId],
    queryFn: () => fetchTimetableById(timetableId),
    enabled: !!timetableId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      classId?: string;
      effectiveFrom: string;
      effectiveTill?: string;
      slots: Array<{
        dayOfWeek: number;
        periodNumber: number;
        startTime: string;
        endTime: string;
        subjectId: string;
        teacherId: string;
      }>;
    }) => createTimetableApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}

export function useUpdateTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateTimetableApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
      queryClient.invalidateQueries({ queryKey: ["timetable", id] });
    },
  });
}

export function useDeleteTimetable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteTimetableApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable"] });
    },
  });
}

export function useCheckTimetableConflicts() {
  return useMutation({
    mutationFn: (data: {
      slots: Array<{
        dayOfWeek: number;
        periodNumber: number;
        startTime: string;
        endTime: string;
        subjectId: string;
        teacherId: string;
      }>;
      classId?: string;
      excludeTimetableId?: string;
    }) => checkConflictsApi(data),
  });
}

