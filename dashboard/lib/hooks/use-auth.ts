"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken, getCurrentUser, getUserRoles } from "@/lib/auth/storage";
import type { User } from "@/lib/auth/storage";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const currentUser = await getCurrentUser();
          const userRole = await getUserRoles();
          setUser(currentUser);
          setRole(userRole);
          setIsAuthenticated(true);

          // Redirect based on role if on login page
          if (pathname === "/login") {
            if (userRole === "SCHOOL_ADMIN") {
              router.replace("/admin/dashboard");
            } else if (userRole === "SUPER_ADMIN") {
              router.replace("/super-admin/dashboard");
            } else if (userRole === "TEACHER") {
              router.replace("/teacher/dashboard");
            } else if (userRole === "STUDENT") {
              router.replace("/student/dashboard");
            } else if (userRole === "STAFF") {
              router.replace("/staff/dashboard");
            } else if (userRole === "EMPLOYEE") {
              router.replace("/employee/dashboard");
            }
          }

          // Protect routes based on role
          if (pathname.startsWith("/admin") && userRole !== "SCHOOL_ADMIN") {
            router.replace("/login");
          } else if (
            pathname.startsWith("/super-admin") &&
            userRole !== "SUPER_ADMIN"
          ) {
            router.replace("/login");
          }
        } else {
          setIsAuthenticated(false);
          // Redirect to login if accessing protected route
          if (!pathname.startsWith("/login") && pathname !== "/") {
            router.replace("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        if (!pathname.startsWith("/login") && pathname !== "/") {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
  };
}

