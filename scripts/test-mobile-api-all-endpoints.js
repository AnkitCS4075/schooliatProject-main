#!/usr/bin/env node
/**
 * Test all Mobile API endpoints from MOBILE_APP_API_COMPLETE.json
 * Usage:
 *   node scripts/test-mobile-api-all-endpoints.js
 *   BASE_URL=https://api.schooliat.com node scripts/test-mobile-api-all-endpoints.js
 *   MOBILE_API_EMAIL=teacher@school.com MOBILE_API_PASSWORD=xxx node scripts/test-mobile-api-all-endpoints.js
 *
 * With credentials: logs in first and uses Bearer token for protected endpoints.
 * Without credentials: tests only public endpoints; protected ones get 401 (counted as "reached").
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const BASE_URL = process.env.BASE_URL || "https://api.schooliat.com";
const MOBILE_API_EMAIL = process.env.MOBILE_API_EMAIL;
const MOBILE_API_PASSWORD = process.env.MOBILE_API_PASSWORD;
const DELAY_MS = parseInt(process.env.DELAY_MS || "200", 10);
const VERBOSE = process.env.VERBOSE === "1" || process.env.VERBOSE === "true";

// Placeholder UUID for path params (server will return 400/404 but endpoint is hit)
const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";
const PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000000";

function loadEndpoints() {
  const path = join(REPO_ROOT, "MOBILE_APP_API_COMPLETE.json");
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  return data.endpoints;
}

function substitutePathParams(path) {
  let p = path;
  const paramNames = ["id", "studentId", "childId", "conversationId", "notificationId", "timetableId", "homeworkId", "routeId", "transportId", "installmentNumber", "classId", "templateId", "slug", "date"];
  for (const name of paramNames) {
    const re = new RegExp(":" + name, "g");
    if (name === "installmentNumber") p = p.replace(re, "1");
    else if (name === "slug") p = p.replace(re, "terms");
    else if (name === "date") p = p.replace(re, "2025-01-15");
    else p = p.replace(re, PLACEHOLDER_UUID);
  }
  return p;
}

function getDefaultBody(method, path) {
  if (method === "GET") return undefined;
  const minimal = { request: {} };
  if (path.includes("authenticate")) return { request: { email: MOBILE_API_EMAIL || "test@test.com", password: MOBILE_API_PASSWORD || "test" } };
  if (path.includes("request-otp") || path.includes("forgot-password")) return { request: { email: MOBILE_API_EMAIL || "test@test.com" } };
  if (path.includes("verify-otp")) return { request: { email: MOBILE_API_EMAIL || "test@test.com", otp: "000000", purpose: "verification" } };
  if (path.includes("reset-password")) return { request: { email: MOBILE_API_EMAIL || "test@test.com", otp: "000000", newPassword: "NewPass123!" } };
  if (path.includes("change-password")) return { request: { currentPassword: "old", newPassword: "NewPass123!" } };
  return minimal;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function login() {
  if (!MOBILE_API_EMAIL || !MOBILE_API_PASSWORD) return null;
  const url = `${BASE_URL.replace(/\/$/, "")}/auth/authenticate`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-platform": "android" },
      body: JSON.stringify({ request: { email: MOBILE_API_EMAIL, password: MOBILE_API_PASSWORD } }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.token) return data.token;
  } catch (e) {
    console.error("Login failed:", e.message);
  }
  return null;
}

async function testEndpoint(ep, token) {
  const path = substitutePathParams(ep.path);
  const url = `${BASE_URL.replace(/\/$/, "")}${path}`;
  const method = ep.method;
  const headers = {
    "Content-Type": "application/json",
    "x-platform": "android",
  };
  if (ep.authRequired && token) headers["Authorization"] = `Bearer ${token}`;

  const body = getDefaultBody(method, path);
  const options = { method, headers };
  if (body && method !== "GET") options.body = JSON.stringify(body);

  let status;
  let ok = false;
  let errorMessage = "";

  try {
    const res = await fetch(url, options);
    status = res.status;

    if (status >= 200 && status < 300) ok = true;
    else if (status === 400) ok = true; // validation - endpoint reached
    else if (status === 401) ok = true; // unauthorized - endpoint reached
    else if (status === 403) ok = true; // forbidden - endpoint reached
    else if (status === 404) ok = true; // not found - endpoint reached
    else if (status >= 500) errorMessage = "Server error";

    if (VERBOSE || !ok) {
      const text = await res.text();
      let preview = text.slice(0, 120);
      if (text.length > 120) preview += "...";
      if (!ok) errorMessage = preview || res.statusText;
    }
  } catch (e) {
    status = "ERR";
    errorMessage = e.message || "Network error";
  }

  return { status, ok, errorMessage };
}

async function main() {
  console.log("Loading endpoints from MOBILE_APP_API_COMPLETE.json...");
  const endpoints = loadEndpoints();
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total endpoints: ${endpoints.length}`);
  if (MOBILE_API_EMAIL && MOBILE_API_PASSWORD) {
    console.log("Logging in with provided credentials...");
  } else {
    console.log("No credentials set; protected endpoints will receive 401 (counted as reached).");
  }
  console.log("");

  const token = await login();
  if (MOBILE_API_EMAIL && MOBILE_API_PASSWORD && !token) {
    console.error("Login failed. Check MOBILE_API_EMAIL and MOBILE_API_PASSWORD.");
    process.exit(1);
  }
  if (token) console.log("Login OK, using Bearer token for protected endpoints.\n");

  const results = { ok: 0, fail: 0, skipped: 0 };
  const failures = [];

  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const { status, ok, errorMessage } = await testEndpoint(ep, token);
    if (ok) results.ok++;
    else {
      results.fail++;
      failures.push({ method: ep.method, path: ep.path, status, error: errorMessage });
    }
    if (VERBOSE) {
      console.log(`${ok ? "✓" : "✗"} ${ep.method} ${ep.path} → ${status}`);
    } else if ((i + 1) % 50 === 0) {
      process.stdout.write(`  Progress: ${i + 1}/${endpoints.length}\r`);
    }
    await sleep(DELAY_MS);
  }

  console.log("\n--- Summary ---");
  console.log(`Passed (endpoint reached): ${results.ok}`);
  console.log(`Failed:                   ${results.fail}`);
  console.log(`Total:                    ${endpoints.length}`);

  if (failures.length > 0) {
    console.log("\n--- Failed requests ---");
    failures.slice(0, 30).forEach((f) => {
      console.log(`  ${f.method} ${f.path} → ${f.status} ${f.error ? " " + f.error.slice(0, 60) : ""}`);
    });
    if (failures.length > 30) console.log(`  ... and ${failures.length - 30} more.`);
  }

  process.exit(results.fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
