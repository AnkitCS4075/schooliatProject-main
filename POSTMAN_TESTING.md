# Testing the Mobile API Postman Collection

The collection is **role-based**: one folder per role (Teacher, Student, Employee). Each folder has its own **Login as [Role]** request and only the APIs that role can use, so you avoid 403 when testing.

## Collection structure

- **1 - TEACHER APIs** — Login as Teacher + setup ID fetches + Teacher endpoints (dashboard, students, attendance, homework, marks, timetables, etc.)
- **2 - STUDENT APIs** — Login as Student + setup + Student endpoints (dashboard, profile, attendance, homework, marks, fees, etc.)
- **3 - EMPLOYEE APIs** — Login as Employee + setup + Employee endpoints (schools, employees, users, vendors, licenses, salary, etc.)

**How to use:** Open the folder for the role you want to test → run **"Login as [Role]"** first (sets `{{auth_token}}`) → run the rest of the folder. To test another role, open that folder and run its Login first.

### Role-based collections (mobile app API only)

Every run of the generator writes **one collection per role** (mobile app API only, no web/admin endpoints):

| File | Use |
|------|-----|
| `MOBILE_APP_API_Postman_Collection_Teacher.json` | Teacher only – login + setup + all Teacher endpoints |
| `MOBILE_APP_API_Postman_Collection_Student.json` | Student only |
| `MOBILE_APP_API_Postman_Collection_Employee.json` | Employee only |

Use these to run “all Teacher APIs” or “all Student APIs” with that role’s login in one file. The combined `MOBILE_APP_API_Postman_Collection.json` (all three roles as folders) is also written.

## How credentials are chosen

1. **When you generate the collection**, the generator:
   - Tries `POSTMAN_CREDENTIALS_FILE` or `postman-credentials.json` in the repo root, or
   - Runs `Backend/scripts/fetch-postman-users.js` (reads DB for one user per role) and uses **Teacher**, **Student**, and **Employee** emails plus default seed passwords (`Teacher@123`, `Student@123`, `Employee@123`).
2. Each role folder’s **Login as [Role]** request uses that role’s email/password. `x_platform` is set to **`android`** (mobile roles).
3. If the DB is unavailable, the generator falls back to hardcoded emails (e.g. `teacher1@gis001.edu`, `student1@gis001.edu`, `employee@schooliat.com`).

So: **generate from a machine that can reach the same DB as the API** (or use a pre-fetched `postman-credentials.json`), and each folder’s login will work for that role.

## Fetch users from DB (recommended before generating)

From **Backend/** (with `DATABASE_URL` in `.env`):

```bash
npm run postman:users
```

This prints JSON with one user per role (including `mobileRoles.TEACHER`, `mobileRoles.STUDENT`, `mobileRoles.EMPLOYEE`). To save it for the generator:

```bash
npm run postman:users > ../postman-credentials.json
```

Then from **repo root**:

```bash
POSTMAN_CREDENTIALS_FILE=./postman-credentials.json node scripts/generate-postman-from-mobile-api.js
```

Or run the generator without the file; it will call the fetch script itself if Backend is present.

## Collection & variables

- **Collection:** `MOBILE_APP_API_Postman_Collection.json`
- **Generated from:** `MOBILE_APP_API_COMPLETE.json` via `node scripts/generate-postman-from-mobile-api.js`

### Variables (collection or environment)

| Variable | Purpose |
|----------|---------|
| `base_url` | API base (default: `https://api.schooliat.com`; use `http://localhost:4000` for local backend) |
| `auth_token` | Set by **Login as [Role]** in each folder |
| `x_platform` | **`android`** (default) for mobile roles |
| `student_id`, `school_id`, `class_id`, … | Set by setup requests inside each folder after login |

## Flow: run by role

1. **Teacher:** Open folder **1 - TEACHER APIs** → run **Login as TEACHER** → run remaining requests (setup + API calls).
2. **Student:** Open folder **2 - STUDENT APIs** → run **Login as STUDENT** → run remaining requests. Login also sets `student_id` from the response when available.
3. **Employee:** Open folder **3 - EMPLOYEE APIs** → run **Login as EMPLOYEE** → run remaining requests.

If your environment uses different passwords (e.g. production), edit the **Login as [Role]** request body in that folder and run it again.

## Seed credentials (for seeded DB only)

When the backend DB is seeded (e.g. `npm run seed` in `Backend/`), the generator will pick one user per role. Typical defaults:

| Role    | Email (example)           | Password    |
|---------|---------------------------|-------------|
| Teacher | `teacher1@gis001.edu` …   | `Teacher@123` |
| Student | `student1@gis001.edu` …   | `Student@123` |
| Employee| `john.doe@schooliat.com`  | `Employee@123` |

- **Production:** Use real accounts; override in the collection or via `postman-credentials.json`.
- **Local:** Set `base_url` to your backend (e.g. `http://localhost:4000`) and ensure the DB is seeded.

## Run with Newman (CLI)

Run the whole collection (all three role folders in sequence; each folder’s Login runs first):

```bash
npx newman run MOBILE_APP_API_Postman_Collection.json \
  --env-var "base_url=https://api.schooliat.com" \
  --delay-request 300
```

Run only one role folder (e.g. Teacher):

```bash
npx newman run MOBILE_APP_API_Postman_Collection.json \
  --folder "1 - TEACHER APIs" \
  --env-var "base_url=https://api.schooliat.com"
```

## Regenerating the collection

From **repo root** (with Backend and DB available so credentials can be fetched):

```bash
node scripts/generate-postman-from-mobile-api.js
```

Optional: pre-fetch credentials and pass the file:

```bash
cd Backend && npm run postman:users > ../postman-credentials.json && cd ..
POSTMAN_CREDENTIALS_FILE=./postman-credentials.json node scripts/generate-postman-from-mobile-api.js
```

The generator rewrites `MOBILE_APP_API_Postman_Collection.json` with three role folders, each with Login + setup + only that role’s endpoints and credentials from DB (or file/fallback).
