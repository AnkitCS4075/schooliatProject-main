# Seeding Dummy Credentials for Postman / API Testing

Dummy login credentials are created by the seed so you can test the Postman collection and mobile API against a real database.

## Credentials (after seeding)

| Role         | Email                    | Password      |
|-------------|--------------------------|---------------|
| Super Admin | `admin@schooliat.com`    | `Admin@123`   |
| Employee    | `john.doe@schooliat.com` | `Employee@123` |
| School Admin| `admin@gis001.edu`       | `Admin@123`   |
| Teacher     | `teacher1@gis001.edu`    | `Teacher@123` |
| Student     | `student1@gis001.edu`    | `Student@123` |

(Full list with all schools: GIS001, SPS002, BFA003 is in `repo/POSTMAN_TESTING.md`.)

---

## Option A: Full seed (recommended for local dev)

Creates roles, regions, schools, classes, and all dummy users (admin, employees, school admins, teachers, students, staff).

1. **Database**  
   Ensure PostgreSQL is running (local install or remote) and you have a connection URL.

2. **Backend/.env**
   - Copy from `.env.example` if needed.
   - Set `DATABASE_URL` (and `DATABASE_DIRECT_URL` if required), e.g.  
     `postgresql://user:password@host:5432/dbname`

3. **Migrations**
   ```bash
   cd Backend
   npm run prisma:migrate:deploy
   ```

4. **Seed**
   ```bash
   npm run seed
   ```

---

## Option B: Only Super Admin (minimal)

Use when the DB already has roles (e.g. after a previous full seed or deploy) and you only need the dummy admin user.

1. Set `DATABASE_URL` in `Backend/.env` (or in env).
2. Run:
   ```bash
   cd Backend
   node scripts/reseed-all.js
   ```
   This creates/updates default roles and ensures **admin@schooliat.com** / **Admin@123** exists (recreates the user if already present).

---

## Option C: Only teacher and student credentials (safe, no data loss)

Use when the DB already has schools, roles, and classes and you only need **teacher1** and **student1** login accounts for mobile API testing. **Does not delete or overwrite any existing data**; only creates users that do not already exist.

1. Ensure `DATABASE_URL` is set in `Backend/.env`.
2. Roles **TEACHER** and **STUDENT** must exist (run full seed once if needed).
3. Run:
   ```bash
   cd Backend
   npm run seed:mobile-credentials
   ```
   Or: `node scripts/seed-mobile-credentials.js`

For each school in the DB, the script ensures:
- **teacher1@\<schoolCode\>.edu** / **Teacher@123** (with TeacherProfile), only if not present.
- **student1@\<schoolCode\>.edu** / **Student@123** (with StudentProfile), only if not present and the school has at least one class.

Example: for schools with codes GIS001, SPS002, BFA003 you get teacher1@gis001.edu, teacher1@sps002.edu, teacher1@bfa003.edu and student1@gis001.edu, etc.

---

## Troubleshooting

- **"DATABASE_URL is not set"**  
  Create `Backend/.env` with `DATABASE_URL=postgresql://...` or export it before running.

- **"Authentication failed" (P1000)**  
  Check user, password, and host in `DATABASE_URL`.

- **"Relation does not exist"**  
  Run migrations first: `npm run prisma:migrate:deploy`.

- **Postman / API**  
  After seeding, use the credentials above with `POST {{base_url}}/auth/authenticate`, then set `{{auth_token}}` from the response. See `repo/POSTMAN_TESTING.md`.
