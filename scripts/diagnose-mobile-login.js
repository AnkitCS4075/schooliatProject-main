#!/usr/bin/env node
/**
 * Diagnose why teacher login fails while student succeeds.
 * Proves that the API treats both roles the same and the only variable is DB state.
 *
 * Usage: node scripts/diagnose-mobile-login.js
 *   BASE_URL=https://api.schooliat.com node scripts/diagnose-mobile-login.js
 */
const BASE_URL = (process.env.BASE_URL || "https://api.schooliat.com").replace(/\/$/, "");
const AUTH_URL = `${BASE_URL}/auth/authenticate`;
const HEADERS = { "Content-Type": "application/json", "x-platform": "android" };

async function login(email, password) {
  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ request: { email, password } }),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, errorCode: data.errorCode, message: data.message, hasToken: !!data.token };
}

async function main() {
  console.log("=== Mobile login root-cause diagnosis ===\n");
  console.log("Base URL:", BASE_URL);
  console.log("Auth flow (backend): find user by email → check deletedAt → bcrypt.compare → check x-platform → return token\n");

  const tests = [
    { email: "student1@gis001.edu", password: "Student@123", label: "Student (correct)" },
    { email: "student1@gis001.edu", password: "WrongPassword", label: "Student (wrong password)" },
    { email: "teacher1@gis001.edu", password: "Teacher@123", label: "Teacher (correct)" },
    { email: "teacher1@gis001.edu", password: "WrongPassword", label: "Teacher (wrong password)" },
    { email: "nonexistent@gis001.edu", password: "Any", label: "Non-existent email" },
  ];

  const results = [];
  for (const t of tests) {
    const r = await login(t.email, t.password);
    results.push({ ...t, ...r });
  }

  console.log("Results:");
  console.log("----------------------------------------");
  for (const r of results) {
    const outcome = r.status === 200 && r.hasToken ? "OK" : `FAIL [${r.status}] ${r.errorCode || ""} ${r.message || ""}`.trim();
    console.log(`${r.label.padEnd(28)} -> ${outcome}`);
  }
  console.log("----------------------------------------\n");

  const studentOk = results[0].status === 200 && results[0].hasToken;
  const studentWrongFail = results[1].status === 401 && results[1].errorCode === "SA003";
  const teacherFail = results[2].status === 401 && results[2].errorCode === "SA003";
  const nonexistentFail = results[4].status === 401 && results[4].errorCode === "SA003";

  console.log("Root cause analysis:");
  console.log("1. Student with correct password returns 200  ->", studentOk ? "Yes" : "No", studentOk ? "(user exists, password matches)" : "");
  console.log("2. Student with wrong password returns 401 SA003 ->", studentWrongFail ? "Yes" : "No", studentWrongFail ? "(API uses same error for wrong/missing)" : "");
  console.log("3. Teacher with correct password returns 401 SA003 ->", teacherFail ? "Yes" : "No");
  console.log("4. Non-existent email returns 401 SA003 ->", nonexistentFail ? "Yes" : "No", nonexistentFail ? "(confirms SA003 = invalid credentials)" : "");
  console.log("");

  if (teacherFail && studentOk) {
    console.log("CONCLUSION (root cause):");
    console.log("  The API logic is identical for TEACHER and STUDENT. SA003 is returned when:");
    console.log("  - No user with that email exists, OR");
    console.log("  - User exists but deletedAt is set, OR");
    console.log("  - User exists but password hash does not match (wrong password or null).");
    console.log("");
    console.log("  Therefore: In the database that this API uses, teacher1@gis001.edu either");
    console.log("  - does not exist, or");
    console.log("  - is soft-deleted (deletedAt not null), or");
    console.log("  - has a different password than Teacher@123 (or password is null).");
    console.log("");
    console.log("  Student login works because student1@gis001.edu exists, is not deleted,");
    console.log("  and has password hash matching Student@123.");
    console.log("");
    console.log("FIX: Run on the same environment the API uses (e.g. production server):");
    console.log("  cd Backend && npm run seed:mobile-credentials");
    console.log("  This creates teacher1@<schoolCode>.edu with Teacher@123 only if missing.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
