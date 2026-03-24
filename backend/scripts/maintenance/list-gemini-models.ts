
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY not found');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  
  try {
    console.log('--- AVAILABLE GEMINI MODELS ---');
    // The SDK might not have a direct listModels, but we can try to see if it works with different names
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("ping");
        console.log(`✅ Model ${m} is available and working.`);
      } catch (e: any) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }

  process.exit(0);
}

listModels();
