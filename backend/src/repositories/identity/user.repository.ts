import { db } from '../../config/database.js';
import { User as IUser } from '../../types/index.js';

export class UserRepository {
  static async findById(id: string, trx?: any): Promise<IUser | undefined> {
    const connection = trx || db;
    return await connection('users')
      .where({ id, deleted_at: null })
      .first();
  }

  static async findByEmail(email: string, trx?: any): Promise<IUser | undefined> {
    const connection = trx || db;
    return await connection('users')
      .where({ email: email.toLowerCase(), deleted_at: null })
      .first();
  }

  static async create(userData: Partial<IUser>, trx?: any): Promise<IUser> {
    const connection = trx || db;
    const [user] = await connection('users')
      .insert({
        ...userData,
        email: userData.email?.toLowerCase(),
      })
      .returning('*');
    return user;
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db('users')
      .where({ id })
      .update({ last_login_at: new Date() });
  }

  static async deactivate(id: string, trx?: any): Promise<void> {
    const connection = trx || db;
    await connection('users')
      .where({ id })
      .update({ 
        is_active: false,
        deleted_at: new Date(),
      });
  }
}
