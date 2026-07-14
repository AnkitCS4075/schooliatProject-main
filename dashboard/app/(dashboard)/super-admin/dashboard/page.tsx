"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardStats } from "@/lib/hooks/use-super-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  School,
  Users,
  UserCheck,
  Briefcase,
  Building2,
  UserPlus,
  Receipt,
  ShieldCheck,
  Clock,
  Store,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BILLING_ROUTES } from "@/lib/super-admin/billing/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAcademicYear } from "@/lib/context/academic-year-context";
import { AcademicYearSelector } from "@/components/layout/academic-year-selector";

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { selectedYear } = useAcademicYear();
  const { data, isLoading } = useDashboardStats(selectedYear);

  const statsCards = useMemo(() => {
    if (!data?.data) return [];
    const stats = data.data;
    return [
      {
        title: "Total Schools",
        value: (stats.totalSchools || 0).toLocaleString(),
        icon: School,
        gradient: "from-primary to-chart-2",
        route: "/super-admin/schools",
      },
      {
        title: "Total Employees",
        value: (stats.totalEmployees || 0).toLocaleString(),
        icon: Users,
        gradient: "from-[#008395] to-[#0073a7]",
        route: "/super-admin/employees",
      },
      {
        title: "Total Students",
        value: (stats.totalStudents || 0).toLocaleString(),
        icon: UserCheck,
        gradient: "from-primary to-chart-2",
        route: "/super-admin/statistics",
      },
      {
        title: "Total Staff",
        value: (stats.totalStaff || 0).toLocaleString(),
        icon: Briefcase,
        gradient: "from-[#008395] to-[#0073a7]",
        route: "/super-admin/statistics",
      },
    ];
  }, [data]);

  const quickActions = [
    {
      title: "Register School",
      subtitle: "Add a new school",
      icon: Building2,
      route: "/super-admin/schools/register",
      color: "var(--primary)",
      bgColor: "#f0f7e8",
    },
    {
      title: "Add Employee",
      subtitle: "Add a new employee",
      icon: UserPlus,
      route: "/super-admin/employees/add",
      color: "#4a90e2",
      bgColor: "#e3f2fd",
    },
    {
      title: "Generate Receipt",
      subtitle: "Create a new receipt",
      icon: Receipt,
      route: BILLING_ROUTES.standaloneReceiptGenerate,
      color: "#9b59b6",
      bgColor: "#f3e5f5",
    },
    {
      title: "View Licenses",
      subtitle: "Manage licenses",
      icon: ShieldCheck,
      route: "/super-admin/licenses",
      color: "#f5a623",
      bgColor: "#fff8e1",
    },
    {
      title: "Pending Receipts",
      subtitle: "Awaiting Receipts",
      icon: Clock,
      route: BILLING_ROUTES.receiptsTab,
      color: "#e74c3c",
      bgColor: "#ffebee",
    },
    {
      title: "View Vendors",
      subtitle: "View possible vendors",
      icon: Store,
      route: "/super-admin/vendors",
      color: "#16a085",
      bgColor: "#e0f2f1",
    },
  ];

  const recentSchools = useMemo(() => {
    if (!data?.data?.recentSchools) return [];
    return data.data.recentSchools.map((school: any) => ({
      id: school.id,
      name: school.name,
      location: school.address?.[0] || "N/A",
      date: new Date(school.createdAt).toISOString().split("T")[0],
      status: school.status || "Active",
      students: school.students || 0,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-chart-2 to-chart-4 p-6 lg:p-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-lg lg:text-xl text-white/90 font-medium mb-2">
              Welcome back! 👋
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-2">
              SchooliAT Team
            </h1>
            <p className="text-base lg:text-lg text-white/85">
              Here's what's happening with your schools today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/25 backdrop-blur-sm rounded-2xl px-4 lg:px-5 py-3 lg:py-4 text-center min-w-[80px] lg:min-w-[100px]">
              <p className="text-3xl lg:text-4xl font-extrabold text-black">
                {new Date().getDate()}
              </p>
              <p className="text-xs lg:text-sm text-black font-semibold uppercase tracking-wider">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <AcademicYearSelector />
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-20 mt-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={cn(
                "cursor-pointer hover:shadow-lg transition-all border-0 overflow-hidden",
                "bg-gradient-to-br relative isolate",
                "hover:-translate-y-1",
                stat.gradient
              )}
              onClick={() => router.push(stat.route)}
            >
              <CardContent className="p-5 lg:p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/25 flex items-center justify-center">
                    <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
                  </div>
                </div>
                <div className="ml-3 lg:ml-4">
                  <p className="text-3xl lg:text-4xl font-extrabold mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm lg:text-base font-semibold text-white/90">
                    {stat.title}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Recent Schools */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                <CardTitle>Recent Registrations</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/super-admin/schools")}
              >
                View All →
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSchools.length > 0 ? (
                  recentSchools.map((school: any, index: number) => (
                    <div key={school.id}>
                      <div
                        className="flex items-center gap-4 p-3 lg:p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push("/super-admin/schools")}
                      >
                        <div
                          className={cn(
                            "w-14 h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center",
                            school.status === "Active"
                              ? "bg-gradient-to-br from-primary to-chart-2"
                              : "bg-gradient-to-br from-[#f5a623] to-[#ffb74d]"
                          )}
                        >
                          <School className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base lg:text-lg text-gray-900 mb-1 truncate">
                            {school.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{school.location}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              <span>{school.students} students</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            school.status === "Active" ? "default" : "secondary"
                          }
                          className={cn(
                            "flex items-center gap-1.5",
                            school.status === "Active"
                              ? "bg-schooliat-tint text-primary"
                              : "bg-orange-100 text-orange-800"
                          )}
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              school.status === "Active"
                                ? "bg-primary"
                                : "bg-orange-500"
                            )}
                          />
                          {school.status}
                        </Badge>
                      </div>
                      {index < recentSchools.length - 1 && (
                        <div className="h-px bg-gray-200 my-2 ml-20" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No recent schools
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                <CardTitle>Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                      onClick={() => router.push(action.route)}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mr-3"
                        style={{ backgroundColor: action.bgColor }}
                      >
                        <Icon
                          className="w-7 h-7"
                          style={{ color: action.color }}
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-sm text-gray-900">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {action.subtitle}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

