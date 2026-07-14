#!/usr/bin/env node
/**
 * Run full system tests: health, auth, school-admin pages, super-admin endpoints.
 * Usage: API_URL=http://localhost:4000 node scripts/run-all-tests.js
 */

const API_URL = (process.env.API_URL || "http://localhost:4000").replace(/\/$/, "");
const SCHOOL_EMAIL = process.env.SCHOOL_ADMIN_EMAIL || "admin@gis001.edu";
const SCHOOL_PASSWORD = process.env.SCHOOL_ADMIN_PASSWORD || "Admin@123";
const SUPER_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@schooliat.com";
const SUPER_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

const results = { passed: 0, failed: 0, errors: [] };

function log(msg) {
  console.log(msg);
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {}
  return { ok: res.ok, status: res.status, data, text: text.slice(0, 200) };
}

async function main() {
  log("=== Full system tests ===\n");
  log(`API_URL: ${API_URL}\n`);

  // --- 1. Health ---
  log("1. Backend health");
  const health = await fetchJson(`${API_URL}/health`);
  if (health.ok) {
    log("   ✅ GET /health → 200\n");
    results.passed++;
  } else {
    log(`   ❌ GET /health → ${health.status} ${health.text}\n`);
    results.failed++;
    results.errors.push("Health check failed");
    process.exit(1);
  }

  // --- 2. Auth: School Admin ---
  log("2. School Admin login");
  const schoolLogin = await fetchJson(`${API_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-platform": "web" },
    body: JSON.stringify({ request: { email: SCHOOL_EMAIL, password: SCHOOL_PASSWORD } }),
  });
  let schoolToken = null;
  if (schoolLogin.ok && schoolLogin.data?.token) {
    schoolToken = schoolLogin.data.token;
    log(`   ✅ Login OK (${SCHOOL_EMAIL})\n`);
    results.passed++;
  } else {
    log(`   ❌ Login failed ${schoolLogin.status}: ${schoolLogin.text}\n`);
    results.failed++;
    results.errors.push("School Admin login failed");
  }

  // --- 3. Auth: Super Admin ---
  log("3. Super Admin login");
  const superLogin = await fetchJson(`${API_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-platform": "web" },
    body: JSON.stringify({ request: { email: SUPER_EMAIL, password: SUPER_PASSWORD } }),
  });
  let superToken = null;
  if (superLogin.ok && superLogin.data?.token) {
    superToken = superLogin.data.token;
    log(`   ✅ Login OK (${SUPER_EMAIL})\n`);
    results.passed++;
  } else {
    log(`   ❌ Login failed ${superLogin.status}: ${superLogin.text}\n`);
    results.failed++;
    results.errors.push("Super Admin login failed");
  }

  // --- 4. School Admin pages (match dashboard: use pageNumber, pageSize for classes) ---
  const schoolPages = [
    { name: "Dashboard", path: "/api/v1/statistics/dashboard", method: "GET" },
    { name: "My School", path: "/api/v1/schools/my-school", method: "GET" },
    { name: "Classes", path: "/api/v1/schools/classes?pageNumber=1&pageSize=10", method: "GET" },
    { name: "Teachers", path: "/api/v1/users/teachers?pageNumber=1&pageSize=10", method: "GET" },
    { name: "Students", path: "/api/v1/users/students?page=1&limit=10", method: "GET" },
    { name: "Attendance", path: "/api/v1/attendance?page=1&limit=10", method: "GET" },
    { name: "Attendance periods", path: "/api/v1/attendance/periods", method: "GET" },
    { name: "Leave history", path: "/api/v1/leave/history?page=1&limit=10", method: "GET" },
    { name: "Fees", path: "/api/v1/fees?page=1&limit=10", method: "GET" },
    { name: "Salary structures", path: "/api/v1/salary-structures?page=1&limit=10", method: "GET" },
    { name: "Calendar events", path: "/api/v1/calendar/events?page=1&limit=10", method: "GET" },
    { name: "Calendar holidays", path: "/api/v1/calendar/holidays?page=1&limit=10", method: "GET" },
    { name: "Timetables", path: "/api/v1/timetables?page=1&limit=10", method: "GET" },
    { name: "Transport", path: "/api/v1/transports?page=1&limit=10", method: "GET" },
    { name: "Library books", path: "/api/v1/library/books?page=1&limit=10", method: "GET" },
    { name: "Notes", path: "/api/v1/notes/notes?page=1&limit=10", method: "GET" },
    { name: "Gallery", path: "/api/v1/gallery?page=1&limit=10", method: "GET" },
    { name: "Circulars", path: "/api/v1/circulars?page=1&limit=10", method: "GET" },
    { name: "Reports attendance", path: "/api/v1/reports/attendance", method: "GET" },
    { name: "Reports fees", path: "/api/v1/reports/fees", method: "GET" },
    { name: "Reports academic", path: "/api/v1/reports/academic", method: "GET" },
    { name: "Settings", path: "/api/v1/settings", method: "GET" },
    { name: "Exams", path: "/api/v1/exams?page=1&limit=10", method: "GET" },
    { name: "ID Cards", path: "/api/v1/id-cards/status", method: "GET" },
  ];

  log("4. School Admin API pages");
  if (schoolToken) {
    for (const page of schoolPages) {
      await new Promise((r) => setTimeout(r, 150));
      const r = await fetchJson(`${API_URL}${page.path}`, {
        method: page.method || "GET",
        headers: { Authorization: `Bearer ${schoolToken}` },
      });
      if (r.ok) {
        log(`   ✅ ${page.name} → ${r.status}`);
        results.passed++;
      } else {
        log(`   ❌ ${page.name} → ${r.status} ${r.text}`);
        results.failed++;
        results.errors.push(`${page.name}: ${r.status}`);
      }
    }
  } else {
    log("   Skipped (no School Admin token)\n");
  }
  log("");

  // --- 5. Super Admin: regions + employees ---
  log("5. Super Admin endpoints");
  if (superToken) {
    await new Promise((r) => setTimeout(r, 150));
    const regions = await fetchJson(`${API_URL}/api/v1/regions`, {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    if (regions.ok) {
      log("   ✅ GET /api/v1/regions → 200");
      results.passed++;
    } else {
      log(`   ❌ GET /api/v1/regions → ${regions.status} ${regions.text}`);
      results.failed++;
      results.errors.push(`Regions: ${regions.status}`);
    }
    await new Promise((r) => setTimeout(r, 150));
    const employees = await fetchJson(`${API_URL}/api/v1/users/employees`, {
      headers: { Authorization: `Bearer ${superToken}` },
    });
    if (employees.ok) {
      log("   ✅ GET /api/v1/users/employees → 200");
      results.passed++;
    } else {
      log(`   ❌ GET /api/v1/users/employees → ${employees.status} ${employees.text}`);
      results.failed++;
      results.errors.push(`Employees: ${employees.status}`);
    }
  } else {
    log("   Skipped (no Super Admin token)\n");
  }
  log("");

  // --- Summary ---
  const total = results.passed + results.failed;
  log("--- Summary ---");
  log(`Passed: ${results.passed}  Failed: ${results.failed}  Total: ${total}`);
  if (results.errors.length) {
    log("Errors: " + results.errors.join("; "));
  }
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
