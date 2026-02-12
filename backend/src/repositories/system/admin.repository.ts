import { db } from '../../config/database.js';

export class AdminRepository {
  static async createUser(data: any, trx: any) {
    return trx('users').insert(data).returning('*');
  }

  static async getAllUsers() {
    return db('users')
      .select('*')
      .orderBy('created_at', 'desc');
  }

  static async findById(id: string) {
    return db('users')
      .select('*')
      .where({ id })
      .first();
  }

  static async updateUser(id: string, data: any, trx?: any) {
    const query = (trx || db)('users').where({ id });
    return query.update({ ...data, updated_at: new Date() }).returning('*');
  }

  static async deleteUser(id: string, trx?: any) {
    return (trx || db)('users').where({ id }).delete();
  }
}
