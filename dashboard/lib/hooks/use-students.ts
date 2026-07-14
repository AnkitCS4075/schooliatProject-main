"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

/**
 * GET /users/students returns `totalPages` and `hasNext` at the top level (not under `pagination`).
 * Normalize so list UIs can rely on `pagination.totalPages` and pagination / Next works past 15 rows.
 */
function fetchStudents({
  page = 1,
  limit = 15,
  academicYear,
  classId,
  gender,
}: { page?: number; limit?: number; academicYear?: string; classId?: string; gender?: string } = {}) {
  return get("/users/students", { page, limit, academicYear, classId, gender }).then((res: any) => {
    const totalPages = res?.totalPages ?? res?.pagination?.totalPages ?? 1;
    const hasNext = res?.hasNext ?? res?.pagination?.hasNext ?? false;
    return {
      ...res,
      totalPages,
      hasNext,
      pagination: {
        totalPages,
        hasNext,
      },
    };
  });
}

function fetchStudent(studentId: string) {
  return get(`/users/students/${studentId}`);
}

function buildAddressLines(form: any) {
  const line1 = (form.areaStreet ?? "").trim();
  const line2Parts = [form.location, form.district]
    .map((v: unknown) => String(v ?? "").trim())
    .filter(Boolean);
  const line2 = line2Parts.join(", ");
  const state = String(form.state ?? "").trim();
  const pincode = String(form.pincode ?? "").trim();
  const line3 = [state, pincode].filter(Boolean).join(" - ");
  return [line1, line2, line3].filter(Boolean);
}

function createStudentApi(form: any) {
  const emailTrim = (form.email ?? "").trim().toLowerCase();
  const payload = {
    request: {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      gender: form.gender,
      dateOfBirth: form.dob,
      contact: form.phone?.trim(),
      ...(emailTrim ? { email: emailTrim } : {}),
      classId: form.classId,
      address: buildAddressLines(form),
      fatherName: form.fatherName?.trim(),
      fatherContact: form.fatherContact?.trim(),
      motherName: form.motherName?.trim(),
      motherContact: form.motherContact?.trim(),
      annualIncome: form.fatherIncome,
      fatherOccupation: form.fatherOccupation?.trim(),
      aadhaarId: form.aadhaarNumber?.trim() || null,
      apaarId: form.apaarId?.trim() || null,
      rollNumber: form.rollNumber?.trim() || null,
      accommodationType: form.accommodationType,
      transport: form.transportMode,
      transportId: form.transportMode === "Transport" ? form.transportId : null,
      registrationPhotoId: form.registrationPhotoId || null,
      bloodGroup: form.bloodGroup?.trim() || null,
    },
  };
  return post("/users/students", payload);
}

function updateStudentApi(studentId: string, form: any) {
  const emailTrim = (form.email ?? "").trim().toLowerCase();
  const request: Record<string, unknown> = {
    firstName: form.firstName?.trim(),
    lastName: form.lastName?.trim(),
    gender: form.gender,
    dateOfBirth: form.dob,
    contact: form.phone?.trim(),
    classId: form.classId,
    address: buildAddressLines(form),
    fatherName: form.fatherName?.trim(),
    fatherContact: form.fatherContact?.trim(),
    motherName: form.motherName?.trim(),
    motherContact: form.motherContact?.trim(),
    annualIncome: form.fatherIncome,
    fatherOccupation: form.fatherOccupation?.trim(),
    aadhaarId: form.aadhaarNumber?.trim() || null,
    apaarId: form.apaarId?.trim() || null,
    rollNumber: form.rollNumber?.trim() || null,
    accommodationType: form.accommodationType,
    transport: form.transportMode,
    transportId: form.transportMode === "Transport" ? form.transportId : null,
    registrationPhotoId: form.registrationPhotoId || null,
    bloodGroup: form.bloodGroup?.trim() || null,
  };
  if (emailTrim) {
    request.email = emailTrim;
  }
  return patch(`/users/students/${studentId}`, { request });
}

function deleteStudentApi(studentId: string, otp: string) {
  return del(`/users/students/${studentId}`, { request: { otp } });
}

function bulkDeleteStudentsApi(studentIds: string[], otp: string) {
  return post("/users/students/bulk-delete", {
    request: { studentIds, otp },
  });
}

export function useStudentsPage(
  page: number,
  limit = 15,
  academicYear?: string,
  classId?: string,
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["students", page, limit, academicYear, classId ?? ""],
    queryFn: () => fetchStudents({ page, limit, academicYear, classId }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // Prefetch next page
  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["students", nextPage, limit, academicYear, classId ?? ""],
      queryFn: () => fetchStudents({ page: nextPage, limit, academicYear, classId }),
    });
  }

  return query;
}

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: () => fetchStudent(studentId),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createStudentApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...form }: { id: string;[key: string]: any }) =>
      updateStudentApi(id, form),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteStudentApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useBulkDeleteStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentIds, otp }: { studentIds: string[]; otp: string }) =>
      bulkDeleteStudentsApi(studentIds, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

// Wrapper hook for simpler API
export function useStudents(params?: { page?: number; limit?: number; academicYear?: string; classId?: string; gender?: string }) {
  return useQuery({
    queryKey: ["students", params?.page || 1, params?.limit || 1000, params?.academicYear, params?.classId, params?.gender],
    queryFn: () => fetchStudents({
      page: params?.page || 1,
      limit: params?.limit || 1000,
      academicYear: params?.academicYear,
      classId: params?.classId,
      gender: params?.gender
    }),
    staleTime: 30 * 1000,
  });
}

export function useToggleStudentAccountActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      patch(`/users/students/${id}/account-active`, { request: { active } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useBulkAssignClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentIds, classId }: { studentIds: string[]; classId: string }) =>
      patch("/users/students/bulk-assign-class", { studentIds, classId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useBulkUploadStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (csvData: string) => post("/users/students/bulk", { csvData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
