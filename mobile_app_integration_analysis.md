# Mobile App Report – Analysis & Backend Mapping

This document analyzes `mobile_app_reports.md` and maps it to the **actual backend API** (see `MOBILE_APP_API_COMPLETE.json` and `MOBILE_API_DOCUMENTATION.md`). The report was generated against a different spec (`API_SPEC.md`); below we align everything to the live backend.

---

## 1. What the report got right

| Item | Status |
|------|--------|
| Base URL `https://api.schooliat.com` | ✅ Correct |
| Auth: `POST /auth/authenticate` with `{ request: { email, password } }` | ✅ Matches backend |
| Auth header: `Authorization: Bearer <token>` | ✅ Correct |
| `x-platform: android` / `ios` | ✅ Correct |
| Token from login used for protected routes | ✅ Correct |
| Only 3 flows use the API today (login, teacher dashboard, unused role) | ✅ Accurate |
| Most screens use mock/static data | ✅ Accurate |

---

## 2. Path and endpoint corrections (report vs real backend)

The report assumes paths from `API_SPEC.md`. Our backend uses different paths. Use this mapping when wiring the app.

### 2.1 Path prefix (critical)

- **Issue:** App calls `/statistics/dashboard` and `/role` **without** `/api/v1/`.
- **Backend:** All non-auth APIs are under **`/api/v1/`**. Auth is under **`/auth/`** only (no `/api/v1`).
- **Fix:**  
  - Use **`/api/v1/statistics/dashboard`** (not `/statistics/dashboard`).  
  - Use **`/auth/roles`** (not `/role` and not under `/api/v1`).  
  - For **every** non-auth endpoint, prefix with **`/api/v1`** (e.g. base URL + `/api/v1/...`).

### 2.2 Role endpoint

- **Report:** `GET /role`  
- **Backend:** **`GET /auth/roles`** (no `/api/v1`, no “role” singular).  
- **Fix:** Point the role fetch to `GET https://api.schooliat.com/auth/roles`.

### 2.3 Profile & user

- **Report:** `GET /profile`, `GET /user/personal-info`, `POST /user/change-password`  
- **Backend:**  
  - Profile / current user: **`GET /auth/me`**  
  - Update profile: **`PATCH /auth/me`**  
  - Change password: **`POST /auth/change-password`** (body: `{ request: { currentPassword, newPassword } }`)  
- **Fix:**  
  - Use **`GET /auth/me`** for profile and personal info (response includes user and can include contact details depending on backend).  
  - Use **`POST /auth/change-password`** with the `request` wrapper and `currentPassword` / `newPassword`.

### 2.4 Teacher features

- **Report:** `GET /teacher/classes`, `GET /teacher/students`, `GET /teacher/students/:id/detail`  
- **Backend:**  
  - Teacher’s classes (timetable view): **`GET /api/v1/timetables/my-classes`**  
  - School classes list: **`GET /api/v1/schools/classes`**  
  - Students list: **`GET /api/v1/students`** (query: `classId`, `page`, `limit`, `search`)  
  - Student by ID: **`GET /api/v1/students/:id`**  
- **Fix:** Wire Teacher Classes to `timetables/my-classes` and/or `schools/classes`; Student list to `students`; Student detail to `students/:id`.

### 2.5 Attendance

- **Report:** `GET /attendance/students?classId=&date=`, `POST /attendance/submit`  
- **Backend:**  
  - Get attendance (filtered): **`GET /api/v1/attendance`** (query: `studentId`, `classId`, `startDate`, `endDate`, `status`)  
  - Mark one: **`POST /api/v1/attendance/mark`** (body: `{ request: { studentId, classId, date, status, ... } }`)  
  - Mark bulk: **`POST /api/v1/attendance/mark-bulk`** (body: `{ request: { classId, date, attendance: [...] } }`)  
- **Fix:** Use **`GET /api/v1/attendance`** with `classId` and date range for “students for attendance”; use **`mark`** or **`mark-bulk`** to submit (no `/attendance/submit`).

### 2.6 Student dashboard & academics

- **Report:** `GET /statistics/student-dashboard`, `GET /student/academics`  
- **Backend:**  
  - Dashboard (role-based): **`GET /api/v1/statistics/dashboard`** (same path; backend returns different shape for student).  
  - Academic summary: **`GET /api/v1/marks/my-summary`**  
  - Marks: **`GET /api/v1/marks`**  
  - Results: **`GET /api/v1/marks/results`**  
- **Fix:** Student home → **`GET /api/v1/statistics/dashboard`** (with `/api/v1/` prefix). Academics / records → **`/api/v1/marks/my-summary`**, **`/api/v1/marks`**, **`/api/v1/marks/results`**.

### 2.7 Notices, calendar, settings, legal, support

- **Report:** `GET /notices`, `GET /calendar/events`, `GET /settings/config`, `GET /support/info`, `GET /legal/terms`, `GET /legal/privacy`  
- **Backend:**  
  - Notices: **`GET /api/v1/calendar/notices`**; announcements: **`GET /api/v1/communication/announcements`**  
  - Calendar events: **`GET /api/v1/calendar/events`** or **`GET /api/v1/calendar`** (query: `month`, `date`)  
  - Settings: **`GET /api/v1/settings`**  
  - Terms / Privacy / Support (platform content): **`GET /api/v1/settings/content/:slug`** with `slug` = **`terms`**, **`privacy`**, **`support`**  
- **Fix:**  
  - Notices → **`/api/v1/calendar/notices`** and/or **`/api/v1/communication/announcements`**.  
  - Calendar → **`/api/v1/calendar/events`** or **`/api/v1/calendar`**.  
  - Settings → **`/api/v1/settings`**.  
  - Terms → **`/api/v1/settings/content/terms`**.  
  - Privacy → **`/api/v1/settings/content/privacy`**.  
  - Help/Support → **`/api/v1/settings/content/support`**.

### 2.8 OTP

- **Report:** `POST /auth/verify-otp`  
- **Backend:** **`POST /auth/verify-otp`** (body: `{ request: { email, otp, purpose } }`).  
- **Fix:** Use **`POST /auth/verify-otp`**; no `/api/v1/`. Match body to backend (email, otp, purpose).

---

## 3. Response shape alignment

### 3.1 Login

- Backend returns something like: `{ message, token, data: { user: { id, email, firstName, lastName, role, school, ... } } }`.
- App uses JWT decode for user; ensure the **JWT payload** (or the response `data.user`) contains the fields the app needs for profile and role (e.g. `id`, `firstName`, `lastName`, `role.name`, `schoolId`). If anything is missing, either extend the backend response/JWT or adjust the app to use `data.user` where available.

### 3.2 Dashboard

- Backend: **`GET /api/v1/statistics/dashboard`** returns a structure that can include `timetable`, `pendingHomeworks`, `submittedHomeworks`, `upcomingExams`, `totalStudents`, `classes`, etc. (see `MOBILE_API_DOCUMENTATION.md`).
- App expects `{ status, message, data: DashboardData }` with specific fields. **Either:**  
  - Have the backend return `{ status, message, data }` with the dashboard payload under `data`, and match the field names the app uses, **or**  
  - Change the app to accept the current backend shape and update Redux/slice accordingly.

---

## 4. Action list for full integration

Do these in the mobile app (and optionally adjust backend only where shapes are agreed):

1. **Path prefix**  
   - Use **`/api/v1/`** for every non-auth endpoint (e.g. dashboard → `/api/v1/statistics/dashboard`).  
   - Use **`/auth/`** only for auth endpoints (authenticate, roles, me, change-password, verify-otp, etc.).

2. **Role**  
   - Use **`GET /auth/roles`** (not `/role`).

3. **Profile & account**  
   - Profile / personal info: **`GET /auth/me`**.  
   - Change password: **`POST /auth/change-password`** with `{ request: { currentPassword, newPassword } }`.

4. **Teacher**  
   - Classes: **`GET /api/v1/timetables/my-classes`** and/or **`GET /api/v1/schools/classes`**.  
   - Students: **`GET /api/v1/students`** (query: `classId`, `page`, `limit`, `search`).  
   - Student detail: **`GET /api/v1/students/:id`**.

5. **Attendance**  
   - Load data: **`GET /api/v1/attendance`** (query: `classId`, `startDate`, `endDate`).  
   - Submit: **`POST /api/v1/attendance/mark`** or **`POST /api/v1/attendance/mark-bulk`** with the request bodies from `MOBILE_APP_API_COMPLETE.json`.

6. **Student**  
   - Dashboard: **`GET /api/v1/statistics/dashboard`**.  
   - Academics: **`GET /api/v1/marks/my-summary`**, **`GET /api/v1/marks`**, **`GET /api/v1/marks/results`**.

7. **OTP**  
   - **`POST /auth/verify-otp`** with `{ request: { email, otp, purpose } }`.

8. **Notices & calendar**  
   - Notices: **`GET /api/v1/calendar/notices`** and/or **`GET /api/v1/communication/announcements`**.  
   - Events: **`GET /api/v1/calendar/events`** or **`GET /api/v1/calendar`** (with query params as in the JSON).

9. **Settings, help, legal**  
   - Settings: **`GET /api/v1/settings`**.  
   - Terms: **`GET /api/v1/settings/content/terms`**.  
   - Privacy: **`GET /api/v1/settings/content/privacy`**.  
   - Support: **`GET /api/v1/settings/content/support`**.

10. **Request body convention**  
    - Where the backend expects a wrapper, use **`{ request: { ... } }`** (e.g. auth, change-password, attendance, etc.). Check `MOBILE_APP_API_COMPLETE.json` or `MOBILE_API_DOCUMENTATION.md` per endpoint.

---

## 5. Summary

- **Report conclusion is right:** the app is **not** fully integratable today (only login and one dashboard path are used; paths and many features are missing or mock).
- **Paths in the report are from another spec.** The **real** backend is described in **`MOBILE_APP_API_COMPLETE.json`** and **`MOBILE_API_DOCUMENTATION.md`**; use the mappings in §2 and the list in §4 when wiring each feature.
- After applying the path prefix, correcting auth/profile/role paths, and wiring the endpoints above with the correct paths and body shapes, the mobile app can be fully integratable with the current backend API.

Use **`MOBILE_APP_API_COMPLETE.json`** as the single source of truth for method, path, and brief description when implementing each call in the React Native app.
