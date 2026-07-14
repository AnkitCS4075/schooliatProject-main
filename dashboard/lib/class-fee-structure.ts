/** Class-level annual fee: custom lines (stored on class) or legacy single annual amount. */

export type FeeComponentRow = { label: string; amount: number };

export function sumFeeComponentRows(
  rows: FeeComponentRow[] | null | undefined,
): number {
  if (!rows?.length) return 0;
  return rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
}

export function getClassAnnualFeeDisplay(cls: {
  defaultFeeComponents?: unknown;
  defaultAnnualFee?: number | null;
}): { primary: string; lines?: string[] } {
  const raw = cls.defaultFeeComponents;
  if (Array.isArray(raw) && raw.length > 0) {
    const lines = raw
      .filter(
        (row: unknown) =>
          row &&
          typeof row === "object" &&
          String((row as { label?: string }).label ?? "").trim(),
      )
      .map((row: unknown) => {
        const r = row as { label?: string; amount?: number };
        const label = String(r.label ?? "").trim();
        const amt = Number(r.amount) || 0;
        return `${label}: ₹${amt.toLocaleString("en-IN")}`;
      });
    const sum = sumFeeComponentRows(
      raw.map((row: unknown) => {
        const r = row as { label?: string; amount?: number };
        return {
          label: String(r.label ?? ""),
          amount: Number(r.amount) || 0,
        };
      }),
    );
    return {
      primary: `₹${sum.toLocaleString("en-IN")} (${raw.length} type${raw.length === 1 ? "" : "s"})`,
      lines: lines.length ? lines : undefined,
    };
  }
  if (cls.defaultAnnualFee != null && cls.defaultAnnualFee > 0) {
    return {
      primary: `₹${Number(cls.defaultAnnualFee).toLocaleString("en-IN")}`,
    };
  }
  return { primary: "School default" };
}
