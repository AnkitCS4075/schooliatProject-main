"use client";

import { useMemo } from "react";
import { useClassesContext } from "@/lib/context/classes-context";

export function useClassFilters({
  allClassesLabel = "All Classes",
  allDivisionsLabel = "All Divisions",
} = {}) {
  const { classes: allClasses, isLoading: loadingClasses } = useClassesContext();

  const classOptions = useMemo(() => {
    const options = [allClassesLabel];
    const uniqueClasses = new Set<string>();

    allClasses.forEach((cls) => {
      if (cls.grade && cls.division) {
        uniqueClasses.add(`${cls.grade}-${cls.division}`);
      } else if (cls.grade) {
        uniqueClasses.add(cls.grade);
      }
    });

    const sortedClasses = Array.from(uniqueClasses).sort((a, b) => {
      const aMatch = a.match(/^(\d+)/);
      const bMatch = b.match(/^(\d+)/);

      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      if (aMatch) return -1;
      if (bMatch) return 1;
      return a.localeCompare(b);
    });

    return options.concat(sortedClasses);
  }, [allClasses, allClassesLabel]);

  const divisionOptions = useMemo(() => {
    const options = [allDivisionsLabel];
    const uniqueDivisions = new Set<string>();

    allClasses.forEach((cls) => {
      if (cls.division) {
        uniqueDivisions.add(cls.division);
      }
    });

    return options.concat(Array.from(uniqueDivisions).sort());
  }, [allClasses, allDivisionsLabel]);

  const classFilter = useMemo(
    () => ({
      options: classOptions,
      defaultValue: allClassesLabel,
      placeholder: "Select Class",
      onFilter: (data: any[], value: string) => {
        if (value === allClassesLabel) return data;

        return data.filter((item) => {
          const itemClass = item.class || item.studentProfile?.class || "";
          const classStr =
            typeof itemClass === "string"
              ? itemClass
              : `${itemClass.grade || ""}-${itemClass.division || ""}`;

          return (
            classStr.toLowerCase().includes(value.toLowerCase()) ||
            classStr.toLowerCase().includes(value.split("-")[0]?.toLowerCase() || "")
          );
        });
      },
    }),
    [classOptions, allClassesLabel]
  );

  const divisionFilter = useMemo(
    () => ({
      options: divisionOptions,
      defaultValue: allDivisionsLabel,
      placeholder: "Select Division",
      onFilter: (data: any[], value: string) => {
        if (value === allDivisionsLabel) return data;

        return data.filter((item) => {
          const itemClass = item.class || item.studentProfile?.class || "";
          const classStr =
            typeof itemClass === "string"
              ? itemClass
              : `${itemClass.grade || ""}-${itemClass.division || ""}`;

          return classStr.toLowerCase().includes(value.toLowerCase());
        });
      },
    }),
    [divisionOptions, allDivisionsLabel]
  );

  return {
    classFilter,
    divisionFilter,
    loadingClasses,
    classes: allClasses,
  };
}

