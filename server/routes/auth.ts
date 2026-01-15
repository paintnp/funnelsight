import express from 'express';
import { auth } from '../lib/auth/factory.js';
import { storage } from '../lib/storage/factory.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth Route] Login attempt: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await auth.login(email, password);
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Route] Login error:', error.message);
    res.status(401).json({ error: error.message || 'Invalid credentials' });
  }
});

router.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    console.log(`[Auth Route] Signup attempt: ${email}`);

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    // Check if user already exists
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Auth adapter handles both Supabase Auth signup and database user creation
    const result = await auth.signup(email, password, name, role);

    res.json(result);
  } catch (error: any) {
    console.error('[Auth Route] Signup error:', error.message);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

router.post('/api/auth/logout', authMiddleware(), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    await auth.logout(token);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[Auth Route] Logout error:', error.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/api/auth/me', authMiddleware(), async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error: any) {
    console.error('[Auth Route] Get user error:', error.message);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
