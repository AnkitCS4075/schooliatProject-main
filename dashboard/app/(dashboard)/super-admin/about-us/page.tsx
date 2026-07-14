"use client";

import { useMemo } from "react";
import { useDashboardStats } from "@/lib/hooks/use-super-admin";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import { Card, CardContent } from "@/components/ui/card";
import {
  School,
  Users,
  Star,
  Target,
  Eye,
  Shield,
  Smartphone,
  Headphones,
  ChartLine,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  {
    icon: School,
    title: "Comprehensive Management",
    description:
      "Manage all aspects of school operations from a single platform.",
    color: "var(--primary)",
  },
  {
    icon: Users,
    title: "Student & Staff Portal",
    description:
      "Efficiently track and manage students, teachers, and staff.",
    color: "#4a90e2",
  },
  {
    icon: ChartLine,
    title: "Analytics & Reports",
    description:
      "Get insights with comprehensive analytics and detailed reports.",
    color: "#f5a623",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security to protect your data.",
    color: "#9b59b6",
  },
  {
    icon: Smartphone,
    title: "Mobile Access",
    description: "Access from anywhere, anytime on any device.",
    color: "#e74c3c",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock support whenever you need help.",
    color: "#16a085",
  },
];

export default function AboutUsPage() {
  const { selectedYear } = useAcademicYear();
  const { data, isLoading, isError, error } = useDashboardStats(selectedYear);

  const stats = useMemo(() => {
    // Default stats if no data or error
    const defaultStats = [
      { label: "Schools", value: "0", icon: School },
      { label: "Active Users", value: "0", icon: Users },
      { label: "Experience", value: "2+ Yrs", icon: Star },
    ];

    if (!data?.data) {
      return defaultStats;
    }

    try {
      const statsData = data.data;
      const totalSchools = statsData.totalSchools || 0;
      const totalUsers =
        (statsData.totalEmployees || 0) +
        (statsData.totalStudents || 0) +
        (statsData.totalStaff || 0);

      const formatNumber = (num: number) => {
        if (num >= 1000) {
          const thousands = (num / 1000).toFixed(1);
          return thousands.endsWith(".0")
            ? `${thousands.slice(0, -2)}K+`
            : `${thousands}K+`;
        }
        return num.toLocaleString();
      };

      return [
        {
          label: "Schools",
          value: formatNumber(totalSchools),
          icon: School,
        },
        {
          label: "Active Users",
          value: formatNumber(totalUsers),
          icon: Users,
        },
        { label: "Experience", value: "2+ Yrs", icon: Star },
      ];
    } catch (err) {
      console.error("Error processing dashboard stats:", err);
      return defaultStats;
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Show error state but still render the page with default stats
  if (isError) {
    console.error("Failed to load dashboard stats:", error);
    // Continue rendering with default stats
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="rounded-2xl p-12 text-white text-center"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%)",
        }}
      >
        <h1 className="text-5xl font-bold mb-4">SchooliAT</h1>
        <p className="text-xl font-semibold mb-6 opacity-95">
          One School : One Vendor - Complete School Solution
        </p>
        <p className="text-base opacity-90 max-w-2xl mx-auto">
          A comprehensive school management platform designed to streamline
          operations, enhance communication, and improve the learning
          experience.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 -mt-8 relative z-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To revolutionize education by providing innovative,
              user-friendly solutions that enable institutions to focus on what
              matters most - teaching and learning.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the leading school management platform globally,
              recognized for excellence, innovation, and transformative impact
              in education.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div>
        <h2 className="text-3xl font-bold text-center mb-8">
          Why Choose SchooliAT
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div
                    className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Contact Section */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-schooliat-tint flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
            <p className="text-gray-600">We&apos;re here to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-primary">✉️</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email Us</p>
                <p className="font-semibold text-gray-900">
                  support@schooliat.com
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-primary">📞</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Call Us</p>
                <p className="font-semibold text-gray-900">+91 8551919628</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <span className="text-red-600">📍</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Visit Us</p>
                <p className="font-semibold text-gray-900">Mumbai, India</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

