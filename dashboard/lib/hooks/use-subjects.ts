"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

interface SubjectData {
  name: string;
  code?: string;
  description?: string;
}

// Fetch subjects
function fetchSubjects(params: { classId?: string; page?: number; limit?: number }) {
  return get("/subjects", params);
}

// Create subject
function createSubjectApi(data: SubjectData) {
  return post("/subjects", { request: data });
}

// Update subject
function updateSubjectApi(id: string, data: Partial<SubjectData>) {
  return patch(`/subjects/${id}`, { request: data });
}

// Delete subject
function deleteSubjectApi(id: string, otp: string) {
  return del(`/subjects/${id}`, { request: { otp } });
}

// Hooks
export function useSubjects(params: { classId?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => fetchSubjects(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubjectData) => createSubjectApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubjectData> }) => updateSubjectApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteSubjectApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
