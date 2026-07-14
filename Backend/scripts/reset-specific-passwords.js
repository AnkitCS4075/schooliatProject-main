#!/usr/bin/env node
/**
 * Reset passwords for specific email addresses
 * Usage: node scripts/reset-specific-passwords.js email1 email2 ...
 */

import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");

async function loadEnv() {
  if (!process.env.DATABASE_URL) {
    const dotenv = (await import("dotenv")).default;
    dotenv.config({ path: path.join(backendRoot, ".env") });
  }
}

async function hashPassword(password) {
  return bcryptjs.hash(password, 10);
}

async function generatePassword() {
  // Generate a random 12-character password
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function main() {
  await loadEnv();
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
    process.exit(1);
  }

  const emails = process.argv.slice(2);
  if (emails.length === 0) {
    console.log("Usage: node scripts/reset-specific-passwords.js email1 email2 ...");
    process.exit(1);
  }

  const updated = [];

  for (const email of emails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: { select: { name: true } } },
    });

    if (!user) {
      console.log(`User not found: ${email}`);
      continue;
    }

    const newPassword = await generatePassword();
    const hashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    updated.push({
      email: user.email,
      role: user.role?.name,
      password: newPassword,
    });

    console.log(`Reset password for ${email} (${user.role?.name}): ${newPassword}`);
  }

  console.log("");
  console.log("Done. Updated", updated.length, "users.");
  updated.forEach((u) => {
    console.log(`${u.role}: ${u.email} / ${u.password}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });