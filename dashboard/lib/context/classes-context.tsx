"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";

interface Class {
  id: string;
  name?: string;
  grade: string;
  division?: string | null;
  classTeacherId?: string | null;
}

interface ClassesContextType {
  classes: Class[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

export function ClassesProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Only fetch classes on school-admin routes; super-admin has no schoolId and no GET_CLASSES permission
  const isSuperAdminRoute = pathname?.startsWith("/super-admin") ?? false;

  const { data: classesData, isLoading, error, refetch } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get("/schools/classes", { pageNumber: 1, pageSize: 100 }),
    enabled: !isSuperAdminRoute,
  });

  const [classes, setClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (classesData?.data) {
      setClasses(classesData.data);
    }
  }, [classesData]);

  const value: ClassesContextType = {
    classes,
    isLoading,
    error: error as Error | null,
    refetch: () => {
      refetch();
    },
  };

  return (
    <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>
  );
}

export function useClassesContext(): ClassesContextType {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error("useClassesContext must be used within a ClassesProvider");
  }
  return context;
}

