#!/usr/bin/env node
/**
 * Test all Mobile API endpoints and write a detailed analysis report.
 * Usage: node scripts/test-mobile-api-report.js
 *   BASE_URL=https://api.schooliat.com node scripts/test-mobile-api-report.js
 *   MOBILE_API_EMAIL=... MOBILE_API_PASSWORD=... node scripts/test-mobile-api-report.js
 *
 * Output: API_ENDPOINT_TEST_REPORT.md and api-test-results.json in repo root.
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const BASE_URL = process.env.BASE_URL || "https://api.schooliat.com";
const MOBILE_API_EMAIL = process.env.MOBILE_API_EMAIL;
const MOBILE_API_PASSWORD = process.env.MOBILE_API_PASSWORD;
const DELAY_MS = parseInt(process.env.DELAY_MS || "200", 10);

const PLACEHOLDER_UUID = "00000000-0000-0000-0000-000000000000";

function loadEndpoints() {
  const path = join(REPO_ROOT, "MOBILE_APP_API_COMPLETE.json");
  const data = JSON.parse(readFileSync(path, "utf8"));
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
  const headers = { "Content-Type": "application/json", "x-platform": "android" };
  if (ep.authRequired && token) headers["Authorization"] = `Bearer ${token}`;

  const body = getDefaultBody(method, path);
  const options = { method, headers };
  if (body && method !== "GET") options.body = JSON.stringify(body);

  let status;
  let responsePreview = "";
  let errorType = "";

  try {
    const res = await fetch(url, options);
    status = res.status;
    const text = await res.text();
    responsePreview = text.slice(0, 200).replace(/\s+/g, " ").trim();
    if (text.length > 200) responsePreview += " ...";

    if (status >= 500) errorType = "server_error";
    else if (status === 0) errorType = "network";
  } catch (e) {
    status = "ERR";
    responsePreview = e.message || "Network error";
    errorType = "network";
  }

  return { status, responsePreview, errorType };
}

function generateReport(results, tokenUsed) {
  const byStatus = {};
  const byGroup = {};
  const failures = [];
  const working = []; // 2xx
  const clientErrors = []; // 400, 401, 403, 404
  const serverErrors = [];

  for (const r of results) {
    const status = r.status;
    byStatus[status] = (byStatus[status] || 0) + 1;
    const group = r.group || "other";
    byGroup[group] = byGroup[group] || { total: 0, ok: 0, fail: 0 };
    byGroup[group].total++;
    const isOk = status >= 200 && status < 300;
    const isClientError = [400, 401, 403, 404].includes(status);
    const isServerError = status >= 500 || status === "ERR";
    if (isOk) {
      byGroup[group].ok++;
      working.push(r);
    } else if (isClientError) {
      byGroup[group].ok++;
      clientErrors.push(r);
    } else if (isServerError) {
      byGroup[group].fail++;
      failures.push(r);
      serverErrors.push(r);
    } else {
      byGroup[group].fail++;
      failures.push(r);
    }
  }

  let md = `# Mobile API Endpoint Test Report\n\n`;
  md += `**Base URL:** ${BASE_URL}\n`;
  md += `**Tested at:** ${new Date().toISOString()}\n`;
  md += `**Authenticated:** ${tokenUsed ? "Yes" : "No (protected endpoints returned 401)"}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Total endpoints | ${results.length} |\n`;
  md += `| Working (2xx) | ${working.length} |\n`;
  md += `| Client errors (400/401/403/404) – endpoint reached | ${clientErrors.length} |\n`;
  md += `| Failed (5xx or network) | ${failures.length} |\n\n`;

  md += `## Status code breakdown\n\n`;
  const statusOrder = Object.keys(byStatus).sort((a, b) => {
    if (a === "ERR") return 1;
    if (b === "ERR") return -1;
    return Number(a) - Number(b);
  });
  md += `| Status | Count |\n|--------|-------|\n`;
  for (const s of statusOrder) {
    md += `| ${s} | ${byStatus[s]} |\n`;
  }
  md += `\n`;

  md += `## By group (success = 2xx or 4xx reached; fail = 5xx/ERR)\n\n`;
  md += `| Group | Total | OK (reached) | Failed |\n|-------|-------|---------------|--------|\n`;
  for (const [group, counts] of Object.entries(byGroup).sort()) {
    md += `| ${group} | ${counts.total} | ${counts.ok} | ${counts.fail} |\n`;
  }
  md += `\n`;

  if (failures.length > 0) {
    md += `## Endpoints failing (5xx or network error)\n\n`;
    md += `| Method | Path | Status | Response (excerpt) |\n|--------|------|--------|--------------------|\n`;
    for (const f of failures) {
      const preview = (f.responsePreview || "").slice(0, 80).replace(/\|/g, " ");
      md += `| ${f.method} | ${f.path} | ${f.status} | ${preview} |\n`;
    }
    md += `\n`;
  }

  if (clientErrors.length > 0 && clientErrors.length <= 50) {
    md += `## Client errors (401/403/404 – expected without auth or with wrong ID)\n\n`;
    md += `| Method | Path | Status |\n|--------|------|--------|\n`;
    for (const c of clientErrors.slice(0, 50)) {
      md += `| ${c.method} | ${c.path} | ${c.status} |\n`;
    }
    if (clientErrors.length > 50) md += `... and ${clientErrors.length - 50} more.\n`;
    md += `\n`;
  }

  md += `## Conclusion\n\n`;
  const reachable = working.length + clientErrors.length;
  md += `- **${reachable}** endpoints are **reachable** (returned 2xx or expected 4xx).\n`;
  if (failures.length > 0) {
    md += `- **${failures.length}** endpoints need attention (server error or network failure).\n`;
  }
  if (!tokenUsed) {
    md += `- Run with \`MOBILE_API_EMAIL\` and \`MOBILE_API_PASSWORD\` (e.g. teacher1@gis001.edu / Teacher@123) to test with auth and get more 2xx responses.\n`;
  }

  return md;
}

async function main() {
  console.log("Loading endpoints...");
  const endpoints = loadEndpoints();
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total endpoints: ${endpoints.length}`);

  const token = await login();
  const tokenUsed = !!token;
  if (token) console.log("Login OK, using Bearer token.");
  else console.log("No auth; protected endpoints will get 401 (counted as reached).\n");

  const results = [];
  for (let i = 0; i < endpoints.length; i++) {
    const ep = endpoints[i];
    const { status, responsePreview, errorType } = await testEndpoint(ep, token);
    results.push({
      method: ep.method,
      path: ep.path,
      group: ep.group,
      status,
      responsePreview: responsePreview.slice(0, 300),
      errorType,
    });
    if ((i + 1) % 50 === 0) process.stdout.write(`  Progress: ${i + 1}/${endpoints.length}\r`);
    await sleep(DELAY_MS);
  }

  const reportMd = generateReport(results, tokenUsed);
  const reportPath = join(REPO_ROOT, "API_ENDPOINT_TEST_REPORT.md");
  const jsonPath = join(REPO_ROOT, "api-test-results.json");
  writeFileSync(reportPath, reportMd, "utf8");
  writeFileSync(jsonPath, JSON.stringify({ baseUrl: BASE_URL, testedAt: new Date().toISOString(), tokenUsed, results }, null, 2), "utf8");

  console.log(`\nReport written: ${reportPath}`);
  console.log(`Raw results: ${jsonPath}`);
  console.log("\n" + reportMd.split("## Conclusion")[0]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
