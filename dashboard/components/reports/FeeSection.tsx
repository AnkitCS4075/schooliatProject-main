"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, TrendingUp, BarChart3, Users, Ban } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { aggregateFeesByMonth, feeStatusDistribution, formatCurrency, CHART_COLORS } from "@/lib/utils/analytics";
import type { FeeStatistics } from "@/lib/types/reports";

interface FeeSectionProps {
  data: Array<{ createdAt?: string; paidAt?: string; amount?: number; paidAmount?: number; paymentStatus?: string }>;
  statistics: Partial<FeeStatistics>;
  isLoading: boolean;
}

const PIE_COLORS = [CHART_COLORS.paid, CHART_COLORS.pending, CHART_COLORS.cancelled];

export function FeeSection({ data, statistics, isLoading }: FeeSectionProps) {
  const trendData = aggregateFeesByMonth(data);
  const distributionData = feeStatusDistribution(statistics);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{formatCurrency(statistics.totalRevenue ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">{formatCurrency(statistics.totalPaid ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <span className="text-3xl font-bold">{formatCurrency(statistics.totalPending ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold">{statistics.collectionRate ?? 0}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ledger cancellations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <Ban className="h-8 w-8 text-slate-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-3xl font-bold">{statistics.cancelledInstallments ?? 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Gross face value: {formatCurrency(statistics.cancelledAmountGross ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fee trend (paid / pending / cancelled gross)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), ""]} />
                  <Legend />
                  <Bar dataKey="paid" fill={CHART_COLORS.paid} name="Paid" />
                  <Bar dataKey="pending" fill={CHART_COLORS.pending} name="Pending" />
                  <Bar dataKey="cancelled" fill={CHART_COLORS.cancelled} name="Cancelled (gross)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No fee data for selected period
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Amount mix</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Amount"]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
