// @ts-ignore
import CircuitBreaker from 'opossum';
import { logger } from '../config/logger.js';

/**
 * Options for the circuit breaker
 */
const breakerOptions = {
  timeout: 10000, // Wait 10 seconds for service
  errorThresholdPercentage: 50, // Open circuit if 50% operations fail
  resetTimeout: 30000, // Try to close after 30 seconds
};

/**
 * Creates a circuit breaker for a given function
 */
export function createBreaker(action: (...args: any[]) => Promise<any>, name: string) {
  const breaker = new CircuitBreaker(action, breakerOptions);

  breaker.on('open', () => logger.error(`${name} circuit opened`));
  breaker.on('halfOpen', () => logger.warn(`${name} circuit half-open`));
  breaker.on('close', () => logger.info(`${name} circuit closed`));
  breaker.on('fallback', (err: any) => logger.warn(`${name} falling back`, { error: err.message }));

  return breaker;
}
