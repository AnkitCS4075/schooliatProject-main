import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const templates = await prisma.template.findMany();
    console.log('Templates found:', templates.length);
    if (templates.length > 0) {
        console.dir(templates[0], { depth: null });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
