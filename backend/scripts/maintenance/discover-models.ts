
import * as dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function listAllModels() {
  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY not found');
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`;
  
  try {
    console.log('--- FETCHING ACCESSIBLE MODELS ---');
    const response = await fetch(url);
    const data: any = await response.json();
    
    if (response.ok) {
      if (data.models && data.models.length > 0) {
        console.log('✅ Found models:');
        data.models.forEach((m: any) => {
          console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
        });
      } else {
        console.log('⚠️ No models found for this key.');
      }
    } else {
      console.log('❌ Failed to fetch models:', data.error?.message || response.statusText);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }

  process.exit(0);
}

listAllModels();
