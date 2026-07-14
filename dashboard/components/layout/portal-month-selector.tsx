"use client";

import { usePathname } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePortalPeriod } from "@/lib/context/portal-period-context";

/**
 * School-admin global month selector (persists and syncs with dashboard month filter when in month mode).
 */
export function PortalMonthSelector({ className }: { className?: string }) {
  const pathname = usePathname();
  const { portalMonth, setPortalMonth } = usePortalPeriod();

  if (!pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-1.5 shrink-0 ${className ?? ""}`}
      title="Portal month (used for reports and dashboard month filter)"
    >
      <CalendarRange className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
      <Input
        type="month"
        value={portalMonth}
        onChange={(e) => setPortalMonth(e.target.value)}
        className="h-8 w-[132px] text-xs border-gray-200"
        aria-label="Portal month"
      />
    </div>
  );
}
