
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_FILE = path.resolve(process.cwd(), 'debug_startup.log');

const debugLog = (msg: string) => {
    try {
        fs.appendFileSync(LOG_FILE, `[ENV] ${new Date().toISOString()} - ${msg}\n`);
    } catch (e) {
        // ignore
    }
};

debugLog('Starting environment loading...');

// Search for .env in current and parent directories until found or root reached
let currentPath = __dirname;
let envPath = '';
debugLog(`Searching for .env starting from: ${currentPath}`);

try {
    while (currentPath !== path.parse(currentPath).root) {
        const potentialPath = path.resolve(currentPath, '.env');
        if (fs.existsSync(potentialPath)) {
            envPath = potentialPath;
            break;
        }
        currentPath = path.dirname(currentPath);
    }

    if (!envPath) {
        // Last resort: check root of project relative to backend
        envPath = path.resolve(__dirname, '../../../.env');
        debugLog(`Checking fallback path: ${envPath}`);
    }

    if (fs.existsSync(envPath)) {
        debugLog(`Found .env at: ${envPath}`);
        const result = dotenv.config({ path: envPath });
        if (result.error) {
           debugLog(`Error loading dotenv: ${result.error.message}`);
           throw result.error;
        }
    } else {
        debugLog('❌ .env file NOT found');
    }
} catch (error: any) {
    debugLog(`CRITICAL ERROR loading environment: ${error.message}\n${error.stack}`);
}

debugLog('🔧 Loading Environment Variables...');
debugLog(`  GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'Set' : 'Missing'}`);
debugLog(`  ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'Set' : 'Missing'}`);

export const config = {
  PORT: 3005,
  JWT_SECRET: process.env.JWT_SECRET || 'default-dev-secret',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_EXPIRY: '8h',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  TELEMETRY_INTERVAL_MS: 5000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
};

if (!config.JWT_SECRET) {
  debugLog('❌ FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

debugLog('Environment configuration loaded successfully.');
