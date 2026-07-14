"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";
import { useAcademicYear } from "@/lib/context/academic-year-context";
import { useDashboard } from "@/lib/hooks/use-dashboard";

export default function StaffDashboardPage() {
  const { selectedYear } = useAcademicYear();
  const { data } = useDashboard({ academicYear: selectedYear });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your dashboard</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Staff Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This dashboard is under development. Please check back soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

