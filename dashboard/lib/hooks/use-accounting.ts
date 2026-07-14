"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

function fetchAccounts() {
  return get("/accounting/accounts");
}

function bootstrapAccounts() {
  return post("/accounting/bootstrap", { request: {} });
}

function createAccount(data: any) {
  return post("/accounting/accounts", { request: data });
}

function fetchJournalEntries(page = 1, limit = 20) {
  return get(`/accounting/journal-entries?page=${page}&limit=${limit}`);
}

function createJournalEntry(data: any) {
  return post("/accounting/journal-entries", { request: data });
}

function fetchBalances() {
  return get("/accounting/balances");
}

function fetchProfitAndLoss() {
  return get("/accounting/reports/profit-and-loss");
}

function fetchBalanceSheet() {
  return get("/accounting/reports/balance-sheet");
}

function upsertOpeningBalance(data: any) {
  return post("/accounting/opening-balances", { request: data });
}

function fetchOpeningBalances() {
  return get("/accounting/opening-balances");
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounting", "accounts"],
    queryFn: fetchAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBootstrapAccounts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bootstrapAccounts,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounting", "accounts"] }),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounting", "accounts"] }),
  });
}

export function useJournalEntries(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["accounting", "journal-entries", page, limit],
    queryFn: () => fetchJournalEntries(page, limit),
    staleTime: 30 * 1000,
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounting", "journal-entries"] });
      qc.invalidateQueries({ queryKey: ["accounting", "balances"] });
    },
  });
}

export function useAccountBalances() {
  return useQuery({
    queryKey: ["accounting", "balances"],
    queryFn: fetchBalances,
    staleTime: 30 * 1000,
  });
}

export function useProfitAndLoss() {
  return useQuery({
    queryKey: ["accounting", "pl"],
    queryFn: fetchProfitAndLoss,
    staleTime: 30 * 1000,
  });
}

export function useBalanceSheet() {
  return useQuery({
    queryKey: ["accounting", "balance-sheet"],
    queryFn: fetchBalanceSheet,
    staleTime: 30 * 1000,
  });
}

export function useUpsertOpeningBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertOpeningBalance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounting"] }),
  });
}

export function useOpeningBalances() {
  return useQuery({
    queryKey: ["accounting", "opening-balances"],
    queryFn: fetchOpeningBalances,
    staleTime: 30 * 1000,
  });
}
