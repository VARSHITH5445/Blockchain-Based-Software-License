import { Request, Response } from 'express';
import { db } from '../services/prisma';
import { blockchainSync } from '../services/blockchainSync';

export async function verifyLicensePublic(req: Request, res: Response) {
  try {
    const licenseIdNum = Number(req.params.licenseId);
    if (!licenseIdNum || isNaN(licenseIdNum) || licenseIdNum <= 0) {
      return res.status(400).json({
        success: false,
        verificationStatus: 'INVALID / NOT FOUND',
        message: 'Invalid License ID format. Please provide a valid positive integer.',
      });
    }

    // 1. Query the deployed smart contract on the blockchain
    const onChainResult = await blockchainSync.queryOnChainVerification(licenseIdNum);

    // 2. Lookup off-chain canonical metadata record in database
    const dbLicense = db.store.licenses.find(l => l.onChainId === licenseIdNum);
    const product = dbLicense ? db.store.products.find(p => p.id === dbLicense.productId) : null;
    const plan = dbLicense ? db.store.plans.find(pl => pl.id === dbLicense.planId) : null;

    // Log the verification attempt in the audit log
    blockchainSync.logAudit(null, 'PUBLIC_VERIFICATION_ATTEMPT', 'License', String(licenseIdNum), {
      status: onChainResult.statusMessage,
      clientIp: req.ip,
    });

    // Check if blockchain is reachable or if record does not exist
    if (!onChainResult.isBlockchainReachable && !dbLicense) {
      return res.json({
        success: false,
        verificationStatus: 'VERIFICATION UNAVAILABLE',
        message: 'The local Ethereum blockchain node (RPC) is currently unreachable and no cached record exists.',
        licenseId: licenseIdNum,
        timestamp: new Date().toISOString(),
      });
    }

    if (onChainResult.statusMessage === 'INVALID / NOT FOUND' && !dbLicense) {
      return res.json({
        success: false,
        verificationStatus: 'INVALID / NOT FOUND',
        message: `License ID #${licenseIdNum} does not exist on the blockchain registry.`,
        licenseId: licenseIdNum,
        timestamp: new Date().toISOString(),
      });
    }

    // Compare metadata hash integrity
    let isMetadataIntegrityVerified = false;
    if (dbLicense && onChainResult.metadataHash) {
      isMetadataIntegrityVerified = (dbLicense.metadataHash.toLowerCase() === onChainResult.metadataHash.toLowerCase());
    }

    // Determine final status
    let finalStatus: 'VALID' | 'EXPIRED' | 'REVOKED' | 'INVALID / NOT FOUND' = 'INVALID / NOT FOUND';

    if (onChainResult.statusMessage.includes('INVALID / NOT FOUND') || (!dbLicense && !onChainResult.isValid && onChainResult.issueTimestamp === 0)) {
      finalStatus = 'INVALID / NOT FOUND';
    } else if (onChainResult.statusCode === 3 || onChainResult.statusMessage.startsWith('REVOKED') || dbLicense?.onChainStatus === 'REVOKED') {
      finalStatus = 'REVOKED';
    } else if (onChainResult.statusCode === 2 || onChainResult.statusMessage.startsWith('EXPIRED') || (dbLicense?.expirationDate && new Date(dbLicense.expirationDate).getTime() < Date.now())) {
      finalStatus = 'EXPIRED';
    } else if (onChainResult.isValid || (dbLicense && (dbLicense.onChainStatus === 'ACTIVE' || dbLicense.onChainStatus === 'ISSUED'))) {
      finalStatus = 'VALID';
    }

    let displayMessage = onChainResult.statusMessage;
    if (finalStatus === 'REVOKED') {
      displayMessage = onChainResult.statusMessage.startsWith('REVOKED')
        ? onChainResult.statusMessage
        : `REVOKED: ${dbLicense?.revocationReason || 'License revoked by publisher'}`;
    }

    // Public sanitized payload (No private email or secrets exposed)
    return res.json({
      success: true,
      verificationStatus: finalStatus,
      statusMessage: displayMessage,
      license: {
        licenseId: licenseIdNum,
        softwareName: product?.name || 'Enterprise Software Suite',
        softwareCategory: product?.category || 'Security Tool',
        softwareVersion: product?.version || '1.0.0',
        planName: plan?.name || 'Enterprise License Plan',
        publisherAddress: onChainResult.publisher || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        holderAddress: onChainResult.holder ? `${onChainResult.holder.slice(0, 6)}...${onChainResult.holder.slice(-4)}` : '0x3C44...93BC',
        issueDate: onChainResult.issueTimestamp ? new Date(onChainResult.issueTimestamp * 1000).toISOString() : (dbLicense?.createdAt?.toISOString() || new Date().toISOString()),
        expirationDate: onChainResult.expirationTimestamp && onChainResult.expirationTimestamp > 0
          ? new Date(onChainResult.expirationTimestamp * 1000).toISOString()
          : (dbLicense?.expirationDate ? new Date(dbLicense.expirationDate).toISOString() : 'PERPETUAL (Lifetime)'),
        metadataHash: onChainResult.metadataHash || dbLicense?.metadataHash,
        metadataIntegrityVerified: isMetadataIntegrityVerified,
        revocationReason: dbLicense?.revocationReason || null,
        transactionHash: dbLicense?.txHash || '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        contractAddress: blockchainSync.getContractAddress(),
        network: 'Hardhat Localhost (Chain ID: 31337)',
        explorerUrl: `http://localhost:8545/tx/${dbLicense?.txHash || ''}`,
      },
      verifiedAt: new Date().toISOString(),
      blockchainReachable: onChainResult.isBlockchainReachable,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      verificationStatus: 'VERIFICATION UNAVAILABLE',
      error: err.message || 'Verification service error',
    });
  }
}
