import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment.js';
import { IJwtPayload } from '../types/auth.types.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateAccessToken(payload: IJwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(payload: IJwtPayload): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): IJwtPayload {
  return jwt.verify(token, config.JWT_SECRET) as IJwtPayload;
}

export function verifyRefreshToken(token: string): IJwtPayload {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as IJwtPayload;
}

export async function hashToken(token: string): Promise<string> {
  return await bcrypt.hash(token, 10);
}

export async function compareToken(token: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(token, hash);
}
