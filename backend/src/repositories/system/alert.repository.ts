import { db } from '../../config/database.js';

export interface Alert {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface AlertCreateInput {
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  status?: string;
}

export class AlertRepository {
  static async create(input: AlertCreateInput, trx?: any): Promise<Alert[]> {
    const connection = trx || db;
    return connection('alerts')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        message: input.message,
        priority: input.priority || 'MEDIUM',
        status: input.status || 'PENDING',
        created_at: connection.fn.now(),
        updated_at: connection.fn.now()
      })
      .returning('*');
  }

  static async findByUser(userId: string, limit = 10, offset = 0, trx?: any): Promise<Alert[]> {
    const connection = trx || db;
    return connection('alerts')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async markResolved(id: string, userId: string, trx?: any): Promise<Alert[]> {
    const connection = trx || db;
    return connection('alerts')
      .where({ id, user_id: userId })
      .update({
        status: 'RESOLVED',
        updated_at: connection.fn.now()
      })
      .returning('*');
  }
}
