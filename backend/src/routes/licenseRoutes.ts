import { Router } from 'express';
import { 
  issueLicense, 
  simulatePurchaseCheckout, 
  getPublisherLicenses, 
  getCustomerLicenses, 
  getLicenseDetails, 
  revokeLicense, 
  renewLicense,
  activateLicense,
  deactivateLicense
} from '../controllers/licenseController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Publisher & Admin issuance
router.post('/issue', authenticate, requireRole(['ADMIN', 'PUBLISHER']), issueLicense);
router.get('/publisher', authenticate, requireRole(['ADMIN', 'PUBLISHER']), getPublisherLicenses);
router.post('/revoke', authenticate, requireRole(['ADMIN', 'PUBLISHER']), revokeLicense);

// Customer checkout & retrieval
router.post('/checkout', authenticate, simulatePurchaseCheckout);
router.get('/customer', authenticate, getCustomerLicenses);

// Device activation / deactivation
router.post('/:idOrOnChainId/activate', authenticate, activateLicense);
router.post('/:idOrOnChainId/deactivate', authenticate, deactivateLicense);

// General license lookup & renewal
router.get('/:idOrOnChainId', authenticate, getLicenseDetails);
router.post('/renew', authenticate, renewLicense);

export default router;
