"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, GraduationCap, UserCog, IndianRupee } from "lucide-react";
import { useSchoolStatistics, SchoolStatistics } from "@/lib/hooks/use-super-admin";
import { SchoolRevenueDialog } from "./school-revenue-dialog";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const summaryCards = [
  {
    title: "Total Students",
    icon: Users,
    color: "#4a90e2",
    bgColor: "#e3f2fd",
  },
  {
    title: "Total Staff",
    icon: Briefcase,
    color: "#f5a623",
    bgColor: "#fff8e1",
  },
  {
    title: "Total Teachers",
    icon: GraduationCap,
    color: "var(--primary)",
    bgColor: "#e8f5e9",
  },
  {
    title: "Admin Staff",
    icon: UserCog,
    color: "#9b59b6",
    bgColor: "#f3e5f5",
  },
  {
    title: "Total Revenue",
    icon: IndianRupee,
    color: "#e67e22",
    bgColor: "#fef3e2",
  },
];

// Generate academic year options (e.g. 2023-24, 2024-25, ...)
function getAcademicYears(): string[] {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const currentYear = currentDate.getFullYear();
  // If we're in Jan-Mar, the current academic year started previous calendar year
  const currentAcademicStart = currentMonth >= 3 ? currentYear : currentYear - 1;

  const years: string[] = [];
  for (let y = currentAcademicStart + 1; y >= currentAcademicStart - 4; y--) {
    const endYear = y + 1;
    years.push(`${y}-${String(endYear).slice(-2)}`);
  }
  return years;
}

export function StatisticsView() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [academicYear, setAcademicYear] = useState<string>("all");
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const itemsPerPage = 10;

  const academicYears = useMemo(() => getAcademicYears(), []);

  const { data, isLoading, error } = useSchoolStatistics(
    searchQuery || undefined,
    academicYear !== "all" ? academicYear : undefined
  );

  interface SchoolStatDisplay {
    id: string;
    schoolName: string;
    schoolCode: string;
    totalStudents: number;
    totalStaff: number;
    teachers: number;
    adminStaff: number;
    totalRevenue: number;
    createdAt: string;
    status: string;
  }

  const schoolStats = useMemo<SchoolStatDisplay[]>(() => {
    if (!data?.data?.schools) return [];
    return data.data.schools.map((school: SchoolStatistics["schools"][0]) => ({
      id: school.id,
      schoolName: school.name,
      schoolCode: school.code,
      totalStudents: school.totalStudents || 0,
      totalStaff: school.totalStaff || 0,
      teachers: school.teachers || 0,
      adminStaff: school.adminStaff || 0,
      totalRevenue: school.totalRevenue || 0,
      createdAt: school.createdAt || "",
      status: school.status || "Active",
    }));
  }, [data]);

  const totals = useMemo(() => {
    if (!data?.data?.totals) {
      return {
        totalStudents: 0,
        totalStaff: 0,
        totalTeachers: 0,
        totalAdminStaff: 0,
        totalRevenue: 0,
      };
    }
    return data.data.totals;
  }, [data]);

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, schoolStats.length);
  const numberOfPages = Math.ceil(schoolStats.length / itemsPerPage);
  const paginatedStats = schoolStats.slice(from, to);

  useEffect(() => {
    setPage(0);
  }, [searchQuery, academicYear]);

  const handleSchoolClick = (school: SchoolStatDisplay) => {
    setSelectedSchool({ id: school.id, name: school.schoolName });
    setRevenueDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600">Failed to load statistics</p>
          <p className="text-sm text-gray-600 mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">School Statistics</h1>
        <p className="text-gray-600 mt-1">
          View student, staff, and revenue statistics for all registered schools
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          let value: string;
          if (index === 0) value = totals.totalStudents.toLocaleString();
          else if (index === 1) value = totals.totalStaff.toLocaleString();
          else if (index === 2) value = totals.totalTeachers.toLocaleString();
          else if (index === 3) value = totals.totalAdminStaff.toLocaleString();
          else value = formatCurrency(totals.totalRevenue || 0);

          return (
            <div
              key={card.title}
              className="p-6 border rounded-lg"
              style={{ backgroundColor: card.bgColor }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>
                    {value}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{card.title}</p>
                </div>
                <Icon className="w-8 h-8" style={{ color: card.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search schools..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Academic Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {academicYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* School Statistics Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-schooliat-tint">
                <TableHead>School Name</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Teachers</TableHead>
                <TableHead className="text-right">Admin Staff</TableHead>
                <TableHead className="text-right">Total Staff</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No schools found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStats.map((stat) => (
                  <TableRow key={stat.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <button
                          className="font-semibold text-left text-primary hover:underline cursor-pointer"
                          onClick={() => handleSchoolClick(stat)}
                          title="View revenue details"
                        >
                          {stat.schoolName}
                        </button>
                        <div className="text-sm text-gray-500">
                          {stat.schoolCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.totalStudents.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.teachers}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {stat.adminStaff}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-700">
                      {stat.totalStaff}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(stat.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {stat.createdAt
                        ? new Date(stat.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-schooliat-tint text-primary border-primary/30"
                      >
                        {stat.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {numberOfPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page + 1} of {numberOfPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(numberOfPages - 1, page + 1))}
              disabled={page >= numberOfPages - 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* School Revenue Dialog */}
      {selectedSchool && (
        <SchoolRevenueDialog
          schoolId={selectedSchool.id}
          schoolName={selectedSchool.name}
          isOpen={revenueDialogOpen}
          onOpenChange={setRevenueDialogOpen}
        />
      )}
    </div>
  );
}
