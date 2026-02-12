
import { aiService } from './src/services/aiService';
import * as dotenv from 'dotenv';
dotenv.config();

async function testTranslation() {
  console.log('--- TESTING INSTRUCTION TRANSLATION ---');
  
  const instructions = "Step 1: Melt the dark chocolate in a double boiler.\nStep 2: Add the heavy cream and stir until smooth.\nStep 3: Let it cool for 30 minutes.";
  const languages = ['am', 'he', 'ru'];

  for (const lang of languages) {
    try {
      console.log(`\nTranslating to: ${lang}...`);
      const result = await aiService.translateText(instructions, lang);
      console.log(`Result:\n${result}`);
    } catch (error: any) {
      console.error(`Error for ${lang}: ${error.message}`);
    }
  }

  process.exit(0);
}

testTranslation();
