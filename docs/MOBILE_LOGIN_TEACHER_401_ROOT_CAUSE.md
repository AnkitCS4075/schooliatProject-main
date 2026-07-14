# Root cause: Teacher login 401 (student login OK)

## Observed behaviour

- **Student:** `student1@gis001.edu` / `Student@123` → **200** (token returned).
- **Teacher:** `teacher1@gis001.edu` / `Teacher@123` → **401** `SA003` "Invalid email or password."

## Auth flow (backend)

Same path for all roles (teacher, student, etc.):

1. `POST /auth/authenticate` with body `{ request: { email, password } }` and header `x-platform: android` or `ios`.
2. Find user by `email` or `publicUserId` (`findFirst`).
3. If no user or `user.deletedAt !== null` → **SA003** (401).
4. If `user.password` is null → **SA003** (401).
5. `bcrypt.compare(password, user.password)` → if false (and not admin fallback) → **SA003** (401).
6. Load role; check `x-platform` is allowed for that role (e.g. TEACHER/STUDENT allow `android`/`ios`).
7. Return JWT.

There is **no role-specific logic** that treats teacher differently from student before the platform check. So the only way teacher fails and student succeeds is **database state** for that user.

## Root cause (conclusion)

In the database used by the API (e.g. production):

- **student1@gis001.edu** exists, is not soft-deleted, and has a password hash that matches `Student@123` → login succeeds.
- **teacher1@gis001.edu** either:
  - does **not** exist, or
  - is **soft-deleted** (`deletedAt` set), or
  - has a **different** password (or `password` is null), so the hash does not match `Teacher@123`.

So the issue is **data**, not API logic: the teacher user is missing or has wrong/null password in that DB.

## How to verify

Run the diagnostic script (against the same base URL as your app):

```bash
node scripts/diagnose-mobile-login.js
# or: BASE_URL=https://api.schooliat.com node scripts/diagnose-mobile-login.js
```

It will confirm that wrong password and non-existent email also return **SA003**, and that student succeeds with correct password.

## Fix

On the **same environment** the API uses (e.g. production server with production `DATABASE_URL`):

```bash
cd Backend
npm run seed:mobile-credentials
```

This creates `teacher1@<schoolCode>.edu` (and student1 if missing) with password `Teacher@123` **only when the user does not exist**, and does not delete or overwrite existing data.

After that, teacher login with `teacher1@gis001.edu` / `Teacher@123` and `x-platform: android` should return **200** with a token.
