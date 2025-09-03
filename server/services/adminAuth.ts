import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { AdminUser, InsertAdminUser } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';
const SALT_ROUNDS = 10;

export interface AdminAuthToken {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

export class AdminAuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(adminUser: AdminUser): string {
    const payload = {
      id: adminUser.id,
      username: adminUser.username,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  verifyToken(token: string): AdminAuthToken | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AdminAuthToken;
      return decoded;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  async createDefaultAdmin(): Promise<InsertAdminUser> {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log('Creating default admin with username:', adminUsername);

    const passwordHash = await this.hashPassword(adminPassword);

    return {
      username: adminUsername,
      passwordHash,
      isActive: true,
    };
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }
}

export const adminAuthService = new AdminAuthService();