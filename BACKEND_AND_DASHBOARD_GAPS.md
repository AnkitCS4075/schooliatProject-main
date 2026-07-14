# Backend & Dashboard – Gaps and Implementation Status

This document lists **missing or partial** features for the backend and both dashboard panels (school admin and super admin). It was produced from a full analysis of routers, services, schema, and dashboard pages/hooks.

---

## 1. Backend – Schema gaps (models used in code but not in schema)

These Prisma models are used in **routers** or **services** but **do not exist** in `Backend/src/prisma/db/schema.prisma`. Until they are added and migrated, the corresponding APIs will fail at runtime.

| Model / enum | Used in | Status |
|--------------|--------|--------|
| **LibraryBook** | library.service.js, library.router.js | Missing – add to schema |
| **LibraryIssue** | library.service.js | Missing – add to schema |
| **LibraryReservation** | library.service.js | Missing – add to schema |
| **LibraryIssueStatus** (enum) | library.service.js | Missing – add to schema |
| **Note** | notes.service.js, notes.router.js | Missing – add to schema |
| **Syllabus** | notes.service.js, notes.router.js | Missing – add to schema |
| **Gallery** | gallery.service.js, gallery.router.js | Missing – add to schema |
| **GalleryImage** | gallery.service.js | Missing – add to schema |
| **GalleryPrivacy** (enum) | gallery.service.js | Missing – add to schema |
| **Circular** | circular.service.js, circular.router.js, dashboard.service.js | Missing – add to schema |
| **CircularStatus** (enum) | circular.service.js | Missing – add to schema |
| **FAQ** | ai.service.js, ai.router.js | Missing – add to schema (Prisma client: `fAQ`) |
| **ChatbotConversation** | ai.service.js | Missing – add to schema |
| **ChatbotMessage** | ai.service.js | Missing – add to schema |
| **ChatbotIntent** (enum) | ai.service.js | Missing – add to schema |
| **Route** | transport-enhanced.service.js, transport.router.js | Missing – add to schema |
| **RouteStop** | transport-enhanced.service.js, transport.router.js | Missing – add to schema |
| **VehicleMaintenance** | transport-enhanced.service.js | Missing – add to schema |

**NotificationType** – Used for LIBRARY and CIRCULAR notifications in code; enum in schema currently has no LIBRARY/CIRCULAR. Add these values if notification types are sent for library and circulars.

---

## 2. Backend – Route vs dashboard path mismatches

| Dashboard hook / usage | Calls | Backend mount | Fix |
|------------------------|-------|----------------|------|
| use-salary.ts `fetchSalaryAssignments()` | GET `/salary-assignments` | Salary assignments are under GET `/salaries` | Point dashboard to GET `/salaries` for assignments |

All other hook paths checked align with backend mounts (`/users`, `/schools`, `/calendar`, `/library`, `/notes`, `/gallery`, `/circulars`, `/attendance`, `/timetables`, `/homework`, `/marks`, `/leave`, `/fees`, `/salary-structures`, `/salary-payments`, `/reports`, `/grievances`, `/id-cards`, `/transfer-certificates`, `/emergency-contacts`, `/ai`, etc.).

---

## 3. Dashboard – Missing or partial pages

| Route | Issue | Fix |
|-------|--------|-----|
| `/super-admin/master-data` | Menu has `hasSubmenu: true` and sub-items (Regions, Locations), but there is **no** `app/(dashboard)/super-admin/master-data/page.tsx`. Parent route can 404. | Add a master-data page that redirects to `/super-admin/master-data/regions` or shows a simple landing with links to Regions and Locations. |

All other school-admin and super-admin menu routes have a corresponding page.

---

## 4. Backend – Features that work today (no schema gap)

- Auth, users (teachers, students), schools, classes, subjects, settings, fees, receipts, licenses, grievances, regions, locations, vendors, transport (CRUD), file upload, letterhead, calendar (events, holidays, notices, exam calendars), exams, id-cards, timetables, homework, marks, leave, communication, reports, audit, TCs, emergency contacts, salary structures, salary payments, salary assignments (under `/salaries`), statistics, deletion-otp.

---

## 5. Implementation checklist (no patch work; do not break existing behaviour)

1. **Schema** ✅ Done
   - Added enums: `LibraryIssueStatus`, `GalleryPrivacy`, `CircularStatus`, `ChatbotIntent`.
   - Added to `NotificationType`: `LIBRARY`, `CIRCULAR`.
   - Added models: `LibraryBook`, `LibraryIssue`, `LibraryReservation`, `Note`, `Syllabus`, `Gallery`, `GalleryImage`, `Circular`, `FAQ`, `ChatbotConversation`, `ChatbotMessage`, `Route`, `RouteStop`, `VehicleMaintenance`.
   - Added relations on School, Transport, Event, Class, Subject, File, User as needed.

2. **Migration**
   - Run when DB is available: `cd Backend && npx prisma migrate dev --name add_missing_models --schema=src/prisma/db/schema.prisma`. This creates and applies the migration for the new tables/indexes without altering existing data.

3. **Backend** ✅ Done
   - `prisma generate` has been run. Routers and services already use the new model names; no code changes required.

4. **Dashboard** ✅ Done
   - **Salary assignments:** `use-salary.ts` now calls GET `/salaries` for salary assignments (was `/salary-assignments`).
   - **Super-admin master-data:** Added `app/(dashboard)/super-admin/master-data/page.tsx` that redirects to `/super-admin/master-data/regions`.

5. **Seed (optional)**
   - Extend seed for Library, Notes/Syllabus, Gallery, Circular, FAQ, Routes/Stops, etc., so that school admin and super admin panels have sample data on every page. (Can be done in a follow-up.)

---

## 6. Summary

- **Backend:** 14 model names + 4 enums (and optionally 2 notification types) are missing from the schema; adding them and running a migration will enable Library, Notes/Syllabus, Gallery, Circulars, AI/FAQ/Chatbot, and Transport routes/stops/maintenance.
- **Dashboard:** One wrong API path (salary assignments) and one missing parent page (super-admin master-data). Fixing these completes the current gap list without breaking existing features.

All changes are at repo root / `master-schooliat` level and can be implemented without patching or removing existing behaviour.
