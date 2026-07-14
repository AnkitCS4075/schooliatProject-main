/**
 * Assigns every active school to an active region for Super Admin master data.
 *
 * Inference order:
 *   1) Keep assignment if region still exists
 *   2) Orphan / missing → school admin's assignedRegionId (if valid)
 *   3) Staff plurality of assignedRegionId in that school
 *   4) Longest region name match inside school name or address lines
 *   5) Fallback: region named "General" (case-insensitive) or first region alphabetically
 *
 * If there are zero regions, creates "General" (unless --dry-run).
 *
 * Usage (from Backend/, with DATABASE_URL in .env):
 *   node scripts/reconcile-school-regions.js --dry-run
 *   node scripts/reconcile-school-regions.js
 */

import "dotenv/config";
import prisma from "../src/prisma/client.js";
import { reconcileSchoolRegionAssignments } from "../src/services/school-region-reconciliation.service.js";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  console.log(
    dryRun
      ? "School region reconciliation (DRY RUN — no writes)\n"
      : "School region reconciliation (APPLYING changes)\n",
  );

  const report = await reconcileSchoolRegionAssignments(prisma, { dryRun });

  if (report.wouldCreateFallbackRegion) {
    console.log(report.message);
    process.exitCode = 1;
    return;
  }

  if (report.createdFallbackRegion) {
    console.log(
      "Created region:",
      report.createdFallbackRegion.name,
      `(${report.createdFallbackRegion.id})`,
    );
  }

  console.log("Fallback bucket used:", report.fallbackRegionUsed);
  console.log("Summary:", report.summary);

  if (report.changed?.length) {
    console.log("\nChanges:");
    console.table(
      report.changed.map((r) => ({
        code: r.code,
        name: r.name.slice(0, 40),
        from: r.previousRegionId ?? "(null)",
        to: r.newRegionId,
        reason: r.reason,
      })),
    );
  } else {
    console.log("\nNo school rows needed updates.");
  }

  if (dryRun && report.changed?.length) {
    console.log(
      "\nRe-run without --dry-run to apply these updates to the database.",
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
