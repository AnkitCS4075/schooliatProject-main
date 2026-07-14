# Production migration recovery (P3009 / P3018)

If deployment fails with:

```text
Error: P3009
migrate found failed migrations in the target database...
The `20260221053404_add_missing_models` migration started at ... failed
```

or:

```text
Error: P3018
A migration failed to apply... Database error code: 42710 ... type "attendance_status" already exists
```

the migration `20260221053404_add_missing_models` has been updated to be **production-safe**: it only creates new enums (library_issue_status, gallery_privacy, circular_status, chatbot_intent), adds LIBRARY/CIRCULAR to notification_type, and creates only the new tables (library_books, notes, galleries, circulars, faqs, chatbot_*, routes, vehicle_maintenance). It does not recreate existing enums or tables.

Do one of the following.

## Option 1: Let the workflow retry

The production deploy workflow now:

1. Runs `prisma migrate deploy`.
2. If it fails, runs `prisma migrate resolve --rolled-back "20260221053404_add_missing_models"` and then runs `prisma migrate deploy` again.

So **re-run the failed workflow** (Actions → Deploy to Production → Re-run all jobs). The second run should apply the migration.

## Option 2: Fix on the server (one-time)

SSH to the production server, then:

```bash
cd /opt/schooliat/repo
git fetch origin main && git checkout main
cd Backend
export DATABASE_URL="<your-production-database-url>"
# Mark the failed migration as rolled back so it can be re-applied
npx prisma migrate resolve --rolled-back "20260221053404_add_missing_models" --schema=src/prisma/db/schema.prisma
# Apply migrations again
npm run prisma:migrate:deploy
```

Then re-run the deployment workflow (or continue your deploy manually).

## Option 3: If the migration actually applied

If you are sure the migration **did** complete (e.g. new tables exist) but Prisma marked it as failed (e.g. timeout), mark it as applied so Prisma stops trying to run it:

```bash
cd /opt/schooliat/repo/Backend
export DATABASE_URL="<production-url>"
npx prisma migrate resolve --applied "20260221053404_add_missing_models" --schema=src/prisma/db/schema.prisma
```

Then run `npm run prisma:migrate:deploy` again; it should report “already in sync”.

## Backup change

The production workflow now runs the pre-migration backup with:

```bash
pg_dump -d "$DATABASE_URL" -F p -f /opt/schooliat/shared/backups/pre-migration-<timestamp>.sql
```

so the backup uses the same credentials as the app (TCP + password) instead of peer auth, and should no longer fail with “Peer authentication failed for user”.
