"use client";

import { useFormContext, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTransports } from "@/lib/hooks/use-transport";
import { Skeleton } from "@/components/ui/skeleton";

interface TransportDropdownProps {
  name?: string;
  label?: string;
  rules?: any;
}

export function TransportDropdown({
  name = "transportId",
  label = "Transport",
  rules,
}: TransportDropdownProps) {
  const { control } = useFormContext();
  const { data: transportsData, isLoading } = useTransports();
  const transports = transportsData?.data || [];

  interface TransportOption {
    value: string;
    label: string;
  }

  const transportOptions: TransportOption[] = transports.map((transport: any) => {
    const dlNo = transport.vehicleNumber || "N/A";
    const vehicleNo = transport.licenseNumber || "N/A";
    return {
      value: transport.id,
      label: `DL no.: ${dlNo} · Vehicle no.: ${vehicleNo}`,
    };
  });

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
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={error ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Transport" />
                </SelectTrigger>
                <SelectContent>
                  {transportOptions.map((option) => (
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

