import { Router } from 'express';
import { getAllUsers, getUserById, updateProfile } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All user routes are protected
router.use(authenticateToken);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/me', updateProfile);

export default router;