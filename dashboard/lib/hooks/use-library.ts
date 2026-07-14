"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, put, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

// Fetch books
function fetchBooks(params: {
  title?: string;
  author?: string;
  category?: string;
  isbn?: string;
  page?: number;
  limit?: number;
}) {
  return get("/library/books", params);
}

// Fetch single book
function fetchBookById(bookId: string) {
  return get(`/library/books/${bookId}`);
}

// Fetch library dashboard
function fetchLibraryDashboard() {
  return get("/library/dashboard");
}

// Fetch library history
function fetchLibraryHistory(params: {
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
}) {
  return get("/library/history", params);
}

// Create book
function createBookApi(data: {
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
  publisher?: string;
  publishedYear?: number;
  description?: string;
}) {
  return post("/library/books", { request: data });
}

// Update book
function updateBookApi(bookId: string, data: {
  title?: string;
  author?: string;
  isbn?: string;
  category?: string;
  totalCopies?: number;
  availableCopies?: number;
  publisher?: string;
  publishedYear?: number;
  description?: string;
}) {
  return put(`/library/books/${bookId}`, { request: data });
}

// Delete book
function deleteBookApi(bookId: string, otp: string) {
  return del(`/library/books/${bookId}`, { request: { otp } });
}

// Issue book
function issueBookApi(data: {
  bookId: string;
  userId: string;
  dueDate: string;
  finePerDay?: number;
}) {
  return post("/library/issues", { request: data });
}

// Return book
function returnBookApi(issueId: string, data: {
  finePaid?: number;
  condition?: string;
}) {
  return post(`/library/issues/${issueId}/return`, { request: data });
}

// Reserve book
function reserveBookApi(data: {
  bookId: string;
  userId: string;
}) {
  return post("/library/reservations", { request: data });
}

// Calculate fines
function calculateFinesApi() {
  return post("/library/calculate-fines");
}

// Bulk create books
function bulkCreateBooksApi(data: {
  books: Array<{
    title: string;
    author: string;
    isbn?: string;
    publisher?: string;
    category?: string;
    totalCopies?: number;
    location?: string;
    language?: string;
    publishedYear?: number;
  }>;
}) {
  return post("/library/books/bulk", { request: data });
}

/**
 * Fetches all pending returns (ISSUED/OVERDUE) for the school from backend.
 */
async function fetchPendingLibraryReturns(): Promise<any[]> {
  const res = await get("/library/pending-returns");
  return res?.data ?? [];
}

// Hooks
export function useBooks(params: {
  title?: string;
  author?: string;
  category?: string;
  isbn?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["library-books", params],
    queryFn: () => fetchBooks(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useLibraryDashboard() {
  return useQuery({
    queryKey: ["library-dashboard"],
    queryFn: () => fetchLibraryDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useLibraryHistory(params: {
  userId?: string;
  page?: number;
  limit?: number;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ["library-history", params],
    queryFn: () => fetchLibraryHistory(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      author: string;
      isbn?: string;
      category?: string;
      totalCopies: number;
      availableCopies: number;
      publisher?: string;
      publishedYear?: number;
      description?: string;
    }) => createBookApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string;[key: string]: any }) =>
      updateBookApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
    },
  });
}

export function useIssueBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      bookId: string;
      userId: string;
      dueDate: string;
      finePerDay?: number;
    }) => issueBookApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-history"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
    },
  });
}

export function useReturnBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, ...data }: { issueId: string;[key: string]: any }) =>
      returnBookApi(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-history"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["library-pending-returns"] });
    },
  });
}

export function useReserveBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { bookId: string; userId: string }) => reserveBookApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-history"] });
    },
  });
}

export function useBookById(bookId: string) {
  return useQuery({
    queryKey: ["library-book", bookId],
    queryFn: () => fetchBookById(bookId),
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteBookApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
    },
  });
}

export function useCalculateFines() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => calculateFinesApi(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-history"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["library-pending-returns"] });
    },
  });
}

export function usePendingLibraryReturns() {
  return useQuery({
    queryKey: ["library-pending-returns"],
    queryFn: fetchPendingLibraryReturns,
    staleTime: 30 * 1000,
  });
}

export function useBulkUploadBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      books: Array<{
        title: string;
        author: string;
        isbn?: string;
        publisher?: string;
        category?: string;
        totalCopies?: number;
        location?: string;
        language?: string;
        publishedYear?: number;
      }>;
    }) => bulkCreateBooksApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-books"] });
      queryClient.invalidateQueries({ queryKey: ["library-dashboard"] });
    },
  });
}

