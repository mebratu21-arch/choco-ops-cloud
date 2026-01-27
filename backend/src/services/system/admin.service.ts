import { db } from '../../config/database.js';
import { logger } from '../../config/logger.js';
import { AdminRepository } from '../../repositories/system/admin.repository.js';
import { AdminUserInput } from '../../types/admin.types.js';
import bcrypt from 'bcryptjs';

export class AdminService {
  static async createUser(input: AdminUserInput, userId: string) {
    return db.transaction(async (trx) => {
      const hashedPassword = await bcrypt.hash('defaultpassword', 10);

      const [user] = await AdminRepository.createUser({
        email: input.email,
        name: input.name,
        role: input.role,
        is_active: input.is_active,
        password_hash: hashedPassword,
        created_by: userId,
      }, trx);

      await trx('audit_logs').insert({
        user_id: userId,
        action: 'USER_CREATED',
        resource: 'users',
        resource_id: user.id,
      });

      logger.info('User created by admin', { userId: user.id });

      return user;
    });
  }

  static async getAllUsers() {
    return AdminRepository.getAllUsers();
  }
}
