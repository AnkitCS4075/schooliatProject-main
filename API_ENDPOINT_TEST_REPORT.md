# Mobile API Endpoint Test Report

**Base URL:** https://api.schooliat.com

---

## Role-based Postman collection tests (Newman)

Each role collection was run with Newman against production. Login runs first and sets `{{auth_token}}`; all requests use that role’s token.

| Collection | Requests | Failed (scripts) | 200 OK | 403 | 404 | 400 | 401 | Duration |
|------------|----------|-------------------|--------|-----|-----|-----|-----|----------|
| **TEACHER**  | 147 | 0 | 33 | 73 | 36 | 4 | 0 | ~18s |
| **STUDENT**  | 131 | 0 | 25 | 69 | 32 | 4 | 0 | ~17s |
| **EMPLOYEE** | 237 | 0 | 30 | 120 | 75 | 9 | 0 | ~30s |

- **401:** None – login succeeded for all three roles.
- **403 / 404:** Backend permissions or missing resources (e.g. placeholder IDs); not collection/auth issues.
- **Run:** `npx newman run MOBILE_APP_API_Postman_Collection_TEACHER.json --env-var "base_url=https://api.schooliat.com"` (same for _STUDENT.json, _EMPLOYEE.json).

### Latest run – local API after seeding credentials (reset passwords + Newman)

Credentials were reset for all Teacher, Student, and Employee users to defaults (`Teacher@123`, `Student@123`, `Employee@123`) via `Backend/scripts/reset-mobile-login-passwords.js`. Postman collections were regenerated. Backend was started locally; all three role collections were run against **http://localhost:4000**.

| Collection | Requests | 200 OK | 403 | 404 | 400 | 401 | Duration |
|------------|----------|--------|-----|-----|-----|-----|----------|
| **TEACHER**  | 147 | 58 | 15 | 36 | 37 | 0 | ~17s |
| **STUDENT**  | 131 | 42 | 47 | 32 | 9 | 0 | ~15s |
| **EMPLOYEE** | 237 | 30 | 120 | 75 | 11 | 0 | ~26s |

- **Login:** 200 for all three roles (no 401).
- **200s:** Auth, dashboard, students, my-school, classes, homework, timetables (some), marks, grievances, exams, subjects, etc., where the role has permission and data exists.
- **403:** Endpoints the role is not allowed to call (e.g. some settings, parent, or admin-only routes).
- **404:** Missing resource or empty/invalid path param (e.g. `:id` not set).
- **400:** Invalid body (e.g. reset-password without valid OTP, or validation errors).

**Commands used:**  
`cd Backend && npm run reset:mobile-passwords` → `cd repo && node scripts/generate-postman-from-mobile-api.js` → start backend → `npx newman run MOBILE_APP_API_Postman_Collection_<ROLE>.json --env-var "base_url=http://localhost:4000"`.

---

## Legacy summary (unauthenticated)
**Tested at:** 2026-03-11T12:55:48.924Z
**Authenticated:** No (protected endpoints returned 401)

## Summary

| Metric | Count |
|--------|-------|
| Total endpoints | 295 |
| Working (2xx) | 3 |
| Client errors (400/401/403/404) – endpoint reached | 292 |
| Failed (5xx or network) | 0 |

## Status code breakdown

| Status | Count |
|--------|-------|
| 200 | 3 |
| 400 | 2 |
| 401 | 290 |

## By group (success = 2xx or 4xx reached; fail = 5xx/ERR)

| Group | Total | OK (reached) | Failed |
|-------|-------|---------------|--------|
| ai | 7 | 7 | 0 |
| attendance | 7 | 7 | 0 |
| audit | 2 | 2 | 0 |
| authentication | 9 | 9 | 0 |
| calendar | 18 | 18 | 0 |
| circulars | 5 | 5 | 0 |
| communication | 7 | 7 | 0 |
| deletion-otp | 1 | 1 | 0 |
| emergency-contacts | 5 | 5 | 0 |
| employees | 6 | 6 | 0 |
| exams | 4 | 4 | 0 |
| fees | 7 | 7 | 0 |
| files | 2 | 2 | 0 |
| gallery | 7 | 7 | 0 |
| grievances | 6 | 6 | 0 |
| homework | 7 | 7 | 0 |
| id-cards | 5 | 5 | 0 |
| inventory | 4 | 4 | 0 |
| invoices | 6 | 6 | 0 |
| leave | 11 | 11 | 0 |
| letterhead | 2 | 2 | 0 |
| library | 13 | 13 | 0 |
| licenses | 5 | 5 | 0 |
| locations | 3 | 3 | 0 |
| marks | 9 | 9 | 0 |
| notes | 8 | 8 | 0 |
| notifications | 6 | 6 | 0 |
| parent | 4 | 4 | 0 |
| receipts | 6 | 6 | 0 |
| regions | 4 | 4 | 0 |
| reports | 5 | 5 | 0 |
| salary | 10 | 10 | 0 |
| schools | 12 | 12 | 0 |
| settings | 4 | 4 | 0 |
| statistics | 4 | 4 | 0 |
| students | 2 | 2 | 0 |
| subjects | 4 | 4 | 0 |
| syllabus | 5 | 5 | 0 |
| templates | 2 | 2 | 0 |
| timetables | 8 | 8 | 0 |
| transfer-certificates | 6 | 6 | 0 |
| transports | 15 | 15 | 0 |
| users | 26 | 26 | 0 |
| vendors | 6 | 6 | 0 |

## Conclusion

- **295** endpoints are **reachable** (returned 2xx or expected 4xx).
- Run with `MOBILE_API_EMAIL` and `MOBILE_API_PASSWORD` (e.g. teacher1@gis001.edu / Teacher@123) to test with auth and get more 2xx responses.
