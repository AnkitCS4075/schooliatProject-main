# School Admin Panel – Seed Data Coverage

This document maps **every school admin page** to the seed data that populates it. Run the seed from root: `./seed-env.sh production` or `./seed-env.sh staging`.

---

## Menu & Pages (from `dashboard/lib/config/menu-items.ts`)

| # | Page | Route | Data Source | Seed Coverage |
|---|------|--------|-------------|----------------|
| 1 | **Dashboard** | `/admin/dashboard` | Stats, calendar, notices, fee widget | ✅ Events, holidays, notices, fees, settings, students/teachers counts |
| 2 | **Classes** | `/admin/classes` | Classes API | ✅ Classes + subjects per school |
| 3 | **Teachers** | `/admin/teachers` | Teachers API | ✅ Teachers (5–8 per school) + teacher profiles |
| 4 | **Students** | `/admin/students`, add, edit | Students API | ✅ Students (20–30 per school) + student profiles, fees |
| 5 | **Attendance** → Mark | `/admin/attendance` | Attendance periods, classes | ✅ Attendance periods, attendance records (30 days) |
| 6 | **Attendance** → Reports | `/admin/attendance/reports` | Attendance API | ✅ Same attendance data |
| 7 | **Homework** | `/admin/homework` | Homework API | ✅ Homeworks + MCQ questions + submissions |
| 8 | **Leave** → My Leaves | `/admin/leave` | Leave requests API | ✅ Leave types, leave requests, leave balances |
| 9 | **Leave** → Approvals | `/admin/leave/approvals` | Leave requests API | ✅ Same leave data |
| 10 | **Finance** → Fees | `/admin/finance/fees` | Fees API | ✅ Fees + 12 installments per student |
| 11 | **Finance** → Salary | `/admin/finance/salary` | Salary API | ✅ Salary structures, salary payments (teachers) |
| 12 | **Calendar** | `/admin/calendar` | Events, holidays, notices, exam calendars | ✅ Events, holidays, notices, exam calendars + items |
| 13 | **Time Table** | `/admin/timetable` | Timetable API | ✅ Timetables + slots per class |
| 14 | **Transport** | `/admin/transport` | Transport API | ✅ Transport vehicles (2–4 per school) |
| 15 | **Library** → Books | `/admin/library` | Library books API | ⚠️ No DB model in current schema; backend expects `LibraryBook` |
| 16 | **Library** → Operations | `/admin/library/operations` | Library issue/return API | ⚠️ Same as above |
| 17 | **Notes & Syllabus** | `/admin/notes` | Notes / Syllabus API | ⚠️ No DB model in current schema; backend expects `Note` / `Syllabus` |
| 18 | **Gallery** | `/admin/gallery` | Gallery API | ⚠️ No DB model in current schema; backend expects `Gallery` |
| 19 | **Inventory** | `/admin/inventory` | Frontend mock only | ✅ Page uses in-component mock data (no backend) |
| 20 | **Result Management** → Results | `/admin/results` | Results API | ✅ Results + marks per exam |
| 21 | **Result Management** → Marks Entry | `/admin/marks/entry` | Exams, marks API | ✅ Exams, marks, results |
| 22 | **ID Cards** | `/admin/id-cards` | ID card status API | ✅ Template (ID_CARD), IdCardConfig, IdCardCollection per class |
| 23 | **Circular/Notice** | `/admin/circulars` | Notices API (`/calendar/notices`) | ✅ Notices (3 per school) |
| 24 | **Reports & Analytics** | `/admin/reports` | Reports API (aggregates) | ✅ Uses attendance, fees, marks, etc. |
| 25 | **Settings** | `/admin/settings` | Settings API | ✅ Settings per school |
| 26 | **Transfer Certificates** | `/admin/transfer-certificates` | TC API | ✅ TCs (where table exists) |
| 27 | **Help** | `/admin/help` | Static / content | N/A |
| 28 | **Contact Schooliat** | `/admin/contact` | Contact / grievance | N/A or grievances |
| 29 | **Profile** | `/admin/profile` | Current user | ✅ User exists (school admin) |

---

## Seed Phases (in order)

1. **Core** – Roles, regions, locations, schools, classes, subjects, users (all types), transport, fees, exams, calendar (events, holidays, notices), receipts, licenses, vendors, **settings**, **ID cards (template, config, collections)**, grievances, salaries.
2. **Phase 1** – Attendance periods & attendance, timetables, homeworks, marks & results, leave types & requests, communication (conversations, messages, notifications).
3. **Phase 2** – Library, notes/syllabus, gallery, circulars (placeholders if models missing).
4. **Phase 3** – Parent–child links, transfer certificates, emergency contacts (where tables exist).

---

## Pages Without Backend Data (current schema)

- **Library** – Backend uses `LibraryBook` (and related) which are not in the current Prisma schema; add schema + migration to enable seeding.
- **Notes & Syllabus** – Backend uses `Note` and `Syllabus`; not in current schema.
- **Gallery** – Backend uses `Gallery` / `GalleryImage`; not in current schema.
- **Circulars** – UI uses **notices** (`/calendar/notices`); notices are seeded. A separate `Circular` model is used by the backend but not in current schema.

---

## How to Run Seed (root level)

```bash
# Production DB (uses /opt/schooliat/backend/production/shared/.env)
./seed-env.sh production

# Staging DB (uses /opt/schooliat/backend/staging/shared/.env)
./seed-env.sh staging
```

From Backend directory:

```bash
cd master-schooliat/Backend && npm run seed
```

---

## Default School Admin Login

- **Email:** `admin@gis001.edu` (Greenwood International School)
- **Password:** `Admin@123`

Same pattern for other schools: `admin@<schoolcode>.edu` (e.g. `admin@sps002.edu`, `admin@bfa003.edu`).
