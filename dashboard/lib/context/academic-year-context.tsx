"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

interface AcademicYearContextType {
    selectedYear: string;
    setSelectedYear: (year: string) => void;
    options: string[];
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

/**
 * Get the default academic year string (e.g. "2025-26").
 * Academic year starts in April.
 */
function getDefaultAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    if (month >= 3) {
        // April (3) onwards
        return `${year}-${((year + 1) % 100).toString().padStart(2, '0')}`;
    }
    return `${year - 1}-${(year % 100).toString().padStart(2, '0')}`;
}

/** Generate a list of academic year options. */
function getAcademicYearOptions(): string[] {
    const now = new Date();
    const year = now.getFullYear();
    const options: string[] = [];
    // Show 3 years back and 1 year ahead
    for (let y = year - 3; y <= year + 1; y++) {
        const endYearShort = (y + 1) % 100;
        options.push(`${y}-${endYearShort.toString().padStart(2, '0')}`);
    }
    return options;
}

export function AcademicYearProvider({ children }: { children: ReactNode }) {
    const [selectedYear, setSelectedYear] = useState<string>("");

    useEffect(() => {
        // Load from localStorage or use default
        const saved = localStorage.getItem("academicYear");
        if (saved) {
            setSelectedYear(saved);
        } else {
            setSelectedYear(getDefaultAcademicYear());
        }
    }, []);

    const handleSetSelectedYear = (year: string) => {
        setSelectedYear(year);
        localStorage.setItem("academicYear", year);
    };

    const options = useMemo(() => getAcademicYearOptions(), []);

    const value: AcademicYearContextType = {
        selectedYear: selectedYear || getDefaultAcademicYear(), // Fallback during initial mount
        setSelectedYear: handleSetSelectedYear,
        options,
    };

    return (
        <AcademicYearContext.Provider value={value}>
            {children}
        </AcademicYearContext.Provider>
    );
}

export function useAcademicYear() {
    const context = useContext(AcademicYearContext);
    if (context === undefined) {
        throw new Error("useAcademicYear must be used within an AcademicYearProvider");
    }
    return context;
}
