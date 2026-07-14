#!/usr/bin/env node
/**
 * Test each school admin panel page by calling the production API.
 * Usage: From Backend, with API_URL set or default https://api.schooliat.com:
 *   node scripts/test-school-admin-pages.js
 * Or with production env loaded:
 *   source /opt/schooliat/backend/production/shared/.env && node scripts/test-school-admin-pages.js
 */

const API_URL = process.env.API_URL || "https://api.schooliat.com";
const EMAIL = process.env.SCHOOL_ADMIN_EMAIL || "admin@gis001.edu";
const PASSWORD = process.env.SCHOOL_ADMIN_PASSWORD || "Admin@123";

// Pages with static paths
const PAGES_STATIC = [
  { name: "1. Dashboard", path: "/api/v1/statistics/dashboard", method: "GET" },
  { name: "2. My School", path: "/api/v1/schools/my-school", method: "GET" },
  { name: "3. Classes", path: "/api/v1/schools/classes?pageNumber=1&pageSize=10", method: "GET" },
  { name: "4. Teachers", path: "/api/v1/users/teachers?page=1&limit=10", method: "GET" },
  { name: "5. Students", path: "/api/v1/users/students?page=1&limit=10", method: "GET" },
  { name: "6. Attendance (list)", path: "/api/v1/attendance?page=1&limit=10", method: "GET" },
  { name: "7. Attendance periods", path: "/api/v1/attendance/periods", method: "GET" },
  { name: "9. Leave history", path: "/api/v1/leave/history?page=1&limit=10", method: "GET" },
  { name: "10. Fees", path: "/api/v1/fees?page=1&limit=10", method: "GET" },
  { name: "11. Salary structures", path: "/api/v1/salary-structures?page=1&limit=10", method: "GET" },
  { name: "12. Calendar events", path: "/api/v1/calendar/events?page=1&limit=10", method: "GET" },
  { name: "13. Calendar holidays", path: "/api/v1/calendar/holidays?page=1&limit=10", method: "GET" },
  { name: "14. Calendar notices", path: "/api/v1/calendar/notices?page=1&limit=10", method: "GET" },
  { name: "15. Timetables", path: "/api/v1/timetables?page=1&limit=10", method: "GET" },
  { name: "16. Transport", path: "/api/v1/transports?page=1&limit=10", method: "GET" },
  { name: "17. Library books", path: "/api/v1/library/books?page=1&limit=10", method: "GET" },
  { name: "18. Notes", path: "/api/v1/notes/notes?page=1&limit=10", method: "GET" },
  { name: "19. Gallery", path: "/api/v1/gallery?page=1&limit=10", method: "GET" },
  { name: "22. ID Cards", path: "/api/v1/id-cards", method: "GET" },
  { name: "23. Circulars", path: "/api/v1/circulars?page=1&limit=10", method: "GET" },
  { name: "24. Reports attendance", path: "/api/v1/reports/attendance", method: "GET" },
  { name: "25. Reports fees", path: "/api/v1/reports/fees", method: "GET" },
  { name: "26. Reports academic", path: "/api/v1/reports/academic", method: "GET" },
  { name: "27. Settings", path: "/api/v1/settings", method: "GET" },
  { name: "28. Exams", path: "/api/v1/exams?page=1&limit=10", method: "GET" },
];

async function login() {
  const res = await fetch(`${API_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-platform": "web" },
    body: JSON.stringify({
      request: { email: EMAIL, password: PASSWORD },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed ${res.status}: ${text}`);
  }
  const json = await res.json();
  const token = json.token;
  if (!token) throw new Error("No token in login response");
  return token;
}

async function testPage(token, page) {
  const url = `${API_URL}${page.path}`;
  const opts = {
    method: page.method || "GET",
    headers: { Authorization: `Bearer ${token}` },
  };
  const res = await fetch(url, opts);
  const ok = res.ok;
  let body = "";
  try {
    body = await res.text();
  } catch (_) {}
  let data = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch (_) {}
  const count = data?.data?.length ?? data?.data?.data?.length ?? (Array.isArray(data?.data) ? data.data.length : null);
  const countStr = count != null ? ` (${count} items)` : "";
  return { ok, status: res.status, countStr, body: body.slice(0, 120) };
}

async function fetchIds(token) {
  const opts = { headers: { Authorization: `Bearer ${token}` } };
  let studentId, classId, examId;
  try {
    const studentsRes = await fetch(`${API_URL}/api/v1/users/students?page=1&limit=1`, opts);
    if (studentsRes.ok) {
      const j = await studentsRes.json();
      const list = j?.data?.data ?? j?.data;
      if (Array.isArray(list) && list.length) studentId = list[0].id;
    }
  } catch (_) {}
  try {
    const classesRes = await fetch(`${API_URL}/api/v1/schools/classes?pageNumber=1&pageSize=1`, opts);
    if (classesRes.ok) {
      const j = await classesRes.json();
      const list = j?.data?.data ?? j?.data;
      if (Array.isArray(list) && list.length) classId = list[0].id;
    }
  } catch (_) {}
  try {
    const examsRes = await fetch(`${API_URL}/api/v1/exams?page=1&limit=1`, opts);
    if (examsRes.ok) {
      const j = await examsRes.json();
      const list = j?.data?.data ?? j?.data;
      if (Array.isArray(list) && list.length) examId = list[0].id;
    }
  } catch (_) {}
  return { studentId, classId, examId };
}

async function main() {
  console.log("School Admin Panel – API page tests (production)\n");
  console.log(`API_URL: ${API_URL}`);
  console.log(`Login: ${EMAIL}\n`);

  let token;
  try {
    token = await login();
    console.log("Login OK.\n");
  } catch (e) {
    console.error("Login failed:", e.message);
    process.exit(1);
  }

  const { studentId, classId, examId } = await fetchIds(token);
  const PAGES = [
    ...PAGES_STATIC.slice(0, 7),
    { name: "8. Homework", path: studentId ? `/api/v1/homework?studentId=${studentId}&page=1&limit=10` : "/api/v1/homework?page=1&limit=10", method: "GET" },
    ...PAGES_STATIC.slice(7, 18),
    { name: "20. Marks", path: examId && classId ? `/api/v1/marks?examId=${examId}&classId=${classId}` : "/api/v1/marks?page=1&limit=10", method: "GET" },
    { name: "21. Results", path: studentId ? `/api/v1/marks/results?studentId=${studentId}` : "/api/v1/marks/results?page=1&limit=10", method: "GET" },
    ...PAGES_STATIC.slice(18),
  ];

  let passed = 0;
  let failed = 0;
  for (const page of PAGES) {
    await new Promise((r) => setTimeout(r, 300)); // avoid rate limit
    try {
      const result = await testPage(token, page);
      if (result.ok) {
        console.log(`  ✅ ${page.name} → ${result.status}${result.countStr}`);
        passed++;
      } else {
        console.log(`  ❌ ${page.name} → ${result.status} ${(result.body || "").replace(/\n/g, " ").slice(0, 80)}`);
        failed++;
      }
    } catch (e) {
      console.log(`  ❌ ${page.name} → Error: ${e.message}`);
      failed++;
    }
  }

  console.log("\n---");
  console.log(`Passed: ${passed}/${PAGES.length}  Failed: ${failed}`);
  if (failed > 0) {
    console.log("\nNote: 403 Forbidden often means role permissions are cached on the API server.");
    console.log("After seeding, restart the production API (or wait for role cache TTL) and run this test again.");
  }
  process.exit(failed > 0 ? 1 : 0);
}

main();
