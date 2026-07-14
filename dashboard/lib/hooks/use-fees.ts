"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/lib/api/client";

function fetchInstallments(installmentNumber: number, endInstallmentNumber?: number, academicYear?: string) {
  const query = endInstallmentNumber ? `?end=${endInstallmentNumber}` : "";
  const academicQuery = academicYear
    ? `${query ? "&" : "?"}academicYear=${encodeURIComponent(academicYear)}`
    : "";
  return get(`/fees/installments/${installmentNumber}${query}${academicQuery}`);
}

function fetchStudentFees(studentId: string) {
  return get(`/fees/student/${studentId}`);
}

function fetchStudentFeeLedger(studentId: string, limit = 200) {
  return get(`/fees/student/${studentId}/ledger?limit=${limit}`);
}

export type SchoolFeeLedgerFilters = {
  studentId?: string;
  entryType?: string;
  academicYear?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

function buildSchoolLedgerQuery(filters: SchoolFeeLedgerFilters): string {
  const p = new URLSearchParams();
  if (filters.studentId) p.set("studentId", filters.studentId);
  if (filters.entryType) p.set("entryType", filters.entryType);
  if (filters.academicYear) p.set("academicYear", filters.academicYear);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  if (filters.page != null && filters.page > 0) p.set("page", String(filters.page));
  if (filters.limit != null && filters.limit > 0) p.set("limit", String(filters.limit));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

function fetchSchoolFeeLedger(filters: SchoolFeeLedgerFilters) {
  return get(`/fees/ledger${buildSchoolLedgerQuery(filters)}`);
}

function recordPaymentApi(
  installmentId: string,
  amount?: number,
  paymentMethod?: string,
  isWaiver?: boolean,
  transactionId?: string,
  remarks?: string,
) {
  return patch(`/fees/installments/${installmentId}/payment`, {
    request: { amount, paymentMethod, isWaiver, transactionId, remarks },
  });
}

function cancelInstallmentApi(installmentId: string, reason?: string) {
  return patch(`/fees/installments/${installmentId}/cancel`, {
    request: { reason },
  });
}

function fetchFeeDefaulters(page = 1, limit = 20) {
  return get(`/fees/defaulters?page=${page}&limit=${limit}`);
}

export function useFeeDefaulters(page = 1, limit = 20, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["fees", "defaulters", page, limit],
    queryFn: () => fetchFeeDefaulters(page, limit),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useInstallments(installmentNumber: number, endInstallmentNumber?: number, options: { enabled?: boolean; academicYear?: string } = {}) {
  const { enabled = true, academicYear } = options;
  const shouldFetch = typeof installmentNumber === "number" && installmentNumber >= 1;

  return useQuery({
    queryKey: ["fees", "installments", installmentNumber, endInstallmentNumber, academicYear],
    queryFn: () => fetchInstallments(installmentNumber, endInstallmentNumber, academicYear),
    enabled: shouldFetch && enabled,
    staleTime: 60 * 1000,
  });
}

export function useStudentFees(studentId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["fees", "student", studentId],
    queryFn: () => fetchStudentFees(studentId),
    enabled: !!studentId && enabled,
    staleTime: 60 * 1000,
  });
}

export function useStudentFeeLedger(studentId: string, options: { enabled?: boolean; limit?: number } = {}) {
  const { enabled = true, limit = 200 } = options;

  return useQuery({
    queryKey: ["fees", "ledger", studentId, limit],
    queryFn: () => fetchStudentFeeLedger(studentId, limit),
    enabled: !!studentId && enabled,
    staleTime: 60 * 1000,
  });
}

export function useSchoolFeeLedger(
  filters: SchoolFeeLedgerFilters,
  options: { enabled?: boolean } = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: ["fees", "school-ledger", filters],
    queryFn: () => fetchSchoolFeeLedger(filters),
    enabled,
    staleTime: 30 * 1000,
  });
}

export { buildSchoolLedgerQuery };

export function useCancelFeeInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      installmentId,
      reason,
    }: {
      installmentId: string;
      reason?: string;
    }) => cancelInstallmentApi(installmentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees", "installments"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "student"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "ledger"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "school-ledger"] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      installmentId,
      amount,
      paymentMethod,
      isWaiver,
      transactionId,
      remarks,
    }: {
      installmentId: string;
      amount?: number;
      paymentMethod?: string;
      isWaiver?: boolean;
      transactionId?: string;
      remarks?: string;
    }) => recordPaymentApi(installmentId, amount, paymentMethod, isWaiver, transactionId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees", "installments"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "student"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "ledger"] });
      queryClient.invalidateQueries({ queryKey: ["fees", "school-ledger"] });
    },
  });
}
