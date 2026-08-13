"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type MatrixEntry = { module: string; levels: string[] };
export type MatrixModule = {
  module: string;
  label: string;
  levels: { level: string; permissions: string[] }[];
};

interface PermissionMatrixEditorProps {
  /** Matrix definition from GET /matrix (levels + modules). */
  definition: { levels: string[]; modules: MatrixModule[] } | undefined;
  /** Currently selected { module, levels } entries. */
  value: MatrixEntry[];
  onChange: (next: MatrixEntry[]) => void;
  readOnly?: boolean;
}

/**
 * Full feature permission matrix grid — every module × granular level
 * (View | Create | Edit | Delete | Export | Approve).
 */
export function PermissionMatrixEditor({
  definition,
  value,
  onChange,
  readOnly = false,
}: PermissionMatrixEditorProps) {
  const levels = definition?.levels || [];
  const modules = definition?.modules || [];

  const selectedMap = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const entry of value) {
      if (!entry || !entry.module) continue;
      map[entry.module] = new Set(entry.levels || []);
    }
    return map;
  }, [value]);

  const isModuleSelected = (module: string) =>
    (selectedMap[module]?.size || 0) > 0;

  const areAllLevelsSelected = (module: MatrixModule) =>
    module.levels.every(({ level }) => selectedMap[module.module]?.has(level));

  const toggleLevel = (module: string, level: string, checked: boolean) => {
    if (readOnly) return;
    const current = new Set(selectedMap[module] || []);
    if (checked) current.add(level);
    else current.delete(level);
    const next = value.filter((e) => e.module !== module);
    if (current.size > 0) next.push({ module, levels: [...current] });
    onChange(next);
  };

  const toggleModule = (module: MatrixModule, checked: boolean) => {
    if (readOnly) return;
    if (checked) {
      const next = value.filter((e) => e.module !== module.module);
      next.push({ module: module.module, levels: module.levels.map((l) => l.level) });
      onChange(next);
    } else {
      onChange(value.filter((e) => e.module !== module.module));
    }
  };

  const allSelected =
    modules.length > 0 && modules.every((m) => areAllLevelsSelected(m));

  const toggleAll = (checked: boolean) => {
    if (readOnly) return;
    if (checked) {
      onChange(
        modules.map((m) => ({
          module: m.module,
          levels: m.levels.map((l) => l.level),
        }))
      );
    } else {
      onChange([]);
    }
  };

  if (!definition || modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No permission matrix available
      </p>
    );
  }

  const selectedCount = modules.reduce(
    (acc, m) => acc + (selectedMap[m.module]?.size || 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of{" "}
          {modules.reduce((acc, m) => acc + m.levels.length, 0)} levels selected
        </p>
        {!readOnly && (
          <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
            <Checkbox checked={allSelected} onCheckedChange={(c) => toggleAll(!!c)} />
            Select all
          </label>
        )}
      </div>

      <ScrollArea className="h-[420px] border rounded-lg">
        <div className="min-w-[640px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b">
                <th className="text-left px-3 py-2 font-semibold w-52">Module</th>
                {levels.map((level) => (
                  <th
                    key={level}
                    className="px-2 py-2 font-semibold text-center capitalize"
                  >
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((module) => {
                const selected = selectedMap[module.module];
                const active = isModuleSelected(module.module);
                return (
                  <tr
                    key={module.module}
                    className={cn(
                      "border-b",
                      active ? "bg-primary/5" : "hover:bg-muted/40"
                    )}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <Checkbox
                            checked={active && areAllLevelsSelected(module)}
                            onCheckedChange={(c) => toggleModule(module, !!c)}
                            aria-label={`Select all levels for ${module.label}`}
                          />
                        )}
                        <span className="font-medium whitespace-nowrap">
                          {module.label}
                        </span>
                      </div>
                    </td>
                    {levels.map((level) => {
                      const hasLevel = module.levels.some((l) => l.level === level);
                      if (!hasLevel) {
                        return (
                          <td key={level} className="px-2 py-2 text-center text-muted-foreground/40">
                            –
                          </td>
                        );
                      }
                      const checked = selected?.has(level) || false;
                      return (
                        <td key={level} className="px-2 py-2 text-center">
                          <Checkbox
                            checked={checked}
                            disabled={readOnly}
                            onCheckedChange={(c) => toggleLevel(module.module, level, !!c)}
                            aria-label={`${module.label} ${level}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * Read-only matrix preview (e.g. inline in the Teacher/Staff creation form when a
 * role is selected). Renders the module × level grid non-interactively.
 */
export function PermissionMatrixPreview({
  definition,
  value,
}: {
  definition: { levels: string[]; modules: MatrixModule[] } | undefined;
  value: MatrixEntry[];
}) {
  return (
    <PermissionMatrixEditor
      definition={definition}
      value={value}
      onChange={() => {}}
      readOnly
    />
  );
}
