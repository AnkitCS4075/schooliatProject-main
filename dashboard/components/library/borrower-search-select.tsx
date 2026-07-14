"use client";

import { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type BorrowerOption = {
  id: string;
  /** Visible label */
  label: string;
  /** Lowercase haystack for substring search */
  searchText: string;
};

interface BorrowerSearchSelectProps {
  value: string;
  onChange: (userId: string) => void;
  options: BorrowerOption[];
  disabled?: boolean;
  loading?: boolean;
  emptyHint?: string;
  error?: string;
}

export function BorrowerSearchSelect({
  value,
  onChange,
  options,
  disabled = false,
  loading = false,
  emptyHint = "No borrowers available",
  error,
}: BorrowerSearchSelectProps) {
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  const filtered = useMemo(() => {
    const tokens = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (tokens.length === 0) return options;
    return options.filter((o) =>
      tokens.every((t) => o.searchText.includes(t))
    );
  }, [options, query]);

  useEffect(() => {
    if (!value) setQuery("");
  }, [value]);

  if (loading) {
    return (
      <div className="rounded-md border border-dashed border-muted-foreground/30 px-3 py-6 text-center text-sm text-muted-foreground">
        Loading borrowers…
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 rounded-md border border-input bg-muted/30 px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-sm" title={selected.label}>
            {selected.label}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={disabled}
            onClick={() => onChange("")}
            aria-label="Clear borrower"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, student ID, email, roll number…"
          disabled={disabled}
          className="pl-9"
          autoComplete="off"
          name="borrowerSearch"
        />
      </div>
      <ScrollArea
        className={cn(
          "h-[min(280px,45vh)] rounded-md border border-input bg-background"
        )}
      >
        <div className="space-y-0.5 p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {options.length === 0 ? emptyHint : "No borrowers match your search"}
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                type="button"
                disabled={disabled}
                title={opt.label}
                className={cn(
                  "w-full rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "truncate"
                )}
                onClick={() => {
                  onChange(opt.id);
                  setQuery("");
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
