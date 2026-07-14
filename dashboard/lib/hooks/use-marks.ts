"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch exams (for marks entry - exams router)
function fetchExams(params: { pageNumber?: number; pageSize?: number } = {}) {
  return get("/exams", {
    pageNumber: params.pageNumber ?? 1,
    pageSize: params.pageSize ?? 100,
  });
}

// Fetch marks
function fetchMarks(params: {
  examId?: string;
  studentId?: string;
  classId?: string;
}) {
  return get("/marks", params);
}

// Fetch results
function fetchResults(params: {
  examId?: string;
  studentId?: string;
}) {
  return get("/marks/results", params);
}

// Enter marks
function enterMarksApi(data: {
  examId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  marksObtained: number;
  maxMarks: number;
}) {
  return post("/marks", { request: data });
}

// Enter bulk marks
function enterBulkMarksApi(data: {
  marks: Array<{
    examId: string;
    studentId: string;
    subjectId: string;
    classId: string;
    marksObtained: number;
    maxMarks: number;
  }>;
}) {
  return post("/marks/bulk", { request: data });
}

// Calculate results (single student or whole class when studentId omitted)
function calculateResultsApi(data: {
  examId: string;
  classId: string;
  studentId?: string;
}) {
  return post("/marks/calculate-result", { request: data });
}

// Publish results
function publishResultsApi(data: {
  examId: string;
  classId?: string;
}) {
  return post("/marks/publish", { request: data });
}

// Hooks
export function useExams(params: { pageNumber?: number; pageSize?: number } = {}) {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => fetchExams(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarks(params: {
  examId?: string;
  studentId?: string;
  classId?: string;
} = {}) {
  /** examId alone loads all marks for the exam (admin overview); examId+classId filters to one class. */
  const enabled = !!params.studentId || !!params.examId;
  return useQuery({
    queryKey: ["marks", params],
    queryFn: () => fetchMarks(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    enabled,
  });
}

export function useResults(params: {
  examId?: string;
  studentId?: string;
} = {}) {
  return useQuery({
    queryKey: ["results", params],
    queryFn: () => fetchResults(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useEnterMarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      examId: string;
      studentId: string;
      subjectId: string;
      classId: string;
      marksObtained: number;
      maxMarks: number;
    }) => enterMarksApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}

export function useEnterBulkMarks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      marks: Array<{
        examId: string;
        studentId: string;
        subjectId: string;
        classId: string;
        marksObtained: number;
        maxMarks: number;
      }>;
    }) => enterBulkMarksApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marks"] });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
  });
}

export function useCalculateResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { examId: string; classId: string; studentId?: string }) =>
      calculateResultsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["marks"] });
    },
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { examId: string; classId?: string }) =>
      publishResultsApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      queryClient.invalidateQueries({ queryKey: ["marks"] });
    },
  });
}

