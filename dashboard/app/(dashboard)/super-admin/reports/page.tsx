"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useAttendanceReports, useFeeAnalytics, useAcademicReports, useSalaryReports } from "@/lib/hooks/use-reports";
import { useSchools } from "@/lib/hooks/use-super-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, GraduationCap, AlertCircle } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isValid } from "date-fns";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

function safeFormatDate(dateValue: unknown, pattern: string): string {
  if (!dateValue) return "N/A";
  const d = new Date(dateValue as string);
  return isValid(d) ? format(d, pattern) : "N/A";
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function aggregateAttendanceByDate(records: any[]): any[] {
  if (!records || records.length === 0) return [];
  const grouped = new Map<string, { present: number; absent: number; late: number }>();

  for (const r of records) {
    const key = safeFormatDate(r.date, "yyyy-MM-dd");
    if (key === "N/A") continue;
    if (!grouped.has(key)) grouped.set(key, { present: 0, absent: 0, late: 0 });
    const entry = grouped.get(key)!;
    if (r.status === "PRESENT") entry.present++;
    else if (r.status === "ABSENT") entry.absent++;
    else if (r.status === "LATE" || r.status === "HALF_DAY") entry.late++;
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([dateKey, counts]) => ({
      date: safeFormatDate(dateKey, "MMM dd"),
      ...counts,
    }));
}

function aggregateFeesByMonth(installments: any[]): any[] {
  if (!installments || installments.length === 0) return [];
  const grouped = new Map<string, { paid: number; pending: number }>();

  for (const inst of installments) {
    const dateVal = inst.paidAt || inst.createdAt;
    const key = safeFormatDate(dateVal, "yyyy-MM");
    if (key === "N/A") continue;
    if (!grouped.has(key)) grouped.set(key, { paid: 0, pending: 0 });
    const entry = grouped.get(key)!;
    const amount = Number(inst.amount || 0);
    if (inst.paymentStatus === "PAID") entry.paid += amount;
    else entry.pending += amount;
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, amounts]) => ({
      month: safeFormatDate(`${monthKey}-01`, "MMM yyyy"),
      ...amounts,
    }));
}

export default function SuperAdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "fees" | "academic" | "salary">("attendance");
  const [dateRange, setDateRange] = useState(() => ({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
    endDate: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  }));
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");

  const { data: schoolsData } = useSchools();
  const schools = schoolsData?.data || [];

  const schoolIdParam = selectedSchoolId && selectedSchoolId !== "all" ? selectedSchoolId : undefined;

  const { data: attendanceData, isLoading: attendanceLoading, isError: attendanceError, error: attendanceErr } = useAttendanceReports({
    schoolId: schoolIdParam,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: feeData, isLoading: feeLoading, isError: feeError, error: feeErr } = useFeeAnalytics({
    schoolId: schoolIdParam,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: academicData, isLoading: academicLoading, isError: academicError, error: academicErr } = useAcademicReports({
    schoolId: schoolIdParam,
  });

  const { data: salaryData, isLoading: salaryLoading, isError: salaryError, error: salaryErr } = useSalaryReports({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const attendanceReport = attendanceData?.data || [];
  const attendanceStats = attendanceData?.statistics || {};
  const feeAnalytics = feeData?.data || [];
  const feeStats = feeData?.statistics || {};
  const academicStats = academicData?.statistics || {};
  const salaryStats = salaryData?.statistics || {};

  const attendanceChartData = useMemo(() => aggregateAttendanceByDate(attendanceReport), [attendanceReport]);
  const feeChartData = useMemo(() => aggregateFeesByMonth(feeAnalytics), [feeAnalytics]);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Multi-School Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive reports and analytics across all schools</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="school">School</Label>
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger id="school">
                  <SelectValue placeholder="All Schools" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  {schools.map((school: any) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">
            <Users className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="fees">
            <DollarSign className="w-4 h-4 mr-2" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="w-4 h-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="salary">
            <DollarSign className="w-4 h-4 mr-2" />
            Salary
          </TabsTrigger>
        </TabsList>

        {/* Attendance Reports */}
        <TabsContent value="attendance" className="space-y-4">
          {attendanceLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : attendanceError ? (
            <ErrorBanner message={(attendanceErr as Error)?.message || "Failed to load attendance reports"} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceStats.totalPresent ?? attendanceStats.presentCount ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceStats.totalAbsent ?? attendanceStats.absentCount ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{attendanceStats.averageAttendance ?? attendanceStats.attendanceRate ?? 0}%</div>
                  </CardContent>
                </Card>
              </div>

              {attendanceChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={attendanceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="present" stroke="var(--primary)" strokeWidth={2} />
                        <Line type="monotone" dataKey="absent" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Fee Analytics */}
        <TabsContent value="fees" className="space-y-4">
          {feeLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : feeError ? (
            <ErrorBanner message={(feeErr as Error)?.message || "Failed to load fee analytics"} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{(feeStats.totalPaid ?? feeStats.paidAmount ?? 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{(feeStats.totalPending ?? feeStats.pendingAmount ?? 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{feeStats.collectionRate ?? 0}%</div>
                  </CardContent>
                </Card>
              </div>

              {feeChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Collection Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={feeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="paid" fill="var(--primary)" />
                        <Bar dataKey="pending" fill="#ef4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Academic Reports */}
        <TabsContent value="academic" className="space-y-4">
          {academicLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : academicError ? (
            <ErrorBanner message={(academicErr as Error)?.message || "Failed to load academic reports"} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{academicStats.totalStudents ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{academicStats.averageScore ?? academicStats.averagePercentage ?? 0}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{academicStats.passRate ?? 0}%</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {academicStats.totalStudents ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-500">Total Exams Evaluated</p>
                        <p className="text-lg font-semibold">{academicStats.totalMarks ?? 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500">Passed</p>
                        <p className="text-lg font-semibold text-green-600">{academicStats.passCount ?? 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500">Failed</p>
                        <p className="text-lg font-semibold text-red-600">{academicStats.failCount ?? 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500">Top Performers (80%+)</p>
                        <p className="text-lg font-semibold text-blue-600">{academicStats.topPerformers ?? 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No academic data available for the selected filters</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Salary Reports */}
        <TabsContent value="salary" className="space-y-4">
          {salaryLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : salaryError ? (
            <ErrorBanner message={(salaryErr as Error)?.message || "Failed to load salary reports"} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{(salaryStats.totalPaid ?? salaryStats.totalSalary ?? 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salaryStats.totalEmployees ?? salaryStats.totalStaff ?? 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{(salaryStats.averageSalary ?? 0).toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Salary Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {salaryStats.totalPayments ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-500">Total Payments Made</p>
                        <p className="text-lg font-semibold">{salaryStats.totalPayments}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-500">Unique Employees</p>
                        <p className="text-lg font-semibold">{salaryStats.totalEmployees ?? 0}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No salary data available for the selected date range</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
