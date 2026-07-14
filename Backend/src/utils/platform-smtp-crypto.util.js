import crypto from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;

/**
 * Derive 32-byte key from PLATFORM_EMAIL_ENCRYPTION_KEY (any length string).
 */
function deriveKey() {
  const secret = process.env.PLATFORM_EMAIL_ENCRYPTION_KEY;
  if (!secret || !String(secret).trim()) {
    return null;
  }
  return crypto.createHash("sha256").update(String(secret), "utf8").digest();
}

export function isPlatformSmtpEncryptionConfigured() {
  return !!deriveKey();
}

/**
 * @param {string} plain
 * @returns {string} base64(iv + tag + ciphertext)
 */
export function encryptPlatformSmtpPassword(plain) {
  const key = deriveKey();
  if (!key) {
    throw new Error(
      "PLATFORM_EMAIL_ENCRYPTION_KEY is not set. Add it to the server environment before saving SMTP passwords.",
    );
  }
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/**
 * @param {string} b64
 * @returns {string|null}
 */
export function decryptPlatformSmtpPassword(b64) {
  if (!b64 || typeof b64 !== "string") {
    return null;
  }
  const key = deriveKey();
  if (!key) {
    return null;
  }
  try {
    const buf = Buffer.from(b64, "base64");
    if (buf.length < IV_LEN + TAG_LEN + 1) {
      return null;
    }
    const iv = buf.subarray(0, IV_LEN);
    const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const data = buf.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LEN });
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
