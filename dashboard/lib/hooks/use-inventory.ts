"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";

export interface InventoryItem {
    id: string;
    itemName: string;
    itemCode: string;
    category: string;
    unit: string;
    type: "CONSUMABLE" | "NON_CONSUMABLE";
    totalStock: number;
    issuedQty: number;
    issuedTo: string | null;
    lastIssuedDate: string | null;
    condition: "NEW" | "GOOD" | "FAIR" | "POOR";
    schoolId: string;
    createdAt: string;
}

interface InventoryFilters {
    type?: string;
    category?: string;
    unit?: string;
    condition?: string;
    search?: string;
    page?: number;
    limit?: number;
}

function fetchInventory(filters: InventoryFilters) {
    return get("/inventory", filters);
}

function createInventoryItem(data: Partial<InventoryItem>) {
    return post("/inventory", { request: data });
}

function updateInventoryItem(id: string, data: Partial<InventoryItem>) {
    return patch(`/inventory/${id}`, { request: data });
}

function deleteInventoryItem(id: string, otp: string) {
    return del(`/inventory/${id}`, { request: { otp } });
}

function bulkDeleteInventoryItems(itemIds: string[], otp: string) {
    return post("/inventory/bulk-delete", { request: { itemIds, otp } });
}

export function useInventory(filters: InventoryFilters = {}) {
    return useQuery({
        queryKey: ["inventory", filters],
        queryFn: () => fetchInventory(filters),
        staleTime: 30 * 1000,
    });
}

export function useCreateInventoryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<InventoryItem>) => createInventoryItem(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
        },
    });
}

export function useUpdateInventoryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
            updateInventoryItem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
        },
    });
}

export function useDeleteInventoryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteInventoryItem(id, otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
        },
    });
}

export function useBulkDeleteInventoryItems() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemIds, otp }: { itemIds: string[]; otp: string }) =>
            bulkDeleteInventoryItems(itemIds, otp),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory"] });
        },
    });
}
