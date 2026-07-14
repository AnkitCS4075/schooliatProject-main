"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, Users, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, CHART_COLORS } from "@/lib/utils/analytics";
import type { SalaryStatistics } from "@/lib/types/reports";

interface SalaryPaymentItem {
  employeeName?: string;
  amount?: number;
  totalAmount?: number;
  month?: string;
}

interface SalarySectionProps {
  data: SalaryPaymentItem[];
  statistics: Partial<SalaryStatistics>;
  isLoading: boolean;
}

export function SalarySection({ data, statistics, isLoading }: SalarySectionProps) {
  const chartData = data.slice(0, 12).map((p) => ({
    employeeName: (p.employeeName ?? "—").length > 14 ? (p.employeeName ?? "—").slice(0, 13) + "…" : (p.employeeName ?? "—"),
    amount: Number(p.amount ?? p.totalAmount ?? 0),
  }));

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{formatCurrency(statistics.totalPaid ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{statistics.totalEmployees ?? 0}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{formatCurrency(statistics.averageSalary ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <span className="text-3xl font-bold">{statistics.pendingPayments ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Salary Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="employeeName" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Amount"]} />
                <Legend />
                <Bar dataKey="amount" fill={CHART_COLORS.primary} name="Salary" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No salary data for selected period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
