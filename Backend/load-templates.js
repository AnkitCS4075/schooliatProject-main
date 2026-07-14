import templateLoaderService from './src/services/template-loader.service.js';

async function main() {
    console.log('Starting template loading...');
    try {
        await templateLoaderService.loadAllTemplates();
        console.log('Template loading complete.');
    } catch (err) {
        console.error('Error loading templates:', err);
    } finally {
        process.exit(0);
    }
}

main();
