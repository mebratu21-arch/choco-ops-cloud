import { db } from '../../config/database.js';
import { AuditLog } from '../../types/domain.types.js';

export class AuditRepository {
  static async findAll(limit: number = 100): Promise<AuditLog[]> {
    return db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select('audit_logs.*', 'users.email as user_email')
      .orderBy('audit_logs.created_at', 'desc')
      .limit(limit);
  }

  static async findById(id: string): Promise<AuditLog | undefined> {
    return db('audit_logs')
      .leftJoin('users', 'audit_logs.user_id', 'users.id')
      .select('audit_logs.*', 'users.email as user_email')
      .where('audit_logs.id', id)
      .first();
  }

  static async findByUser(userId: string): Promise<AuditLog[]> {
    return db('audit_logs')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  static async findByEntity(entityType: string, entityId?: string): Promise<AuditLog[]> {
    let query = db('audit_logs').where({ entity_type: entityType });
    if (entityId) query = query.where({ entity_id: entityId });
    return query.orderBy('created_at', 'desc');
  }

  static async findByAction(action: string): Promise<AuditLog[]> {
    return db('audit_logs')
      .where({ action })
      .orderBy('created_at', 'desc');
  }

  static async create(data: Partial<AuditLog>): Promise<AuditLog> {
    const [log] = await db('audit_logs')
      .insert(data)
      .returning('*');
    return log;
  }

  static async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return db('audit_logs')
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc');
  }

  static async countOpenMechanicIssues(since: Date): Promise<number> {
    const result = await db('audit_logs')
      .count('* as count')
      .where('action', 'MACHINE_FIX')
      .where('created_at', '>=', since)
      .first();
    return Number(result?.count || 0);
  }
}
