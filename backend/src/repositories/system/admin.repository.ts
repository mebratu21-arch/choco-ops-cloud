import { db } from '../../config/database.js';

export class AdminRepository {
  static async createUser(data: any, trx: any) {
    return trx('users').insert(data).returning('*');
  }

  static async getAllUsers() {
    return db('users')
      .select('*')
      .whereNull('deleted_at');
  }
}
