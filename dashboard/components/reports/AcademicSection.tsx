"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, GraduationCap, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CHART_COLORS } from "@/lib/utils/analytics";
import type { AcademicStatistics } from "@/lib/types/reports";

interface MarksItem {
  student?: { firstName?: string; lastName?: string };
  totalMarks?: number;
  marksObtained?: number;
  percentage?: number;
}

interface AcademicSectionProps {
  data: MarksItem[];
  statistics: Partial<AcademicStatistics>;
  isLoading: boolean;
}

export function AcademicSection({ data, statistics, isLoading }: AcademicSectionProps) {
  const chartData = data.slice(0, 12).map((m) => {
    const name = m.student
      ? [m.student.firstName, m.student.lastName].filter(Boolean).join(" ").trim() || "—"
      : "—";
    return {
      studentName: name.length > 15 ? name.slice(0, 14) + "…" : name,
      totalMarks: Number(m.marksObtained ?? m.totalMarks ?? 0),
      percentage: Number(m.percentage ?? 0),
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[320px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{statistics.totalStudents ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{statistics.averageScore ?? 0}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{statistics.passRate ?? 0}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers (≥80%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold">{statistics.topPerformers ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Academic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="studentName" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }) =>
                    active && payload?.[0] ? (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-medium">{payload[0].payload.studentName}</p>
                        <p className="text-sm">Marks: {payload[0].payload.totalMarks}</p>
                        <p className="text-sm">Percentage: {payload[0].payload.percentage}%</p>
                      </div>
                    ) : null
                  }
                />
                <Legend />
                <Bar dataKey="percentage" fill={CHART_COLORS.secondary} name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No marks data for selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
