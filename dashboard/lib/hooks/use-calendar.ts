"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api/client";
import { keepPreviousData } from "@tanstack/react-query";

function fetchCalendarEvents({
  page = 1,
  limit = 15,
  month,
  date,
}: {
  page?: number;
  limit?: number;
  month?: string;
  date?: string;
} = {}) {
  const params: any = { page, limit };
  if (month) params.month = month;
  if (date) params.date = date;
  return get("/calendar/events", params);
}

function fetchCalendarEvent(eventId: string) {
  return get(`/calendar/events/${eventId}`);
}

function createCalendarEventApi(form: any) {
  const payload = {
    request: {
      title: form.title?.trim(),
      description: form.description?.trim(),
      dateType: "SINGLE_DATE",
      from: form.from,
      till: form.till,
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return post("/calendar/events", payload);
}

function updateCalendarEventApi(eventId: string, form: any) {
  const fromDate = new Date(form.from);
  const tillDate = new Date(form.till);
  const isMultiDate = fromDate.toDateString() !== tillDate.toDateString();
  const dateType = isMultiDate ? "DATE_RANGE" : "SINGLE_DATE";

  const payload = {
    request: {
      title: form.title?.trim(),
      description: form.description?.trim(),
      dateType: dateType,
      from: form.from,
      till: form.till,
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return patch(`/calendar/events/${eventId}`, payload);
}

function deleteCalendarEventApi(eventId: string, otp: string) {
  return del(`/calendar/events/${eventId}`, { request: { otp } });
}

function fetchHolidays({ month, date }: { month?: string; date?: string } = {}) {
  const params: any = {};
  if (month) params.month = month;
  if (date) params.date = date;
  return get("/calendar/holidays", params);
}

function createHolidayApi(form: any) {
  const payload = {
    request: {
      title: form.title?.trim(),
      from: form.from,
      till: form.till,
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return post("/calendar/holidays", payload);
}

function updateHolidayApi(id: string, form: any) {
  const payload = {
    request: {
      title: form.title?.trim(),
      from: form.from,
      till: form.till,
      visibleFrom: form.visibleFrom,
      visibleTill: form.visibleTill,
    },
  };
  return patch(`/calendar/holidays/${id}`, payload);
}

function deleteHolidayApi(holidayId: string, otp: string) {
  return del(`/calendar/holidays/${holidayId}`, { request: { otp } });
}

export function useCalendarEventsPage(
  page: number = 1,
  limit: number = 15,
  month?: string,
  date?: string
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["calendar-events", page, limit, month, date],
    queryFn: () => fetchCalendarEvents({ page, limit, month, date }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  // Prefetch next page
  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: ["calendar-events", nextPage, limit, month, date],
      queryFn: () => fetchCalendarEvents({ page: nextPage, limit, month, date }),
    });
  }

  return query;
}

export function useCalendarEvent(eventId: string) {
  return useQuery({
    queryKey: ["calendar-event", eventId],
    queryFn: () => fetchCalendarEvent(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createCalendarEventApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string; [key: string]: any }) =>
      updateCalendarEventApi(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteCalendarEventApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    },
  });
}

export function useHolidays(month?: string, date?: string) {
  return useQuery({
    queryKey: ["holidays", month, date],
    queryFn: () => fetchHolidays({ month, date }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: any) => createHolidayApi(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...formData }: { id: string; [key: string]: any }) =>
      updateHolidayApi(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteHolidayApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays"] });
    },
  });
}

