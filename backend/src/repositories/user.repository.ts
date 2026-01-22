import { db } from '../config/database.js';
import { IUser } from '../types/auth.types.js';

export class UserRepository {
  static async findById(id: string): Promise<IUser | undefined> {
    return await db('users')
      .where({ id, deleted_at: null })
      .first();
  }

  static async findByEmail(email: string): Promise<IUser | undefined> {
    return await db('users')
      .where({ email: email.toLowerCase(), deleted_at: null })
      .first();
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const [user] = await db('users')
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

  static async deactivate(id: string): Promise<void> {
    await db('users')
      .where({ id })
      .update({ 
        is_active: false,
        deleted_at: new Date(),
      });
  }
}
