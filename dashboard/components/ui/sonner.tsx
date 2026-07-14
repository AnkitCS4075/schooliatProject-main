"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "border shadow-lg",
          success: "!bg-emerald-50 !text-emerald-900 !border-emerald-200 [&_[data-icon]]:!text-emerald-600",
          error: "!bg-red-50 !text-red-900 !border-red-200 [&_[data-icon]]:!text-red-600",
          warning: "!bg-amber-50 !text-amber-900 !border-amber-200 [&_[data-icon]]:!text-amber-600",
          info: "!bg-blue-50 !text-blue-900 !border-blue-200 [&_[data-icon]]:!text-blue-600",
          description: "!text-current opacity-70",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
