"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { usePathname } from "next/navigation";
import { ClassesProvider } from "@/lib/context/classes-context";
import { SidebarProvider } from "@/lib/context/sidebar-context";
import { AcademicYearProvider } from "@/lib/context/academic-year-context";
import { PortalPeriodProvider } from "@/lib/context/portal-period-context";
import { LayoutContent } from "./layout-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  // Routes that should NOT show sidebar and header (public/auth pages)
  const publicRoutes = ["/", "/login", "/forgot-password"];
  const shouldShowSidebar = !publicRoutes.some((route) => pathname === route);

  // Check if we're on a school admin route (not super-admin or employee)
  const isSchoolAdminRoute = pathname.startsWith("/admin");

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Skeleton className="hidden lg:block w-[var(--sidebar-width)] lg:w-[var(--sidebar-width-lg)] fixed left-0 top-[var(--navbar-height)] bottom-0 z-30" />
        <div className="flex-1 flex flex-col ml-0 lg:ml-[var(--sidebar-width)] lg:ml-[var(--sidebar-width-lg)]">
          <Skeleton className="h-[var(--navbar-height)] fixed top-0 left-0 right-0 z-40" />
          <Skeleton className="flex-1 mt-[var(--navbar-height)]" />
        </div>
      </div>
    );
  }

  if (!shouldShowSidebar) {
    return <>{children}</>;
  }

  return (
    <AcademicYearProvider>
      <PortalPeriodProvider>
        <ClassesProvider>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </ClassesProvider>
      </PortalPeriodProvider>
    </AcademicYearProvider>
  );
}

