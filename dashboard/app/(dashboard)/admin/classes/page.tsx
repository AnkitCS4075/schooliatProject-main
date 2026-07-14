"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClassesTable } from "@/components/classes/classes-table";
import {
  useClassesPage,
  type ClassesListFilters,
} from "@/lib/hooks/use-classes";
import { TEACHERS_MAX_PAGE_SIZE, useTeachersPage } from "@/lib/hooks/use-teachers";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const DEFAULT_FILTERS: ClassesListFilters = {
  hasClassTeacher: "all",
  sortBy: "grade",
  sortOrder: "asc",
};

export default function ClassesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 15;
  const [filters, setFilters] = useState<ClassesListFilters>(DEFAULT_FILTERS);
  const debouncedFilters = useDebouncedValue(filters, 350);
  const filtersKeyRef = useRef(JSON.stringify(debouncedFilters));

  useEffect(() => {
    const next = JSON.stringify(debouncedFilters);
    if (next !== filtersKeyRef.current) {
      filtersKeyRef.current = next;
      setPage(1);
    }
  }, [debouncedFilters]);

  const { data, isLoading, isError, error, isFetching, refetch: refetchClasses } = useClassesPage(
    page,
    limit,
    debouncedFilters,
  );

  const { data: teachersData } = useTeachersPage(1, TEACHERS_MAX_PAGE_SIZE);

  const classes = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const meta = data?.meta;
  const teachers = teachersData?.data ?? [];

  const handleFiltersChange = useCallback((patch: Partial<ClassesListFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handleAddNew = useCallback(() => {
    router.push("/admin/classes/update");
  }, [router]);

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error?.message || "Failed to load classes"}</p>
          <button
            onClick={() => refetchClasses()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-in-out"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <ClassesTable
        classes={classes}
        meta={meta}
        teachers={teachers}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onAddNew={handleAddNew}
        page={page - 1}
        pageSize={limit}
        onPageChange={(newPage) => setPage(newPage + 1)}
        serverTotalPages={totalPages}
        loading={isFetching}
      />
    </div>
  );
}
