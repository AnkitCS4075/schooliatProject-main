/**
 * Remove SMTP password from platform JSON (must never be stored or returned in platform_config).
 * @param {Record<string, unknown>|null|undefined} config
 */
export function stripSmtpPasswordFromPlatformConfig(config) {
  if (!config || typeof config !== "object") {
    return config;
  }
  const c = structuredClone(config);
  if (c.system && typeof c.system === "object" && c.system.smtp && typeof c.system.smtp === "object") {
    delete c.system.smtp.password;
  }
  return c;
}

/**
 * Shape API settings payload: strip secrets from platformConfig and hide encrypted column.
 * @param {Record<string, unknown>} settingsRow - Prisma settings object
 */
export function sanitizeSettingsForApiResponse(settingsRow) {
  if (!settingsRow || typeof settingsRow !== "object") {
    return settingsRow;
  }
  const out = { ...settingsRow };
  const enc = out.platformSmtpPasswordEnc;
  delete out.platformSmtpPasswordEnc;
  out.platformSmtpPasswordConfigured = Boolean(enc);

  if (out.platformConfig !== undefined && out.platformConfig !== null) {
    out.platformConfig = stripSmtpPasswordFromPlatformConfig(out.platformConfig);
  }
  return out;
}
