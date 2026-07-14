"use client";

import { useAcademicYear } from "@/lib/context/academic-year-context";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcademicYearSelectorProps {
    className?: string;
    variant?: "navbar" | "default";
}

export function AcademicYearSelector({ className, variant = "default" }: AcademicYearSelectorProps) {
    const { selectedYear, setSelectedYear, options } = useAcademicYear();

    if (variant === "navbar") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-8 w-[110px] text-xs font-semibold bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    return (
        <div className={cn("bg-white/25 backdrop-blur-sm rounded-2xl px-4 py-3 min-w-[140px]", className)}>
            <p className="text-xs text-black/70 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Academic Year
            </p>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="bg-white/40 border-white/50 text-black font-bold h-9 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
