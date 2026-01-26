import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { AuditLogEntry } from '../types/index.js';
import { logger } from '../config/logger.js';

class AuditService {
  async logAction(entry: AuditLogEntry): Promise<void> {
    try {
      await db('audit_logs').insert({
        id: uuidv4(),
        user_id: entry.user_id || null,
        action: entry.action,
        resource: entry.resource,
        resource_id: entry.resource_id || null,
        changes: entry.changes ? JSON.stringify(entry.changes) : null,
        ip_address: entry.ip_address || null,
        user_agent: entry.user_agent || null,
        created_at: new Date(),
      });
    } catch (error) {
      logger.error('Audit log error:', error);
      // Don't throw - audit logging shouldn't break the main flow
    }
  }
}

export const auditService = new AuditService();
