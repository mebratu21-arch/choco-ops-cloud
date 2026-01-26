import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { JWTPayload, User } from '../types/index.js';
import { Audit } from '../utils/audit.js';

export class AuthService {
  /**
   * Register a new user with transaction and audit logging
   */
  static async register(input: { email: string; password_hash: string; role?: string; name?: string }, ipAddress?: string, userAgent?: string) {
    return await db.transaction(async (trx) => {
      // 1. Create user
      const [user] = await trx('users')
        .insert({
          id: uuidv4(),
          email: input.email,
          password: input.password_hash,
          role: input.role || 'OPERATOR',
          name: input.name || null,
          is_active: true,
          created_at: trx.fn.now(),
          updated_at: trx.fn.now(),
        })
        .returning(['id', 'email', 'role', 'name']);

      // 2. Audit log
      await Audit.logAction(user.id, 'USER_REGISTERED', 'users', { 
        email: user.email, 
        role: user.role,
        ip: ipAddress,
        userAgent
      }, trx);

      return user;
    });
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, parseInt(env.BCRYPT_ROUNDS || '10'));
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: JWTPayload): string {
    return jwt.sign({ ...payload }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as any,
    });
  }

  static generateRefreshToken(): string {
    return uuidv4();
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  }

  static async saveRefreshToken(userId: string, token: string, trx?: any): Promise<void> {
    const connection = trx || db;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 
    
    await connection('refresh_tokens').insert({
      id: uuidv4(),
      token,
      user_id: userId,
      expires_at: expiresAt,
    });
  }

  static async validateRefreshToken(token: string): Promise<User | null> {
    const refreshToken = await db('refresh_tokens')
      .where({ token })
      .andWhere('expires_at', '>', new Date())
      .first();

    if (!refreshToken) return null;

    const user = await db('users')
      .where({ id: refreshToken.user_id, is_active: true })
      .first();

    return user || null;
  }

  static async revokeRefreshToken(token: string): Promise<void> {
    await db('refresh_tokens').where({ token }).delete();
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    await db('refresh_tokens').where({ user_id: userId }).delete();
  }
}
