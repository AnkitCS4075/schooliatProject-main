import 'dotenv/config';
import prisma from './src/prisma/client.js';
import fileService from './src/services/file.service.js';

async function main() {
    try {
        const templates = await prisma.template.findMany({ 
            where: { type: 'ID_CARD' },
            take: 1
        });
        
        if (templates.length > 0) {
            const template = templates[0];
            const templatesWithUrls = templates.map((template) => ({
                ...template,
                imageUrl: template.imageId
                    ? fileService.attachFileURL({ id: template.imageId, extension: "png" })
                        .url
                    : null,
            }));
            console.log('Template with URL:', JSON.stringify(templatesWithUrls[0], null, 2));
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
