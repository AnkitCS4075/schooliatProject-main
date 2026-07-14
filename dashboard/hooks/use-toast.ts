"use client";

import { toast as sonnerToast } from "sonner";

export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "warning";
    }) => {
      if (variant === "destructive") {
        sonnerToast.error(title, {
          description,
        });
      } else if (variant === "warning") {
        sonnerToast.warning(title, {
          description,
        });
      } else {
        sonnerToast.success(title, {
          description,
        });
      }
    },
  };
}

