"use client";

import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circular";
}

export function Shimmer({ className, variant = "default" }: ShimmerProps) {
  const baseClasses = "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

  const variants = {
    default: "h-4 w-full rounded",
    card: "h-full w-full rounded-lg",
    text: "h-4 w-3/4 rounded",
    circular: "h-12 w-12 rounded-full"
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{
        backgroundSize: "200% 100%",
        animation: "shimmer 2s infinite"
      }}
    />
  );
}

