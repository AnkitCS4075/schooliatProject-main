import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del, downloadFromApi } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// ─── API Functions ───────────────────────────────────────────────────

function fetchQuotations({ page, limit, status }: { page: number; limit: number; status?: string }) {
  const params: Record<string, any> = { page, limit };
  if (status) params.status = status;
  return get("/quotations", params);
}

function fetchQuotation(id: string) {
  return get(`/quotations/${id}`);
}

function createQuotationApi(form: any) {
  return post("/quotations", { request: form });
}

function updateQuotationApi(id: string, form: any) {
  return patch(`/quotations/${id}`, { request: form });
}

function deleteQuotationApi(id: string) {
  return del(`/quotations/${id}`);
}

function fetchQuotationStats() {
  return get("/quotations/stats");
}

function approveQuotationApi(id: string, data?: { comments?: string }) {
  return patch(`/quotations/${id}/approve`, { request: data || {} });
}

function rejectQuotationApi(id: string, data: { reason: string }) {
  return patch(`/quotations/${id}/reject`, { request: data });
}

function cancelQuotationApi(id: string, data?: { reason?: string }) {
  return patch(`/quotations/${id}/cancel`, { request: data || {} });
}

function convertToInvoiceApi(id: string) {
  return post(`/quotations/${id}/convert-to-invoice`);
}

function sendQuotationEmailApi(id: string, data: { to: string[]; subject?: string; message?: string }) {
  return post(`/quotations/${id}/send-email`, { request: data });
}

function fetchQuotationVersions(id: string) {
  return get(`/quotations/${id}/versions`);
}

function fetchQuotationComments(id: string) {
  return get(`/quotations/${id}/comments`);
}

function addQuotationCommentApi(id: string, text: string) {
  return post(`/quotations/${id}/comments`, { request: { text } });
}

function fetchQuotationPreview(id: string) {
  return get(`/quotations/${id}/preview`);
}

function downloadQuotationPdf(id: string) {
  return downloadFromApi(`/quotations/${id}/pdf`);
}

// ─── Hooks ───────────────────────────────────────────────────────────

export function useQuotationsPage(page: number, limit: number, status?: string) {
  return useQuery({
    queryKey: ["quotations", page, limit, status],
    queryFn: () => fetchQuotations({ page, limit, status }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => fetchQuotation(id),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });
}

export function useQuotationStats() {
  return useQuery({
    queryKey: ["quotation-stats"],
    queryFn: fetchQuotationStats,
    staleTime: 30_000,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuotationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateQuotationApi(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuotationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useApproveQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { comments?: string } }) => approveQuotationApi(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useRejectQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { reason: string } }) => rejectQuotationApi(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useCancelQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { reason?: string } }) => cancelQuotationApi(id, data),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
    },
  });
}

export function useConvertToInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => convertToInvoiceApi(id),
    onSuccess: (_: any, variables: string) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation", variables] });
      queryClient.invalidateQueries({ queryKey: ["quotation-stats"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useSendQuotationEmail() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { to: string[]; subject?: string; message?: string } }) =>
      sendQuotationEmailApi(id, data),
  });
}

export function useQuotationVersions(id: string) {
  return useQuery({
    queryKey: ["quotation-versions", id],
    queryFn: () => fetchQuotationVersions(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useQuotationComments(id: string) {
  return useQuery({
    queryKey: ["quotation-comments", id],
    queryFn: () => fetchQuotationComments(id),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useAddQuotationComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => addQuotationCommentApi(id, text),
    onSuccess: (_: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotation-comments", variables.id] });
    },
  });
}

export function useDownloadQuotationPdf() {
  return useMutation({
    mutationFn: (id: string) => downloadQuotationPdf(id),
  });
}

export function useQuotationPreview(id: string) {
  return useQuery({
    queryKey: ["quotation-preview", id],
    queryFn: () => fetchQuotationPreview(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}
