import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../../config/db';
import { DatabaseHelpers } from '../../common/utils/database.helpers';

export const AuthService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string) {
    // 1. Find user
    const user = await db('users').where('email', email).first();
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // 3. Generate Token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role_id,
        email: user.email 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    // 4. Update last login
    await db('users')
      .where('id', user.id)
      .update({ last_login: new Date() });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      },
      token
    };
  }
};
