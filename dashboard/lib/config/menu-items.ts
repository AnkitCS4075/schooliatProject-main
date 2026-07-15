import { BILLING_BASE_PATH, BILLING_ROUTES } from "@/lib/super-admin/billing/constants";
import { MASTER_DATA_ROUTES } from "@/lib/super-admin/master-data/routes";

export interface MenuItem {
  name: string;
  icon: string; // Lucide icon name
  route: string;
  hasSubmenu?: boolean;
}

export interface SubMenuItem {
  name: string;
  route: string;
}

// Submenu items for Finance
export const FINANCE_SUBMENU: SubMenuItem[] = [
  { name: "My Finance", route: "/admin/finance" },
  { name: "Fees Management", route: "/admin/finance/fees" },
  { name: "Fee Defaulters", route: "/admin/finance/fee-defaulters" },
  { name: "Salary Distribution", route: "/admin/finance/salary" },
  { name: "Discounts & Scholarships", route: "/admin/finance/discounts" },
];

// Submenu items for Attendance
export const ATTENDANCE_SUBMENU: SubMenuItem[] = [
  { name: "Mark Attendance", route: "/admin/attendance" },
  { name: "Staff Attendance", route: "/admin/attendance/staff" },
  { name: "Self Attendance", route: "/admin/attendance/self" },
  { name: "Reports", route: "/admin/attendance/reports" },
];

// Submenu items for Leave (school admin: Approvals only; "My Leave" removed per requirement)
export const LEAVE_SUBMENU: SubMenuItem[] = [
  { name: "Approvals", route: "/admin/leave/approvals" },
];

// Submenu items for Library
export const LIBRARY_SUBMENU: SubMenuItem[] = [
  { name: "Books", route: "/admin/library" },
  { name: "Operations", route: "/admin/library/operations" },
];

// Submenu items for Results
export const RESULTS_SUBMENU: SubMenuItem[] = [
  { name: "Results", route: "/admin/results" },
  { name: "Marks Entry", route: "/admin/marks/entry" },
];

// Submenu items for Students (if needed in future)
export const STUDENTS_SUBMENU: SubMenuItem[] = [
  { name: "All Students", route: "/admin/students" },
  { name: "New admission", route: "/admin/students?admission=1" },
  { name: "Transfer Certificates", route: "/admin/transfer-certificates" },
  { name: "Bonafide Certificates", route: "/admin/bonafide" },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "LayoutDashboard",
    route: "/admin/dashboard",
  },
  {
    name: "Classes",
    icon: "GraduationCap",
    route: "/admin/classes",
  },
  {
    name: "Subjects",
    icon: "Book",
    route: "/admin/subjects",
  },
  {
    name: "Teachers",
    icon: "Users",
    route: "/admin/teachers",
  },
  {
    name: "Students",
    icon: "UserCheck",
    route: "/admin/students",
  },
  {
    name: "Staff",
    icon: "SquareUser",
    route: "/admin/staff",
  },
  {
    name: "Attendance",
    icon: "UserCheck",
    route: "/admin/attendance",
    hasSubmenu: true,
  },
  {
    name: "Homework",
    icon: "FileText",
    route: "/admin/homework",
  },
  {
    name: "Leave Management",
    icon: "Calendar",
    route: "/admin/leave",
    hasSubmenu: true,
  },
  {
    name: "Finance",
    icon: "DollarSign",
    route: "/admin/finance",
    hasSubmenu: true,
  },
  {
    name: "Calendar",
    icon: "Calendar",
    route: "/admin/calendar",
  },
  {
    name: "Time Table",
    icon: "CalendarDays",
    route: "/admin/timetable",
  },
  {
    name: "Transport",
    icon: "Bus",
    route: "/admin/transport",
  },
  {
    name: "Library",
    icon: "BookOpen",
    route: "/admin/library",
    hasSubmenu: true,
  },
  {
    name: "Notes & Syllabus",
    icon: "FileText",
    route: "/admin/notes",
  },
  {
    name: "Gallery",
    icon: "Image",
    route: "/admin/gallery",
  },
  {
    name: "Inventory",
    icon: "Package",
    route: "/admin/inventory",
  },
  {
    name: "Result Management",
    icon: "Award",
    route: "/admin/results",
    hasSubmenu: true,
  },
  {
    name: "ID Cards",
    icon: "CreditCard",
    route: "/admin/id-cards",
  },
  {
    name: "Circular/Notice",
    icon: "FileText",
    route: "/admin/circulars",
  },
  {
    name: "Reports & Analytics",
    icon: "BarChart3",
    route: "/admin/reports",
  },
  {
    name: "Accounting",
    icon: "BookOpen",
    route: "/admin/accounting",
  },
  {
    name: "Courier",
    icon: "Truck",
    route: "/admin/courier",
  },
  {
    name: "Gate Entry",
    icon: "DoorOpen",
    route: "/admin/gate-entry",
  },
  {
    name: "CRM",
    icon: "Target",
    route: "/admin/crm",
  },
  {
    name: "Bonafide",
    icon: "ScrollText",
    route: "/admin/bonafide",
  },
  {
    name: "Approvals",
    icon: "CheckSquare",
    route: "/admin/approvals",
  },
  {
    name: "Messages",
    icon: "MessageSquare",
    route: "/admin/messages",
  },
  {
    name: "Referral",
    icon: "Gift",
    route: "/admin/referral",
  },
  {
    name: "Settings",
    icon: "ShieldCheck",
    route: "/admin/settings",
  },
  {
    name: "Help",
    icon: "Info",
    route: "/admin/help",
  },
  {
    name: "Contact Schooliat",
    icon: "MessageCircle",
    route: "/admin/contact",
  },
];

export const SUPER_ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    name: "Dashboard",
    icon: "LayoutDashboard",
    route: "/super-admin/dashboard",
  },
  {
    name: "Schools",
    icon: "School",
    route: "/super-admin/schools",
  },
  {
    name: "Onboarding",
    icon: "UserPlus",
    route: "/super-admin/onboarding",
  },
  {
    name: "Billing",
    icon: "Wallet",
    route: BILLING_BASE_PATH,
  },
  {
    name: "Platform Finance",
    icon: "Landmark",
    route: "/super-admin/platform-finance",
  },
  {
    name: "Licenses",
    icon: "ShieldCheck",
    route: "/super-admin/licenses",
  },
  {
    name: "Statistics",
    icon: "BarChart3",
    route: "/super-admin/statistics",
  },
  {
    name: "Employees",
    icon: "Users",
    route: "/super-admin/employees",
  },
  {
    name: "Vendors",
    icon: "Store",
    route: "/super-admin/vendors",
  },
  {
    name: "Master Data",
    icon: "Database",
    route: "/super-admin/master-data",
  },
  {
    name: "Audit Logs",
    icon: "ScrollText",
    route: "/super-admin/audit-logs",
  },
  {
    name: "System Health",
    icon: "Activity",
    route: "/super-admin/system-health",
  },
  {
    name: "About Us",
    icon: "Info",
    route: "/super-admin/about-us",
  },
  {
    name: "Letter Head",
    icon: "FileText",
    route: "/super-admin/letter-head",
  },
  {
    name: "Grievances",
    icon: "MessageSquare",
    route: "/super-admin/grievances",
  },
  {
    name: "Reports & Analytics",
    icon: "BarChart3",
    route: "/super-admin/reports",
  },
  {
    name: "Reminders",
    icon: "Bell",
    route: "/super-admin/reminders",
  },
  {
    name: "Settings",
    icon: "ShieldCheck",
    route: "/super-admin/settings",
  },
  {
    name: "Help",
    icon: "Info",
    route: "/super-admin/help",
  },
];

/** Flat list of { name, route } for navbar quick search (admin + all submenus) */
export function getAdminSearchItems(): { name: string; route: string }[] {
  const out: { name: string; route: string }[] = [];
  for (const item of MENU_ITEMS) {
    if (item.hasSubmenu) {
      const sub =
        item.name === "Finance"
          ? FINANCE_SUBMENU
          : item.name === "Attendance"
            ? ATTENDANCE_SUBMENU
            : item.name === "Leave Management"
              ? LEAVE_SUBMENU
              : item.name === "Library"
                ? LIBRARY_SUBMENU
                : item.name === "Result Management"
                  ? RESULTS_SUBMENU
                  : [];
      sub.forEach((s) => out.push({ name: s.name, route: s.route }));
    } else {
      out.push({ name: item.name, route: item.route });
    }
  }
  out.push({
    name: "Templates",
    route: "/admin/settings?tab=templates",
  });
  return out;
}

/** Flat list of { name, route } for navbar quick search (super-admin + submenus) */
export function getSuperAdminSearchItems(): { name: string; route: string }[] {
  const out: { name: string; route: string }[] = [];
  for (const item of SUPER_ADMIN_MENU_ITEMS) {
    out.push({ name: item.name, route: item.route });
  }
  out.push(
    { name: "Regions", route: MASTER_DATA_ROUTES.regionsTab },
    { name: "Locations", route: MASTER_DATA_ROUTES.locationsTab },
    { name: "Invoices", route: BILLING_ROUTES.invoicesTab },
    { name: "Receipts", route: BILLING_ROUTES.receiptsTab },
    { name: "Onboarding", route: "/super-admin/onboarding" },
    { name: "Platform Finance", route: "/super-admin/platform-finance" },
  );
  return out;
}

