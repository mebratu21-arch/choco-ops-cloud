
import dotenv from 'dotenv';
// Load env before imports
dotenv.config();

import { aiService } from './src/services/aiService.js';

async function testChat() {
  console.log('--- Starting AI Verification ---');
  console.log('Environment Check:');
  console.log('DEEPSEEK_KEY:', process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing');
  console.log('ANTHROPIC_KEY:', process.env.ANTHROPIC_API_KEY ? 'Present' : 'Missing');
  console.log('GEMINI_KEY:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

  console.log('\n--- Testing Chat Response ---');
  try {
    const start = Date.now();
    const response = await aiService.generateChatResponse('Status of the factory?', 'en');
    const duration = Date.now() - start;
    
    console.log(`\n✅ Success (${duration}ms):`);
    console.log(response);
    
    // Check provider
    console.log('\nProvider used:', (aiService as any).provider || 'unknown');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testChat();
