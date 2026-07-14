"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch homework list
function fetchHomework(params: {
  homeworkId?: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
}) {
  return get("/homework", params);
}

// Fetch single homework
function fetchHomeworkById(homeworkId: string) {
  return get("/homework", { homeworkId });
}

// Create homework
function createHomeworkApi(data: {
  title: string;
  description: string;
  classIds: string[];
  subjectId: string;
  dueDate: string;
  isMCQ: boolean;
  attachments?: string[];
  mcqQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    marks: number;
  }>;
}) {
  return post("/homework", { request: data });
}

// Update homework
function updateHomeworkApi(homeworkId: string, data: {
  title?: string;
  description?: string;
  classIds?: string[];
  subjectId?: string;
  dueDate?: string;
  attachments?: string[];
  mcqQuestions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    marks: number;
  }>;
}) {
  return patch(`/homework/${homeworkId}`, { request: data });
}

// Delete homework
function deleteHomeworkApi(homeworkId: string, otp: string) {
  return del(`/homework/${homeworkId}`, { request: { otp } });
}

// Submit homework
function submitHomeworkApi(homeworkId: string, data: {
  answers?: number[];
  attachments?: string[];
  submissionText?: string;
}) {
  return post(`/homework/${homeworkId}/submit`, { request: data });
}

// Grade homework
function gradeHomeworkApi(submissionId: string, data: {
  marksObtained: number;
  feedback?: string;
}) {
  return post("/homework/grade", { 
    request: {
      submissionId,
      marksObtained: data.marksObtained,
      feedback: data.feedback || null,
    }
  });
}

// Hooks
export function useHomework(params: {
  homeworkId?: string;
  studentId?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["homework", params],
    queryFn: () => fetchHomework(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useHomeworkById(homeworkId: string) {
  return useQuery({
    queryKey: ["homework", homeworkId],
    queryFn: () => fetchHomeworkById(homeworkId),
    enabled: !!homeworkId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      classIds: string[];
      subjectId: string;
      dueDate: string;
      isMCQ: boolean;
      attachments?: string[];
      mcqQuestions?: Array<{
        question: string;
        options: string[];
        correctAnswer: number;
        marks: number;
      }>;
    }) => createHomeworkApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
  });
}

export function useUpdateHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateHomeworkApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["homework"] });
      queryClient.invalidateQueries({ queryKey: ["homework", id] });
    },
  });
}

export function useDeleteHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteHomeworkApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
  });
}

export function useSubmitHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeworkId, ...data }: { homeworkId: string; [key: string]: any }) =>
      submitHomeworkApi(homeworkId, data),
    onSuccess: (_data, { homeworkId }) => {
      queryClient.invalidateQueries({ queryKey: ["homework"] });
      queryClient.invalidateQueries({ queryKey: ["homework", homeworkId] });
    },
  });
}

export function useGradeHomework() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      ...data
    }: {
      submissionId: string;
      marksObtained: number;
      feedback?: string;
    }) => gradeHomeworkApi(submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
  });
}

