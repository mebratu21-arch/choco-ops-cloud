import { v4 as uuidv4 } from 'uuid';

/**
 * Formats a number as currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

/**
 * Generates a unique batch number
 */
export const generateBatchNumber = (): string => {
  return `BATCH-${new Date().getFullYear()}-${uuidv4().substring(0, 8).toUpperCase()}`;
};

/**
 * Rounds a number to 2 decimal places safely
 */
export const safeFloat = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};
