"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { EnhancedNavbar } from "@/components/layout/enhanced-navbar";
import { ChatBot } from "@/components/layout/chatbot";
import { useSidebar } from "@/lib/context/sidebar-context";
import { useIsLgScreen } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const isLg = useIsLgScreen();

  // Check if we're on a school admin route (not super-admin or employee)
  const isSchoolAdminRoute = pathname.startsWith("/admin");

  const mobileDrawerOpen = !isLg && isOpen;

  useEffect(() => {
    if (!mobileDrawerOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileDrawerOpen]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileDrawerOpen, close]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      {mobileDrawerOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 top-[var(--navbar-height)] z-[25] bg-black/40 lg:hidden"
          onClick={close}
        />
      ) : null}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          "max-lg:ml-0",
          isOpen
            ? "lg:ml-[var(--sidebar-width-lg)]"
            : "lg:ml-[var(--sidebar-width-collapsed-lg)]"
        )}
      >
        <EnhancedNavbar />
        <main
          className="flex-1 overflow-y-auto p-3 min-h-[calc(100vh-var(--navbar-height))] mt-[var(--navbar-height)]"
        >
          {children}
        </main>
      </div>
      {/* ChatBot for School Admin */}
      {isSchoolAdminRoute && <ChatBot />}
    </div>
  );
}

