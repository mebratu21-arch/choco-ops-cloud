import { Knex } from 'knex';
import db from '../../config/db';

/**
 * database.helpers.ts
 * Utility functions for database operations
 */

export const DatabaseHelpers = {
  /**
   * Set the current user context for Row-Level Security (RLS)
   * @param trx Knex transaction object
   * @param userId The ID of the authenticated user
   */
  async setUserContext(trx: Knex.Transaction, userId: string): Promise<void> {
    await trx.raw('SET LOCAL app.current_user_id = ?', [userId]);
  },

  /**
   * Check if the database connection is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      await db.raw('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  },

  /**
   * Safe transaction wrapper
   */
  async transaction<T>(callback: (trx: Knex.Transaction) => Promise<T>): Promise<T> {
    return db.transaction(async (trx) => {
      return callback(trx);
    });
  }
};
