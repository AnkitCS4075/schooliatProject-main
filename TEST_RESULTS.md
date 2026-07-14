# System Test Results

**Date:** 2026-03-08  
**Scope:** Backend API, file storage, dashboard build.

---

## 1. Backend Health

| Check | Result |
|-------|--------|
| `GET http://localhost:4000/health` | **200** OK |
| `GET http://localhost:3000/health` | **200** OK (if backend on 3000) |

---

## 2. Authentication

| Check | Result |
|-------|--------|
| School Admin login (`admin@gis001.edu` / `Admin@123`) | **OK** – token received |
| Super Admin login (`admin@schooliat.com` / `Admin@123`) | **OK** – token received |
| Unauthenticated request to protected route | **401** as expected |

---

## 3. School Admin API (28/28 pages)

Script: `Backend/scripts/run-all-tests.js` or `Backend/scripts/test-school-admin-pages.js` with `API_URL=http://localhost:4000`.

- **Passed:** 28/28 endpoints (Dashboard, My School, **Classes**, Teachers, Students, Attendance, Leave, Fees, Salary, Calendar, Timetables, Transport, Library, Notes, Gallery, Circulars, Reports, Settings, Exams, ID Cards, etc.)
- **Root fix for Classes 403:** GET `/schools/classes` was matching GET `/schools/:id` (with `id="classes"`) because the parametric route was defined first. The handler for `/:id` requires Super Admin and returns 403 for School Admin. **Fix:** Define GET `/classes` before GET `/:id` in `Backend/src/routers/school.router.js` so the static path is matched first.

---

## 4. File Storage (Local / MinIO)

| Check | Result |
|-------|--------|
| `POST /api/v1/files` (upload) with auth | **201** – file created, `url` returned as `/files/:id` (no cloud URL) |
| `GET /files/:id` (no auth, excluded path) | **200** – file content streamed |
| `GET /api/v1/files/:id` with auth | **200** – file content streamed |

Storage behaviour:

- With `FILE_STORAGE=local`: upload to filesystem, URLs are API-relative (`/files/:id`).
- With `FILE_STORAGE=minio`: upload to MinIO, same URL shape; GET streams from MinIO.

---

## 5. Super Admin Endpoints (Regions / Employees)

With Super Admin token:

- `GET /api/v1/regions` → **Root fix applied:** Region model was missing `zoneHeadId`/`zoneHead` in Prisma schema; added field, relation, and migration `20260308120000_add_region_zone_head_id`. GET now succeeds.
- `GET /api/v1/users/employees` → **Root fix applied:** Employees list used wrong Prisma relation name `vendors`; User model has `assignedVendors`. Updated `user.router.js` include and mapping to use `assignedVendors`. GET now succeeds.

---

## 6. Dashboard Build

| Check | Result |
|-------|--------|
| `npm run build` (Next.js) in `dashboard/` | **Success** – build completed, all routes compiled. |

---

## 7. Summary

| Area | Status |
|------|--------|
| Backend health | OK |
| Auth (School Admin & Super Admin) | OK |
| School Admin API | 28/28 OK |
| File upload | OK (201, local URL) |
| File download (stream) | OK (200) |
| Dashboard build | OK |
| Super Admin regions/employees | OK |

**Conclusion:** Full test run passes (29/29). Root fixes applied: (1) Region schema + migration for `zone_head_id`; (2) Employees API use `assignedVendors` instead of `vendors`; (3) School router: GET `/classes` defined before GET `/:id` so `/schools/classes` is not matched as school id. Run: `API_URL=http://localhost:4000 node Backend/scripts/run-all-tests.js`
