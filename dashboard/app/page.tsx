"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, getUserRoles } from "@/lib/auth/storage";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = await getAuthToken();

        if (token) {
          // User is authenticated, redirect to appropriate dashboard
          const role = await getUserRoles();

          if (role === "SCHOOL_ADMIN") {
            router.replace("/admin/dashboard");
          } else if (role === "SUPER_ADMIN") {
            router.replace("/super-admin/dashboard");
          } else if (role === "TEACHER") {
            router.replace("/teacher/dashboard");
          } else if (role === "STUDENT") {
            router.replace("/student/dashboard");
          } else if (role === "STAFF") {
            router.replace("/staff/dashboard");
          } else if (role === "EMPLOYEE") {
            router.replace("/employee/dashboard");
          } else {
            // Unknown role, redirect to login
            router.replace("/login");
          }
        } else {
          // User is not authenticated, redirect to login
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, redirect to login
        router.replace("/login");
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Show loading state while checking authentication
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
