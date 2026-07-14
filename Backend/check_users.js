
import "dotenv/config";
import prisma from './src/prisma/client.js';

async function main() {
    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        include: {
            role: true
        }
    });

    console.log("Active Users and their Roles:");
    users.forEach(user => {
        console.log(`User: ${user.email} (${user.firstName})`);
        console.log(`Role: ${user.role?.name}`);
        console.log(`Permissions (${user.role?.permissions?.length}): ${JSON.stringify(user.role?.permissions)}`);
        console.log('---');
    });

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
