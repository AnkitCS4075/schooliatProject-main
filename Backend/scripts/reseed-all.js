import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import roleService from "../src/services/role.service.js";
import prisma from "../src/prisma/client.js";
import bcryptjs from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.join(backendRoot, ".env") });
}
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/production/shared/.env" });
}
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: "/opt/schooliat/backend/staging/shared/.env" });
}

async function reseed() {
    if (!process.env.DATABASE_URL?.trim()) {
        console.error("DATABASE_URL is not set. Create Backend/.env or set DATABASE_URL.");
        process.exit(1);
    }
    try {
        console.log("Creating default roles...");
        await roleService.createDefaultRoles();
        await roleService.updateRolePermissions();

        console.log("Creating super admin...");
        // We want a known password for testing
        const superAdminRole = await prisma.role.findFirst({
            where: { name: 'SUPER_ADMIN' }
        });

        const ADMIN_EMAIL = "admin@schooliat.com";
        const ADMIN_PASSWORD = "Admin@123";

        const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
        if (existing) {
            await prisma.user.delete({ where: { id: existing.id } });
        }

        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                password: await bcryptjs.hash(ADMIN_PASSWORD, 10),
                roleId: superAdminRole.id,
                publicUserId: "ADMIN001",
                userType: "APP",
                firstName: "App",
                lastName: "Admin User",
                gender: "MALE",
                dateOfBirth: new Date("1990-01-01"),
                contact: "0000000000",
                address: [],
                createdBy: "system",
            },
        });

        console.log("Reseed complete. Admin: admin@schooliat.com / Admin@123");
        process.exit(0);
    } catch (error) {
        console.error("Reseed failed:", error);
        process.exit(1);
    }
}

reseed();
