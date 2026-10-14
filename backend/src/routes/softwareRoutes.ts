import { Router } from 'express';
import { listSoftware, getSoftwareByIdOrSlug, createSoftware, updateSoftware, deleteSoftware } from '../controllers/softwareController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public browse
router.get('/', listSoftware);
router.get('/:idOrSlug', getSoftwareByIdOrSlug);

// Publisher / Admin actions
router.post('/', authenticate, requireRole(['ADMIN', 'PUBLISHER']), createSoftware);
router.put('/:id', authenticate, requireRole(['ADMIN', 'PUBLISHER']), updateSoftware);
router.delete('/:id', authenticate, requireRole(['ADMIN', 'PUBLISHER']), deleteSoftware);

export default router;

