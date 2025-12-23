import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

export class AuthService {
  
  /**
   * Register a new user
   */
  static async register(username: string, email: string, password: string) {
    // Validation
    if (!username || username.length < 3 || username.length > 20) {
      throw new ValidationError('Username must be 3-20 characters');
    }
    
    if (!email || !email.includes('@')) {
      throw new ValidationError('Valid email required');
    }
    
    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }
    
    // Sanitize username (alphanumeric only)
    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, '');
    if (cleanUsername !== username) {
      throw new ValidationError('Username can only contain letters, numbers, - and _');
    }
    
    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: email.toLowerCase() }
        ]
      }
    });
    
    if (existing) {
      throw new ConflictError('Username or email already taken');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: email.toLowerCase(),
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true
      }
    });
    
    // Create session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    console.log(`[Auth] User registered: ${user.username}`);
    
    return { user, token };
  }
  
  /**
   * Login existing user
   */
  static async login(usernameOrEmail: string, password: string) {
    if (!usernameOrEmail || !password) {
      throw new ValidationError('Username/email and password required');
    }
    
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() }
        ]
      }
    });
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Create new session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    console.log(`[Auth] User logged in: ${user.username}`);
    
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      },
      token
    };
  }
  
  /**
   * Verify JWT token and return user
   */
  static async verifyToken(token: string) {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Check session exists and not expired
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true }
      });
      
      if (!session) {
        throw new UnauthorizedError('Session not found');
      }
      
      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await prisma.session.delete({ where: { token } });
        throw new UnauthorizedError('Session expired');
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = session.user;
      return userWithoutPassword;
      
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid token');
    }
  }
  
  /**
   * Logout user (invalidate session)
   */
  static async logout(token: string) {
    try {
      await prisma.session.delete({ where: { token } });
      console.log('[Auth] User logged out');
    } catch (error) {
      // Session might not exist, that's okay
    }
  }
  
  /**
   * Clean up expired sessions (call periodically)
   */
  static async cleanupExpiredSessions() {
    const deleted = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    
    if (deleted.count > 0) {
      console.log(`[Auth] Cleaned up ${deleted.count} expired sessions`);
    }
  }
}