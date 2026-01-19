import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';

/**
 * Express middleware to protect routes
 * Attaches user to req.user if authenticated
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Try to get token from cookie or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Verify token and get user
    const user = await AuthService.verifyToken(token) as {
      id: string;
      username: string;
      email: string;
      avatar: string | null;
      createdAt: Date;
      updatedAt: Date;
    };

    // Attach user to request
    req.user = user;

    next();

  } catch (error: any) {
    res.status(401).json({ error: error.message || 'Unauthorized' });
  }
}

/**
 * Optional auth - doesn't fail if no token
 * Just attaches user if token is valid
 */
export async function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const user = await AuthService.verifyToken(token) as {
        id: string;
        username: string;
        email: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
      req.user = user;
    }
  } catch (error) {
    // Ignore auth errors for optional middleware
  }

  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        avatar: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}