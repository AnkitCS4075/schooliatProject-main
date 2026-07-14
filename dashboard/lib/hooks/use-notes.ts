"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

function fetchNoteById(noteId: string) {
  return get(`/notes/notes/${noteId}`);
}

function fetchSyllabusById(syllabusId: string) {
  return get(`/notes/syllabus/${syllabusId}`);
}

// Fetch notes
function fetchNotes(params: {
  subjectId?: string;
  classId?: string;
  chapter?: string;
  topic?: string;
  page?: number;
  limit?: number;
}) {
  return get("/notes/notes", params);
}

// Fetch syllabus
function fetchSyllabus(params: {
  subjectId?: string;
  classId?: string;
  academicYear?: string;
}) {
  return get("/notes/syllabus", params);
}

// Create note
function createNoteApi(data: {
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  chapter?: string;
  topic?: string;
  fileId?: string;
}) {
  return post("/notes/notes", { request: data });
}

// Update note
function updateNoteApi(noteId: string, data: {
  title?: string;
  description?: string;
  subjectId?: string;
  classId?: string | null;
  chapter?: string;
  topic?: string;
  fileId?: string;
}) {
  return put(`/notes/notes/${noteId}`, { request: data });
}

// Delete note
function deleteNoteApi(noteId: string, otp: string) {
  return del(`/notes/notes/${noteId}`, { request: { otp } });
}

// Create syllabus
function createSyllabusApi(data: {
  title?: string;
  description?: string | null;
  subjectId: string;
  classId: string;
  academicYear: string;
  chapters: Array<{
    chapterNumber: number;
    chapterName: string;
    topics: string[];
  }>;
  fileId?: string;
}) {
  const title =
    data.title?.trim() || `Syllabus ${data.academicYear}`;
  return post("/notes/syllabus", {
    request: {
      title,
      description: data.description ?? null,
      subjectId: data.subjectId,
      classId: data.classId,
      academicYear: data.academicYear,
      chapters: data.chapters,
      fileId: data.fileId ?? null,
    },
  });
}

// Update syllabus
function updateSyllabusApi(
  syllabusId: string,
  data: {
    title: string;
    description?: string | null;
    subjectId: string;
    classId: string;
    academicYear: string;
    chapters?: Array<{
      chapterNumber: number;
      chapterName: string;
      topics: string[];
    }> | null;
    fileId?: string | null;
  },
) {
  return put(`/notes/syllabus/${syllabusId}`, { request: data });
}

// Delete syllabus
function deleteSyllabusApi(syllabusId: string, otp: string) {
  return del(`/notes/syllabus/${syllabusId}`, { request: { otp } });
}

// Hooks
export function useNotes(params: {
  subjectId?: string;
  classId?: string;
  chapter?: string;
  topic?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => fetchNotes(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useNote(noteId: string) {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => fetchNoteById(noteId),
    enabled: !!noteId,
    staleTime: 60 * 1000,
  });
}

export function useSyllabus(params: {
  subjectId?: string;
  classId?: string;
  academicYear?: string;
} = {}) {
  return useQuery({
    queryKey: ["syllabus", params],
    queryFn: () => fetchSyllabus(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyllabusById(syllabusId: string) {
  return useQuery({
    queryKey: ["syllabusById", syllabusId],
    queryFn: () => fetchSyllabusById(syllabusId),
    enabled: !!syllabusId,
    staleTime: 60 * 1000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      subjectId: string;
      classId: string;
      chapter?: string;
      topic?: string;
      fileId?: string;
    }) => createNoteApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateNoteApi(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteNoteApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useCreateSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      subjectId: string;
      classId: string;
      academicYear: string;
      chapters: Array<{
        chapterNumber: number;
        chapterName: string;
        topics: string[];
      }>;
      fileId?: string;
    }) => createSyllabusApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
}

export function useUpdateSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updateSyllabusApi(id, data as Parameters<typeof updateSyllabusApi>[1]),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
      queryClient.invalidateQueries({ queryKey: ["syllabusById", id] });
    },
  });
}

export function useDeleteSyllabus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteSyllabusApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syllabus"] });
    },
  });
}

