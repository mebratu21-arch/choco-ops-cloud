
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AiService } from './src/services/system/ai.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testTranslation() {
    console.log('--- DeepSeek Translation Test ---');
    console.log('Provider:', AiService.getProvider ? 'Supported' : 'System Service');
    
    const text = "Tempering chocolate at 32 degrees Celsius ensures perfect crystallization.";
    const languages = ['am', 'he', 'ru', 'ar'];

    for (const lang of languages) {
        console.log(`\nTranslating to [${lang}]...`);
        try {
            const result = await AiService.translate(text, lang, { domain: 'recipe' });
            console.log(`Result: ${result}`);
        } catch (error) {
            console.error(`Error translating to ${lang}:`, error.message);
        }
    }
}

testTranslation().then(() => process.exit(0));
