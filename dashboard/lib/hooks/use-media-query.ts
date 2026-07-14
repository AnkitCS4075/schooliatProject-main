"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to `window.matchMedia(query)`. SSR snapshot is `false` (mobile-first).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Tailwind `lg` breakpoint (1024px). */
export function useIsLgScreen() {
  return useMediaQuery("(min-width: 1024px)");
}
