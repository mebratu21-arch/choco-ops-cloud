import { db } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, LoginCredentials, RegisterData, AuthResponse, JWTPayload } from '../types/index.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const JWT_EXPIRES_IN = '24h';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, full_name, role, language_preference } = data as any;

    // Check if user exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      throw new Error('User already exists with this email.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password || 'Default123!', SALT_ROUNDS);

    // Create user
    const [newUser] = await db('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        role,
        language_preference: language_preference || 'en',
        is_active: true
      })
      .returning(['id', 'email', 'full_name', 'role', 'language_preference', 'is_active', 'created_at', 'updated_at']);

    // Generate token
    const token = this.generateToken(newUser);

    return { token, user: newUser };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user
    const user = await db('users').where({ email }).first();
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password || '', user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Generate token
    const token = this.generateToken(userWithoutPassword as User);

    return { token, user: userWithoutPassword as User };
  }

  /**
   * Generate JWT Token
   */
  private generateToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Get current user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const user = await db('users')
      .where({ id })
      .select('id', 'email', 'full_name', 'role', 'language_preference', 'is_active', 'created_at', 'updated_at')
      .first();
    
    return user || null;
  }
}

export const authService = new AuthService();
