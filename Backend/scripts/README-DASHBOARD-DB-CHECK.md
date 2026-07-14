# Dashboard DB check

Use this to see whether "no data" on the admin dashboard is due to **missing DB data** or an **API/code issue**.

## Run the check

From the **Backend** folder, with a valid `.env` (or `DATABASE_URL` set):

```bash
cd Backend
npm run check:dashboard-db
```

**On the production server** (uses production shared `.env`):

```bash
cd /opt/schooliat/backend/production/current
bash scripts/check-production-db.sh
```

Or for a specific school:

```bash
SCHOOL_ID=<your-school-uuid> npm run check:dashboard-db
```

## What it checks

- **Roles**: STUDENT, TEACHER, STAFF, SCHOOL_ADMIN (dashboard needs these for counts).
- **Schools**: At least one non-deleted school.
- **Per school**: Settings, user counts (students/teachers/staff), fees (current year), fee installments, notices, events, salary payments.
- **Sample admin user** for that school.

## How to interpret

| Result | Meaning |
|--------|--------|
| Script exits with "Missing required roles" | Run seed: `npm run seed` (or fix role data). Dashboard will 500 or use fallback until roles exist. |
| "No schools found" | Create a school (or seed). Dashboard has nothing to show. |
| Roles + school exist, counts are 0 | **DB is set up; API can return 200.** Dashboard will show zeros until you add students/teachers/notices/fees. If the app still shows "no data" or errors, the issue is likely **API** (e.g. wrong base URL, auth, or backend not deployed). |
| Script throws (e.g. connection error, Prisma error) | Fix DB connection or schema. Same error may cause the dashboard API to 500 in production. |

## Quick API check

If the DB check passes but the dashboard still fails:

1. Call the API directly (e.g. Postman or curl) with a valid school-admin token:  
   `GET /api/v1/statistics/dashboard`
2. If that returns **200** with a JSON body (even with zeros), the **API is fine** and the problem is frontend (e.g. auth, URL, or how the response is used).
3. If that returns **500**, check backend logs for the same errors you see when running the DB script (e.g. missing table, wrong column, or connection).
