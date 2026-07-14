"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

function fetchStaffMembers({ page = 1, limit = 15, academicYear }: { page?: number; limit?: number; academicYear?: string } = {}) {
    return get("/users/staff", { pageNumber: page, pageSize: limit, academicYear });
}

function fetchStaffMember(staffId: string) {
    return get(`/users/staff/${staffId}`);
}

function createStaffApi(form: any) {
    const payload = {
        request: {
            firstName: form.firstName?.trim(),
            lastName: form.lastName?.trim(),
            email: form.email?.trim(),
            contact: form.contact?.trim(),
            gender: form.gender,
            dateOfBirth: form.dob,
            address: [
                `${form.areaStreet}`,
                `${form.location}, ${form.district}`,
                `${form.state} - ${form.pincode}`,
            ].filter(Boolean),
            aadhaarId: form.aadhaarId?.trim(),
            registrationPhotoId: form.registrationPhotoId || null,
            designation: form.designation?.trim() || null,
            basicSalary: form.basicSalary != null ? Number(form.basicSalary) : null,
            ...(form.publicUserId?.trim()
                ? { publicUserId: form.publicUserId.trim() }
                : {}),
        },
    };
    return post("/users/staff", payload);
}

function updateStaffApi(id: string, form: any) {
    const payload = {
        request: {
            firstName: form.firstName?.trim(),
            lastName: form.lastName?.trim(),
            email: form.email?.trim(),
            contact: form.contact?.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth ?? form.dob,
            address: [
                `${form.areaStreet}`,
                `${form.location}, ${form.district}`,
                `${form.state} - ${form.pincode}`,
            ].filter(Boolean),
            aadhaarId: form.aadhaarId?.trim(),
            registrationPhotoId: form.registrationPhotoId || null,
            designation: form.designation?.trim() || null,
            basicSalary: form.basicSalary != null ? Number(form.basicSalary) : null,
        },
    };
    return patch(`/users/staff/${id}`, payload);
}

function deleteStaffApi(staffId: string, otp: string) {
    return del(`/users/staff/${staffId}`, { request: { otp } });
}

function bulkDeleteStaffApi(staffIds: string[], otp: string) {
    return post("/users/staff/bulk-delete", {
        request: { staffIds, otp },
    });
}

export function useStaffPage(page: number, limit = 15, academicYear?: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["staff", page, limit, academicYear],
        queryFn: () => fetchStaffMembers({ page, limit, academicYear }),
        placeholderData: keepPreviousData,
        staleTime: 30 * 1000,
    });

    // Prefetch next page
    if (!query.isPlaceholderData && query.data?.hasNext) {
        const nextPage = page + 1;
        queryClient.prefetchQuery({
            queryKey: ["staff", nextPage, limit, academicYear],
            queryFn: () => fetchStaffMembers({ page: nextPage, limit, academicYear }),
        });
    }

    return query;
}

export function useStaffMember(staffId: string) {
    return useQuery({
        queryKey: ["staffMember", staffId],
        queryFn: () => fetchStaffMember(staffId),
        enabled: !!staffId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useCreateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: any) => createStaffApi(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
    });
}

export function useUpdateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...form }: { id: string;[key: string]: any }) =>
            updateStaffApi(id, form),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            queryClient.invalidateQueries({ queryKey: ["staffMember", id] });
        },
    });
}

export function useDeleteStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteStaffApi(id, otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
    });
}

export function useBulkDeleteStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffIds, otp }: { staffIds: string[]; otp: string }) =>
            bulkDeleteStaffApi(staffIds, otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
    });
}
