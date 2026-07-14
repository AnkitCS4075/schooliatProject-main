"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup as RadioGroupPrimitive, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RadioGroup({ options, value, onChange, className }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive value={value} onValueChange={onChange} className={cn("flex flex-row gap-4", className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem value={option.value} id={option.value} />
          <Label htmlFor={option.value} className="font-normal cursor-pointer">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroupPrimitive>
  );
}

