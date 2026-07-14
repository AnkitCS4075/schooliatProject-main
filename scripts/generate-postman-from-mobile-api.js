#!/usr/bin/env node
/**
 * Generate Postman Collection v2.1 from MOBILE_APP_API_COMPLETE.json
 * Output: repo/MOBILE_APP_API_Postman_Collection.json
 *
 * Design: Role-based folders so each role only calls APIs it is allowed to use (avoids 403):
 * - Fetches real users from DB (Backend/scripts/fetch-postman-users.js): Teacher, Student, Employee.
 * - Creates three folders: "1 - TEACHER APIs", "2 - STUDENT APIs", "3 - EMPLOYEE APIs".
 * - Each folder starts with "Login as [Role]" (sets {{auth_token}}), then role-specific setup (IDs), then only that role's endpoints.
 * - Path params are replaced with {{variable}} so requests use real IDs.
 *
 * Run from repo root: node scripts/generate-postman-from-mobile-api.js
 * Optional: POSTMAN_CREDENTIALS_FILE=./postman-credentials.json to use pre-fetched JSON.
 * Always writes role-based collections (mobile app API only):
 *   MOBILE_APP_API_Postman_Collection_Teacher.json, _Student.json, _Employee.json
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const BACKEND_DIR = join(REPO_ROOT, "Backend");

const inputPath = join(REPO_ROOT, "MOBILE_APP_API_COMPLETE.json");
const outputPath = join(REPO_ROOT, "MOBILE_APP_API_Postman_Collection.json");

const data = JSON.parse(readFileSync(inputPath, "utf8"));
const baseUrl = data.info.baseUrl || "https://api.schooliat.com";

/** Load credentials from DB (fetch script) or from file. Returns single default + per-role creds for role-based folders. */
function loadCredentials() {
  const credPath = process.env.POSTMAN_CREDENTIALS_FILE || join(REPO_ROOT, "postman-credentials.json");
  let parsed = null;
  if (existsSync(credPath)) {
    try {
      parsed = JSON.parse(readFileSync(credPath, "utf8"));
    } catch (_) {}
  }
  if (!parsed) {
    try {
      const out = execSync("node scripts/fetch-postman-users.js", {
        cwd: BACKEND_DIR,
        encoding: "utf8",
        env: { ...process.env, NODE_ENV: "production", DEBUG: "" },
        stdio: ["pipe", "pipe", "pipe"],
      });
      const lastLine = out.trim().split("\n").filter((l) => l.startsWith("{")).pop();
      if (lastLine) parsed = JSON.parse(lastLine);
    } catch (_) {}
  }
  const defaultPasswords = parsed?.defaultPasswords || { TEACHER: "Teacher@123", STUDENT: "Student@123", EMPLOYEE: "Employee@123" };
  const users = parsed?.users || {};
  const mobileRoles = parsed?.mobileRoles || {};
  const byRole = {
    TEACHER: mobileRoles.TEACHER || (users.TEACHER ? { email: users.TEACHER.email, password: defaultPasswords.TEACHER } : { email: "teacher1@gis001.edu", password: "Teacher@123" }),
    STUDENT: mobileRoles.STUDENT || (users.STUDENT ? { email: users.STUDENT.email, password: defaultPasswords.STUDENT } : { email: "student1@gis001.edu", password: "Student@123" }),
    EMPLOYEE: mobileRoles.EMPLOYEE || (users.EMPLOYEE ? { email: users.EMPLOYEE.email, password: defaultPasswords.EMPLOYEE } : { email: "employee@schooliat.com", password: "Employee@123" }),
  };
  const defaultRole = parsed?.postmanLoginRole || "TEACHER";
  const defaultCreds = byRole[defaultRole] || byRole.TEACHER;
  return {
    byRole,
    email: defaultCreds.email,
    password: defaultCreds.password,
    x_platform: parsed?.x_platform || "android",
    source: parsed ? "db" : "fallback",
  };
}

const credentials = loadCredentials();
const DEFAULT_AUTH_EMAIL = credentials.email;
const DEFAULT_AUTH_PASSWORD = credentials.password;
const DEFAULT_X_PLATFORM = credentials.x_platform;
const CREDS_BY_ROLE = credentials.byRole;

// MOBILE_APP_API_COMPLETE.json is the single source of truth. Endpoints are assigned to roles per MOBILE_API_DOCUMENTATION.md.
const GROUPS_BY_ROLE = {
  TEACHER: new Set([
    "authentication", "students", "statistics", "attendance", "homework", "marks", "timetables", "notes", "syllabus",
    "leave", "fees", "communication", "notifications", "calendar", "files", "schools", "settings", "exams", "subjects",
    "grievances", "parent", "emergency-contacts",
  ]),
  STUDENT: new Set([
    "authentication", "students", "statistics", "attendance", "homework", "marks", "timetables", "syllabus",
    "leave", "fees", "communication", "notifications", "calendar", "files", "schools", "settings", "exams", "subjects",
    "grievances", "parent",
  ]),
  EMPLOYEE: new Set([
    "authentication", "employees", "users", "statistics", "schools", "settings", "vendors", "licenses", "receipts",
    "gallery", "circulars", "reports", "regions", "transports", "invoices", "locations", "letterhead", "id-cards",
    "templates", "grievances", "salary", "ai", "audit", "deletion-otp", "transfer-certificates", "emergency-contacts",
    "inventory", "subjects", "leave", "fees", "exams", "files", "communication", "notifications", "calendar",
  ]),
};

/** True if this endpoint is used by the given role (group + path rules for schools). */
function endpointBelongsToRole(ep, role) {
  const g = ep.group || "other";
  if (!GROUPS_BY_ROLE[role]?.has(g)) return false;
  const path = (ep.path || "").toLowerCase();
  // Teacher: schools = only my-school and classes (read), not full CRUD
  if (role === "TEACHER" && g === "schools") {
    if (path.includes("my-school")) return true;
    if (path.includes("/schools/classes") && ep.method === "GET") return true;
    return false;
  }
  // Student: schools = only my-school and classes read
  if (role === "STUDENT" && g === "schools") {
    if (path.includes("my-school")) return true;
    if (path.includes("/schools/classes") && ep.method === "GET") return true;
    return false;
  }
  return true;
}

/**
 * Map path parameter name + path context to collection variable name.
 * Used so GET students/:id -> {{student_id}}, GET schools/:id -> {{school_id}}, etc.
 */
function pathParamToVariable(paramName, path) {
  const p = path.toLowerCase();
  const named = {
    studentid: "student_id",
    childid: "child_id",
    conversationid: "conversation_id",
    notificationid: "notification_id",
    timetableid: "timetable_id",
    homeworkid: "homework_id",
    routeid: "route_id",
    transportid: "transport_id",
    templateid: "template_id",
    classid: "class_id",
    slug: "slug",
    date: "date",
    installments: "installment_number",
    installmentnumber: "installment_number",
  };
  if (named[paramName.toLowerCase()]) return named[paramName.toLowerCase()];
  // Generic :id – derive from path segment
  if (paramName === "id") {
    // More specific paths first (e.g. schools/classes before students)
    if (p.includes("/schools/classes/")) return "class_id";
    if (p.includes("/schools/") && !p.includes("/classes/")) return "school_id";
    if (p.includes("/students/")) return "student_id";
    if (p.includes("/employees/") || p.includes("/users/employees/")) return "employee_id";
    if (p.includes("/timetables/")) return "timetable_id";
    if (p.includes("/homework/")) return "homework_id";
    if (p.includes("/salary-structures/")) return "salary_structure_id";
    if (p.includes("/salaries/")) return "salary_id";
    if (p.includes("/conversations/") || p.includes("/communication/")) return "conversation_id";
    if (p.includes("/notifications/")) return "notification_id";
    if (p.includes("/transports/routes/")) return "route_id";
    if (p.includes("/transports/")) return "transport_id";
    if (p.includes("/templates/")) return "template_id";
    if (p.includes("/statistics/schools/")) return "school_id";
    if (p.includes("/leave/types/")) return "leave_type_id";
    if (p.includes("/notes/") || p.includes("/notes/notes/") || p.includes("/syllabus/")) return "note_id";
    if (p.includes("/calendar/events/")) return "event_id";
    if (p.includes("/calendar/holidays/")) return "holiday_id";
    if (p.includes("/calendar/exam-calendars/")) return "exam_calendar_id";
    if (p.includes("/calendar/notices/")) return "notice_id";
    if (p.includes("/exams/")) return "exam_id";
    if (p.includes("/subjects/")) return "subject_id";
    if (p.includes("/vendors/")) return "vendor_id";
    if (p.includes("/licenses/")) return "license_id";
    if (p.includes("/receipts/")) return "receipt_id";
    if (p.includes("/gallery/")) return "gallery_id";
    if (p.includes("/library/books/")) return "book_id";
    if (p.includes("/grievances/")) return "grievance_id";
    if (p.includes("/emergency-contacts/")) return "emergency_contact_id";
    if (p.includes("/inventory/")) return "inventory_id";
    if (p.includes("/invoices/")) return "invoice_id";
    if (p.includes("/locations/")) return "location_id";
    if (p.includes("/letterhead/")) return "letterhead_id";
    if (p.includes("/id-cards/")) return "id_card_id";
    if (p.includes("/fees/installments/")) return "fee_installment_id";
    if (p.includes("/transfer-certificates/")) return "tc_id";
    if (p.includes("/audit/")) return "audit_id";
    if (p.includes("/ai/conversations/")) return "ai_conversation_id";
    if (p.includes("/ai/faqs/")) return "faq_id";
    return "entity_id";
  }
  if (paramName === "installmentNumber") return "installment_number";
  return paramName.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "") + "_id";
}

/**
 * Replace path params like :id, :studentId with {{variable}}
 */
function substitutePathParams(path) {
  return path.replace(/:([a-zA-Z]+)/g, (_, paramName) => {
    const varName = pathParamToVariable(paramName, path);
    return `{{${varName}}}`;
  });
}

function requestName(ep) {
  const pathShort = ep.path.replace("/api/v1/", "").replace("/auth/", "auth/");
  return `${ep.method} ${pathShort}`;
}

function getBody(ep, roleCreds) {
  if (ep.method === "GET") return undefined;
  const creds = roleCreds || { email: DEFAULT_AUTH_EMAIL, password: DEFAULT_AUTH_PASSWORD };
  const email = creds.email || DEFAULT_AUTH_EMAIL;
  const password = creds.password || DEFAULT_AUTH_PASSWORD;
  let raw = { request: {} };
  if (ep.path.includes("authenticate")) {
    raw = { request: { email, password } };
  } else if (ep.path.includes("request-otp") || ep.path.includes("forgot-password")) {
    raw = { request: { email, purpose: "password-reset" } };
  } else if (ep.path.includes("verify-otp")) {
    raw = { request: { email, otp: "123456", purpose: "verification" } };
  } else if (ep.path.includes("reset-password")) {
    raw = { request: { email, otp: "123456", newPassword: "NewPass123!" } };
  } else if (ep.path.includes("change-password")) {
    raw = { request: { currentPassword: password, newPassword: "NewPass123!" } };
  }
  return {
    mode: "raw",
    raw: JSON.stringify(raw, null, 2),
    options: { raw: { language: "json" } },
  };
}

function buildRequest(ep, roleCreds) {
  const pathWithVars = substitutePathParams(ep.path);
  const urlRaw = "{{base_url}}" + pathWithVars;
  const req = {
    method: ep.method,
    header: [
      { key: "Content-Type", value: "application/json", type: "text" },
      { key: "x-platform", value: "{{x_platform}}", type: "text", description: "android | ios" },
    ],
    url: urlRaw,
    description: ep.description || "",
    response: [],
  };
  if (ep.authRequired) req.auth = { type: "bearer", bearer: [{ key: "token", value: "{{auth_token}}", type: "string" }] };
  const body = getBody(ep, roleCreds);
  if (body) req.body = body;
  return req;
}

function makeLoginRequest(roleName, email, password) {
  return {
    name: `Login as ${roleName}`,
    request: {
      method: "POST",
      header: [
        { key: "Content-Type", value: "application/json", type: "text" },
        { key: "x-platform", value: "{{x_platform}}", type: "text" },
      ],
      url: "{{base_url}}/auth/authenticate",
      description: `Login as ${roleName}. Saves token to {{auth_token}}. Run this first when testing this folder.`,
      body: {
        mode: "raw",
        raw: JSON.stringify({ request: { email, password } }, null, 2),
        options: { raw: { language: "json" } },
      },
      response: [],
    },
    event: [
      {
        listen: "test",
        script: {
          type: "text/javascript",
          exec: [
            "var json = pm.response.json();",
            "var token = json && (json.token || (json.data && json.data.token));",
            "if (token) { pm.collectionVariables.set('auth_token', token); }",
            roleName === "STUDENT"
              ? "var user = json && (json.user || (json.data && json.data.user)); if (user && user.id) { pm.collectionVariables.set('student_id', user.id); }"
              : "",
          ].filter(Boolean),
        },
      },
    ],
  };
}

function makeSetupRequest(name, method, path, testScript) {
  const url = path.startsWith("http") ? path : "{{base_url}}" + (path.startsWith("/") ? path : "/" + path);
  return {
    name,
    request: {
      method,
      header: [
        { key: "Content-Type", value: "application/json", type: "text" },
        { key: "x-platform", value: "{{x_platform}}", type: "text" },
      ],
      auth: { type: "bearer", bearer: [{ key: "token", value: "{{auth_token}}", type: "string" }] },
      url,
      description: "Saves IDs for use in later requests in this folder.",
      response: [],
    },
    event: testScript ? [{ listen: "test", script: { type: "text/javascript", exec: testScript } }] : [],
  };
}

// --- Build role-based folders: each folder has Login as [Role] + ID setup + only that role's endpoints ---
const ROLES = ["TEACHER", "STUDENT", "EMPLOYEE"];
const roleSetupRequests = {
  TEACHER: [
    makeSetupRequest("GET students (save student_id)", "GET", "/api/v1/students?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('student_id', d[0].id);",
    ]),
    makeSetupRequest("GET my-school (save school_id)", "GET", "/api/v1/schools/my-school", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (d && d.id) pm.collectionVariables.set('school_id', d.id);",
    ]),
    makeSetupRequest("GET classes (save class_id)", "GET", "/api/v1/schools/classes?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('class_id', d[0].id);",
    ]),
    makeSetupRequest("GET timetables (save timetable_id)", "GET", "/api/v1/timetables?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('timetable_id', d[0].id);",
    ]),
    makeSetupRequest("GET homework (save homework_id)", "GET", "/api/v1/homework?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('homework_id', d[0].id);",
    ]),
  ],
  STUDENT: [
    makeSetupRequest("GET my-school (save school_id)", "GET", "/api/v1/schools/my-school", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (d && d.id) pm.collectionVariables.set('school_id', d.id);",
    ]),
    makeSetupRequest("GET classes (save class_id)", "GET", "/api/v1/schools/classes?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('class_id', d[0].id);",
    ]),
  ],
  EMPLOYEE: [
    makeSetupRequest("GET schools (save school_id)", "GET", "/api/v1/schools?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('school_id', d[0].id);",
    ]),
    makeSetupRequest("GET employees (save employee_id)", "GET", "/api/v1/employees?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('employee_id', d[0].id);",
    ]),
    makeSetupRequest("GET salary-structures (save salary_structure_id)", "GET", "/api/v1/salary-structures?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('salary_structure_id', d[0].id);",
    ]),
    makeSetupRequest("GET salaries (save salary_id)", "GET", "/api/v1/salaries?limit=1", [
      "var json = pm.response.json(); var d = json && (json.data || json); if (Array.isArray(d) && d[0]) pm.collectionVariables.set('salary_id', d[0].id);",
    ]),
  ],
};

const roleFolders = []; // { name, description, item: folderItems } per role
for (const role of ROLES) {
  const creds = CREDS_BY_ROLE[role];
  const folderItems = [
    makeLoginRequest(role, creds.email, creds.password),
    ...(roleSetupRequests[role] || []),
    ...data.endpoints
      .filter((ep) => endpointBelongsToRole(ep, role))
      .map((ep) => ({
        name: requestName(ep),
        request: buildRequest(ep, creds),
      })),
  ];
  const folder = {
    name: `${role === "TEACHER" ? "1" : role === "STUDENT" ? "2" : "3"} - ${role} APIs`,
    description: `APIs for ${role} role. Run "Login as ${role}" first (or run folder); then run other requests. Credentials: ${creds.email}`,
    item: folderItems,
  };
  roleFolders.push({ role, folder, folderItems });
}

const item = roleFolders.map(({ folder }) => folder);

// Collection variables: all IDs used in path substitution + base_url, auth_token, x_platform
const variableKeys = [
  "base_url", "auth_token", "x_platform",
  "student_id", "school_id", "class_id", "employee_id", "timetable_id", "homework_id",
  "salary_structure_id", "salary_id", "conversation_id", "notification_id", "route_id", "transport_id",
  "child_id", "template_id", "leave_type_id", "entity_id", "note_id", "event_id", "holiday_id",
  "exam_calendar_id", "notice_id", "exam_id", "subject_id", "vendor_id", "license_id", "receipt_id",
  "gallery_id", "book_id", "grievance_id", "emergency_contact_id", "inventory_id", "invoice_id",
  "location_id", "fee_installment_id", "tc_id", "audit_id", "ai_conversation_id", "faq_id", "slug", "date", "installment_number",
];
const defaultVarValues = {
  base_url: baseUrl,
  x_platform: DEFAULT_X_PLATFORM,
  slug: "terms",
  date: "2025-01-15",
  installment_number: "1",
};
const collectionVariables = variableKeys.map((key) => ({
  key,
  value: defaultVarValues[key] !== undefined ? defaultVarValues[key] : "",
  type: "string",
}));

const collection = {
  info: {
    _postman_id: "schooliat-mobile-api-complete",
    name: "SchooliAt Mobile App API (all roles)",
    description: [
      "Mobile app API only – all three roles in one collection. Each folder is one role (Teacher, Student, Employee). No web/admin endpoints.",
      "",
      "For a single-role collection, use the generated role-based files instead:",
      "  MOBILE_APP_API_Postman_Collection_Teacher.json, _Student.json, _Employee.json",
      "",
      "How to use: Open a role folder → Run 'Login as [Role]' first → Run the rest.",
      "",
      "Credentials: Teacher: " + (CREDS_BY_ROLE.TEACHER?.email || "-") + " | Student: " + (CREDS_BY_ROLE.STUDENT?.email || "-") + " | Employee: " + (CREDS_BY_ROLE.EMPLOYEE?.email || "-"),
      "x_platform: " + DEFAULT_X_PLATFORM + " | Base URL: " + baseUrl,
    ].join("\n"),
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{auth_token}}", type: "string" }],
  },
  item,
  variable: collectionVariables,
};

writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf8");
const teacherCount = data.endpoints.filter((ep) => endpointBelongsToRole(ep, "TEACHER")).length;
const studentCount = data.endpoints.filter((ep) => endpointBelongsToRole(ep, "STUDENT")).length;
const employeeCount = data.endpoints.filter((ep) => endpointBelongsToRole(ep, "EMPLOYEE")).length;
console.log("Written:", outputPath);

// Always write role-based collections (mobile app API only: one file per role)
const baseOutputPath = outputPath.replace(/\.json$/i, "");
const roleCollectionPaths = [];
for (const { role, folder } of roleFolders) {
  const singleRoleCollection = {
    info: {
      _postman_id: `schooliat-mobile-api-${role.toLowerCase()}`,
      name: `SchooliAt Mobile App API - ${role}`,
      description: [
        `Mobile app API only – ${role} role. Run "Login as ${role}" first, then run the rest.`,
        "",
        "All endpoints in this collection are for the mobile app (Android/iOS) and this role only. No web/admin endpoints.",
        "",
        "Credentials: " + (CREDS_BY_ROLE[role]?.email || "-") + " | x_platform: " + DEFAULT_X_PLATFORM + " | Base URL: " + baseUrl,
      ].join("\n"),
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    auth: { type: "bearer", bearer: [{ key: "token", value: "{{auth_token}}", type: "string" }] },
    item: folder.item,
    variable: collectionVariables,
  };
  const separatePath = `${baseOutputPath}_${role}.json`;
  writeFileSync(separatePath, JSON.stringify(singleRoleCollection, null, 2), "utf8");
}

console.log("Role-based collections (mobile app API only):");
console.log("  Teacher:  " + baseOutputPath + "_TEACHER.json  (" + teacherCount + " endpoints)");
console.log("  Student:  " + baseOutputPath + "_STUDENT.json  (" + studentCount + " endpoints)");
console.log("  Employee: " + baseOutputPath + "_EMPLOYEE.json (" + employeeCount + " endpoints)");
console.log("Credentials: Teacher", CREDS_BY_ROLE.TEACHER?.email, "| Student", CREDS_BY_ROLE.STUDENT?.email, "| Employee", CREDS_BY_ROLE.EMPLOYEE?.email);
