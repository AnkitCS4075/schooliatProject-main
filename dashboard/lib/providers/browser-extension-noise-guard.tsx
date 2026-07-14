"use client";

import { ReactNode, useEffect } from "react";

const EXTENSION_ASYNC_CHANNEL_CLOSED =
  "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received";

/**
 * Filters known browser-extension runtime noise that surfaces as unhandled
 * promise errors inside web apps, but does not originate from app code.
 */
export function BrowserExtensionNoiseGuard({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        typeof reason === "string"
          ? reason
          : reason && typeof reason === "object" && "message" in reason
            ? String((reason as { message?: unknown }).message ?? "")
            : "";
      if (message.includes(EXTENSION_ASYNC_CHANNEL_CLOSED)) {
        event.preventDefault();
      }
    };

    const onError = (event: ErrorEvent) => {
      const message = String(event.message || "");
      if (message.includes(EXTENSION_ASYNC_CHANNEL_CLOSED)) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);
    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return <>{children}</>;
}

