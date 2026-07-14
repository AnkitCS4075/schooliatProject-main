
import "dotenv/config";
import prisma from './src/prisma/client.js';

async function main() {
    const roles = await prisma.role.findMany({
        where: { deletedAt: null }
    });

    console.log("Current Database Roles and Permissions:");
    roles.forEach(role => {
        console.log(`Role: ${role.name}`);
        console.log(`Permissions (${role.permissions.length}): ${JSON.stringify(role.permissions)}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
