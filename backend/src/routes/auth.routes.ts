import express from 'express';
import { AuthService } from '../services/AuthService.js';
import { authMiddleware } from '../middleware/auth.js';
import { hybridAuthLimiter } from '../middleware/hybridAuthRateLimit.js';

const router = express.Router();

// ✅ FREE TIER: Cross-origin cookie configuration
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,                    // ✅ XSS protection
    secure: isProduction,              // ✅ HTTPS only in production
    sameSite: 'none' as const,         // ✅ CRITICAL: Allow cross-origin (GitHub Pages → Fly.io)
    maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
    path: '/',
    // ⚠️ NO domain setting (causes issues with Fly.io)
  };
};

/**
 * POST /api/auth/register
 * Register new user with hybrid rate limiting
 */
router.post('/register', async (req, res): Promise<void> => {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const identifier = req.body.email?.toLowerCase().trim();

  try {
    // ✅ Tier 1: Check IP rate limit (20 attempts/15min - anti-bot)
    if (!hybridAuthLimiter.checkIPLimit(clientIP)) {
      console.warn(`[Auth API] IP rate limit exceeded: ${clientIP}`);
      res.status(429).json({
        error: 'Too many requests from your network. Please try again later.'
      });
      return;
    }

    const { username, email, password } = req.body;

    const { user, token } = await AuthService.register(username, email, password);

    // Set httpOnly cookie with cross-origin support
    res.cookie('token', token, getCookieOptions());

    res.json({ user, token });

  } catch (error: any) {
    // Record failure for IP tracking (registration spam prevention)
    hybridAuthLimiter.recordFailure(clientIP, identifier);

    console.error('[Auth API] Register error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user with hybrid rate limiting
 * - Tier 1: IP-based (20 failures/15min) - blocks distributed attacks
 * - Tier 2: User-based (5 failures/15min) - blocks credential stuffing
 */
router.post('/login', async (req, res): Promise<void> => {
  const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
  const identifier = req.body.usernameOrEmail?.toLowerCase().trim();

  try {
    // ✅ Tier 1: Check IP rate limit (20 attempts/15min - anti-bot)
    if (!hybridAuthLimiter.checkIPLimit(clientIP)) {
      console.warn(`[Auth API] IP rate limit exceeded: ${clientIP}`);
      res.status(429).json({
        error: 'Too many requests from your network. Please try again later.'
      });
      return;
    }

    // ✅ Tier 2: Check user rate limit (5 attempts/15min - anti-credential stuffing)
    if (identifier && !hybridAuthLimiter.checkUserLimit(identifier)) {
      console.warn(`[Auth API] User rate limit exceeded: ${identifier}`);
      res.status(429).json({
        error: 'Too many failed login attempts for this account. Please try again in 15 minutes.'
      });
      return;
    }

    const { usernameOrEmail, password } = req.body;

    const { user, token } = await AuthService.login(usernameOrEmail, password);

    // ✅ Success: Clear user's failure counter (IP counter persists for bot detection)
    if (identifier) {
      hybridAuthLimiter.clearAttempts(identifier);
    }

    // Set httpOnly cookie with cross-origin support
    res.cookie('token', token, getCookieOptions());

    res.json({ user, token });

  } catch (error: any) {
    // ❌ Failure: Record for both IP and user tracking
    hybridAuthLimiter.recordFailure(clientIP, identifier);

    console.error('[Auth API] Login error:', error);
    res.status(error.statusCode || 500).json({
      error: error.message || 'Login failed'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      await AuthService.logout(token);
    }

    res.clearCookie('token', getCookieOptions());
    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error: any) {
    console.error('[Auth API] Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post('/logout-all', authMiddleware, async (req, res) => {
  try {
    await AuthService.logoutAll(req.user!.id);
    res.clearCookie('token', getCookieOptions());
    res.json({ success: true, message: 'Logged out from all devices' });
  } catch (error: any) {
    console.error('[Auth API] Logout all error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /api/auth/sessions
 * Get list of active sessions
 */
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await AuthService.getActiveSessions(req.user!.id);
    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default router;