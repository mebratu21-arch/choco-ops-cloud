import { env } from './env.js';

/**
 * Feature flags for the application
 * Enabled via environment variables
 */
export const features = {
  AI_CHATBOT: env.NODE_ENV === 'development' || process.env.ENABLE_AI_CHATBOT === 'true',
  MISSILE_ALERTS: process.env.ENABLE_MISSILE_ALERTS === 'true',
  ADVANCED_REPORTS: process.env.ENABLE_ADVANCED_REPORTS === 'true',
};
