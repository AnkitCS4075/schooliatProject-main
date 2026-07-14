/**
 * SchooliAT Phase 1 + Phase 2 — Automated API Test Script
 *
 * Tests all endpoints implemented across both phases:
 *   Phase 1: Gate Entry, CRM, Bonafide Certificate
 *   Phase 2: Fee Defaulters, Self Attendance, Geofence Config,
 *            Communication (Conversations/Messages), Other Income,
 *            Accounting, Student Emergency Contacts, Student Bonafide
 *
 * Usage:
 *   node test-phase1-apis.js
 *
 * Requirements:
 *   - Backend running on http://localhost:4000
 *   - Database seeded (admin@gis001.edu / Admin@123)
 */

const BASE = "http://localhost:4000";

let token = null;
let userId = null;
let schoolId = null;

const passed = [];
const failed = [];
const skipped = [];

// ── Helpers ──────────────────────────────────────────────────────────

async function api(method, path, body, expectStatus = null) {
  const headers = {
    "Content-Type": "application/json",
    "x-platform": "web",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}

  return { status: res.status, json, text };
}

function log(testName, ok, detail = "") {
  if (ok) {
    passed.push(testName);
    console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
  } else {
    failed.push({ name: testName, detail });
    console.log(`  \x1b[31m✗\x1b[0m ${testName}`);
    if (detail) console.log(`    \x1b[90m${detail.substring(0, 200)}\x1b[0m`);
  }
}

function skip(testName, reason) {
  skipped.push(testName);
  console.log(`  \x1b[33m○\x1b[0m ${testName} — ${reason}`);
}

async function login() {
  console.log("\n── Authentication ──");
  const r = await api("POST", "/auth/authenticate", {
    request: { email: "admin@gis001.edu", password: "Admin@123" },
  });
  if (r.status === 200 && r.json.token) {
    token = r.json.token;
    userId = r.json.user?.id;
    schoolId = r.json.user?.schoolId;
    log("Login as school admin", true);
  } else {
    log("Login as school admin", false, JSON.stringify(r.json));
    console.log("\n\x1b[31mCannot continue without auth. Exiting.\x1b[0m");
    process.exit(1);
  }
}

// ── Phase 1: Gate Entry ─────────────────────────────────────────────

async function testGateEntry() {
  console.log("\n── Phase 1: Gate Entry ──");

  const create = await api("POST", "/gate-entries", {
    request: {
      category: "PARENT",
      name: "Test Visitor",
      phone: "9876543210",
      reason: "Parent-teacher meeting",
      personToMeet: "Radha Singh",
    },
  });
  const gateId = create.json?.data?.id;
  log("POST /gate-entries — create", create.status === 201 || create.status === 200, JSON.stringify(create.json));

  // List
  const list = await api("GET", "/gate-entries");
  log("GET /gate-entries — list", list.status === 200 && list.json?.data, JSON.stringify(list.json));

  // Get by ID (if created)
  if (gateId) {
    const get = await api("GET", `/gate-entries/${gateId}`);
    log("GET /gate-entries/:id — detail", get.status === 200, JSON.stringify(get.json));

    // Update
    const upd = await api("PATCH", `/gate-entries/${gateId}`, {
      request: { visitorName: "Updated Visitor" },
    });
    log("PATCH /gate-entries/:id — update", upd.status === 200, JSON.stringify(upd.json));

    // Delete
    const del = await api("DELETE", `/gate-entries/${gateId}`);
    log("DELETE /gate-entries/:id — delete", del.status === 200, JSON.stringify(del.json));
  } else {
    skip("GET /gate-entries/:id", "No gate entry created");
    skip("PATCH /gate-entries/:id", "No gate entry created");
    skip("DELETE /gate-entries/:id", "No gate entry created");
  }
}

// ── Phase 1: CRM ────────────────────────────────────────────────────

async function testCRM() {
  console.log("\n── Phase 1: CRM (Lead Pipeline) ──");

  // Create lead
  const create = await api("POST", "/crm", {
    request: {
      name: "Sunrise Academy",
      phone: "9123456780",
      source: "GATE_ENTRY",
      category: "School",
    },
  });
  const leadId = create.json?.data?.id;
  log("POST /crm — create lead", create.status === 201 || create.status === 200, JSON.stringify(create.json));

  // List leads
  const list = await api("GET", "/crm");
  log("GET /crm — list leads", list.status === 200, JSON.stringify(list.json));

  // Funnel stats
  const funnel = await api("GET", "/crm/funnel");
  log("GET /crm/funnel — funnel stats", funnel.status === 200, JSON.stringify(funnel.json));

  // Get lead detail
  if (leadId) {
    const get = await api("GET", `/crm/${leadId}`);
    log("GET /crm/:id — lead detail", get.status === 200, JSON.stringify(get.json));

    // Update lead
    const upd = await api("PATCH", `/crm/${leadId}`, {
      request: { stage: "CONTACTED", name: "Sunrise Academy Updated" },
    });
    log("PATCH /crm/:id — update lead", upd.status === 200, JSON.stringify(upd.json));

    // Add remark
    const remark = await api("POST", `/crm/${leadId}/remarks`, {
      request: { content: "Called the school, they are interested" },
    });
    log("POST /crm/:id/remarks — add remark", remark.status === 201 || remark.status === 200, JSON.stringify(remark.json));

    // Delete
    const del = await api("DELETE", `/crm/${leadId}`);
    log("DELETE /crm/:id — delete lead", del.status === 200, JSON.stringify(del.json));
  } else {
    skip("GET /crm/:id", "No lead created");
    skip("PATCH /crm/:id", "No lead created");
    skip("POST /crm/:id/remarks", "No lead created");
    skip("DELETE /crm/:id", "No lead created");
  }
}

// ── Phase 1: Bonafide Certificate ───────────────────────────────────

async function testBonafide() {
  console.log("\n── Phase 1: Bonafide Certificate ──");

  // Get a valid student ID
  const r = await api("GET", "/students");
  const students = r.json?.data;
  const student = students?.[0];

  if (!student) {
    skip("POST /bonafide/generate", "No students in DB");
    skip("GET /bonafide", "No students in DB");
    return;
  }

  // Generate PDF
  const gen = await api("POST", "/bonafide/generate", {
    request: { studentId: student.id, purpose: "PASSPORT" },
  });
  // Returns PDF binary, status 200 = success
  log(
    "POST /bonafide/generate — generate PDF",
    gen.status === 200,
    gen.status !== 200 ? JSON.stringify(gen.json) : "PDF generated"
  );

  // List certificates
  const list = await api("GET", "/bonafide");
  log(
    "GET /bonafide — list certificates",
    list.status === 200,
    JSON.stringify(list.json)
  );
}

// ── Phase 2: Fee Defaulters ─────────────────────────────────────────

async function testFeeDefaulters() {
  console.log("\n── Phase 2: Fee Defaulters ──");

  const r = await api("GET", "/fees/defaulters");
  log("GET /fees/defaulters — list defaulters", r.status === 200, JSON.stringify(r.json));

  // With pagination
  const p = await api("GET", "/fees/defaulters?page=1&limit=5");
  log("GET /fees/defaulters?page=1&limit=5 — paginated", p.status === 200, JSON.stringify(p.json));
}

// ── Phase 2: Staff Self Attendance ───────────────────────────────────

async function testSelfAttendance() {
  console.log("\n── Phase 2: Self Attendance (Geo-Fencing) ──");

  // Mark self attendance (admin users get 403 — only staff/teachers can self-mark)
  const mark = await api("POST", "/attendance/self-mark", {
    request: {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10,
    },
  });
  log(
    "POST /attendance/self-mark — (403 for admin is correct)",
    mark.status === 403 || mark.status === 200,
    JSON.stringify(mark.json)
  );

  // Get geofence config
  const geo = await api("GET", "/attendance/geofence");
  log(
    "GET /attendance/geofence — config",
    geo.status === 200,
    JSON.stringify(geo.json)
  );
}

// ── Phase 2: Communication (Conversations / Messages) ────────────────

async function testCommunication() {
  console.log("\n── Phase 2: In-App Communication ──");

  // Get conversations
  const convos = await api("GET", "/communication/conversations");
  log(
    "GET /communication/conversations — list",
    convos.status === 200,
    JSON.stringify(convos.json)
  );

  // Get notifications
  const notifs = await api("GET", "/communication/notifications");
  log(
    "GET /communication/notifications — list",
    notifs.status === 200,
    JSON.stringify(notifs.json)
  );

  // Unread count
  const unread = await api("GET", "/communication/notifications/unread-count");
  log(
    "GET /communication/notifications/unread-count",
    unread.status === 200,
    JSON.stringify(unread.json)
  );
}

// ── Phase 2: Other Income ───────────────────────────────────────────

async function testOtherIncome() {
  console.log("\n── Phase 2: Other Income ──");

  // Create
  const create = await api("POST", "/other-incomes", {
    request: {
      title: "Alumni Donation",
      description: "Annual alumni association donation",
      amount: 50000,
      category: "Donation",
      source: "Alumni Association",
      receivedAt: new Date().toISOString(),
    },
  });
  const incomeId = create.json?.data?.id;
  log("POST /other-incomes — create", create.status === 201 || create.status === 200, JSON.stringify(create.json));

  // List
  const list = await api("GET", "/other-incomes");
  log("GET /other-incomes — list", list.status === 200, JSON.stringify(list.json));

  // Summary
  const summary = await api("GET", "/other-incomes/summary");
  log("GET /other-incomes/summary — summary", summary.status === 200, JSON.stringify(summary.json));

  // Delete if created
  if (incomeId) {
    const del = await api("DELETE", `/other-incomes/${incomeId}`);
    log("DELETE /other-incomes/:id — delete", del.status === 200, JSON.stringify(del.json));
  }
}

// ── Phase 2: Accounting ─────────────────────────────────────────────

async function testAccounting() {
  console.log("\n── Phase 2: Accounting Suite ──");

  // Bootstrap chart of accounts
  const bootstrap = await api("POST", "/accounting/bootstrap");
  log(
    "POST /accounting/bootstrap — init accounts",
    bootstrap.status === 200,
    JSON.stringify(bootstrap.json)
  );

  // List accounts
  const accounts = await api("GET", "/accounting/accounts");
  log("GET /accounting/accounts — list", accounts.status === 200, JSON.stringify(accounts.json));
  const accountList = accounts.json?.data;
  const cashAcc = Array.isArray(accountList) ? accountList.find((a) => a.code === "1000") : null;
  const feeIncomeAcc = Array.isArray(accountList) ? accountList.find((a) => a.code === "4000") : null;

  // Trial balance
  const balances = await api("GET", "/accounting/balances");
  log("GET /accounting/balances — trial balance", balances.status === 200, JSON.stringify(balances.json));

  // P&L
  const pnl = await api("GET", "/accounting/reports/profit-and-loss");
  log("GET /accounting/reports/profit-and-loss", pnl.status === 200, JSON.stringify(pnl.json));

  // Balance sheet
  const bs = await api("GET", "/accounting/reports/balance-sheet");
  log("GET /accounting/reports/balance-sheet", bs.status === 200, JSON.stringify(bs.json));

  // Create journal entry (if accounts exist)
  if (cashAcc && feeIncomeAcc) {
    const je = await api("POST", "/accounting/journal-entries", {
      request: {
        entryDate: new Date().toISOString(),
        reference: "TEST-JE-001",
        narration: "Test fee collection from student",
        lines: [
          { accountId: cashAcc.id, debitAmount: 10000, creditAmount: 0, lineDescription: "Cash received" },
          { accountId: feeIncomeAcc.id, debitAmount: 0, creditAmount: 10000, lineDescription: "Fee income recognized" },
        ],
      },
    });
    log("POST /accounting/journal-entries — create JE", je.status === 201 || je.status === 200, JSON.stringify(je.json));

    // Re-fetch trial balance (should reflect the entry)
    const balances2 = await api("GET", "/accounting/balances");
    log("GET /accounting/balances — after JE", balances2.status === 200, JSON.stringify(balances2.json));

    // Journal entries list
    const jes = await api("GET", "/accounting/journal-entries");
    log("GET /accounting/journal-entries — list", jes.status === 200, JSON.stringify(jes.json));
  } else {
    skip("POST /accounting/journal-entries", "Cash or Fee Income account not found after bootstrap");
    skip("GET /accounting/journal-entries", "Skipped — depends on JE creation");
  }

  // Opening balances
  const ob = await api("GET", "/accounting/opening-balances");
  log("GET /accounting/opening-balances — list", ob.status === 200, JSON.stringify(ob.json));
}

// ── Phase 2: Student Profile Enhancements ────────────────────────────

async function testStudentProfile() {
  console.log("\n── Phase 2: Student Profile Enhancements ──");

  // Get a valid student ID
  const r = await api("GET", "/students");
  const students = r.json?.data;
  const student = students?.[0];

  if (!student) {
    skip("All student profile tests", "No students in DB");
    return;
  }

  // Get emergency contacts
  const ec = await api("GET", `/emergency-contacts/student/${student.id}`);
  log(
    `GET /emergency-contacts/student/:id — ${student.firstName}`,
    ec.status === 200,
    JSON.stringify(ec.json)
  );

  // Bonafide certificates for this student (via listing)
  const certs = await api("GET", "/bonafide");
  log(
    "GET /bonafide — certificates for students",
    certs.status === 200,
    JSON.stringify(certs.json)
  );
}

// ── Phase 2: Fee Overview ───────────────────────────────────────────

async function testFeeOverview() {
  console.log("\n── Phase 2: Fee System (Overview) ──");

  const overview = await api("GET", "/fees");
  log("GET /fees — overview", overview.status === 200, JSON.stringify(overview.json));

  // Fee status for a student
  const r = await api("GET", "/users?limit=50");
  const students = r.json?.data?.users?.filter(
    (u) => u.role?.name === "STUDENT"
  );
  const student = students?.[0];

  if (student) {
    const status = await api("GET", `/fees/status?studentId=${student.id}`);
    log(
      `GET /fees/status?studentId= — ${student.firstName}`,
      status.status === 200,
      JSON.stringify(status.json)
    );
  }
}

// ── Additional: Settings & Statistics ────────────────────────────────

async function testSettingsAndStats() {
  console.log("\n── Additional: Settings & Platform ──");

  const settings = await api("GET", "/settings");
  log("GET /settings", settings.status === 200, JSON.stringify(settings.json));

  const stats = await api("GET", "/statistics");
  log("GET /statistics", stats.status === 200 || stats.status === 403, JSON.stringify(stats.json));
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  SchooliAT — Phase 1 + Phase 2 API Test Suite");
  console.log("=".repeat(60));

  await login();

  await testGateEntry();
  await testCRM();
  await testBonafide();
  await testFeeDefaulters();
  await testSelfAttendance();
  await testCommunication();
  await testOtherIncome();
  await testAccounting();
  await testStudentProfile();
  await testFeeOverview();
  await testSettingsAndStats();

  // ── Summary ──
  console.log("\n" + "=".repeat(60));
  console.log("  RESULTS SUMMARY");
  console.log("=".repeat(60));
  console.log(`  \x1b[32mPassed: ${passed.length}\x1b[0m`);
  console.log(`  \x1b[31mFailed: ${failed.length}\x1b[0m`);
  console.log(`  \x1b[33mSkipped: ${skipped.length}\x1b[0m`);
  console.log(`  Total: ${passed.length + failed.length + skipped.length}`);

  if (failed.length > 0) {
    console.log("\n\x1b[31mFailed Tests:\x1b[0m");
    for (const f of failed) {
      console.log(`  \x1b[31m✗\x1b[0m ${f.name}`);
      if (f.detail) console.log(`    \x1b[90m${f.detail.substring(0, 300)}\x1b[0m`);
    }
  }

  console.log("\n" + "=".repeat(60));
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\n\x1b[31mFatal error:\x1b[0m", err);
  process.exit(1);
});
