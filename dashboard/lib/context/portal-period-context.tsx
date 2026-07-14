"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "schooliat-portal-month";

function defaultMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type PortalPeriodContextValue = {
  /** Calendar month in `yyyy-MM` (used for cross-page reporting context). */
  portalMonth: string;
  setPortalMonth: (value: string) => void;
  /** UTC date strings `yyyy-MM-dd` for the selected calendar month. */
  getMonthDateRange: () => { startDate: string; endDate: string };
};

const PortalPeriodContext = createContext<PortalPeriodContextValue | null>(
  null,
);

export function PortalPeriodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [portalMonth, setPortalMonthState] = useState(() => {
    if (typeof window === "undefined") return defaultMonth();
    try {
      return localStorage.getItem(STORAGE_KEY) || defaultMonth();
    } catch {
      return defaultMonth();
    }
  });

  const setPortalMonth = useCallback((value: string) => {
    setPortalMonthState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  const getMonthDateRange = useCallback(() => {
    const [y, m] = portalMonth.split("-").map(Number);
    if (!y || !m) {
      const d = new Date();
      const sy = d.getFullYear();
      const sm = d.getMonth() + 1;
      const start = new Date(sy, sm - 1, 1);
      const end = new Date(sy, sm, 0);
      const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
      return { startDate: fmt(start), endDate: fmt(end) };
    }
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
    return { startDate: fmt(start), endDate: fmt(end) };
  }, [portalMonth]);

  const value = useMemo(
    () => ({ portalMonth, setPortalMonth, getMonthDateRange }),
    [portalMonth, setPortalMonth, getMonthDateRange],
  );

  return (
    <PortalPeriodContext.Provider value={value}>
      {children}
    </PortalPeriodContext.Provider>
  );
}

export function usePortalPeriod(): PortalPeriodContextValue {
  const ctx = useContext(PortalPeriodContext);
  if (!ctx) {
    throw new Error("usePortalPeriod must be used within PortalPeriodProvider");
  }
  return ctx;
}
