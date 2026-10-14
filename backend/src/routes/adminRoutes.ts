import { Router } from 'express';
import { 
  getAdminMetrics, 
  listAllUsers, 
  toggleUserStatus, 
  getAuditLogs, 
  getBlockchainTransactions 
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Admin-only endpoints
router.use(authenticate, requireRole(['ADMIN']));

router.get('/metrics', getAdminMetrics);
router.get('/users', listAllUsers);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/transactions', getBlockchainTransactions);

export default router;
