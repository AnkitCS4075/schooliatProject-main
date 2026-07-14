# Dashboard "Unauthorized" Fix and Migration Guide

## What was wrong

1. **Seed permissions were out of sync with the backend**
   - The seed had its **own** list of permissions for SUPER_ADMIN and SCHOOL_ADMIN.
   - The **backend** (`Backend/src/services/role.service.js`) uses a fuller list that the dashboard and API expect.
   - So after seeding, some dashboard pages called APIs that require permissions the seeded roles **did not have** → **403 Unauthorized / Forbidden**.

2. **Missing permissions (examples)**
   - **SUPER_ADMIN:** Invoices (`GET_INVOICES`, `CREATE_INVOICE`, …), Audit Logs (`VIEW_AUDIT_LOGS`), and some messaging permissions were missing in the seed.
   - **SCHOOL_ADMIN:** Export attendance (`EXPORT_ATTENDANCE`), edit/delete homework (`EDIT_HOMEWORK`, `DELETE_HOMEWORK`), reject leave (`REJECT_LEAVE`), edit marks (`EDIT_MARKS`), circulars (`CREATE_CIRCULAR`, `GET_CIRCULARS`, …), transport routes (`MANAGE_ROUTES`, `GET_ROUTES`, `ASSIGN_STUDENTS_TO_ROUTE`), gallery (`GET_GALLERIES`, `CREATE_GALLERY`, …) were missing in the seed.

3. **Two migration folders (confusion only)**
   - **Used:** `Backend/src/prisma/db/migrations` — this is what `prisma:migrate` and `prisma:migrate:deploy` use (schema: `src/prisma/db/schema.prisma`).
   - **Not used:** `Backend/prisma/migrations` — legacy; do not run migrations from here.

---

## What was fixed

1. **Single source of truth for role permissions**
   - **Seed now uses** `role.service.defaultRolePermissionsMap` instead of a duplicate list.
   - So SUPER_ADMIN and SCHOOL_ADMIN (and other roles) get **exactly** the same permissions the backend and dashboard expect.

2. **Post-seed sync**
   - After seeding, the seed calls `roleService.updateRolePermissions()` so:
     - All roles in the DB are synced to the default permission set.
     - Role cache (e.g. Redis) is cleared so the next API/dashboard request sees the new permissions.

3. **No schema or migration file changes**
   - Only seed and role service were updated; migrations stay as they are.

---

## How to run migration and seed (correct order)

Use the **production** (or target) database by setting `DATABASE_URL` in `Backend/.env` (or in the environment).

### 1. Deploy migrations (create/update tables)

From repo root or Backend:

```bash
cd Backend
npm run prisma:migrate:deploy
```

- This applies all migrations in **`Backend/src/prisma/db/migrations`**.
- Do **not** run migrations from `Backend/prisma/migrations`.

### 2. Seed the database (roles, permissions, and data)

```bash
cd Backend
npm run seed
```

- Creates/updates **roles and permissions** from `role.service.defaultRolePermissionsMap`.
- Creates regions, schools, users (super admin, school admin, teachers, students, staff, employees), and other seed data.
- At the end it runs **updateRolePermissions** and clears the role cache.

### 3. Restart the API (if it’s already running)

- So it picks up a clean state and new permissions from DB/cache.
- If you use Redis for role cache, the seed already clears it; a restart is still recommended after a full seed.

---

## If you still see "Unauthorized" on some pages

- **403 Forbidden:** Usually “valid token but missing permission”. After re-seeding, roles have the full permission set; if it persists, check which API endpoint is called and which permission it requires (`withPermission(...)` in the backend), and ensure that permission is in `role.service.js` for that role.
- **401 Unauthorized:** Token missing, invalid, or expired. Log in again from the dashboard (use **admin@schooliat.com** / **Admin@123** for super-admin, or **admin@gis001.edu** / **Admin@123** for school admin, if you use the seeded users).
- **Dashboard route guard:** Only `/admin` and `/super-admin` are protected by role in the app; teacher/staff/student/employee panels are not blocked by route, but their APIs still require the right permissions.

---

## Summary

| Item | Action |
|------|--------|
| Migrations | Use only `Backend/src/prisma/db/` (schema + migrations). Run `npm run prisma:migrate:deploy` in Backend. |
| Seed | Run `npm run seed` in Backend. Seed now uses backend’s role permissions and runs `updateRolePermissions` after. |
| Unauthorized on dashboard | Re-run seed so roles get full permissions; restart API; log in again. |
