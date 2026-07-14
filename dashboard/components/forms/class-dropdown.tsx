"use client";

import { useMemo } from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useClassesContext } from "@/lib/context/classes-context";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassDropdownProps {
  name?: string;
  label?: string;
  rules?: any;
  /** Ensures the Select has an item for the current value (e.g. class not returned in the first page of the list). */
  additionalOptions?: { value: string; label: string }[];
}

export function ClassDropdown({
  name = "classId",
  label = "Class",
  rules,
  additionalOptions = [],
}: ClassDropdownProps) {
  const { control } = useFormContext();
  const { classes, isLoading } = useClassesContext();

  const classOptions = useMemo(() => {
    const fromApi =
      classes?.map((cls) => ({
        value: cls.id,
        label: cls.division ? `${cls.grade}-${cls.division}` : cls.grade,
      })) || [];
    const extras = (additionalOptions || []).filter(
      (e) => e?.value && !fromApi.some((o) => o.value === e.value)
    );
    return [...extras, ...fromApi];
  }, [classes, additionalOptions]);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={value ? value : undefined}
                onValueChange={onChange}
              >
                <SelectTrigger className={error ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
}

