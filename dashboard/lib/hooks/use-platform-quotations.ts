import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, downloadFromApi } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// ─── API Functions ───────────────────────────────────────────────────

function fetchPlatformQuotations({ page, limit, status, search }: { page: number; limit: number; status?: string; search?: string }) {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  if (search) params.search = search;
  return get("/platform-quotations", params);
}

function fetchPlatformQuotation(id: string) {
  return get(`/platform-quotations/${id}`);
}

function fetchPlatformQuotationStats() {
  return get("/platform-quotations/stats");
}

function fetchPlatformQuotationPreview(id: string) {
  return get(`/platform-quotations/${id}/preview`);
}

function createPlatformQuotationApi(form: any) {
  return post("/platform-quotations", { request: form });
}

function updatePlatformQuotationApi(id: string, form: any) {
  return patch(`/platform-quotations/${id}`, { request: form });
}

function sendPlatformQuotationEmailApi(id: string, data: { to: string; subject?: string; message?: string }) {
  return post(`/platform-quotations/${id}/send-email`, { request: data });
}

function acceptPlatformQuotationApi(id: string) {
  return post(`/platform-quotations/${id}/accept`);
}

function rejectPlatformQuotationApi(id: string, reason: string) {
  return post(`/platform-quotations/${id}/reject`, { request: { reason } });
}

function expirePlatformQuotationApi(id: string) {
  return post(`/platform-quotations/${id}/expire`);
}

function downloadPlatformQuotationPdf(id: string) {
  return downloadFromApi(`/platform-quotations/${id}/pdf`);
}

// ─── Hooks ───────────────────────────────────────────────────────────

export function usePlatformQuotations(page: number, limit: number, status?: string, search?: string) {
  return useQuery({
    queryKey: ["platform-quotations", page, limit, status, search],
    queryFn: () => fetchPlatformQuotations({ page, limit, status, search }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePlatformQuotation(id: string) {
  return useQuery({
    queryKey: ["platform-quotation", id],
    queryFn: () => fetchPlatformQuotation(id),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

export function usePlatformQuotationStats() {
  return useQuery({
    queryKey: ["platform-quotation-stats"],
    queryFn: fetchPlatformQuotationStats,
    staleTime: 30_000,
  });
}

export function usePlatformQuotationPreview(id: string) {
  return useQuery({
    queryKey: ["platform-quotation-preview", id],
    queryFn: () => fetchPlatformQuotationPreview(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

function invalidatePlatformQuotations(queryClient: any, id?: string) {
  queryClient.invalidateQueries({ queryKey: ["platform-quotations"] });
  queryClient.invalidateQueries({ queryKey: ["platform-quotation-stats"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["platform-quotation", id] });
}

export function useCreatePlatformQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPlatformQuotationApi,
    onSuccess: () => invalidatePlatformQuotations(queryClient),
  });
}

export function useUpdatePlatformQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updatePlatformQuotationApi(id, data),
    onSuccess: (_: any, variables: any) => invalidatePlatformQuotations(queryClient, variables.id),
  });
}

export function useSendPlatformQuotationEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { to: string; subject?: string; message?: string } }) =>
      sendPlatformQuotationEmailApi(id, data),
    onSuccess: (_: any, variables: any) => invalidatePlatformQuotations(queryClient, variables.id),
  });
}

export function useAcceptPlatformQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acceptPlatformQuotationApi(id),
    onSuccess: (_: any, variables: any) => {
      invalidatePlatformQuotations(queryClient, variables);
      queryClient.invalidateQueries({ queryKey: ["school-onboardings"] });
    },
  });
}

export function useRejectPlatformQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectPlatformQuotationApi(id, reason),
    onSuccess: (_: any, variables: any) => invalidatePlatformQuotations(queryClient, variables.id),
  });
}

export function useExpirePlatformQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expirePlatformQuotationApi(id),
    onSuccess: (_: any, variables: any) => invalidatePlatformQuotations(queryClient, variables),
  });
}

export function useDownloadPlatformQuotationPdf() {
  return useMutation({
    mutationFn: (id: string) => downloadPlatformQuotationPdf(id),
  });
}
