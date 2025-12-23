import express from 'express';
import { AuthService } from '../services/AuthService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const { user, token } = await AuthService.register(username, email, password);
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ user, token });
    
  } catch (error: any) {
    console.error('[Auth API] Register error:', error);
    res.status(error.statusCode || 500).json({ 
      error: error.message || 'Registration failed' 
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    const { user, token } = await AuthService.login(usernameOrEmail, password);
    
    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ user, token });
    
  } catch (error: any) {
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
    
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
    
  } catch (error: any) {
    console.error('[Auth API] Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
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