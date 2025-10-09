import { Router } from 'express';
import {
  googleAuth,
  googleCallback,
  getCurrentUser,
  logout,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

export default router;