"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

/** Keep aligned with backend pagination safety limit. */
export const TEACHERS_MAX_PAGE_SIZE = 100;

function fetchTeachers({ page = 1, limit = 15, academicYear }: { page?: number; limit?: number; academicYear?: string } = {}) {
  const safeLimit = Math.min(TEACHERS_MAX_PAGE_SIZE, Math.max(1, limit));
  return get("/users/teachers", { pageNumber: page, pageSize: safeLimit, academicYear });
}

function fetchTeacher(teacherId: string) {
  return get(`/users/teachers/${teacherId}`);
}

function createTeacherApi(form: any) {
  const ypRaw = form.yearOfPassing?.toString?.().trim?.() ?? "";
  const yearOfPassing = ypRaw ? parseInt(ypRaw, 10) : new Date().getFullYear();
  const payload = {
    request: {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      email: form.email?.trim().toLowerCase(),
      contact: form.contact?.trim(),
      gender: form.gender,
      dateOfBirth: form.dob,
      address: [
        `${form.areaStreet}`,
        `${form.location}, ${form.district}`,
        `${form.state} - ${form.pincode}`,
      ].filter(Boolean),
      aadhaarId: form.aadhaarId?.trim(),
      panCardNumber: form.panCardNumber?.trim()
        ? form.panCardNumber.trim().toUpperCase()
        : undefined,
      subjects: form.subjects?.trim(),
      designation: form.designation?.trim(),
      highestQualification: form.highestQualification?.trim(),
      university: form.university?.trim(),
      yearOfPassing: Number.isFinite(yearOfPassing) ? yearOfPassing : new Date().getFullYear(),
      grade: form.percentage?.trim(),
      transportId:
        form.transportMode === "Transport" ? form.transportId ?? null : null,
      registrationPhotoId: form.registrationPhotoId || null,
      ...(form.publicUserId?.trim()
        ? { publicUserId: form.publicUserId.trim() }
        : {}),
    },
  };
  return post("/users/teachers", payload);
}

function updateTeacherApi(id: string, form: any) {
  const payload = {
    request: {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      email: form.email?.trim().toLowerCase(),
      contact: form.contact?.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      address: [
        `${form.areaStreet}`,
        `${form.location}, ${form.district}`,
        `${form.state} - ${form.pincode}`,
      ].filter(Boolean),
      subjects: form.subjects?.trim(),
      designation: form.designation?.trim(),
      highestQualification: form.highestQualification?.trim(),
      university: form.university?.trim(),
      yearOfPassing: form.yearOfPassing?.toString().trim() || null,
      grade: form.percentage?.trim(),
      transportId:
        form.transportMode === "Transport" ? form.transportId ?? null : null,
      registrationPhotoId: form.registrationPhotoId || null,
      ...(form.basicSalary !== undefined &&
      form.basicSalary !== null &&
      !Number.isNaN(form.basicSalary)
        ? { basicSalary: form.basicSalary }
        : {}),
    },
  };
  return patch(`/users/teachers/${id}`, payload);
}

function deleteTeacherApi(teacherId: string, otp: string) {
  return del(`/users/teachers/${teacherId}`, { request: { otp } });
}

function bulkDeleteTeachersApi(teacherIds: string[], otp: string) {
  return post("/users/teachers/bulk-delete", {
    request: { teacherIds, otp },
  });
}

export function useTeachersPage(page: number, limit = 15, academicYear?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["teachers", page, limit, academicYear],
    queryFn: () => fetchTeachers({ page, limit, academicYear }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // Prefetch next page
  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["teachers", nextPage, limit, academicYear],
      queryFn: () => fetchTeachers({ page: nextPage, limit, academicYear }),
    });
  }

  return query;
}

export function useTeacher(teacherId: string) {
  return useQuery({
    queryKey: ["teacher", teacherId],
    queryFn: () => fetchTeacher(teacherId),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createTeacherApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...form }: { id: string;[key: string]: any }) =>
      updateTeacherApi(id, form),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", id] });
    },
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteTeacherApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useBulkDeleteTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teacherIds, otp }: { teacherIds: string[]; otp: string }) =>
      bulkDeleteTeachersApi(teacherIds, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useBulkUploadTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (csvData: string) => post("/users/teachers/bulk", { csvData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useToggleTeacherAccountActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      patch(`/users/teachers/${id}/account-active`, { request: { active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
}

