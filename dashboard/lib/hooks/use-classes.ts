"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { get, post, del } from "@/lib/api/client";
import { ClassItem } from "@/lib/schemas/class-schema";

export type ClassesListFilters = {
  search?: string;
  grade?: string;
  division?: string;
  classTeacherId?: string;
  hasClassTeacher?: "all" | "assigned" | "unassigned";
  sortBy?: "createdAt" | "grade" | "division" | "defaultAnnualFee" | "defaultMonthlyFee";
  sortOrder?: "asc" | "desc";
};

export type ClassesListMeta = {
  grades: string[];
  divisions: (string | null)[];
};

/** Backend get-classes schema caps pageSize at 100; keep in sync with get-classes.schema.js */
export const CLASSES_MAX_PAGE_SIZE = 100;

function buildClassesListQuery(
  page: number,
  pageSize: number,
  params: ClassesListFilters,
): Record<string, string | number> {
  const capped = Math.min(CLASSES_MAX_PAGE_SIZE, Math.max(1, pageSize));
  const q: Record<string, string | number> = {
    pageNumber: page,
    pageSize: capped,
  };
  const s = params.search?.trim();
  if (s) q.search = s;
  const g = params.grade?.trim();
  if (g) q.grade = g;
  if (params.division !== undefined && params.division !== "") {
    q.division = params.division;
  }
  if (params.classTeacherId) q.classTeacherId = params.classTeacherId;
  if (params.hasClassTeacher && params.hasClassTeacher !== "all") {
    q.hasClassTeacher = params.hasClassTeacher;
  }
  if (params.sortBy) q.sortBy = params.sortBy;
  if (params.sortOrder) q.sortOrder = params.sortOrder;
  return q;
}

function classesQueryKey(page: number, limit: number, f: ClassesListFilters) {
  return [
    "classes",
    page,
    limit,
    f.search ?? "",
    f.grade ?? "",
    f.division ?? "",
    f.classTeacherId ?? "",
    f.hasClassTeacher ?? "all",
    f.sortBy ?? "",
    f.sortOrder ?? "",
  ] as const;
}

function fetchClasses(
  params: { page?: number; limit?: number } & ClassesListFilters = {},
) {
  const { page = 1, limit = 15, ...filters } = params;
  return get("/schools/classes", buildClassesListQuery(page, limit, filters));
}

/** Fetch every page until hasNext is false (for dropdowns / bulk UIs). */
async function fetchAllClassesPages(filters: ClassesListFilters = {}) {
  const pageSize = CLASSES_MAX_PAGE_SIZE;
  let page = 1;
  const all: any[] = [];
  let first: any = null;
  const maxPages = 500;

  while (page <= maxPages) {
    const res = await get(
      "/schools/classes",
      buildClassesListQuery(page, pageSize, filters),
    );
    if (!first) first = res;
    const chunk = Array.isArray(res?.data) ? res.data : [];
    all.push(...chunk);
    if (!res?.hasNext) break;
    page += 1;
  }

  return {
    ...(first ?? { message: "Classes fetched!" }),
    data: all,
    hasNext: false,
    totalPages: Math.max(1, Math.ceil(all.length / pageSize)),
  };
}

function allClassesQueryKey(f: ClassesListFilters) {
  return [
    "classes",
    "all",
    f.search ?? "",
    f.grade ?? "",
    f.division ?? "",
    f.classTeacherId ?? "",
    f.hasClassTeacher ?? "all",
    f.sortBy ?? "",
    f.sortOrder ?? "",
  ] as const;
}

function fetchClass(classId: string) {
  return get(`/schools/classes/${classId}`);
}

export type ClassStudentsSortBy = "rollNumber" | "name" | "createdAt";

export function classStudentsQueryKey(
  classId: string,
  p: {
    page: number;
    limit: number;
    sortBy: ClassStudentsSortBy;
    sortOrder: "asc" | "desc";
    search: string;
  },
) {
  return [
    "class",
    classId,
    "students",
    p.page,
    p.limit,
    p.sortBy,
    p.sortOrder,
    p.search,
  ] as const;
}

function fetchClassStudents(
  classId: string,
  p: {
    page?: number;
    limit?: number;
    sortBy?: ClassStudentsSortBy;
    sortOrder?: "asc" | "desc";
    search?: string;
  },
) {
  const q: Record<string, string | number> = {
    pageNumber: p.page ?? 1,
    pageSize: p.limit ?? 25,
  };
  if (p.sortBy) q.sortBy = p.sortBy;
  if (p.sortOrder) q.sortOrder = p.sortOrder;
  const s = p.search?.trim();
  if (s) q.search = s;
  return get(`/schools/classes/${classId}/students`, q);
}

function createClassesApi(classes: ClassItem[]) {
  const payload = {
    request: classes.map((cls) => ({
      id: cls.id || null,
      grade: cls.grade,
      division: cls.division || null,
      classTeacherId: cls.classTeacherId || null,
      defaultAnnualFee:
        cls.defaultAnnualFee !== undefined && cls.defaultAnnualFee !== null
          ? cls.defaultAnnualFee
          : undefined,
      defaultMonthlyFee:
        cls.defaultMonthlyFee !== undefined && cls.defaultMonthlyFee !== null
          ? cls.defaultMonthlyFee
          : undefined,
      defaultFeeComponents:
        cls.defaultFeeComponents != null && cls.defaultFeeComponents.length > 0
          ? cls.defaultFeeComponents
          : null,
    })),
  };
  return post("/schools/classes", payload);
}

function deleteClassApi(classId: string, otp: string) {
  return del(`/schools/classes/${classId}`, { request: { otp } });
}

export function useClassesPage(
  page: number,
  limit = 15,
  filters: ClassesListFilters = {},
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: classesQueryKey(page, limit, filters),
    queryFn: () => fetchClasses({ page, limit, ...filters }),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  if (!query.isPlaceholderData && query.data?.hasNext) {
    const nextPage = page + 1;
    queryClient.prefetchQuery({
      queryKey: classesQueryKey(nextPage, limit, filters),
      queryFn: () => fetchClasses({ page: nextPage, limit, ...filters }),
    });
  }

  return query;
}

export function useClass(classId: string) {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: () => fetchClass(classId),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
}

/** All classes for the school (paginates client-side up to backend max page size). */
export function useAllClasses(filters: ClassesListFilters = {}) {
  return useQuery({
    queryKey: allClassesQueryKey(filters),
    queryFn: () => fetchAllClassesPages(filters),
    staleTime: 30 * 1000,
  });
}

export function useClassStudents(
  classId: string,
  p: {
    page: number;
    limit?: number;
    sortBy?: ClassStudentsSortBy;
    sortOrder?: "asc" | "desc";
    search?: string;
  },
) {
  const limit = p.limit ?? 25;
  const sortBy = p.sortBy ?? "rollNumber";
  const sortOrder = p.sortOrder ?? "asc";
  const search = p.search ?? "";
  return useQuery({
    queryKey: classStudentsQueryKey(classId, {
      page: p.page,
      limit,
      sortBy,
      sortOrder,
      search,
    }),
    queryFn: () =>
      fetchClassStudents(classId, {
        page: p.page,
        limit,
        sortBy,
        sortOrder,
        search,
      }),
    enabled: !!classId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useCreateClasses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classes: ClassItem[]) => createClassesApi(classes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
      // Class teacher assignments live on Class rows; teacher list/detail read them via GET /users/teachers
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
}

export function useUpdateClasses() {
  return useCreateClasses();
}

export function useDeleteClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => deleteClassApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["class"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher"] });
    },
  });
}

export function useClasses(
  params?: { page?: number; limit?: number } & ClassesListFilters,
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 15;
  const filters: ClassesListFilters = {
    search: params?.search,
    grade: params?.grade,
    division: params?.division,
    classTeacherId: params?.classTeacherId,
    hasClassTeacher: params?.hasClassTeacher,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  };
  return useQuery({
    queryKey: classesQueryKey(page, limit, filters),
    queryFn: () => fetchClasses({ page, limit, ...filters }),
    staleTime: 30 * 1000,
  });
}
