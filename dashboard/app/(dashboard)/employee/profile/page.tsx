"use client";

import { useRouter } from "next/navigation";
import { useVendorStats } from "@/lib/hooks/use-super-admin";
import { clearToken } from "@/lib/auth/storage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  Edit,
  Lock,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { data: statsData, isLoading } = useVendorStats();

  const stats = statsData?.data || {
    total: 0,
    converted: 0,
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await clearToken();
      router.replace("/login");
    }
  };

  const successRate =
    stats.total > 0 ? Math.round((stats.converted / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>

        {/* Avatar and Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary border-4 border-primary"></div>
          </div>
          <h2 className="text-2xl font-bold mb-1">Employee</h2>
          <p className="text-sm opacity-90">Field Executive</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 bg-white/15 rounded-xl p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs opacity-90">Total Vendors</p>
          </div>
          <div className="text-center border-x border-white/20">
            <p className="text-2xl font-bold">{stats.converted}</p>
            <p className="text-xs opacity-90">Converted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{successRate}%</p>
            <p className="text-xs opacity-90">Success Rate</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Account
        </h3>
        <Card>
          <CardContent className="p-0">
            <button
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              onClick={() => toast.info("This feature will be available soon!")}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Edit className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-500">
                  Update your personal information
                </p>
              </div>
            </button>
            <div className="h-px bg-gray-100 ml-14"></div>
            <button
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              onClick={() => toast.info("This feature will be available soon!")}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}

