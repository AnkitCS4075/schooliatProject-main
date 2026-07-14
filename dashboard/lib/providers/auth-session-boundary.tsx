"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const TOKEN_KEY = "accessToken";

/**
 * Root-level tenant/session safety:
 * whenever auth token changes (login/logout/account switch), clear React Query cache
 * so school-scoped data from the previous account is never reused.
 */
export function AuthSessionBoundary() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let token: string | null = null;
    try {
      token = window.sessionStorage.getItem(TOKEN_KEY);
    } catch {
      token = null;
    }

    if (lastTokenRef.current === null) {
      lastTokenRef.current = token;
      return;
    }

    if (lastTokenRef.current !== token) {
      queryClient.clear();
      lastTokenRef.current = token;
    }
  }, [pathname, queryClient]);

  return null;
}
