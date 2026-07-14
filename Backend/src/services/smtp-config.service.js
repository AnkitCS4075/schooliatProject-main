import prisma from "../prisma/client.js";
import logger from "../config/logger.js";
import { decryptPlatformSmtpPassword } from "../utils/platform-smtp-crypto.util.js";

let platformRowCache = { at: 0, row: null };
const PLATFORM_ROW_TTL_MS = 10_000;

function resolveSmtpPortFromEnv() {
  const raw = process.env.SMTP_PORT;
  if (raw === undefined || raw === "") return 587;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : 587;
}

function resolveSmtpSecureFromEnv(port) {
  const v = process.env.SMTP_SECURE;
  if (v === "true") return true;
  if (v === "false") return false;
  return port === 465;
}

/**
 * Build Nodemailer transport options from environment variables (legacy / default).
 * @returns {import('nodemailer').TransportOptions | null}
 */
export function buildEnvSmtpTransportOptions() {
  const port = resolveSmtpPortFromEnv();
  const secure = resolveSmtpSecureFromEnv(port);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!user || !pass) {
    return null;
  }

  const opts = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: { user, pass },
  };

  if (!secure && port === 587 && process.env.SMTP_REQUIRE_TLS !== "false") {
    opts.requireTLS = true;
  }

  const connMs = parseInt(String(process.env.SMTP_CONNECTION_TIMEOUT_MS || "60000"), 10);
  if (Number.isFinite(connMs) && connMs > 0) {
    opts.connectionTimeout = connMs;
  }
  const greetMs = parseInt(String(process.env.SMTP_GREETING_TIMEOUT_MS || "30000"), 10);
  if (Number.isFinite(greetMs) && greetMs > 0) {
    opts.greetingTimeout = greetMs;
  }
  if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false") {
    opts.tls = { ...(opts.tls || {}), rejectUnauthorized: false };
  }

  return opts;
}

async function getPlatformSettingsRow() {
  const now = Date.now();
  if (platformRowCache.row && now - platformRowCache.at < PLATFORM_ROW_TTL_MS) {
    return platformRowCache.row;
  }
  const row = await prisma.settings.findFirst({
    where: { schoolId: null, deletedAt: null },
    select: {
      platformConfig: true,
      platformSmtpPasswordEnc: true,
    },
  });
  platformRowCache = { at: now, row };
  return row;
}

export function invalidatePlatformSmtpRowCache() {
  platformRowCache = { at: 0, row: null };
}

/**
 * If platform system.smtp.enabled is true and credentials exist, build transport from DB.
 * @returns {Promise<import('nodemailer').TransportOptions | null>}
 */
export async function buildDatabaseSmtpTransportOptions() {
  const row = await getPlatformSettingsRow();
  if (!row) {
    return null;
  }

  const smtp = row.platformConfig?.system?.smtp;
  if (!smtp || smtp.enabled !== true) {
    return null;
  }

  const host = typeof smtp.host === "string" ? smtp.host.trim() : "";
  const user = typeof smtp.user === "string" ? smtp.user.trim() : "";
  if (!host || !user) {
    logger.warn("Platform SMTP enabled but host or user is missing");
    return null;
  }

  const pass = row.platformSmtpPasswordEnc
    ? decryptPlatformSmtpPassword(row.platformSmtpPasswordEnc)
    : null;
  if (!pass) {
    logger.warn(
      "Platform SMTP enabled but password is missing or PLATFORM_EMAIL_ENCRYPTION_KEY cannot decrypt it — falling back to environment SMTP if configured",
    );
    return null;
  }

  const port =
    typeof smtp.port === "number" && smtp.port > 0
      ? smtp.port
      : parseInt(String(smtp.port || "587"), 10) || 587;
  const secure =
    smtp.secure === true
      ? true
      : smtp.secure === false
        ? false
        : port === 465;

  const opts = {
    host,
    port,
    secure,
    auth: { user, pass },
  };

  if (!secure && port === 587 && smtp.requireTls !== false) {
    opts.requireTLS = true;
  }

  const connMs = parseInt(String(process.env.SMTP_CONNECTION_TIMEOUT_MS || "60000"), 10);
  if (Number.isFinite(connMs) && connMs > 0) {
    opts.connectionTimeout = connMs;
  }
  const greetMs = parseInt(String(process.env.SMTP_GREETING_TIMEOUT_MS || "30000"), 10);
  if (Number.isFinite(greetMs) && greetMs > 0) {
    opts.greetingTimeout = greetMs;
  }
  if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED === "false") {
    opts.tls = { ...(opts.tls || {}), rejectUnauthorized: false };
  }

  return opts;
}

/**
 * Prefer platform SMTP when enabled and valid; otherwise environment variables.
 * @returns {Promise<{ transport: import('nodemailer').TransportOptions, source: 'database' | 'environment' } | null>}
 */
export async function resolveSmtpTransportOptions() {
  const db = await buildDatabaseSmtpTransportOptions();
  if (db) {
    return { transport: db, source: "database" };
  }
  const env = buildEnvSmtpTransportOptions();
  if (env) {
    return { transport: env, source: "environment" };
  }
  return null;
}

/**
 * "From" for MailOptions: platform from fields, else SMTP_FROM / user.
 */
export async function resolveSmtpFromAddress() {
  const row = await getPlatformSettingsRow();
  const smtp = row?.platformConfig?.system?.smtp;
  if (smtp?.enabled === true) {
    const email = typeof smtp.fromEmail === "string" ? smtp.fromEmail.trim() : "";
    const name = typeof smtp.fromName === "string" ? smtp.fromName.trim() : "";
    if (email && name) {
      return `${name} <${email}>`;
    }
    if (email) {
      return email;
    }
    if (typeof smtp.user === "string" && smtp.user.trim()) {
      return smtp.user.trim();
    }
  }
  return process.env.SMTP_FROM || process.env.SMTP_USER || null;
}
