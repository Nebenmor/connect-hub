import { Router } from 'express';
import {
  getConnections,
  sendConnectionRequest,
  acceptConnection,
  deleteConnection,
} from '../controllers/connectionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All connection routes are protected
router.use(authenticateToken);

router.get('/', getConnections);
router.post('/:userId', sendConnectionRequest);
router.put('/:id/accept', acceptConnection);
router.delete('/:id', deleteConnection);

export default router;