import { db } from '../config/database.js';
import { logger } from '../config/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class Audit {
  /**
   * Logs a user action to the audit_logs table
   */
  static async logAction(
    userId: string | undefined, 
    action: string, 
    resource: string, 
    details: any = {},
    trx?: any
  ): Promise<void> {
    try {
      const connection = trx || db;
      await connection('audit_logs').insert({
        id: uuidv4(),
        user_id: userId || null,
        action,
        resource,
        resource_id: details.resourceId || details.id || details.batchId || null,
        details: JSON.stringify(details),
        created_at: new Date(),
      });
    } catch (error) {
      logger.error('Audit log failed', { error, action, resource });
      // We don't throw here to avoid interrupting the main business transaction
    }
  }
}
