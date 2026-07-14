"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

function bootstrapPlatformAccounts() {
  return post("/platform-finance/bootstrap", { request: {} });
}

function fetchPlatformAccounts() {
  return get("/platform-finance/accounts");
}

function fetchPlatformBalances() {
  return get("/platform-finance/balances");
}

function fetchPlatformJournalEntries(page = 1, limit = 20) {
  return get(`/platform-finance/journal-entries?page=${page}&limit=${limit}`);
}

function createPlatformJournalEntry(data: any) {
  return post("/platform-finance/journal-entries", { request: data });
}

function fetchPlatformProfitAndLoss() {
  return get("/platform-finance/reports/profit-and-loss");
}

function fetchPlatformBalanceSheet() {
  return get("/platform-finance/reports/balance-sheet");
}

function fetchPlatformOpeningBalances() {
  return get("/platform-finance/opening-balances");
}

function upsertPlatformOpeningBalance(data: any) {
  return post("/platform-finance/opening-balances", { request: data });
}

function fetchPlatformIncoming() {
  return get("/platform-finance/incoming");
}

function fetchPlatformOutgoing() {
  return get("/platform-finance/outgoing");
}

export function usePlatformBootstrap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bootstrapPlatformAccounts,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-finance"] }),
  });
}

export function usePlatformAccounts() {
  return useQuery({
    queryKey: ["platform-finance", "accounts"],
    queryFn: fetchPlatformAccounts,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformBalances() {
  return useQuery({
    queryKey: ["platform-finance", "balances"],
    queryFn: fetchPlatformBalances,
    staleTime: 30 * 1000,
  });
}

export function usePlatformJournalEntries(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["platform-finance", "journal-entries", page, limit],
    queryFn: () => fetchPlatformJournalEntries(page, limit),
    staleTime: 30 * 1000,
  });
}

export function useCreatePlatformJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlatformJournalEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-finance", "journal-entries"] });
      qc.invalidateQueries({ queryKey: ["platform-finance", "balances"] });
    },
  });
}

export function usePlatformProfitAndLoss() {
  return useQuery({
    queryKey: ["platform-finance", "pl"],
    queryFn: fetchPlatformProfitAndLoss,
    staleTime: 30 * 1000,
  });
}

export function usePlatformBalanceSheet() {
  return useQuery({
    queryKey: ["platform-finance", "balance-sheet"],
    queryFn: fetchPlatformBalanceSheet,
    staleTime: 30 * 1000,
  });
}

export function usePlatformOpeningBalances() {
  return useQuery({
    queryKey: ["platform-finance", "opening-balances"],
    queryFn: fetchPlatformOpeningBalances,
    staleTime: 30 * 1000,
  });
}

export function useUpsertPlatformOpeningBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertPlatformOpeningBalance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform-finance"] }),
  });
}

export function usePlatformIncoming() {
  return useQuery({
    queryKey: ["platform-finance", "incoming"],
    queryFn: fetchPlatformIncoming,
    staleTime: 30 * 1000,
  });
}

export function usePlatformOutgoing() {
  return useQuery({
    queryKey: ["platform-finance", "outgoing"],
    queryFn: fetchPlatformOutgoing,
    staleTime: 30 * 1000,
  });
}
