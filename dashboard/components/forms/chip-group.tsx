"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ChipGroup({ options, value, onChange, className }: ChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full",
              isSelected
                ? "bg-[#E7F6D5] border-[#7CB342] text-[#4A7C20] hover:bg-[#E7F6D5]"
                : "bg-white border-gray-300 text-gray-700"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

