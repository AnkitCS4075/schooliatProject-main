#!/usr/bin/env node
/**
 * Test teacher and student login for Mobile API.
 * Usage:
 *   node scripts/test-mobile-login.js
 *   BASE_URL=http://localhost:3000 node scripts/test-mobile-login.js
 */
const BASE_URL = (process.env.BASE_URL || "https://api.schooliat.com").replace(/\/$/, "");

const CREDENTIALS = [
  { role: "Teacher", email: "teacher1@gis001.edu", password: "Teacher@123" },
  { role: "Student", email: "student1@gis001.edu", password: "Student@123" },
];

async function testLogin(email, password, headers) {
  const res = await fetch(`${BASE_URL}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ request: { email, password } }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log("Base URL:", BASE_URL);
  console.log("Header: x-platform: android");
  console.log("");

  let allOk = true;
  for (const { role, email, password } of CREDENTIALS) {
    const { status, data } = await testLogin(email, password, { "x-platform": "android" });
    const ok = status === 200 && data.token;
    if (!ok) allOk = false;
    console.log(`${role} (${email}): ${ok ? "OK" : "FAIL"} [${status}]`);
    if (!ok && data.message) console.log("  ", data.message);
  }

  console.log("");
  if (allOk) {
    console.log("Result: All mobile logins OK.");
  } else {
    console.log("Result: Some logins failed. Ensure DB is seeded (npm run seed or npm run seed:mobile-credentials in Backend/) and BASE_URL points to that backend.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
