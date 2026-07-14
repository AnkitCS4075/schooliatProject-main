#!/usr/bin/env node
/**
 * Test teacher login for Mobile API.
 * Usage:
 *   node scripts/test-teacher-login.js
 *   BASE_URL=http://localhost:3000 node scripts/test-teacher-login.js
 *   EMAIL=teacher1@gis001.edu PASSWORD=Teacher@123 node scripts/test-teacher-login.js
 */
const BASE_URL = (process.env.BASE_URL || "https://api.schooliat.com").replace(/\/$/, "");
const EMAIL = process.env.EMAIL || "teacher1@gis001.edu";
const PASSWORD = process.env.PASSWORD || "Teacher@123";

const url = `${BASE_URL}/auth/authenticate`;
const body = { request: { email: EMAIL, password: PASSWORD } };

async function test(name, headers) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { name, status: res.status, data };
}

async function main() {
  console.log("Testing teacher login:", url);
  console.log("Credentials:", EMAIL, "/", PASSWORD.replace(/./g, "*"));
  console.log("");

  const withPlatform = await test("With x-platform: android", { "x-platform": "android" });
  console.log("1. With x-platform: android");
  console.log("   Status:", withPlatform.status);
  console.log("   Response:", JSON.stringify(withPlatform.data, null, 2));
  console.log("");

  const noPlatform = await test("Without x-platform", {});
  console.log("2. Without x-platform");
  console.log("   Status:", noPlatform.status);
  console.log("   Response:", JSON.stringify(noPlatform.data, null, 2));
  console.log("");

  if (withPlatform.status === 200 && withPlatform.data.token) {
    console.log("Result: Teacher login OK (token received).");
  } else {
    console.log("Result: Teacher login FAILED.");
    if (withPlatform.data.errorCode === "SA003") {
      console.log("   SA003 = Invalid email or password. Ensure the teacher user exists in the DB (run seed) and password is Teacher@123.");
    } else if (withPlatform.data.errorCode === "SA001") {
      console.log("   SA001 = Unauthorized. Send header x-platform: android or ios for teacher login.");
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
