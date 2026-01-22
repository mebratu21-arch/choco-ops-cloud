import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { config } from '../config/environment.js';
import { logger } from '../config/logger.js';
import { UserRepository } from '../repositories/user.repository.js';
import { 
  ILoginRequest, 
  IRegisterRequest, 
  IAuthResponse, 
  IJwtPayload 
} from '../types/auth.types.js';
import { 
  UnauthorizedError, 
  ConflictError,
} from '../utils/errors.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  hashToken,
  verifyRefreshToken
} from '../utils/jwt.js';

export class AuthService {
  static async register(data: IRegisterRequest): Promise<IAuthResponse> {
    const existingUser = await UserRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email: data.email });
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);

    const user = await UserRepository.create({
      email: data.email,
      name: data.name,
      role: data.role,
      password_hash: hashedPassword,
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const hashedRefreshToken = await hashToken(refreshToken);

    await db('refresh_tokens').insert({
      user_id: user.id,
      hashed_token: hashedRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  static async login(data: ILoginRequest): Promise<IAuthResponse> {
    const user = await UserRepository.findByEmail(data.email);
    if (!user || !user.is_active) {
      logger.warn('Login attempt with invalid credentials', { email: data.email });
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password_hash);
    if (!isValidPassword) {
      logger.warn('Login failed - wrong password', { userId: user.id });
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const hashedRefreshToken = await hashToken(refreshToken);

    await db('refresh_tokens').insert({
      user_id: user.id,
      hashed_token: hashedRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await UserRepository.updateLastLogin(user.id);

    logger.info('User logged in successfully', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  static async logout(userId: string): Promise<void> {
    await db('refresh_tokens')
      .where({ user_id: userId })
      .del();
    
    logger.info('User logged out', { userId });
  }

  static async refreshTokens(refreshToken: string): Promise<{ access_token: string }> {
    const payload = verifyRefreshToken(refreshToken);
    const user = await UserRepository.findById(payload.id);
    
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const storedToken = await db('refresh_tokens')
      .where({ user_id: user.id })
      .first();
    
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token revoked');
    }

    const newPayload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(newPayload);

    logger.info('Tokens refreshed', { userId: user.id });

    return { access_token: newAccessToken };
  }
}
