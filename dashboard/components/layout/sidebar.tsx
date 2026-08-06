"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  DollarSign,
  Calendar,
  CalendarDays,
  Bus,
  Package,
  Award,
  CreditCard,
  FileText,
  MessageCircle,
  School,
  Receipt,
  ShieldCheck,
  BarChart3,
  Store,
  Info,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  LogOut,
  LucideIcon,
  BookOpen,
  Image as ImageIcon,
  FileCheck,
  Settings,
  Database,
  ScrollText,
  Activity,
  Truck,
  Bell,
  SquareUser,
  Book,
  Gift,
  Wallet,
  DoorOpen,
  Target,
  CheckSquare,
  Shield,
} from "lucide-react";
import { clearToken } from "@/lib/auth/storage";
import {
  MENU_ITEMS,
  SUPER_ADMIN_MENU_ITEMS,
  FINANCE_SUBMENU,
  ATTENDANCE_SUBMENU,
  LEAVE_SUBMENU,
  LIBRARY_SUBMENU,
  RESULTS_SUBMENU,
  MenuItem,
  SubMenuItem,
} from "@/lib/config/menu-items";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/context/sidebar-context";
import { useIsLgScreen } from "@/lib/hooks/use-media-query";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  DollarSign,
  Calendar,
  CalendarDays,
  Bus,
  Package,
  Award,
  CreditCard,
  FileText,
  MessageCircle,
  School,
  Receipt,
  ShieldCheck,
  BarChart3,
  Store,
  Info,
  MessageSquare,
  BookOpen,
  Image: ImageIcon,
  FileCheck,
  Settings,
  Database,
  ScrollText,
  Activity,
  Truck,
  Bell,
  SquareUser,
  Book,
  Gift,
  Wallet,
  DoorOpen,
  Target,
  CheckSquare,
  Shield,
};

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const isLg = useIsLgScreen();

  /** Mobile drawer: close after navigation (desktop keeps expand/collapse unchanged). */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    close();
  }, [pathname, close]);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isActive = (route: string) => {
    return pathname.startsWith(route);
  };

  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const menuItems = isSuperAdminRoute ? SUPER_ADMIN_MENU_ITEMS : MENU_ITEMS;

  const handleLogout = async () => {
    await clearToken();
    router.replace("/login");
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.name);
    } else {
      router.push(item.route);
    }
  };

  const getSubmenuItems = (menuName: string): SubMenuItem[] => {
    switch (menuName) {
      case "Finance":
        return FINANCE_SUBMENU;
      case "Attendance":
        return ATTENDANCE_SUBMENU;
      case "Leave Management":
        return LEAVE_SUBMENU;
      case "Library":
        return LIBRARY_SUBMENU;
      case "Result Management":
        return RESULTS_SUBMENU;
      default:
        return [];
    }
  };

  const isMenuExpanded = (menuName: string) => {
    const submenuItems = getSubmenuItems(menuName);
    const isSubmenuActive = submenuItems.some((sub) =>
      pathname.startsWith(sub.route)
    );
    return expandedMenus[menuName] || isSubmenuActive;
  };

  return (
    <aside
      id="dashboard-sidebar"
      aria-hidden={!isLg && !isOpen ? true : undefined}
      className={cn(
        "fixed left-0 bottom-0 bg-black border-r border-gray-800 flex flex-col z-30 transition-all duration-300 ease-in-out",
        "top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))]",
        // Mobile (max-lg): off-canvas drawer — closed = fully hidden (no collapsed icon rail).
        isOpen
          ? "max-lg:translate-x-0 max-lg:shadow-xl"
          : "max-lg:-translate-x-full max-lg:pointer-events-none max-lg:border-transparent",
        // Width: mobile uses full expanded drawer width for slide; desktop = expanded vs collapsed rail.
        isOpen
          ? "w-[var(--sidebar-width)] lg:w-[var(--sidebar-width-lg)]"
          : "max-lg:w-[min(100vw,var(--sidebar-width-lg))] lg:w-[var(--sidebar-width-collapsed)] lg:w-[var(--sidebar-width-collapsed-lg)]"
      )}
    >
      {/* Menu Container */}
      <div className="flex-1 overflow-y-auto pt-4 pb-2 lg:pb-4 scrollbar-none scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {menuItems.map((item) => {
          const active = isActive(item.route);
          const hasSubmenu = item.hasSubmenu;
          const isExpanded = hasSubmenu && isMenuExpanded(item.name);
          const submenuItems = hasSubmenu ? getSubmenuItems(item.name) : [];
          const Icon = iconMap[item.icon] || LayoutDashboard;

          return (
            <div key={item.name}>
              <button
                onClick={() => handleMenuPress(item)}
                className={cn(
                  "flex items-center py-3 mx-4 my-1.5 rounded-2xl transition-all duration-200",
                  isOpen ? "px-4 w-[calc(100%-32px)]" : "px-0 w-[calc(100%-32px)] justify-center",
                  active && !hasSubmenu ? "bg-white shadow-sm" : "hover:bg-white/10"
                )}
                title={!isOpen ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] flex-shrink-0",
                    active && !hasSubmenu ? "text-black" : "text-gray-300"
                  )}
                />
                {isOpen && (
                  <>
                    <span
                      className={cn(
                        "ml-3.5 text-[15px] flex-1 text-left font-medium",
                        active && !hasSubmenu ? "text-black font-semibold" : "text-gray-300 transition-colors"
                      )}
                    >
                      {item.name}
                    </span>
                    {hasSubmenu && (
                      <div className="text-gray-500">
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>

              {/* Submenu Items */}
              {hasSubmenu && isExpanded && isOpen && (
                <div className="ml-8 mr-2">
                  {submenuItems.map((subItem) => {
                    const subActive = pathname.startsWith(subItem.route);
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.route}
                        className={cn(
                          "block py-1 px-2.5 my-0.5 rounded transition-colors",
                          subActive
                            ? "bg-white/15"
                            : "hover:bg-white/8 text-white/70"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-normal",
                            subActive ? "text-white font-medium" : "text-white/70"
                          )}
                        >
                          {subItem.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Logout Button */}
      <div className={cn("py-2.5 border-t border-gray-800", isOpen ? "px-3" : "px-2")}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full py-3 rounded-2xl bg-white hover:bg-gray-100 transition-colors cursor-pointer",
            isOpen ? "px-4" : "px-2 justify-center"
          )}
          title={!isOpen ? "Log Out" : undefined}
        >
          <LogOut className="w-4 h-4 text-black flex-shrink-0" />
          {isOpen && (
            <span className="ml-2 text-sm text-black flex-1 text-left font-semibold">
              Log Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

