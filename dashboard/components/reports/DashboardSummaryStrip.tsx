"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, IndianRupee, GraduationCap, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils/analytics";
import type { DashboardSummary } from "@/lib/types/reports";

interface DashboardSummaryStripProps {
  summary: DashboardSummary | null | undefined;
  isLoading: boolean;
}

export function DashboardSummaryStrip({ summary, isLoading }: DashboardSummaryStripProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-40" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || !summary.attendance || !summary.fees || !summary.academic || !summary.salary) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-muted-foreground">
          Some dashboard data is unavailable for the selected period.
        </CardContent>
      </Card>
    );
  }

  const { attendance, fees, academic, salary } = summary;
  const ay = summary.academicYear || attendance.periodLabel || "";

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-schooliat-tint/80 dark:bg-primary/20 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Attendance{ay ? ` (AY ${ay})` : ""}
              </p>
              <p className="text-lg font-semibold">{attendance.averageRate ?? 0}% avg</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fees{ay ? ` (AY ${ay})` : ""}</p>
              <p className="text-lg font-semibold">{formatCurrency(fees.totalRevenue ?? 0)} revenue</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
              <GraduationCap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Academic{ay ? ` (AY ${ay})` : ""}</p>
              <p className="text-lg font-semibold">{academic.averageScore ?? 0}% avg · {academic.passRate ?? 0}% pass</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Salary{ay ? ` (AY ${ay})` : ""}</p>
              <p className="text-lg font-semibold">{formatCurrency(salary.totalPaid ?? 0)} · {salary.totalEmployees ?? 0} staff</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
