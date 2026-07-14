import prisma from './src/prisma/client.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();



async function main() {
    try {
        const roleId = await prisma.role.findFirst({ where: { name: 'SUPER_ADMIN' } });
        if (!roleId) {
            console.log('No SUPER_ADMIN role found');
            process.exit(1);
        }

        const user = await prisma.user.findFirst({
            where: { roleId: roleId.id }
        });

        if (!user) {
            console.log('No super admin found');
            process.exit(1);
        }

        const token = jwt.sign(
            { data: { user: { id: user.id } } },
            process.env.JWT_SECRET || 'your-secret-key-123!@#',
            { expiresIn: '24h', issuer: 'SchooliAT' }
        );

        console.log('Got token for', user.email);

        const res = await fetch('http://localhost:3001/api/v1/grievances/c42fad7f-49ab-4877-ba71-20f160c46233', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.dir(data, { depth: null });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
