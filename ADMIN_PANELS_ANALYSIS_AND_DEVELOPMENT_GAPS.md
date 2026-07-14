# School Admin & Super Admin Panels – Deep Analysis & What Needs to Be Developed

This document is a **very deep analysis** of both the School Admin and Super Admin dashboards. For each feature, it notes whether the flow is complete (UI → API → backend → DB) or what is missing so that **every feature/functionality can work end-to-end**.

---

## 1. School Admin Panel – Feature-by-Feature

### 1.1 Dashboard (`/admin/dashboard`)
- **UI**: Uses `useDashboard()` → `GET /statistics/dashboard` with optional `academicYear`, `filterType`, `filterValue`.
- **Backend**: `GET /reports/dashboard-summary` and statistics service exist.
- **Status**: ✅ Working (dashboard stats and summary).

---

### 1.2 Classes (`/admin/classes`, `/admin/classes/update`)
- **UI**: List from `GET /schools/classes` (card grid, multi-select, bulk class student-list CSV export); update page sends full list via `POST /schools/classes` with optional **default annual/monthly fee** per row.
- **Backend**: `POST /schools/classes` supports create + update + soft-delete with `defaultAnnualFee` / `defaultMonthlyFee`; `PATCH /schools/classes/:id` supports the same optional fee fields.
- **Status**: ✅ Working. (Dashboard uses bulk POST for “Update classes”; single-class PATCH is available but not used in UI.)

---

### 1.3 Subjects (`/admin/subjects`)
- **UI**: `use-subjects` → GET/POST/PATCH/DELETE `/subjects`.
- **Backend**: subject.router has full CRUD.
- **Status**: ✅ Working.

---

### 1.4 Teachers (`/admin/teachers`, add, edit)
- **UI**: List, add, edit, delete, bulk CSV via `use-teachers` (GET/POST/PATCH/DELETE, bulk).
- **Backend**: user.router teachers routes exist.
- **Status**: ✅ Working.

---

### 1.5 Students (`/admin/students`, add, edit, transfer certificates)
- **UI**: List, add, edit, delete, bulk, TC flow via `use-students` and `use-tc`.
- **Backend**: user.router students + transfer-certificates router.
- **Status**: ✅ Working.

---

### 1.6 Staff (`/admin/staff`)
- **UI**: List, add, delete, bulk delete; **edit** at `/admin/staff/[id]/edit` calling `PATCH /users/staff/:id` (payload maps `dob` → `dateOfBirth`).
- **Backend**: `PATCH /users/staff/:id` exists.
- **Status**: ✅ Edit flow implemented (replace any legacy “coming soon” toasts if they remain on the list page).

---

### 1.7 Attendance (Mark, Staff, Reports)
- **UI**: Mark → `use-attendance` (periods, mark, mark-bulk) with **Present / Absent / Late / Half day**; statistics cards use API fields `total`, `present`, `absent`, `late`, `halfDay`; Staff attendance page; Reports → `useAttendanceReports` → `GET /reports/attendance` (portal month sync optional on reports page).
- **Backend**: attendance.router + reports.router (`AttendanceStatus` includes `HALF_DAY`).
- **Status**: ✅ Working.

---

### 1.8 Homework
- **UI**: List, add, edit, delete, grade via `use-homework`.
- **Backend**: homework.router full CRUD + submit + grade.
- **Status**: ✅ Working.

---

### 1.9 Leave (Approvals)
- **UI**: `use-leave` (history, approve, reject, types); approvals page **class filter** (pending list scoped with `GET /leave/history?userId=all&classId=` for students in that class).
- **Backend**: leave.router; history supports optional **`classId`** when listing all school requests.
- **Status**: ✅ Working.

---

### 1.10 Finance – Fees (`/admin/finance/fees`)
- **UI**: Installments, record payment (online/offline), receipt, export, student lookup, cancel installment (OTP), cancelled status; collection chart from paid installments.
- **Backend**: fee.router (installments, student fees, record payment, cancel, lookup, OTP, export); class-level fee defaults; student fee plan on create / rebuild on class change when safe.
- **Status**: ✅ Working.

---

### 1.11 Finance – Salary (`/admin/finance/salary`)
- **UI**: `use-salary` → salary-payments, salary-structures, `/salaries` for assignments.
- **Backend**: salary-structures, salary-payments, salaries (assignments).
- **Status**: ✅ Working.

---

### 1.12 Calendar
- **UI**: Events, holidays, exam calendars via `use-calendar` and calendar API.
- **Backend**: calendar.router (events, holidays, notices, exam-calendars).
- **Status**: ✅ Working.

---

### 1.13 Time Table
- **UI**: `use-timetable` CRUD + conflict check.
- **Backend**: timetable.router.
- **Status**: ✅ Working.

---

### 1.14 Transport
- **UI**: `use-transport` CRUD.
- **Backend**: transport.router (vehicles). No Route/RouteStop/VehicleMaintenance in current routes (schema may have models).
- **Status**: ✅ Basic vehicle CRUD working. Advanced (routes, stops, maintenance) not exposed in UI/API.

---

### 1.15 Library (Books, Operations)
- **UI**: `use-library` (books, dashboard, history, issues, returns, reservations, fines, bulk, pending-returns).
- **Backend**: library.router; schema has LibraryBook, LibraryIssue, LibraryReservation.
- **Status**: ✅ Working if migrations applied and seed (if any) run.

---

### 1.16 Notes & Syllabus
- **UI**: `use-notes` for notes and syllabus (CRUD).
- **Backend**: notes.router; schema has Note, Syllabus.
- **Status**: ✅ Working.

---

### 1.17 Gallery
- **UI**: `use-gallery` CRUD + images.
- **Backend**: gallery.router; schema has Gallery, GalleryImage.
- **Status**: ✅ Working.

---

### 1.18 Inventory
- **UI**: `use-inventory` GET/POST/PATCH/DELETE `/inventory`.
- **Backend**: inventory.router; schema has InventoryItem.
- **Status**: ✅ Working.

---

### 1.19 Result Management (Results, Marks Entry)
- **UI**: Results + marks entry use `use-marks`, `use-reports` (academic).
- **Backend**: marks.router, exams, reports (academic).
- **Status**: ✅ Working.

---

### 1.20 ID Cards
- **UI**: `use-id-cards` (status, generate by class, config, templates).
- **Backend**: id-card.router, templates.
- **Status**: ✅ Working.

---

### 1.21 Circular/Notice
- **UI**: `use-circulars` CRUD + publish.
- **Backend**: circular.router; schema has Circular.
- **Status**: ✅ Working.

---

### 1.22 Reports & Analytics
- **UI**: Dashboard summary, attendance, fees, academic, salary reports + export (client-side CSV from report data); fee tab shows **cancelled** ledger metrics and trend when data exists; date range can follow **portal month** on school admin reports/attendance reports.
- **Backend**: reports.router (dashboard-summary, attendance, fees, academic, salary); `GET /reports/fees` supports **`classId`** (students in class).
- **Status**: ✅ Working.

---

### 1.23 Courier (`/admin/courier`)
- **UI**: CourierManagement – CRUD via `use-courier` (React Query) against **`GET/POST/PATCH/DELETE /api/v1/couriers`**.
- **Backend**: `SchoolCourier` model (per school, soft delete), `courier.router.js`, permissions `GET_COURIERS`, `CREATE_COURIER_ENTRY`, `UPDATE_COURIER_ENTRY`, `DELETE_COURIER_ENTRY` on School Admin.
- **Status**: ✅ Persisted per school; aggregates + pagination on list.

---

### 1.24 Referral (`/admin/referral`)
- **UI**: Share school code + referral link (copy, WhatsApp, email). No API calls for tracking.
- **Backend**: No referral tracking API.
- **Status**: ✅ Share/copy works. Optional: backend for referral tracking (codes, signups, rewards) if product requires it.

---

### 1.25 Settings (`/admin/settings`)
- **UI**: School profile, logo, fees config, notifications, account (password), payments (bank/UPI). Uses `use-settings`, `useMySchool`, platform bank for display.
- **Backend**: settings.router (school settings), PATCH my-school, platform-bank (read), auth change-password.
- **Status**: ✅ Working for school admin.

---

### 1.26 Help (`/admin/help`)
- **UI**: Help center; can submit via `POST /grievances` (support as grievance).
- **Backend**: grievances.
- **Status**: ✅ Working.

---

### 1.27 Contact SchooliAT (`/admin/contact`, create)
- **UI**: Lists “my grievances” and “New Grievance” → CreateGrievanceForm → `POST /grievances`.
- **Backend**: grievances (school-scoped when created by school admin).
- **Status**: ✅ Working. Ensure super admin can list/filter grievances by school or type so “Contact SchooliAT” tickets are visible platform-wide if required.

---

## 2. Super Admin Panel – Feature-by-Feature

### 2.1 Dashboard
- **UI**: `useDashboardStats` → `GET /statistics/dashboard`.
- **Backend**: statistics.
- **Status**: ✅ Working.

---

### 2.2 Schools (list, register, view, edit)
- **UI**: `use-super-admin` schools CRUD, register form.
- **Backend**: school.router.
- **Status**: ✅ Working.

---

### 2.3 Receipts (list, create, generate)
- **UI**: Receipts list, create, generate via use-super-admin receipts APIs.
- **Backend**: receipt.router.
- **Status**: ✅ Working.

---

### 2.4 Invoices (list, create, generate, delete)
- **UI**: Invoices management + generate.
- **Backend**: invoice.router.
- **Status**: ✅ Working.

---

### 2.5 Licenses
- **UI**: CRUD via use-super-admin licenses.
- **Backend**: license.router.
- **Status**: ✅ Working.

---

### 2.6 Statistics
- **UI**: Schools stats, revenue; uses statistics APIs.
- **Backend**: statistics.router.
- **Status**: ✅ Working.

---

### 2.7 Employees
- **UI**: List, add, edit, permissions, vendors view.
- **Backend**: user.router employees.
- **Status**: ✅ Working.

---

### 2.8 Vendors
- **UI**: List, add, edit, delete, stats.
- **Backend**: vendor.router.
- **Status**: ✅ Working.

---

### 2.9 Master Data (Regions, Locations)
- **UI**: Regions and locations CRUD; parent `/super-admin/master-data` redirects to regions.
- **Backend**: region.router, location.router.
- **Status**: ✅ Working.

---

### 2.10 Templates
- **UI**: List templates by type, view default.
- **Backend**: template.router.
- **Status**: ✅ Working.

---

### 2.11 Audit Logs
- **UI**: `useAuditLogs` → `GET /audit` with filters.
- **Backend**: audit.router.
- **Status**: ✅ Working.

---

### 2.12 System Health
- **UI**: `useSystemHealth` → `GET /health`.
- **Backend**: /health and /api/v1/health.
- **Status**: ✅ Working.

---

### 2.13 About Us
- **UI**: Static content + dashboard stats.
- **Status**: ✅ Working.

---

### 2.14 Letter Head
- **UI**: Generate letterhead via `use-super-admin` → `POST /letterhead/generate`.
- **Backend**: letterhead.router.
- **Status**: ✅ Working.

---

### 2.15 Grievances
- **UI**: List, view detail, add comment.
- **Backend**: grievance.router (list, get, comments). Super admin needs to see all schools’ grievances (filter by school/platform).
- **Status**: ✅ Working if backend list supports super-admin scope (all schools or filter).

---

### 2.16 Reports & Analytics
- **UI**: Super-admin reports (e.g. by school).
- **Backend**: reports/statistics with school filter.
- **Status**: ✅ Working.

---

### 2.17 Reminders (Payment Reminders)
- **UI**: Select schools, set subject/message, “Send Reminder” → `POST /communication/announcements` with **targetSchoolIds** and **type** (e.g. `PAYMENT_REMINDER`).
- **Backend**: Announcements / communication service resolves **targetSchoolIds** to users (e.g. school admins per school) and supports notification **type** for payment-style reminders.
- **Status**: ✅ Working for school-targeted reminders (verify on staging with real schools).

---

### 2.18 Settings
- **UI**: Platform settings (platform bank, branding, maintenance, email, etc.). Uses `useSettings`, `useUpdateSettings`, `GET /settings/platform-bank`.
- **Backend**: settings.router (platform settings for SUPER_ADMIN, platform-bank, platformConfig).
- **Status**: ✅ Working (assuming platformConfig migration applied).

---

### 2.19 Help
- **UI**: Static/support.
- **Status**: ✅ Working.

---

## 3. Backend–Dashboard API Mismatches / Gaps

| Area | Issue | Fix |
|------|--------|-----|
| **Courier** | — | ✅ `SchoolCourier` + `/couriers` + dashboard hooks (was localStorage-only). |
| **Referral** | No backend. | Optional: add referral tracking (codes, signups, rewards) if product needs it. |
| **Universal delete OTP** | Super-admin dashboard deletes were ungated. | ✅ Super-admin flows: `SuperAdminDeletionOtpDialog` + `POST /deletion-otp/request`; DELETE payloads include `request.otp`. Backend: `requireDeletionOTP` on school, region, vendor, license, invoice, location deletes. Other panels / routes still auditable separately. |

---

## 4. What Needs to Be Developed (Prioritized)

### Must-have (features that are in the UI but not working end-to-end)

_(Courier persistence is implemented; see §1.23.)_

### Should-have (consistency and polish)

1. **Referral tracking (optional)**  
   - Only if product needs it: referral codes, signup attribution, rewards; backend models + APIs; dashboard updates to show stats or links.

2. **OTP on remaining deletes / cancels (meeting)**  
   - Super-admin destructive deletes (schools, regions, locations, vendors, licenses, invoices) are OTP-gated end-to-end. Extend the same pattern to school-admin deletes and any other DELETE routes if policy requires it.

### Already working (no dev needed for “starts working”)

- Dashboard (admin + super-admin), Classes, Subjects, Teachers, Students, TCs, Attendance (mark + staff + reports), Homework, Leave, Finance (fees + salary), Calendar, Timetable, Transport (basic), Library, Notes & Syllabus, Gallery, Inventory, Results & Marks, ID Cards, Circulars, Reports & Analytics, Settings, Help, Contact (grievances).  
- Super Admin: Schools, Receipts, Invoices, Licenses, Statistics, Employees, Vendors, Master Data, Templates, Audit, System Health, About Us, Letter Head, Grievances, Reports, Settings, Help.  
- Backend: All corresponding routers and services for the above; schema includes Library, Notes, Syllabus, Gallery, Circular, InventoryItem, etc. (migrations must be applied).

---

## 5. Summary Table

| Panel        | Feature / Area     | Status        | Action |
|-------------|--------------------|---------------|--------|
| School Admin | Staff edit         | ✅            | Edit route + PATCH. |
| School Admin | Courier            | ✅            | `SchoolCourier` + `/couriers`; dashboard API hooks. |
| School Admin | Fees / classes     | ✅            | Class defaults, ledger cancel, reports class filter, portal month on key report pages. |
| Super Admin  | Reminders by school| ✅            | targetSchoolIds + resolution (verify on staging). |
| Super Admin  | Grievances         | ✅            | List scope: all schools, platform (`schoolId` null), or one school; school-scoped for non–super-admin `GET /grievances`. |
| Both         | Referral           | Optional      | Only if tracking/rewards required. |
| Both         | Delete OTP everywhere | ⚠️ Partial   | Super-admin deletes: ✅. School admin / other routes: extend if required. |

Remaining panel gaps are mostly optional product items (referral, universal delete OTP, etc.).
