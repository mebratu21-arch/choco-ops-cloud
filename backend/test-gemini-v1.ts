
import * as dotenv from 'dotenv';
dotenv.config();

const GEMINI_KEY = process.env.GEMINI_API_KEY;

async function testGeminiFetch() {
  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY not found');
    process.exit(1);
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  
  try {
    console.log('--- TESTING GEMINI V1 FETCH ---');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Translate 'Step 1: Roast cocoa beans' to Russian. Return only the translation." }]
        }]
      })
    });

    const data: any = await response.json();
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', data.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ Failed:', data.error?.message || response.statusText);
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
  }

  process.exit(0);
}

testGeminiFetch();
