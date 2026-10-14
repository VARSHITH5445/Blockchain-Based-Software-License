import { Router } from 'express';
import { verifyLicensePublic } from '../controllers/verificationController';
import { verificationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public verification endpoint
router.get('/:licenseId', verificationLimiter, verifyLicensePublic);

export default router;
