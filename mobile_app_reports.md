# SchoolIt Mobile App – Backend API Integration Report

**Scope:** React Native app in `SchoolIt-main/` vs backend API.  
**Backend source of truth:** `API_SPEC.md` (workspace does not contain `MOBILE_APP_API_COMPLETE.json` or `MOBILE_API_DOCUMENTATION.md`; this report uses `API_SPEC.md`).  
**Base URL:** `https://api.schooliat.com` (auth: `/auth/*`, API: `/api/v1/*` per your spec).

---

## 1. Backend API Usage Found in the App

### 1.1 Configuration & client

| Item | Location | Details |
|------|----------|--------|
| Base URL | `SchoolIt-main/src/constants/srtrings.ts` | `API_CONST.BASE_URL = "https://api.schooliat.com"` |
| API client | `SchoolIt-main/src/utils/intercepter.ts` | Axios instance with `baseURL`, `timeout: 20000`, `Content-Type: application/json`, `x-platform: Platform.OS` |
| Auth header | `SchoolIt-main/src/utils/intercepter.ts` | Request interceptor adds `Authorization: Bearer ${token}` when `state.auth?.data?.token` exists |
| Token source | `SchoolIt-main/src/redux/services/AuthAuthenticate/authSlice.ts` | Token stored in `state.auth.data` after login success |
| API helpers | `SchoolIt-main/src/utils/apiClient.ts` | `getAPIClient(url)`, `postAPIClient(url, params)` using the axios instance above |

### 1.2 Endpoints actually called

| # | Screen / flow | File(s) | What it does | Endpoint used | Backend spec (API_SPEC.md) |
|---|----------------|---------|---------------|---------------|----------------------------|
| 1 | Login | `Login.tsx` → `authRequest` → `authSaga.ts` | Email/password sign-in, stores token and decoded user | `POST /auth/authenticate` | **Matches backend.** Spec: `POST /auth/authenticate` |
| 2 | Teacher dashboard | `TeacherHome/Home.tsx` | On load, fetches dashboard stats | `GET /statistics/dashboard` | Spec: `GET /statistics/dashboard` (see path & shape notes below) |
| 3 | Role (optional) | Saga only; no UI dispatches it | Fetches roles (e.g. multi-role) | `GET /role` | Spec: `GET /role` (see path note below) |

No other screens or hooks call the backend. All other features use local/mock data or Redux state from login.

---

## 2. Mapped: App Usage vs Backend

### 2.1 Login (auth)

- **Screen/hook/file:** `Login.tsx` → `authRequest` → `authSaga.ts` → `postAPIClient(API_CONST.LOGIN_AUTH, payload)`.
- **What it does:** Sends email/password, on success stores response in Redux; `authSuccess` stores `action.payload` in `state.auth.data` and sets `authData = jwtDecode(payload.token)` for user.
- **Backend endpoint:** `POST /auth/authenticate`.
- **Request body:** `{ request: { email, password } }` — **Matches backend** (API_SPEC §1.1).
- **Conclusion:** **Matches backend** for method, path, and request shape. Base URL is correct for auth (`/auth/*`).

### 2.2 Teacher dashboard

- **Screen/hook/file:** `TeacherHome/Home.tsx` → `dashboardRequest()` → `dashboardSaga.ts` → `getAPIClient(API_CONST.DASHBOARD)`.
- **What it does:** Fetches teacher dashboard data; success stores `action.payload.data` in `state.dashboard.data` (see shape mismatch below).
- **Backend endpoint (intended):** `GET /statistics/dashboard` (API_SPEC §3.1).
- **Path used:** `/statistics/dashboard` (no `/api/v1/` prefix). If your backend serves this at `https://api.schooliat.com/api/v1/statistics/dashboard`, the app currently **does not match** (wrong path).
- **Conclusion:** Method and logical endpoint match spec; **path may be wrong** if API lives under `/api/v1/`. Response shape mismatch (see §4).

### 2.3 Role

- **Screen/hook/file:** Only `roleSaga.ts` → `getAPIClient(API_CONST.ROLE)`. **No screen or flow dispatches `roleRequest()`** in the codebase.
- **What it does:** Would fetch available roles (e.g. for role selection).
- **Backend endpoint (spec):** `GET /role` (API_SPEC §1.3).
- **Path used:** `/role`. Same as above: if backend uses `/api/v1/role`, path is wrong.
- **Conclusion:** **Matches backend** where used; app does not use this endpoint in any user flow (missing integration).

---

## 3. Gaps (App Calls That Don’t Match Backend)

- **Path prefix:** App uses paths relative to base only (e.g. `/statistics/dashboard`, `/role`). You specified API under `https://api.schooliat.com/api/v1/*`. So:
  - **Gap:** Non-auth API calls are missing the `/api/v1` prefix and will 404 if the backend only exposes them under `/api/v1/`.
- **No wrong paths found:** Aside from the missing prefix, the app does not call endpoints that don’t exist in the spec (no extra or wrong paths).

---

## 4. Missing (Backend Endpoints the App Should Use but Doesn’t)

These are in API_SPEC but the app never calls them; screens use mock/hardcoded data or no data.

| Backend endpoint (API_SPEC) | Purpose | App screen / feature | Status |
|-----------------------------|---------|----------------------|--------|
| `POST /auth/verify-otp` | OTP verification | `OtpScreen.tsx` | **Missing:** OTP screen only logs to console; no API call. |
| `GET /profile` | Profile info (name, role, detailId) | `Profile.tsx` | **Missing:** Profile uses login user + hardcoded Employee ID / Class | Roll. |
| `GET /user/personal-info` | Email, phone, address | `Personal.tsx` | **Missing:** All contact details hardcoded. |
| `POST /user/change-password` | Change password | `ChangePassword.tsx` | **Missing:** Form only; submit button does not call API. Spec uses `currentPassword` / `newPassword`; UI uses “Old” / “New” / “Confirm”. |
| `GET /statistics/student-dashboard` | Student dashboard | `StudentHome/Home.tsx` | **Missing:** Student home uses only mock data and login user name. |
| `GET /teacher/classes` | Teacher’s classes | `TeacherClass/Classes.tsx` | **Missing:** Uses `DUMMY_CLASSES`. |
| `GET /teacher/students` (query, classId) | Student directory | `TeachStudents.tsx` | **Missing:** Uses `DUMMY_DATA` and local search/filter. |
| `GET /attendance/students?classId=&date=` | Students for attendance | `MarkAttendance.tsx` | **Missing:** Uses `initialStudents` mock. |
| `POST /attendance/submit` | Submit attendance | `MarkAttendance.tsx` | **Missing:** No submit-to-server; only local state. |
| `GET /teacher/students/{studentId}/detail` | Student detail profile | `ViewStudentProfile.tsx` | **Missing:** All data hardcoded. |
| `GET /student/academics` | Academic progress | `StudentAcademics/Academics.tsx`, `AcademicRecords.tsx` | **Missing:** Mock data only. |
| `GET /notices` | Notices & circulars | `StudentNotice/Notice.tsx`, Student Home notices | **Missing:** Mock arrays. |
| `GET /calendar/events` | Calendar & events | Teacher/Student calendar screens | **Missing:** No API usage found; likely mock. |
| `GET /settings/config` | Settings / preferences | `Settings.tsx` | **Missing:** Local state only. |
| `GET /support/info` | Help & support | `HelpSupport.tsx` | **Missing:** FAQ/support hardcoded. |
| `GET /legal/terms` | Terms | `TermsConditions.tsx` | **Missing:** Static paragraphs. |
| `GET /legal/privacy` | Privacy | `Privacy.tsx` | **Missing:** Static content. |

---

## 5. Shape Mismatches

### 5.1 Login response

- **API_SPEC (§1.1):** `{ status, token, user: { id, firstName, lastName, email, role: { id, name } } }`.
- **App:** Expects at least `token`; user is taken from **JWT decode** (`authData = jwtDecode(action.payload.token)`), not from response body `user`. Profile/role in UI come from `state.auth.authData.data.user` (TokenResponse).
- **Mismatch:** App does not use top-level `user` from response; it relies on JWT payload. Backend must either return `user` in the response (and app could be updated to use it) or ensure JWT payload matches `TokenResponse.data.user` (id, firstName, lastName, role, etc.). If JWT doesn’t include full user/role, profile/role may be wrong.

### 5.2 Dashboard response

- **API_SPEC (§3.1):** Flat object, e.g. `{ totalStudents, attendanceSummary, pendingTasks, upcomingClasses }`.
- **App:** `dashboardSlice` does `state.data = action.payload.data` and `DashboardResponse` in `dashboardStore.ts` expects `{ status, message, data: DashboardData }` with `DashboardData` (recentAttendance, pendingHomeworks, upcomingExams, recentResults, timetable, recentNotices, feeStatus, class).
- **Mismatch:** Spec shows a flat structure; app expects a wrapped `{ status, message, data }` with a different inner shape. Backend and app need to agree on one response format (either spec’s flat shape and app updated, or backend returns the app’s expected wrapper and fields).

### 5.3 Change password (when wired)

- **API_SPEC (§2.3):** `POST /user/change-password` body: `currentPassword`, `newPassword`.
- **App (ChangePassword.tsx):** Labels are “Old Password”, “New Password”, “Confirm Password”. No API call yet. When implemented, map to `currentPassword` and `newPassword`; confirm key names and whether a `request` wrapper is required (align with other auth APIs).

---

## 6. Auth Verification

| Requirement | Status |
|-------------|--------|
| `Authorization: Bearer <token>` on protected requests | **Done.** `intercepter.ts` request interceptor sets `config.headers.Authorization = \`Bearer ${token}\`` when `state.auth?.data?.token` exists. |
| Token from login used for protected routes | **Done.** All requests go through the same axios instance; dashboard and any future protected calls get the token from the same store. |
| `x-platform: android` / `ios` | **Done.** `headers: { "x-platform": Platform.OS }` in axios create. |
| Logout clears token | **Done.** Logout dispatches `RESET_STORE`; app then shows Auth stack (no token). |

Auth wiring is correct for the current set of calls. Any new protected endpoint will automatically get Bearer + x-platform as long as it uses the same `api` client.

---

## 7. Summary

**The mobile app is not fully integratable with the backend API** because:

- Only three backend operations are used (login, teacher dashboard, and an unused role fetch), and several details don’t align with your stated backend (path prefix, response shapes).
- Most features that the API spec describes (student dashboard, teacher classes/students, attendance, profile, personal info, change password, notices, calendar, settings, help, legal) are not wired to the backend at all and use mock or static data.
- Path and response-shape mismatches would cause 404s or runtime errors even for the endpoints that are called.

**Required fixes to make everything integratable:**

1. **API path prefix:** Use `/api/v1/` for all non-auth endpoints (e.g. `/api/v1/statistics/dashboard`, `/api/v1/role`). Keep auth as `/auth/*` without `/api/v1/`.
2. **Align dashboard response:** Either have the backend return the app’s expected `{ status, message, data: DashboardData }` (and match `DashboardData` in `dashboardStore.ts`) or change the app to accept the spec’s flat dashboard shape and update the slice/store.
3. **Align login response / JWT:** Ensure the JWT payload (or the login response `user`) contains the user and role structure the app expects (`TokenResponse.data.user`), so profile and role-based routing work.
4. **Wire student dashboard:** Add a saga/slice for student dashboard and call `GET /api/v1/statistics/student-dashboard` from `StudentHome/Home.tsx`; use the same path and auth rules as above.
5. **Wire teacher features:** Implement API calls for My Classes (`GET /api/v1/teacher/classes`), Student directory (`GET /api/v1/teacher/students`), attendance students + submit (`GET /api/v1/attendance/students`, `POST /api/v1/attendance/submit`), and student detail (`GET /api/v1/teacher/students/:id/detail`) and connect them to the corresponding screens.
6. **Wire profile & account:** Implement `GET /api/v1/profile` and `GET /api/v1/user/personal-info` for Profile and Personal screens; implement `POST /api/v1/user/change-password` from ChangePassword with `currentPassword` and `newPassword` (and optional `request` wrapper if backend uses it).
7. **Wire OTP:** Call `POST /auth/verify-otp` from `OtpScreen.tsx` with the request body shape from the spec (phone, otp, role).
8. **Wire student features:** Implement `GET /api/v1/student/academics`, `GET /api/v1/notices`, `GET /api/v1/calendar/events` for Academics, Notice, and Calendar screens.
9. **Wire settings, help, legal:** Implement `GET /api/v1/settings/config`, `GET /api/v1/support/info`, `GET /api/v1/legal/terms`, `GET /api/v1/legal/privacy` and replace static/mock content in Settings, HelpSupport, TermsConditions, and Privacy.
10. **Optional:** If you use multi-role selection, dispatch `roleRequest()` from the appropriate post-login screen and use `GET /api/v1/role` (with the same path prefix).

After these changes (and any backend adjustments to match agreed shapes and paths), the app can be fully integratable with the backend API as described in `API_SPEC.md`.
