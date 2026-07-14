# SchooliAT — Meeting Notes × Codebase Implementation Plan

**Source meeting:** *SchooliAT Portal — UI & Fees Discussion* (Thursday, March 19, 2026) — extracted from `SchooliAT_Meeting_Notes.docx`  
**Codebase:** `/opt/schooliat/repo` (Backend: Node/Express + Prisma; Dashboard: Next.js; no React Native app in this workspace)  
**Cross-reference:** `ADMIN_PANELS_ANALYSIS_AND_DEVELOPMENT_GAPS.md`, `SRS.md`, `mobile_app_integration_analysis.md`, `Backend/ARCHITECTURE.md`

---

## 1. Purpose of this document

This file merges **stakeholder meeting outcomes** (bugs, features, action items) with an **inventory of what already exists in the repository**, so you get:

- A **single prioritized backlog** with concrete tasks mapped to likely code areas.
- Explicit **reconciliation** where internal analysis says “working” but the client session says “broken” (environment, data, or regression verification required).

---

## 2. Executive summary

| Theme | Meeting emphasis | Codebase reality (high level) |
|-------|------------------|-------------------------------|
| **Fees / finance** | “Empty / non-functional”; ledger, installments, receipts, class-level fees | Substantial implementation exists: `fee.router.js`, `fee.service.js`, dashboard `fees-management.tsx`, payment OTP on record path. **Treat meeting items as product hardening + UX + any env/data gaps**, not greenfield. |
| **Global date/month filter** | Filter on dashboard must drive all modules | Dashboard filter is **local state** on `admin/dashboard/page.tsx` only; academic year is global via `AcademicYearProvider`. **No portal-wide “selected month” context** — matches client complaint. |
| **OTP for destructive actions** | All delete/cancel must be OTP-gated (admin email) | `deletion-otp.router.js` + `otp-deletion.service.js` exist; fee recording uses OTP (`fee.router.js`). **Broad enforcement on every DELETE/cancel route + dashboard flows is not evidenced** — needs audit and wiring. |
| **Student profile** | Click row → full profile (fees, marks, homework, attendance) | Routes: `students/add`, `students/[id]/edit` — **no `students/[id]` profile (read-only detail) page** in glob search. |
| **Super Admin reminders** | (from internal doc) Payment reminders by school | UI sends `targetSchoolIds`; backend gap documented in `ADMIN_PANELS_ANALYSIS_AND_DEVELOPMENT_GAPS.md`. |
| **Courier / Staff edit** | Staff edit missing in UI; courier is localStorage-only | Confirmed in `ADMIN_PANELS_ANALYSIS_AND_DEVELOPMENT_GAPS.md`. |
| **Mobile** | Not primary in this meeting doc | No `mobile/` app in repo; integration guides describe API path fixes and mock data. |

---

## 3. Repository structure (what exists)

### 3.1 Backend (`Backend/`)

- **Entry:** `src/server.js` — mounts `/api/v1/*` and legacy paths; auth at `/auth` and `/api/v1/auth`.
- **Routers (representative):** users, students, employees, schools, regions, vendors, transports, files, licenses, receipts, invoices, statistics, locations, letterhead, calendar, exams, id-cards, templates, settings, **fees**, grievances, salary (structures/payments/assignments), attendance, timetables, homework, marks, leave, communication, notifications, library, notes, syllabus, gallery, circulars, parent, reports, **ai**, audit, **deletion-otp**, transfer-certificates, emergency-contacts, subjects, inventory.
- **Docs:** `ARCHITECTURE.md`, `MOBILE_DEV_REFERENCE.md`, `routes-map.json`.

### 3.2 Dashboard (`dashboard/`)

- Next.js app under `app/(dashboard)/` with **admin**, **super-admin**, **teacher**, **staff**, **parent** route groups.
- **Navigation:** `lib/config/menu-items.ts` defines admin menu (Finance → Fees, Salary; Attendance subtree; Results + Marks Entry; etc.).
- **Known gaps (internal):** staff edit UI; courier persistence; payment reminders backend alignment; optional fees chart mock data.

### 3.3 Mobile application

- **Not present** in this workspace. Treat mobile work as a **separate repo** using `MOBILE_API_DOCUMENTATION.md` and Postman collections in repo root.

---

## 4. Reconciliation: meeting bugs vs codebase

Use this when triaging: **“fixed in code since meeting”** vs **“still open”** vs **“data/env issue”**.

| # | Meeting bug | Likely code / verification |
|---|-------------|----------------------------|
| 1 | Global month filter not propagated | New or extended context (e.g. alongside `academic-year-context.tsx`); pass month into fee/reports/attendance queries. |
| 2–3 | Classes broken; scattered UI | `school.router.js` (classes), dashboard classes pages; bulk UX in class list components. |
| 4 | Teacher name saves as “Admin” | `user.router.js` + teacher create service; check role/default name assignment. |
| 5 | Duplicate Add Teacher buttons | Teacher list page components under `dashboard/`. |
| 6 | Bulk upload broken; no templates | Bulk CSV flows in hooks + API; add downloadable templates per entity. |
| 7 | Student row not opening profile | Add `[id]/page.tsx` profile + link from table. |
| 8 | Fee module empty | Verify API base URL, school data, migrations; align UI with `GET` fees endpoints; see `fee.service.js`. |
| 9–10 | Staff attendance / student attendance server errors | `attendance.router.js` + staff attendance pages; reproduce with logs. |
| 11–13 | Homework due date, class in submissions | `homework.router.js`, homework edit/submission UI. |
| 14 | Leave: no class filter | Leave approvals UI + `leave.router.js` query params. |
| 15–16 | Salary action broken; receipt reset | `salary` dashboard components + `salary.router.js`; fees receipt UI. |
| 17–18 | Results / marks tab navigation | Marks entry page UX + `marks.router.js`. |
| 19 | ID card template empty / permissions | `id-card.router.js`, template service, super-admin permissions in `role.service.js`. |
| 20 | Circular not connected | **Conflict:** internal doc says circular API exists — **verify** `circular.router.js` vs dashboard `use-circulars` wiring on client build client pointed at. |
| 21 | Super Admin comments Open/High build error | Grievance/detail components under `super-admin/grievances`. |
| 22–23 | Notes / Syllabus “WICKER” error | Likely typo for **Wicked** or similar UI lib — `notes`/`syllabus` pages and hooks. |
| 24 | Inventory search + ledger | `inventory.router.js` + inventory UI. |

---

## 5. Feature requirements from meeting (mapped to work packages)

| # | Requirement | Implementation hints |
|---|-------------|---------------------|
| F1 | Portal-wide persistent month/date | React context + URL query sync optional; propagate to list pages’ API calls. |
| F2 | Classes: card layout, multi-select, bulk actions | Dashboard classes UI refactor. |
| F3 | Fees on class creation → propagate to students | Extend class create/update payload in `school` flow; fee structure linkage in `fee` service / Prisma models. |
| F4 | Student profile page | New route + aggregate calls: student, fees ledger, marks, homework, attendance. |
| F5–F6 | Full fee management + ledger accounting | Extend/correct fee APIs for net collection, cancellation as audit row not hard delete; dashboard fee ledger views. |
| F7 | OTP all delete/cancel | Middleware pattern: verify OTP on sensitive routes; dashboard modals calling `/deletion-otp/request` + verify; align with `otp-deletion.service.js`. |
| F8 | Receipt/invoice: logo, serial, GST, two formats | Template service / PDF generation; school settings for series + GST. |
| F9 | Staff attendance: tabs + arrival time | Schema if needed + staff attendance UI. |
| F10–F12 | Attendance UI (calendar + summary + 4 statuses) | `attendance` pages redesign; enum support in API if currently binary. |
| F13–F14 | Leave: class filter, balance, salary link | Leave + salary services integration. |
| F15 | Homework visibility + submissions per class | Hooks + homework service filters. |
| F16 | Result templates (10–15) + customization | `template.router.js`, marks/result UI. |
| F17 | Gallery video + limits | `gallery` upload validation, storage limits. |
| F18 | Inventory consumable vs non-consumable + ledger | Model + API extensions. |
| F19 | ID cards content + permissions | Templates + `Permission` matrix. |
| F20 | Referral data in admin view | New backend + UI (optional today; meeting LOW). |
| F21 | Help content | CMS/static content or `settings/content` slugs. |

---

## 6. Phased plan and detailed task list

### Phase A — Verification & stability (1–2 weeks, parallelizable)

**Goal:** Confirm which meeting bugs still reproduce on staging with real DB; fix P0 crashes and 500s.

| ID | Task | Details |
|----|------|---------|
| A1 | **Staging smoke matrix** | For each meeting bug #1–24, one row: reproduce Y/N, endpoint, screenshot/log. |
| A2 | **Attendance server error** | Trace `attendance.router.js` + DB constraints; add request validation and error messages. |
| A3 | **Notes/Syllabus runtime error** | Find stack trace; fix import/component (search “Wicked” / toast / editor deps). |
| A4 | **Circular E2E** | Call `circular` API with token; trace dashboard `use-circulars` — close gap if mismatch. |
| A5 | **Super Admin grievance comments** | Fix build/runtime on Open/High filters in grievance detail. |
| A6 | **Salary distribution action** | Debug button handler + API response in salary payment generation flow. |
| A7 | **Receipt reset** | Finance UI: wire reset to clear form state and optional draft id. |

### Phase B — Navigation, context, and core UX (2–3 weeks)

| ID | Task | Details |
|----|------|---------|
| B1 | **Global period context** | Introduce `PeriodFilterProvider` (month/week/date) or extend existing layout; persist to `localStorage` + optional `?month=` query. |
| B2 | **Wire period to APIs** | Fees reports, attendance reports, finance widgets: read shared context instead of defaulting to “now”. |
| B3 | **Student profile v1** | Add `app/(dashboard)/admin/students/[id]/page.tsx`; sections: overview, fees, attendance summary, marks, homework. |
| B4 | **Student table → profile** | Link row click to `/admin/students/[id]`. |
| B5 | **Classes UI redesign** | Card grid, checkbox selection, bulk export/download. |
| B6 | **Teacher duplicate button** | Remove redundant CTA; keep single primary flow. |
| B7 | **Teacher name = Admin bug** | Fix create/update payload mapping in backend + verify frontend form field names. |
| B8 | **Staff edit UI** | Implement edit dialog/page using existing `PATCH /users/staff/:id` (per internal gap doc). |

### Phase C — Fees & compliance (highest business value; 3–5 weeks)

| ID | Task | Details |
|----|------|---------|
| C1 | **Class-level fee defaults** | On class create/update, set fee plan; batch-update or lazy-link student fee records when class assignment changes. |
| C2 | **Payment lookup by ID/email/phone** | Enhance fee record-payment flow + UI search. |
| C3 | **Ledger: cancellations as adjustments** | Ensure cancelled payments remain rows with status; reports show gross vs net. |
| C4 | **OTP on fee cancellation** | Reuse `otpService` / deletion OTP pattern; document flow for admins. |
| C5 | **Receipt templates** | GST vs non-GST; school logo; configurable invoice/series in school settings. |
| C6 | **Installments** | Verify installment APIs vs meeting spec; UI for partial payments and schedule. |
| C7 | **Fees dashboard chart** | Replace mock data in `fees-management.tsx` with `/reports/fees` or dedicated aggregation. |
| C8 | **Client deliverables** | Share TC format reference; confirm GST/serial numbering with client (meeting items 31–32). |

### Phase D — Attendance & leave (2–4 weeks)

| ID | Task | Details |
|----|------|---------|
| D1 | **Four attendance statuses** | Extend schema/API if needed: Present, Absent, Late, Half Day. |
| D2 | **Calendar + summary layout** | Admin attendance pages: calendar left, summary right, list below. |
| D3 | **Staff attendance tabs** | “Mark today” vs “Past records”; time-of-arrival field. |
| D4 | **Leave class filter + balances** | Query params + UI; optional leave balance model. |
| D5 | **Leave ↔ salary** | Deduct approved leave in salary calculation or payment generation rules. |

### Phase E — Homework & academics (2–3 weeks)

| ID | Task | Details |
|----|------|---------|
| E1 | **Homework due date/time validation** | Align Zod schema (`create-homework` / `update-homework`) with UI. |
| E2 | **Submission class name** | Fix join/select in homework service or UI mapping. |
| E3 | **Student profile homework** | Surface assigned/submitted items on profile page. |
| E4 | **Marks entry Tab navigation** | Keyboard navigation in marks grid component. |
| E5 | **Results module regression** | End-to-end: template selection → marks → publish; migrate legacy templates per meeting. |

### Phase F — Super Admin, communications, inventory, media (1–3 weeks)

| ID | Task | Details |
|----|------|---------|
| F1 | **Payment reminders by school** | Backend: `targetSchoolIds` on `createAnnouncement` + user resolution (per internal gap doc). |
| F2 | **ID card templates & permissions** | Super Admin visibility; populate default template content when client provides 3 fields. |
| F3 | **Gallery video** | Upload pipeline, duration/size validation, storage. |
| F4 | **Inventory** | Searchable items; issue ledger; consumable flag behavior. |
| F5 | **Courier persistence** | New Prisma model + router + replace localStorage in courier UI. |
| F6 | **Referral tracking** | Optional: schema + admin list showing referral id, parent, preferred class. |

### Phase G — Mobile (separate codebase)

| ID | Task | Details |
|----|------|---------|
| G1 | **Base URL & paths** | Enforce `/api/v1` on all protected routes; `GET /auth/roles`. |
| G2 | **Replace mocks** | Wire student/teacher/parent flows per `mobile_app_integration_analysis.md`. |
| G3 | **Parity with web** | OTP, fees view, attendance — as product prioritizes. |

### Phase H — Quality, SRS alignment, and ops

| ID | Task | Details |
|----|------|---------|
| H1 | **Bulk upload templates** | Server-generated CSV/Excel templates per entity; validate columns on upload. |
| H2 | **Automated API tests** | Extend `scripts/test-mobile-api-all-endpoints.js` / Postman for web-critical paths. |
| H3 | **Audit logging** | Ensure fee cancellations and deletes appear in `audit` where required. |
| H4 | **Documentation** | Update `ADMIN_PANELS_ANALYSIS_AND_DEVELOPMENT_GAPS.md` after each phase closes. |

---

## 7. Meeting action items (32) — traceability

The following are copied from the March 19, 2026 notes with **suggested phase** tags:

1. Global month filter portal-wide → **B1–B2**  
2. Fix Classes (subjects, display, flows) → **A1, B5**  
3. Teacher name bug + duplicate button → **B6–B7**  
4. Bulk upload all sections + templates → **H1**  
5. Classes card + multi-select → **B5**  
6. Fees on class creation → **C1**  
7. Complete fee module → **C2–C7** (verify **A1** first)  
8. Student ledger accounting → **C3**  
9. OTP all delete/cancel → **C4 + cross-cutting middleware audit**  
10. Invoice/receipt formats → **C5**  
11. TC format to client → **C8** (process)  
12. Student profile page → **B3–B4**  
13. Staff attendance + server error → **A2, D3**  
14. Attendance UI redesign → **D2**  
15. Four attendance states → **D1**  
16. Leave class filter + approval + salary → **D4–D5**  
17. Homework fixes + profile integration → **E1–E3**  
18. Salary action + receipt reset → **A6–A7**  
19. Result management fixes → **E5**  
20. Result templates 10–15 + customization → **E5**  
21. ID card permissions + template → **F2**  
22. Notes error → **A3**  
23. Syllabus error → **A3**  
24. Gallery video → **F3**  
25. Inventory → **F4**  
26. Circular backend → **A4**  
27. Super Admin comments error → **A5**  
28. Referral reflection → **F6**  
29. Client: competitor comparatives → stakeholder  
30. Client: TC + ID card 3 elements → stakeholder  
31. Client: confirm GST / PC serial format → stakeholder  
32. Reschedule meeting → stakeholder  

---

## 8. Suggested priority order (merged backlog)

1. **A1 + A2 + A3 + A5** — stop hard failures and ambiguous “broken module” reports.  
2. **B1–B2 + C1–C3** — align with client’s top theme (fees + global period).  
3. **B3–B4 + B7–B8** — teachers/students daily operations.  
4. **C4–C5 + OTP audit** — security commitment from meeting.  
5. **D1–D3 + E1–E2** — attendance/homework pain.  
6. **F1 + internal gaps** (courier, reminders).  
7. **G\*** when mobile repo is available.

---

## 9. Appendix — meeting metrics (from DOCX)

- **23** bugs listed  
- **21** feature requirements  
- **32** action items  
- Participants: SchooliAT (client), Anand Singh (tech lead), Prince Mogha  
- Recording: confirmed; next meeting contingent on client comparatives  

---

*Generated for planning; task estimates should be refined by the team after A1 verification.*

---

## 10. Changelog — implemented in repo (2026-03-21)

The following were **implemented in `/opt/schooliat/repo`** in one pass (not the full meeting backlog):

| Area | Change |
|------|--------|
| **Backend — Notes** | `GET /notes/notes/:id` and `GET /notes/syllabus/:id` (school-scoped); `getNoteById` / `getSyllabusById` in `notes.service.js`. |
| **Backend — Communications** | Announcements accept `targetSchoolIds` and optional `type`; payment-style reminders use `NotificationType.FEE` when `type === "PAYMENT_REMINDER"`; resolves **school admins per selected school**. |
| **Dashboard — Notes / Syllabus** | `useNote`, `useSyllabusById`; view pages load by id (fixes “not found” on paginated lists); **edit routes** `notes/[id]/edit`, `syllabus/[id]/edit`; syllabus **create** sends required `title` (auto-generated if missing). |
| **Dashboard — Teachers** | Removed duplicate **Add New** header inside `TeachersTable`; **create teacher** sends `publicUserId` when set; safer **yearOfPassing** when field empty. |
| **Dashboard — Staff** | **Edit** via `/admin/staff/[id]/edit` and `PATCH` payload uses `dob` → `dateOfBirth`. |
| **Dashboard — Students** | **Profile** at `/admin/students/[id]` (overview, fee ledger, marks, results, homework); name in table links to profile. |
| **Dashboard — Global month** | `PortalPeriodProvider` + navbar **month** control; syncs with admin dashboard when filter type is **Month**. |
| **Dashboard — Fees chart** | Replaced mock **Recharts** data with **monthly totals from paid installments** (`paidAt`). |

**Still out of scope for this commit** (requires larger migrations / UX projects): full OTP on every delete, courier persistence, attendance 4-state + layout overhaul, complete fee ledger cancellations, bulk CSV template downloads, mobile app, gallery video, inventory consumable types, all result-template work, etc.

---

## 11. Reconciliation — Phase 2 + follow-through (2026-03-21+)

The following **additional** items are implemented in-repo (extends §10):

| Area | Change |
|------|--------|
| **Fees / Prisma** | Class `defaultAnnualFee` / `defaultMonthlyFee`; installment `cancelledAt`, `cancellationReason`; `FeePaymentStatus.CANCELLED`. |
| **Fees / Backend** | Student fee plan on create/bulk create; rebuild on class change when no payments; cancel installment (OTP); lookup student; `GET /reports/fees` respects **`classId`** (students in class). |
| **Fees / Dashboard** | Class fee fields on bulk class form; fees management: lookup, cancel modal, cancelled status; real collection chart. |
| **Fees / Reports UI** | `FeeSection`: cancelled **count + gross**, pie slice, monthly **cancelled** bar; `aggregateFeesByMonth` no longer counts cancelled as pending. |
| **Leave** | `GET /leave/history?classId=` when `userId=all` filters to requesters with `studentProfile.classId`; **Leave Approvals** page class filter. |
| **Attendance** | Marking UI supports **HALF_DAY** (bulk + per row); statistics cards read backend fields `total` / `present` / `absent` / `late` / `halfDay`. |
| **Portal month** | Reports + attendance reports pages can follow **portal month** (see §10 + reports/attendance pages). |

**Remaining major backlog** (not closed here): universal delete OTP, courier API, receipt/GST/serial product completion, attendance calendar layout spec, leave ↔ salary, homework/marks polish, inventory ledger, mobile app, bulk CSV templates, full audit on every cancel/delete.
