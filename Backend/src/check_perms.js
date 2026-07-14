import prisma from './prisma/client.js';
async function main() {
  const adminRole = await prisma.role.findFirst({ where: { name: 'SCHOOL_ADMIN' } });
  if (adminRole) {
    console.log('SCHOOL_ADMIN permissions:', adminRole.permissions.length);
    console.log('SCHOOL_ADMIN has STAFF perms?', adminRole.permissions.some(p => p.includes('STAFF')));
    if (!adminRole.permissions.some(p => p.includes('STAFF'))) {
       console.log('Adding STAFF permissions to SCHOOL_ADMIN');
       await prisma.role.update({
         where: { id: adminRole.id },
         data: { permissions: { push: ['CREATE_STAFF', 'GET_STAFF', 'EDIT_STAFF', 'DELETE_STAFF'] } }
       });
       console.log('Permissions added.');
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
