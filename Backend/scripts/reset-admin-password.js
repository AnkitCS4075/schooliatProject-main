/**
 * Reset Admin Password Script
 * 
 * This script resets the admin user password to match the seed script default.
 * Usage: node scripts/reset-admin-password.js [staging|production|both]
 */

import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";
import config from "../src/config.js";
import logger from "../src/config/logger.js";

const ADMIN_EMAIL = "admin@schooliat.com";
const ADMIN_PASSWORD = "Admin@123";

async function resetAdminPassword() {
  try {
    logger.info(`Resetting admin password for: ${config.ENVIRONMENT}`);
    
    const user = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (!user) {
      logger.error(`Admin user not found: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    if (user.deletedAt !== null) {
      logger.error(`Admin user is deleted: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info(`Admin password reset successfully for ${ADMIN_EMAIL} in ${config.ENVIRONMENT}`);
    
    // Verify the password
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    const passwordMatches = await bcryptjs.compare(ADMIN_PASSWORD, updatedUser.password);
    if (passwordMatches) {
      logger.info(`Password verification successful`);
    } else {
      logger.error(`Password verification failed`);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error({ error }, "Failed to reset admin password");
    process.exit(1);
  }
}

resetAdminPassword();

