"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clearToken } from "@/lib/auth/storage";
import { apiEvents, API_EVENTS } from "@/lib/api/events";
import { useQueryClient } from "@tanstack/react-query";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Handle logout - clears token and redirects to login
  const handleLogout = useCallback(async () => {
    try {
      await clearToken();
      // Clear all cached queries
      queryClient.clear();
      // Navigate to login
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still try to navigate even if token clearing fails
      router.replace("/login");
    }
  }, [router, queryClient]);

  // Listen for API events
  useEffect(() => {
    const unsubUnauthorized = apiEvents.on(API_EVENTS.UNAUTHORIZED, (data) => {
      toast.warning(
        data?.message || "Your session has expired. Please log in again."
      );
      handleLogout();
    });

    const unsubForbidden = apiEvents.on(API_EVENTS.FORBIDDEN, (data) => {
      const customMessage =
        data?.message || "You are not authorized to perform this action.";
      toast.error(customMessage);
    });

    const unsubServerError = apiEvents.on(API_EVENTS.SERVER_ERROR, (data) => {
      const customMessage =
        data?.message || "A server error occurred. Please try again later.";
      toast.error(customMessage);
    });

    const unsubNetworkError = apiEvents.on(API_EVENTS.NETWORK_ERROR, (data) => {
      const customMessage =
        data?.message ||
        "Network error. Please check your connection and try again.";
      toast.error(customMessage);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubUnauthorized();
      unsubForbidden();
      unsubServerError();
      unsubNetworkError();
    };
  }, [handleLogout]);

  return <>{children}</>;
}

