import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "../utils/errors.js";
import { logger } from "../lib/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET is missing or too short (min 32 chars). " +
    "Set it in .env before starting the server."
  );
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

export class AuthService {
  private static validatePasswordStrength(password: string): void {
    if (password.length < 12) {
      throw new ValidationError("Password must be at least 12 characters");
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const strength = [hasUpperCase, hasLowerCase, hasNumber, hasSpecial].filter(
      Boolean
    ).length;

    if (strength < 3) {
      throw new ValidationError(
        "Password must contain at least 3 of: uppercase, lowercase, number, special character"
      );
    }
  }

  /**
   * Register a new user
   */
  static async register(username: string, email: string, password: string) {
    // Validation
    if (!username || username.length < 3 || username.length > 20) {
      throw new ValidationError("Username must be 3-20 characters");
    }

    if (!email || !email.includes("@")) {
      throw new ValidationError("Valid email required");
    }

    if (!password) {
      throw new ValidationError("Password required");
    }

    this.validatePasswordStrength(password);

    // Sanitize username (alphanumeric only)
    const cleanUsername = username.replace(/[^a-zA-Z0-9_-]/g, "");
    if (cleanUsername !== username) {
      throw new ValidationError(
        "Username can only contain letters, numbers, - and _"
      );
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: email.toLowerCase() }],
      },
    });

    if (existing) {
      throw new ConflictError("Username or email already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Create session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, {
      expiresIn: TOKEN_EXPIRY,
    });
    const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS), // 7 days
      },
    });

    console.log(`[Auth] User registered: ${user.username}`);

    return { user, token };
  }

  /**
   * Login existing user
   */
  static async login(usernameOrEmail: string, password: string) {
    if (!usernameOrEmail || !password) {
      throw new ValidationError("Username/email and password required");
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail.toLowerCase() },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Create new session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET as string, {
      expiresIn: TOKEN_EXPIRY,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[Auth] User logged in: ${user.username}`);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    };
  }

  /**
   * Verify JWT token and return user
   */
  static async verifyToken(token: string) {
    try {
      // Verify JWT
      jwt.verify(token, JWT_SECRET as string);

      // Check session exists and not expired
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedError("Session not found");
      }

      if (session.expiresAt < new Date()) {
        // Clean up expired session
        await prisma.session.delete({ where: { token } });
        throw new UnauthorizedError("Session expired");
      }

      // Return user without password
      const { password, ...userWithoutPassword } = session.user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError("Invalid token");
    }
  }

  /**
   * Logout user (invalidate session)
   */
  static async logout(token: string) {
    try {
      await prisma.session.delete({ where: { token } });
      console.log("[Auth] User logged out");
    } catch (error) {
      // Session might not exist, that's okay
    }
  }

  /**
   * Logout from ALL devices (revoke all sessions)
   */
  static async logoutAll(userId: string) {
    const deleted = await prisma.session.deleteMany({
      where: { userId },
    });

    console.log(`[Auth] Revoked ${deleted.count} sessions for user ${userId}`);
  }

  /**
   * Get active sessions for a user (logged-in devices)
   */

  static async getActiveSessions(userId: string) {
    return await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Clean up expired sessions (call periodically)
   */
  static async cleanupExpiredSessions() {
    const deleted = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (deleted.count > 0) {
      logger.info("Expired sessions cleaned", {
        count: deleted.count,
        operation: "session_cleanup",
      });
    }
  }
}
