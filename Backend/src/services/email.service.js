import nodemailer from "nodemailer";
import config from "../config.js";
import logger from "../config/logger.js";
import * as smtpConfigService from "./smtp-config.service.js";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Cached transporter (invalidated when platform SMTP settings change)
let transporter = null;

export function resetEmailTransporter() {
  transporter = null;
  smtpConfigService.invalidatePlatformSmtpRowCache();
}

async function ensureTransporter() {
  if (transporter) {
    return transporter;
  }

  const resolved = await smtpConfigService.resolveSmtpTransportOptions();
  if (!resolved) {
    logger.warn("SMTP not configured (platform UI disabled or incomplete, and no SMTP_* env credentials)");
    return null;
  }

  transporter = nodemailer.createTransport(resolved.transport);
  logger.info(
    {
      host: resolved.transport.host,
      port: resolved.transport.port,
      secure: resolved.transport.secure,
      source: resolved.source,
    },
    "Email transporter created",
  );
  return transporter;
}

/**
 * Optional boot-time check (set SMTP_VERIFY_ON_START=true). Logs only; does not exit the process.
 */
async function verifySmtpIfConfigured() {
  resetEmailTransporter();
  const t = await ensureTransporter();
  if (!t) {
    logger.info("SMTP verify skipped: no platform or environment SMTP credentials");
    return { ok: false, skipped: true };
  }
  try {
    await t.verify();
    logger.info("SMTP verify succeeded");
    return { ok: true };
  } catch (error) {
    logger.error({ error }, "SMTP verify failed — outgoing mail will fail until this is fixed");
    return { ok: false, error };
  }
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {Array} [options.attachments] - Nodemailer attachments array [{ filename, content, contentType }]
 * @param {string[]} [options.cc] - CC recipients
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async ({ to, subject, html, text, attachments, cc }) => {
  const emailTransporter = await ensureTransporter();

  if (!emailTransporter) {
    logger.warn({ to, subject }, "Email not sent: SMTP not configured");
    // In development, log the email instead of failing
    if (config.ENVIRONMENT !== "production") {
      logger.info({
        to,
        subject,
        html,
        text,
        attachments: attachments?.map((a) => a.filename),
      }, "Email would be sent (SMTP not configured)");
      return { success: true, messageId: "dev-mode" };
    }
    throw new Error("Email service not configured");
  }

  try {
    const fromAddr =
      (await smtpConfigService.resolveSmtpFromAddress()) ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER;

    const mailOptions = {
      from: fromAddr,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      ...(Array.isArray(attachments) && attachments.length > 0 ? { attachments } : {}),
      ...(Array.isArray(cc) && cc.length > 0 ? { cc } : {}),
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info({ to, subject, messageId: info.messageId }, "Email sent successfully");
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error({ error, to, subject }, "Failed to send email");
    throw error;
  }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP (e.g., "login", "password-reset")
 * @param {number} expiryMinutes - OTP expiry time in minutes
 * @returns {Promise<Object>} - Send result
 */
const sendOTPEmail = async (to, otp, purpose = "verification", expiryMinutes = 10) => {
  const purposeText = {
    verification: "Email Verification",
    "password-reset": "Password Reset",
    login: "Login Verification",
    deletion: "Account Deletion",
  }[purpose] || "Verification";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${purposeText} - SchooliAt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">${purposeText}</h2>
        <p>Hello,</p>
        <p>Your ${purposeText.toLowerCase()} code is:</p>
        <div style="background-color: #fff; border: 2px dashed #6f8f3e; padding: 20px; text-align: center; margin: 20px 0; border-radius: 4px;">
          <h1 style="color: #6f8f3e; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This code will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't request this code, please ignore this email or contact support if you have concerns.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${purposeText} Code - SchooliAt`,
    html,
  });
};

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {number} expiryMinutes - Token expiry time in minutes
 * @returns {Promise<Object>} - Send result
 */
const sendPasswordResetEmail = async (to, resetToken, expiryMinutes = 30) => {
  const resetUrl = `${process.env.FRONTEND_URL || process.env.API_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - SchooliAt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6f8f3e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
        <p>This link will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Password Reset Request - SchooliAt",
    html,
  });
};

/**
 * Welcome email for new school admin (credentials shown once at registration).
 */
const sendSchoolAdminWelcomeEmail = async ({
  to,
  schoolName,
  loginEmail,
  publicUserId,
  password,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SchooliAt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">Welcome, ${escapeHtml(schoolName)}</h2>
        <p>Your school has been registered on SchooliAt. Below are your administrator login credentials. Please sign in and change your password after first login.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0; color: #666;">Public user ID</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${escapeHtml(publicUserId)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email (login)</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(loginEmail)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Temporary password</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${escapeHtml(password)}</td></tr>
        </table>
        <p style="color: #666; font-size: 14px;">If you did not expect this message, please contact support.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Welcome to SchooliAt — ${String(schoolName ?? "").slice(0, 80)}`,
    html,
  });
};

/**
 * Welcome email for new employee (portal login).
 */
const sendEmployeeWelcomeEmail = async ({
  to,
  firstName,
  loginEmail,
  publicUserId,
  password,
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SchooliAt</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">Welcome${firstName ? `, ${escapeHtml(firstName)}` : ""}</h2>
        <p>Your employee account has been created. Use the credentials below to sign in to the SchooliAt portal.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0; color: #666;">Public user ID</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${escapeHtml(publicUserId)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email (login)</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(loginEmail)}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Temporary password</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace;">${escapeHtml(password)}</td></tr>
        </table>
        <p style="color: #666; font-size: 14px;">Please change your password after first login.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: "Your SchooliAt employee account",
    html,
  });
};

/**
 * Welcome email for new student (admission confirmation).
 * Includes app link + login credentials + optional admission form PDF attachment.
 */
const sendStudentWelcomeEmail = async ({
  to,
  studentName,
  parentName,
  schoolName,
  loginEmail,
  publicUserId,
  password,
  className,
  rollNumber,
  admissionFormBuffer,
  admissionFormName,
}) => {
  const appStoreLink = process.env.SCHOOLIAT_APP_LINK || "https://play.google.com/store/apps";
  const dashboardLink =
    process.env.FRONTEND_URL || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admission Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
        <p style="margin: 5px 0 0; font-size: 13px;">Admission Confirmation</p>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">Admission Confirmed!</h2>
        <p>Dear ${escapeHtml(parentName || "Parent")},</p>
        <p>We are pleased to confirm the admission of <strong>${escapeHtml(studentName)}</strong> to <strong>${escapeHtml(schoolName || "our school")}</strong>.</p>
        ${className ? `<p><strong>Class:</strong> ${escapeHtml(className)}</p>` : ""}
        ${rollNumber ? `<p><strong>Roll Number:</strong> ${escapeHtml(String(rollNumber))}</p>` : ""}
        <p>Below are the login credentials for the student portal:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border: 1px solid #e0e0e0;">
          <tr><td style="padding: 8px 12px; color: #666; border-bottom: 1px solid #eee;">Student Name</td><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">${escapeHtml(studentName)}</td></tr>
          <tr><td style="padding: 8px 12px; color: #666; border-bottom: 1px solid #eee;">Admission No</td><td style="padding: 8px 12px; font-weight: bold; font-family: monospace; border-bottom: 1px solid #eee;">${escapeHtml(publicUserId)}</td></tr>
          <tr><td style="padding: 8px 12px; color: #666; border-bottom: 1px solid #eee;">Login Email</td><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">${escapeHtml(loginEmail)}</td></tr>
          <tr><td style="padding: 8px 12px; color: #666;">Temporary Password</td><td style="padding: 8px 12px; font-weight: bold; font-family: monospace;">${escapeHtml(password)}</td></tr>
        </table>
        ${admissionFormBuffer ? `<p>A copy of the admission form is attached to this email for your records.</p>` : ""}
        <p style="margin: 24px 0 8px;"><strong>Get the SchooliAt app</strong></p>
        <div style="text-align: center; margin: 12px 0;">
          <a href="${appStoreLink}" style="background-color: #6f8f3e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Download the SchooliAt App</a>
        </div>
        <p style="text-align: center; color: #666; font-size: 13px; margin: 8px 0 24px;">
          Available on Google Play Store
        </p>
        <p>Or log in from the web dashboard: <a href="${dashboardLink}" style="color: #6f8f3e;">${dashboardLink}</a></p>
        <p style="color: #666; font-size: 14px;">Please change the password after first login.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Admission Confirmed - ${studentName} | ${schoolName || "SchooliAt"}`,
    html,
    ...(admissionFormBuffer
      ? {
          attachments: [
            {
              filename: admissionFormName || "Admission-Form.pdf",
              content: admissionFormBuffer,
              contentType: "application/pdf",
            },
          ],
        }
      : {}),
  });
};

/**
 * Sent to the school when a student's admission form is edited after admission.
 */
const sendAdmissionFormUpdatedEmail = async ({
  to,
  studentName,
  schoolName,
  loginEmail,
  publicUserId,
  admissionFormBuffer,
  admissionFormName,
  updatedAt,
}) => {
  const dashboardLink = process.env.FRONTEND_URL || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admission Form Updated</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #6f8f3e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">SchooliAt</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0;">
        <h2 style="color: #6f8f3e; margin-top: 0;">Admission Form Updated</h2>
        <p>Dear Parent/Guardian,</p>
        <p>The admission form for <strong>${escapeHtml(studentName)}</strong> at <strong>${escapeHtml(schoolName || "our school")}</strong> was updated ${updatedAt ? `on <strong>${escapeHtml(updatedAt)}</strong>` : "recently"}.</p>
        <p>The latest copy of the admission form is attached. Your login details remain unchanged.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border: 1px solid #e0e0e0;">
          <tr><td style="padding: 8px 12px; color: #666; border-bottom: 1px solid #eee;">Admission No</td><td style="padding: 8px 12px; font-weight: bold; font-family: monospace; border-bottom: 1px solid #eee;">${escapeHtml(publicUserId)}</td></tr>
          <tr><td style="padding: 8px 12px; color: #666;">Login Email</td><td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #eee;">${escapeHtml(loginEmail)}</td></tr>
        </table>
        <p>Web dashboard: <a href="${dashboardLink}" style="color: #6f8f3e;">${dashboardLink}</a></p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
          This is an automated message from SchooliAt.
        </p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `Admission Form Updated - ${studentName}`,
    html,
    ...(admissionFormBuffer
      ? {
          attachments: [
            {
              filename: admissionFormName || "Admission-Form-Updated.pdf",
              content: admissionFormBuffer,
              contentType: "application/pdf",
            },
          ],
        }
      : {}),
  });
};

const emailService = {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendSchoolAdminWelcomeEmail,
  sendEmployeeWelcomeEmail,
  sendStudentWelcomeEmail,
  sendAdmissionFormUpdatedEmail,
  verifySmtpIfConfigured,
  resetEmailTransporter,
};

export default emailService;

