import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
async function main() {
    const templates = await prisma.template.findMany();
    console.dir(templates, { depth: null });
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
