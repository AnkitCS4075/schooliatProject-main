# Staging & Production Environments (Hostinger VPS)

This project uses **two environments** on the Hostinger VPS. Credentials and config live **on the server**, not in the repo.

## Where credentials live (on the VPS)

| Environment | Backend .env (DATABASE_URL, JWT, etc.) |
|-------------|----------------------------------------|
| **Production** | `/opt/schooliat/backend/production/shared/.env` |
| **Staging**    | `/opt/schooliat/backend/staging/shared/.env`   |

Dashboard and other apps have their own `shared/.env` under `/opt/schooliat/dashboard/<env>/shared/` and `/opt/schooliat/landing/`.

## Directory layout on the VPS

```
/opt/schooliat/
├── backend/
│   ├── production/
│   │   ├── current -> repo/Backend (symlink)
│   │   └── shared/
│   │       └── .env          ← production credentials
│   └── staging/
│       ├── current -> repo/Backend (symlink)
│       └── shared/
│           └── .env          ← staging credentials
├── dashboard/
│   ├── production/shared/.env
│   └── staging/shared/.env
└── shared/backups, logs, etc.
```

## School admin panel – sample data on every page

The seed populates sample data for **every school admin page** (dashboard, classes, teachers, students, attendance, homework, leave, finance, calendar, timetable, transport, results, marks, ID cards, circulars/notices, settings, etc.). See **[SCHOOL_ADMIN_SEED_COVERAGE.md](SCHOOL_ADMIN_SEED_COVERAGE.md)** for the full page-to-seed mapping.

## Seeding from here (manual only — not in CI/CD)

Seeding is **not** run on deploy. To avoid re-seeding on every production/staging deploy (and potentially overwriting or duplicating data), seed only when you choose, from this repo:

From the **workspace root** (e.g. `/root` or your repo root on the VPS):

```bash
# Seed production (uses /opt/schooliat/backend/production/shared/.env)
./seed-env.sh production
# or
./seed-production.sh

# Seed staging (uses /opt/schooliat/backend/staging/shared/.env)
./seed-env.sh staging
# or
./seed-staging.sh
```

Scripts look for the env files at the paths above. If you get "Environment file not found", create or fix the `.env` on the VPS at that path.

## Migrate + seed (on the VPS, when you want to)

Deploy workflows run **migrations only**; they do **not** run seed. To migrate and/or seed manually from the **Backend** directory:

- **Production**: `./scripts/migrate-and-seed-production.sh` (prompts, then loads production `.env` and runs migrate + seed)
- **Staging**: load staging env then run:
  ```bash
  source /opt/schooliat/backend/staging/shared/.env
  npm run prisma:migrate:deploy
  npm run seed
  ```

## Databases

- **Production**: typically `schooliat_production` (see `DATABASE_URL` in production shared `.env`)
- **Staging**: typically `schooliat_staging` (see `DATABASE_URL` in staging shared `.env`)

See `COMPLETE_DEPLOYMENT_GUIDE.md` for full VPS setup and env examples.
