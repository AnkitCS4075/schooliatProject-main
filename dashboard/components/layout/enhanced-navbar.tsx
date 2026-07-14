"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Settings,
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearToken } from "@/lib/auth/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import { useIsLgScreen } from "@/lib/hooks/use-media-query";
import { useSidebar } from "@/lib/context/sidebar-context";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/lib/hooks/use-notifications";
import { getAdminSearchItems, getSuperAdminSearchItems } from "@/lib/config/menu-items";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import { AcademicYearSelector } from "./academic-year-selector";
import { PortalMonthSelector } from "./portal-month-selector";

export function EnhancedNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const isLg = useIsLgScreen();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchItems = useMemo(
    () => (pathname.startsWith("/super-admin") ? getSuperAdminSearchItems() : getAdminSearchItems()),
    [pathname]
  );
  const filteredSearchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return searchItems.slice(0, 8);
    return searchItems
      .filter((item) => item.name.toLowerCase().includes(q) || item.route.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, searchItems]);

  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) setSearchQuery("");
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = searchWrapRef.current;
      if (el && !el.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen]);

  const handleSearchSelect = (route: string) => {
    router.push(route);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const { data: notificationsRes, isLoading: notificationsLoading } = useNotifications({
    page: 1,
    limit: 10,
    isRead: null,
  });
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsRes?.data?.notifications ?? [];
  const hasUnread = unreadCount > 0;

  const handleNotificationClick = (item: { id: string; actionUrl?: string | null; isRead: boolean }) => {
    if (!item.isRead) {
      markRead.mutate(item.id);
    }
    if (item.actionUrl) {
      setNotificationsOpen(false);
      router.push(item.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const settingsRoute = isSuperAdminRoute ? "/super-admin/settings" : "/admin/settings";
  const profileRoute =
    isSuperAdminRoute
      ? "/super-admin/profile"
      : pathname.startsWith("/employee")
        ? "/employee/profile"
        : "/admin/profile";

  const handleLogout = async () => {
    await clearToken();
    router.replace("/login");
  };

  const getUserInitials = () => {
    if (user?.email) {
      const emailParts = user.email.split("@")[0].split(".");
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase();
      }
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserName = () => {
    if (user?.email) {
      const emailParts = user.email.split("@")[0].split(".");
      if (emailParts.length >= 2) {
        return `${emailParts[0]} ${emailParts[1]}`.replace(/\b\w/g, (l) => l.toUpperCase());
      }
      return user.email.split("@")[0];
    }
    return "User";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[var(--navbar-height)] bg-white border-b border-gray-200 z-40 flex items-center px-0 shadow-sm">
      {/* Left: toggle + logo — always pinned to viewport left, never shifts */}
      <div className="flex items-center gap-2 flex-shrink-0 pl-3 pr-2 h-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 h-8 w-8 shrink-0"
          title={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={!isLg ? isOpen : undefined}
          aria-controls="dashboard-sidebar"
        >
          {isOpen ? (
            <X className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <Menu className="h-3.5 w-3.5 text-gray-600" />
          )}
        </Button>
        <div className="w-8 h-8 flex-shrink-0 bg-primary/10 rounded-lg flex items-center justify-center p-1">
          <Image
            src="/logo.png"
            alt="SchooliAT"
            width={24}
            height={24}
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-sm font-semibold text-gray-800 tracking-wide text-left whitespace-nowrap">
          SchooliAT
        </span>
      </div>

      {/* Rest of navbar — static, no margin shift on sidebar toggle */}
      <div className="flex flex-1 items-center justify-between min-w-0 pr-3 pl-2">

        {/* Center: Quick navigation search */}
        <div className="hidden md:flex flex-1 justify-center min-w-0 max-w-xl mx-2">
          <div ref={searchWrapRef} className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none z-10" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search pages (e.g. Students, Library, Fees)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="pl-8 pr-3 h-8 w-full text-sm border-gray-200 focus:border-primary focus:ring-primary"
              aria-label="Quick navigation search"
              aria-expanded={searchOpen}
              aria-controls="navbar-quick-search-results"
              autoComplete="off"
            />
            {searchOpen ? (
              <div
                id="navbar-quick-search-results"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[min(20rem,60vh)] overflow-y-auto rounded-md border border-gray-200 bg-popover text-popover-foreground shadow-md"
              >
                {filteredSearchItems.length === 0 ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {searchQuery.trim() ? "No matching pages" : "Type to search pages"}
                  </div>
                ) : (
                  <ul className="py-1">
                    {filteredSearchItems.map((item) => (
                      <li key={item.route} role="option">
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSearchSelect(item.route)}
                        >
                          <span className="truncate">{item.name}</span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Academic Year Selector */}
        <AcademicYearSelector variant="navbar" className="mr-1" />
        <PortalMonthSelector className="mr-1" />

        {/* Notifications */}
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 h-8 w-8"
              title="Notifications"
            >
              <Bell className="h-3.5 w-3.5 text-gray-600" />
              {hasUnread && (
                <span
                  className="absolute top-0.5 right-0.5 min-w-[0.375rem] h-1.5 px-0.5 flex items-center justify-center bg-red-500 text-[10px] font-medium text-white rounded-full"
                  aria-label={`${unreadCount} unread`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-h-[min(24rem,70vh)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-2 py-2 border-b">
              <span className="text-sm font-semibold">Notifications</span>
              {hasUnread && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleMarkAllRead}
                  disabled={markAllRead.isPending}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              {notificationsLoading ? (
                <div className="p-3 space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="py-1">
                  {notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex flex-col items-stretch gap-0.5 p-3 cursor-pointer rounded-none border-b border-gray-100 last:border-0 focus:bg-gray-50"
                      onSelect={(e) => {
                        e.preventDefault();
                        handleNotificationClick(item);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={item.isRead ? "text-sm font-normal text-gray-700" : "text-sm font-semibold text-gray-900"}
                        >
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" aria-hidden />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 text-left">
                        {item.content}
                      </p>
                      <span className="text-[10px] text-muted-foreground text-left">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(settingsRoute)}
          className="rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 h-8 w-8"
        >
          <Settings className="h-3.5 w-3.5 text-gray-600" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 h-8 px-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:block text-xs font-medium text-gray-700">
                {getUserName()}
              </span>
              <ChevronDown className="h-3 w-3 text-gray-500 hidden lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{getUserName()}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileRoute)}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(settingsRoute)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </nav>
  );
}

