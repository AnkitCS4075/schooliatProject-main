"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useVendorStats, useVendors } from "@/lib/hooks/use-super-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumLoadingSkeleton } from "@/components/dashboard/premium-loading-skeleton";
import { cn } from "@/lib/utils";
import {
  Store,
  Star,
  Flame,
  Clock,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";

const LEAD_STATUS_CONFIG = {
  NEW: {
    label: "New",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    icon: Star,
  },
  HOT: {
    label: "Hot",
    color: "#ef4444",
    bgColor: "#fef2f2",
    icon: Flame,
  },
  COLD: {
    label: "Cold",
    color: "#6b7280",
    bgColor: "#f3f4f6",
    icon: Store,
  },
  FOLLOW_UP: {
    label: "Follow Up",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    icon: Clock,
  },
  CONVERTED: {
    label: "Converted",
    color: "#10b981",
    bgColor: "#ecfdf5",
    icon: CheckCircle,
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { data: statsData, isLoading: statsLoading } = useVendorStats();
  const { data: vendorsData, isLoading: vendorsLoading } = useVendors({});

  const stats = statsData?.data || {
    total: 0,
    new: 0,
    hot: 0,
    cold: 0,
    followUp: 0,
    converted: 0,
  };

  const recentVendors = useMemo(() => {
    if (!vendorsData?.data) return [];
    return vendorsData.data.slice(0, 5);
  }, [vendorsData]);

  const isLoading = statsLoading || vendorsLoading;

  if (isLoading) {
    return <PremiumLoadingSkeleton />;
  }

  const StatCard = ({
    title,
    count,
    config,
  }: {
    title: string;
    count: number;
    config: typeof LEAD_STATUS_CONFIG[keyof typeof LEAD_STATUS_CONFIG];
  }) => {
    const Icon = config.icon;
    return (
      <Link href="/employee/vendors">
        <Card
          className={cn(
            "cursor-pointer transition-all duration-300",
            "card-hover-lift hover:shadow-xl hover:-translate-y-1"
          )}
          style={{ backgroundColor: config.bgColor }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg transition-transform duration-300",
                  "hover:scale-110"
                )}
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: config.color }} />
              </div>
              <div>
                <p 
                  className="text-2xl font-bold animate-count-up" 
                  style={{ color: config.color }}
                >
                  {count}
                </p>
                <p className="text-sm font-medium" style={{ color: `${config.color}cc` }}>
                  {title}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Premium Styling */}
      <div
        className={cn(
          "rounded-2xl p-6 text-white relative overflow-hidden",
          "animate-slide-up shadow-2xl"
        )}
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="animate-slide-in-left">
            <p className="text-sm opacity-90 mb-1">Good {getGreeting()}</p>
            <h1 className="text-3xl font-bold">Welcome Back! 👋</h1>
          </div>
        </div>

        {/* Total Vendors Card */}
        <Card 
          className={cn(
            "bg-white relative z-10 animate-scale-in",
            "card-hover-lift transition-all duration-300"
          )}
          style={{ animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Vendors</p>
                <p 
                  className="text-4xl font-bold text-gray-900 animate-count-up"
                  style={{ animation: "countUp 0.6s ease-out" }}
                >
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">Assigned to you</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <Store className="w-10 h-10 text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="New" count={stats.new} config={LEAD_STATUS_CONFIG.NEW} />
          <StatCard
            title="Hot Leads"
            count={stats.hot}
            config={LEAD_STATUS_CONFIG.HOT}
          />
          <StatCard
            title="Follow Up"
            count={stats.followUp}
            config={LEAD_STATUS_CONFIG.FOLLOW_UP}
          />
          <StatCard
            title="Converted"
            count={stats.converted}
            config={LEAD_STATUS_CONFIG.CONVERTED}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up" style={{ animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/employee/add-vendor">
            <Button
              className={cn(
                "w-full h-20 text-white transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
              )}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Vendor
            </Button>
          </Link>
          <Link href="/employee/vendors">
            <Button
              className={cn(
                "w-full h-20 text-white transition-all duration-300",
                "hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
              )}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              }}
            >
              <Search className="w-6 h-6 mr-2" />
              Search
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Vendors */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Vendors</h2>
          <Link href="/employee/vendors" className="text-primary font-semibold">
            See All →
          </Link>
        </div>

        {recentVendors.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No vendors yet</p>
              <Link href="/employee/add-vendor">
                <Button className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                  Add First Vendor
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentVendors.map((vendor: any) => {
              const statusConfig =
                LEAD_STATUS_CONFIG[vendor.status as keyof typeof LEAD_STATUS_CONFIG] ||
                LEAD_STATUS_CONFIG.NEW;
              return (
                <Link key={vendor.id} href="/employee/vendors">
                  <Card className={cn(
                    "cursor-pointer transition-all duration-300",
                    "card-hover-lift hover:shadow-xl hover:-translate-y-1"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-lg flex items-center justify-center",
                            "transition-transform duration-300 hover:scale-110"
                          )}
                          style={{ backgroundColor: statusConfig.bgColor }}
                        >
                          <Store
                            className="w-5 h-5"
                            style={{ color: statusConfig.color }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {vendor.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {vendor.contact}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-lg text-xs font-semibold"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
