"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";

import { useDashboard } from "@/lib/hooks/use-dashboard";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import { usePortalPeriod } from "@/lib/context/portal-period-context";
import { useHolidays } from "@/lib/hooks/use-calendar";
import { format } from "date-fns";
import { PremiumLoadingSkeleton } from "@/components/dashboard/premium-loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, MoreHorizontal, User, Users, CalendarDays, Filter, Truck, Package, CreditCard, BookOpen, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";
import { NoticeBoardWidget } from "@/components/dashboard/notice-board-widget";
import { FinancialOverviewWidget } from "@/components/dashboard/financial-overview-widget";
import { FeeStatusWidget } from "@/components/dashboard/fee-status-widget";
import { TimetableWidget } from "@/components/dashboard/timetable-widget";

const CHART_HEIGHT = 280;

const SimpleStatCard = ({ title, value, variant }: { title: string, value: number, variant: "dark" | "light" }) => {
  const bg = variant === "dark" ? "bg-[#71954f]" : "bg-[#dcfce7]";
  const textColor = "text-gray-900";
  return (
    <Card className={`border-none ${bg} ${textColor} flex-1 flex flex-col justify-between p-5 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
      <h3 className="text-base font-medium">{title}</h3>
      <div className="text-4xl font-bold mt-3">{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </Card>
  )
}

const RadialProgress = ({ percentage, color, label, subLabel }: { percentage: number, color: string, label: string, subLabel: string }) => {
  const radius = 70;
  const stroke = 14;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle stroke="#f3f4f6" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <div className="flex items-center text-2xl font-bold" style={{ color }}>
            <User className="w-5 h-5 mr-1" fill={color} />
            {percentage}%
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="font-bold text-gray-800 text-base">{label}</span>
        <span className="text-gray-500">{subLabel}</span>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const { selectedYear } = useAcademicYear();
  const { portalMonth, setPortalMonth } = usePortalPeriod();

  // Dashboard filter state
  const [filterType, setFilterType] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");

  useEffect(() => {
    if (filterType === "month") {
      setFilterValue(portalMonth);
    }
  }, [portalMonth, filterType]);

  // States for the Calendar persistence
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const { data, isLoading, isError, refetch } = useDashboard({
    academicYear: selectedYear,
    filterType: filterType || undefined,
    filterValue: filterValue || undefined,
  });
  const stats = data?.data || {};

  const school = stats.school || {};
  const userCounts = stats.userCounts || {};
  const students = userCounts.students || { total: 0, boys: 0, girls: 0 };
  const notices = stats.notices || [];
  const installments = stats.installments || {};
  const financial = stats.financial || {};
  const calendar = stats.calendar || {};

  const totalStudents = students.total || 0;
  const boysCount = students.boys || 0;
  const girlsCount = students.girls || 0;
  const presentStudents = students.present || 0;

  const teachersCount = userCounts.teachers || 0;
  const totalStaff = userCounts.staff || 0;
  const presentStaffAndTeachers = userCounts.presentStaffAndTeachers || 0;
  const totalStaffAndTeachers = totalStaff + teachersCount;

  const boysPercentage =
    totalStudents > 0 ? Math.round((boysCount / totalStudents) * 100) : 0;
  const girlsPercentage =
    totalStudents > 0 ? Math.round((girlsCount / totalStudents) * 100) : 0;

  const { data: holidaysData } = useHolidays(format(displayMonth, "yyyy-MM"));
  const holidays = holidaysData?.data || [];

  const earningsData = financial.monthlyEarnings || [
    { month: "Jan", income: 0, expense: 0 },
    { month: "Feb", income: 0, expense: 0 },
    { month: "Mar", income: 0, expense: 0 },
    { month: "Apr", income: 0, expense: 0 },
    { month: "May", income: 0, expense: 0 },
    { month: "Jun", income: 0, expense: 0 },
    { month: "Jul", income: 0, expense: 0 },
    { month: "Aug", income: 0, expense: 0 },
    { month: "Sep", income: 0, expense: 0 },
    { month: "Oct", income: 0, expense: 0 },
    { month: "Nov", income: 0, expense: 0 },
    { month: "Dec", income: 0, expense: 0 },
  ];

  const earningsYAxisMax = useMemo(() => {
    const maxVal = Math.max(
      0,
      ...earningsData.flatMap((d: { income?: number; expense?: number }) => [
        Number(d.income) || 0,
        Number(d.expense) || 0,
      ]),
    );
    if (maxVal <= 0) return 1000;
    const padded = maxVal * 1.15;
    const exp = Math.floor(Math.log10(padded)) || 0;
    const step = 10 ** Math.max(0, exp - 1);
    return Math.max(1000, Math.ceil(padded / step) * step);
  }, [earningsData]);

  if (isLoading) {
    return <PremiumLoadingSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <AlertCircle className="h-12 w-12 text-amber-600" />
          <p className="text-center text-sm text-amber-800">
            Could not load dashboard. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto pb-8 animate-fade-in bg-gray-50 min-h-screen p-4 rounded-3xl">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border-none">
        <div className="flex items-center gap-2 text-gray-500 mr-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filter by:</span>
        </div>

        <Select
          value={filterType}
          onValueChange={(val) => {
            setFilterType(val === "none" ? "" : val);
            setFilterValue("");
          }}
        >
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Select Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Today)</SelectItem>
            <SelectItem value="term">Term</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="date">Date</SelectItem>
          </SelectContent>
        </Select>

        {filterType === "term" && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Term 1 (Apr–Sep)</SelectItem>
              <SelectItem value="2">Term 2 (Oct–Mar)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {filterType === "month" && (
          <Input
            type="month"
            value={filterValue}
            onChange={(e) => {
              const v = e.target.value;
              setFilterValue(v);
              if (v) setPortalMonth(v);
            }}
            className="w-[180px] h-9 text-sm"
          />
        )}

        {filterType === "date" && (
          <Input
            type="date"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="w-[180px] h-9 text-sm"
          />
        )}

        {filterType && filterValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setFilterType(""); setFilterValue(""); }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <a href="/admin/courier" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-none cursor-pointer">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Courier</p>
            <p className="text-xs text-gray-500">Track dispatches</p>
          </div>
        </a>
        <a href="/admin/inventory" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-none cursor-pointer">
          <div className="bg-green-100 p-2 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Inventory</p>
            <p className="text-xs text-gray-500">Manage stock</p>
          </div>
        </a>
        <a href="/admin/id-cards" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-none cursor-pointer">
          <div className="bg-purple-100 p-2 rounded-lg">
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-sm">ID Cards</p>
            <p className="text-xs text-gray-500">Generate cards</p>
          </div>
        </a>
        <a href="/admin/results" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-none cursor-pointer">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Results</p>
            <p className="text-xs text-gray-500">View & download</p>
          </div>
        </a>
        <a href="/admin/finance/fees" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border-none cursor-pointer">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Fees</p>
            <p className="text-xs text-gray-500">Receipts & payments</p>
          </div>
        </a>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Welcome */}
        <div className="lg:col-span-7 xl:col-span-7 h-full">
          <Card className="bg-white border-none shadow-sm h-full rounded-2xl overflow-hidden relative">
            <CardContent className="p-6 md:p-10 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between gap-6">
                <div className="max-w-xl z-10">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Welcome
                    {school.name?.trim()
                      ? `, ${school.name.trim()} team`
                      : " to your school dashboard"}
                    !
                  </h1>
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-6">
                    Manage your school operations with ease. Stay updated on academics, attendance, finances, and more, all in one place. Let's keep shaping a brighter future together!
                  </p>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <div className="bg-blue-50/80 px-4 py-3 rounded-xl border border-blue-100 flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Students</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {presentStudents.toLocaleString()} <span className="text-gray-500 font-normal">/ {totalStudents.toLocaleString()} Present</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50/80 px-4 py-3 rounded-xl border border-purple-100 flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Staff & Teachers</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {presentStaffAndTeachers.toLocaleString()} <span className="text-gray-500 font-normal">/ {totalStaffAndTeachers.toLocaleString()} Present</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block w-48 h-48 lg:w-72 lg:h-56 relative z-10 shrink-0">
                  <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden relative">
                    <Image
                      src="/dashboard-illustration.jpg"
                      alt="Student and Teacher illustration"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 xl:col-span-2 flex flex-col gap-4">
          <SimpleStatCard title="Students" value={totalStudents} variant="dark" />
          <SimpleStatCard title="Teachers" value={teachersCount} variant="light" />
          <SimpleStatCard title="Staff" value={totalStaff} variant="dark" />
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3 xl:col-span-3">
          <CalendarWidget
            events={calendar.events || []}
            holidays={holidays}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            displayMonth={displayMonth}
            onMonthChange={setDisplayMonth}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Students Radial */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-sm h-full rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold">Students</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-around pt-6 pb-8">
              <RadialProgress
                percentage={boysPercentage}
                color="#4b830d"
                label={boysCount.toLocaleString()}
                subLabel="( Male )"
              />
              <RadialProgress
                percentage={girlsPercentage}
                color="#f59e0b"
                label={girlsCount.toLocaleString()}
                subLabel="( Female )"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notice Board */}
        <div className="lg:col-span-4 h-[350px]">
          <NoticeBoardWidget notices={notices} />
        </div>

        {/* Timetable */}
        <div className="lg:col-span-4 h-[350px]">
          <TimetableWidget />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Financial */}
        <div className="lg:col-span-4 h-[350px] lg:h-auto">
          <FinancialOverviewWidget
            totalIncome={financial.totalIncome}
            totalSalary={financial.totalSalary}
            todayCollection={financial.todayCollection}
            pendingAmount={financial.pendingAmount}
            incomeChangePercent={financial.incomeChangePercent}
            salaryChangePercent={financial.salaryChangePercent}
            currentYear={installments.currentYear}
            filterType={filterType}
            filterValue={filterValue}
          />
        </div>

        {/* Earnings */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm rounded-2xl h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-xl font-bold">Earnings</CardTitle>
              <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <div className="w-3 h-3 rounded-full bg-[#84cc16]" /> Income
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <div className="w-3 h-3 rounded-full bg-[#bbf7d0]" /> Expense
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="pt-8">
              <div style={{ width: "100%", height: CHART_HEIGHT }} role="img" aria-label="Earnings chart">
                <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                  <LineChart
                    data={earningsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.6} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 13 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 13 }}
                      domain={[0, earningsYAxisMax]}
                      tickCount={6}
                      tickFormatter={(val) => {
                        if (val === 0) return "0";
                        if (val >= 100000) {
                          const l = val / 100000;
                          return `${l % 1 === 0 ? l : l.toFixed(1)}L`;
                        }
                        if (val >= 1000) return `${Math.round(val / 1000)}K`;
                        return String(val);
                      }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#84cc16"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#84cc16' }}
                      animationDuration={1500}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#bbf7d0"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#bbf7d0' }}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
        {/* Fee Status */}
        <div className="lg:col-span-4">
          <FeeStatusWidget
            paid={installments.paid}
            pending={installments.pending}
            partiallyPaid={installments.partiallyPaid}
            currentYear={installments.currentYear}
            currentInstallmentNumber={installments.currentInstallmentNumber}
          />
        </div>
      </div>
    </div>
  );
}
