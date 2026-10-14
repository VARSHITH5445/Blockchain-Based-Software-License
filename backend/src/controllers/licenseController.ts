import { Request, Response } from 'express';
import { db } from '../services/prisma';
import { 
  issueLicenseSchema, 
  purchaseCheckoutSchema, 
  revokeLicenseSchema, 
  renewLicenseSchema,
  activateLicenseSchema 
} from '../validators/schemas';
import { blockchainSync } from '../services/blockchainSync';

export async function issueLicense(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = issueLicenseSchema.parse(req.body);

    const product = db.store.products.find(p => p.id === validated.productId);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    // Authorization: only publisher of product or admin
    if (product.publisherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'You are not authorized to issue licenses for this product.' });
    }

    const plan = db.store.plans.find(pl => pl.id === validated.planId);
    if (!plan) return res.status(404).json({ success: false, error: 'License plan not found' });

    // Find customer by wallet or ID or create placeholder
    let customer = db.store.users.find(
      u => (validated.customerId && u.id === validated.customerId) ||
           (u.walletAddress?.toLowerCase() === validated.customerWalletAddress.toLowerCase())
    );

    if (!customer) {
      customer = {
        id: `usr-cust-${Date.now()}`,
        email: `client.${validated.customerWalletAddress.slice(2, 8).toLowerCase()}@licensechain.org`,
        passwordHash: 'N/A',
        name: `Wallet Holder (${validated.customerWalletAddress.slice(0, 6)}...${validated.customerWalletAddress.slice(-4)})`,
        role: 'CUSTOMER',
        walletAddress: validated.customerWalletAddress,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.store.users.push(customer);
    }

    // Determine license type enum for smart contract:
    // 0 = PERPETUAL, 1 = SUBSCRIPTION, 2 = TRIAL, 3 = SEAT_BASED
    let licenseTypeEnum = 0;
    if (plan.licenseType === 'SUBSCRIPTION') licenseTypeEnum = 1;
    else if (plan.licenseType === 'TRIAL') licenseTypeEnum = 2;
    else if (plan.licenseType === 'SEAT_BASED') licenseTypeEnum = 3;

    const durationSeconds = plan.durationDays > 0 ? plan.durationDays * 86400 : (licenseTypeEnum !== 0 ? 365 * 86400 : 0);

    let onChainId = validated.onChainId;
    let txHash = validated.txHash;
    let blockNumber = 19854020;

    // Preliminary canonical metadata for hash
    const metaPayload = {
      product: product.name,
      plan: plan.name,
      type: plan.licenseType,
      maxSeats: plan.maxSeats,
      publisher: req.user.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      holder: validated.customerWalletAddress,
      issuedAt: new Date().toISOString(),
    };
    const metadataHash = blockchainSync.computeMetadataHash(metaPayload);

    // If txHash and onChainId were not supplied by frontend, execute directly on local smart contract
    if (!txHash || !onChainId) {
      const onChainRes = await blockchainSync.issueLicenseOnChain(
        product.slug,
        validated.customerWalletAddress,
        licenseTypeEnum,
        durationSeconds,
        plan.maxSeats,
        metadataHash
      );
      onChainId = onChainRes.onChainId;
      txHash = onChainRes.txHash;
      blockNumber = onChainRes.blockNumber;
    }

    const finalCanonicalMetadata = {
      ...metaPayload,
      licenseId: onChainId,
    };

    let expirationDate: Date | null = null;
    if (plan.durationDays > 0) {
      expirationDate = new Date(Date.now() + plan.durationDays * 86400000);
    }

    const licenseRecord = {
      id: `lic-meta-${onChainId}`,
      onChainId,
      productId: product.id,
      planId: plan.id,
      publisherId: req.user.id,
      customerId: customer.id,
      metadataHash,
      canonicalJson: JSON.stringify(finalCanonicalMetadata),
      onChainStatus: 'ISSUED' as const,
      txHash,
      expirationDate,
      maxSeats: plan.maxSeats,
      currentSeats: 0,
      revocationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.store.licenses.push(licenseRecord);

    blockchainSync.logTransaction({
      txHash,
      blockNumber,
      fromAddress: req.user.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      method: `issueLicense(${product.slug}, #${onChainId})`,
      eventName: 'LicenseIssued',
      status: 'CONFIRMED',
    });

    blockchainSync.logAudit(req.user.id, 'LICENSE_ISSUED', 'License', String(onChainId), {
      product: product.name,
      holderWallet: validated.customerWalletAddress,
      txHash,
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: `License #${onChainId} issued on blockchain and indexed in database.`,
      license: licenseRecord,
      verificationUrl: `/verify?id=${onChainId}`,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function simulatePurchaseCheckout(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = purchaseCheckoutSchema.parse(req.body);

    const product = db.store.products.find(p => p.id === validated.productId);
    if (!product) return res.status(404).json({ success: false, error: 'Software product not found' });

    const plan = db.store.plans.find(pl => pl.id === validated.planId);
    if (!plan) return res.status(404).json({ success: false, error: 'License plan not found' });

    // Determine license type enum
    let licenseTypeEnum = 0;
    if (plan.licenseType === 'SUBSCRIPTION') licenseTypeEnum = 1;
    else if (plan.licenseType === 'TRIAL') licenseTypeEnum = 2;
    else if (plan.licenseType === 'SEAT_BASED') licenseTypeEnum = 3;

    const durationSeconds = plan.durationDays > 0 ? plan.durationDays * 86400 : (licenseTypeEnum !== 0 ? 365 * 86400 : 0);

    const metaPayload = {
      product: product.name,
      plan: plan.name,
      type: plan.licenseType,
      maxSeats: plan.maxSeats,
      publisher: db.store.users.find(u => u.id === product.publisherId)?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      holder: validated.customerWalletAddress,
      issuedAt: new Date().toISOString(),
    };
    const metadataHash = blockchainSync.computeMetadataHash(metaPayload);

    // Call smart contract on-chain to mint genuine license
    const onChainRes = await blockchainSync.issueLicenseOnChain(
      product.slug,
      validated.customerWalletAddress,
      licenseTypeEnum,
      durationSeconds,
      plan.maxSeats,
      metadataHash
    );

    let expirationDate: Date | null = null;
    if (plan.durationDays > 0) {
      expirationDate = new Date(Date.now() + plan.durationDays * 86400000);
    }

    const licenseRecord = {
      id: `lic-meta-${onChainRes.onChainId}`,
      onChainId: onChainRes.onChainId,
      productId: product.id,
      planId: plan.id,
      publisherId: product.publisherId,
      customerId: req.user.id,
      metadataHash,
      canonicalJson: JSON.stringify({ ...metaPayload, licenseId: onChainRes.onChainId }),
      onChainStatus: 'ACTIVE' as const,
      txHash: onChainRes.txHash,
      expirationDate,
      maxSeats: plan.maxSeats,
      currentSeats: 1, // 1 seat activated
      revocationReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.store.licenses.push(licenseRecord);

    const purchase = {
      id: `purch-${Date.now()}`,
      metadataId: licenseRecord.id,
      buyerId: req.user.id,
      pricePaid: plan.priceDemo,
      txHash: onChainRes.txHash,
      status: 'CONFIRMED',
      createdAt: new Date(),
    };
    db.store.purchases.push(purchase);

    blockchainSync.logTransaction({
      txHash: onChainRes.txHash,
      blockNumber: onChainRes.blockNumber,
      fromAddress: validated.customerWalletAddress,
      method: `purchaseLicense(${product.slug}, #${onChainRes.onChainId})`,
      eventName: 'LicensePurchased',
      status: 'CONFIRMED',
    });

    blockchainSync.logAudit(req.user.id, 'LICENSE_PURCHASED', 'License', String(onChainRes.onChainId), {
      product: product.name,
      priceDemo: plan.priceDemo,
      txHash: onChainRes.txHash,
    });

    db.save();

    return res.status(201).json({
      success: true,
      message: `Demo purchase confirmed on blockchain. License #${onChainRes.onChainId} created.`,
      license: {
        ...licenseRecord,
        product,
        plan,
      },
      purchase,
      verificationUrl: `/verify?id=${onChainRes.onChainId}`,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function activateLicense(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { idOrOnChainId } = req.params;
    const validated = activateLicenseSchema.parse(req.body);

    const license = db.store.licenses.find(
      l => l.id === idOrOnChainId || String(l.onChainId) === idOrOnChainId
    );

    if (!license) {
      return res.status(404).json({ success: false, error: 'License record not found' });
    }

    if (license.onChainStatus === 'REVOKED') {
      return res.status(400).json({ success: false, error: 'Cannot activate a revoked license' });
    }

    if (license.currentSeats >= license.maxSeats) {
      return res.status(400).json({ success: false, error: `Seat limit reached (${license.currentSeats}/${license.maxSeats} active seats)` });
    }

    const deviceFingerprint = validated.deviceFingerprint || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    // Execute on-chain activation
    const onChainRes = await blockchainSync.activateLicenseOnChain(license.onChainId, deviceFingerprint);

    license.currentSeats += 1;
    if (license.onChainStatus === 'ISSUED') {
      license.onChainStatus = 'ACTIVE';
    }
    license.updatedAt = new Date();

    blockchainSync.logTransaction({
      txHash: onChainRes.txHash,
      blockNumber: onChainRes.blockNumber,
      fromAddress: req.user.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      method: `activateLicense(${license.onChainId}, ${validated.deviceName || 'Device'})`,
      eventName: 'LicenseActivated',
      status: 'CONFIRMED',
    });

    blockchainSync.logAudit(req.user.id, 'DEVICE_ACTIVATED', 'License', String(license.onChainId), {
      deviceFingerprint,
      deviceName: validated.deviceName,
      seats: `${license.currentSeats}/${license.maxSeats}`,
    });

    db.save();

    return res.json({
      success: true,
      message: `Device successfully activated on blockchain (${license.currentSeats}/${license.maxSeats} seats used).`,
      license,
      txHash: onChainRes.txHash,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function deactivateLicense(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { idOrOnChainId } = req.params;
    const license = db.store.licenses.find(
      l => l.id === idOrOnChainId || String(l.onChainId) === idOrOnChainId
    );

    if (!license) {
      return res.status(404).json({ success: false, error: 'License record not found' });
    }

    license.currentSeats = Math.max(0, license.currentSeats - 1);
    license.updatedAt = new Date();

    blockchainSync.logAudit(req.user.id, 'DEVICE_DEACTIVATED', 'License', String(license.onChainId), {
      remainingSeats: `${license.currentSeats}/${license.maxSeats}`,
    });

    db.save();

    return res.json({
      success: true,
      message: `Device deactivated. Available seats: ${license.maxSeats - license.currentSeats}`,
      license,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPublisherLicenses(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    let licenses = db.store.licenses;
    if (req.user.role !== 'ADMIN') {
      licenses = licenses.filter(l => l.publisherId === req.user?.id);
    }

    const populated = licenses.map(l => {
      const product = db.store.products.find(p => p.id === l.productId);
      const plan = db.store.plans.find(pl => pl.id === l.planId);
      const customer = db.store.users.find(u => u.id === l.customerId);
      return {
        ...l,
        product: product ? { id: product.id, name: product.name, slug: product.slug, version: product.version } : null,
        plan: plan ? { id: plan.id, name: plan.name, licenseType: plan.licenseType, durationDays: plan.durationDays } : null,
        customer: customer ? { id: customer.id, name: customer.name, walletAddress: customer.walletAddress } : null,
      };
    });

    return res.json({ success: true, count: populated.length, licenses: populated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCustomerLicenses(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    // Match by customer ID or wallet address
    const userWallet = req.user.walletAddress?.toLowerCase();
    const licenses = db.store.licenses.filter(l => {
      if (l.customerId === req.user?.id) return true;
      if (userWallet) {
        const cust = db.store.users.find(u => u.id === l.customerId);
        if (cust?.walletAddress?.toLowerCase() === userWallet) return true;
      }
      return false;
    });

    const populated = licenses.map(l => {
      const product = db.store.products.find(p => p.id === l.productId);
      const plan = db.store.plans.find(pl => pl.id === l.planId);
      const publisher = db.store.users.find(u => u.id === l.publisherId);
      return {
        ...l,
        product: product ? { id: product.id, name: product.name, slug: product.slug, version: product.version } : null,
        plan: plan ? { id: plan.id, name: plan.name, licenseType: plan.licenseType, durationDays: plan.durationDays } : null,
        publisher: publisher ? { id: publisher.id, name: publisher.name, walletAddress: publisher.walletAddress } : null,
      };
    });

    return res.json({ success: true, count: populated.length, licenses: populated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getLicenseDetails(req: Request, res: Response) {
  try {
    const { idOrOnChainId } = req.params;

    const license = db.store.licenses.find(
      l => l.id === idOrOnChainId || String(l.onChainId) === idOrOnChainId
    );

    if (!license) {
      return res.status(404).json({ success: false, error: 'License record not found' });
    }

    const product = db.store.products.find(p => p.id === license.productId);
    const plan = db.store.plans.find(pl => pl.id === license.planId);
    const publisher = db.store.users.find(u => u.id === license.publisherId);
    const customer = db.store.users.find(u => u.id === license.customerId);
    const tx = db.store.transactions.find(t => t.txHash === license.txHash);

    return res.json({
      success: true,
      license: {
        ...license,
        product,
        plan,
        publisher: publisher ? { id: publisher.id, name: publisher.name, walletAddress: publisher.walletAddress } : null,
        customer: customer ? { id: customer.id, name: customer.name, walletAddress: customer.walletAddress } : null,
        transaction: tx || null,
        verificationUrl: `/verify?id=${license.onChainId}`,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function revokeLicense(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = revokeLicenseSchema.parse(req.body);

    const license = db.store.licenses.find(l => l.onChainId === validated.licenseId);
    if (!license) return res.status(404).json({ success: false, error: 'License not found' });

    // Must be issuing publisher or admin
    if (license.publisherId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Only the issuing publisher or admin can revoke this license.' });
    }

    // Call smart contract on-chain to revoke license
    let txHash = validated.txHash;
    let blockNumber = 19854025;
    if (!txHash) {
      const onChainRes = await blockchainSync.revokeLicenseOnChain(validated.licenseId, validated.reason);
      txHash = onChainRes.txHash;
      blockNumber = onChainRes.blockNumber;
    }

    license.onChainStatus = 'REVOKED';
    license.revocationReason = validated.reason;
    license.updatedAt = new Date();

    blockchainSync.logTransaction({
      txHash,
      blockNumber,
      fromAddress: req.user.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      method: `revokeLicense(${license.onChainId}, "${validated.reason}")`,
      eventName: 'LicenseRevoked',
      status: 'CONFIRMED',
    });

    blockchainSync.logAudit(req.user.id, 'LICENSE_REVOKED', 'License', String(license.onChainId), {
      reason: validated.reason,
      txHash,
    });

    db.save();

    return res.json({
      success: true,
      message: `License #${license.onChainId} has been REVOKED on the blockchain and updated in registry.`,
      license,
      txHash,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function renewLicense(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const validated = renewLicenseSchema.parse(req.body);

    const license = db.store.licenses.find(l => l.onChainId === validated.licenseId);
    if (!license) return res.status(404).json({ success: false, error: 'License not found' });

    if (license.onChainStatus === 'REVOKED') {
      return res.status(400).json({ success: false, error: 'Cannot renew a revoked license.' });
    }

    let txHash = validated.txHash;
    let blockNumber = 19854026;
    if (!txHash) {
      const onChainRes = await blockchainSync.renewLicenseOnChain(validated.licenseId, validated.additionalDays * 86400);
      txHash = onChainRes.txHash;
      blockNumber = onChainRes.blockNumber;
    }

    const currentExp = license.expirationDate ? new Date(license.expirationDate).getTime() : Date.now();
    const baseTime = currentExp > Date.now() ? currentExp : Date.now();
    license.expirationDate = new Date(baseTime + validated.additionalDays * 86400000);
    license.onChainStatus = 'ACTIVE';
    license.updatedAt = new Date();

    blockchainSync.logTransaction({
      txHash,
      blockNumber,
      fromAddress: req.user.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      method: `renewLicense(${license.onChainId}, ${validated.additionalDays} days)`,
      eventName: 'LicenseRenewed',
      status: 'CONFIRMED',
    });

    blockchainSync.logAudit(req.user.id, 'LICENSE_RENEWED', 'License', String(license.onChainId), {
      newExpiration: license.expirationDate,
      txHash,
    });

    db.save();

    return res.json({
      success: true,
      message: `License #${license.onChainId} renewed until ${license.expirationDate.toLocaleDateString()}.`,
      license,
      txHash,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}
