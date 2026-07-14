"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api/client";

function fetchGeofenceConfig() {
  return get("/attendance/geofence");
}

function selfMarkAttendance(data: {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  status?: string;
}) {
  return post("/attendance/self-mark", { request: data });
}

export function useGeofenceConfig() {
  return useQuery({
    queryKey: ["attendance", "geofence"],
    queryFn: fetchGeofenceConfig,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSelfMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selfMarkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}
