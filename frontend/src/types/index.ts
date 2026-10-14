export type Role = 'ADMIN' | 'PUBLISHER' | 'CUSTOMER';
export type LicenseType = 'PERPETUAL' | 'SUBSCRIPTION' | 'TRIAL' | 'SEAT_BASED';
export type LicenseStatus = 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  walletAddress?: string | null;
  createdAt?: string;
}

export interface LicensePlan {
  id: string;
  productId: string;
  name: string;
  licenseType: LicenseType;
  durationDays: number;
  maxSeats: number;
  priceDemo: number;
  isDefault: boolean;
  createdAt?: string;
}

export interface SoftwareProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  imageUrl?: string;
  publisherId: string;
  isActive: boolean;
  plans?: LicensePlan[];
  publisher?: {
    id: string;
    name: string;
    walletAddress?: string;
  } | null;
  createdAt?: string;
}

export interface LicenseRecord {
  id: string;
  onChainId: number;
  productId: string;
  planId: string;
  publisherId: string;
  customerId: string;
  metadataHash: string;
  canonicalJson: string;
  onChainStatus: LicenseStatus;
  txHash?: string;
  expirationDate?: string | null;
  maxSeats: number;
  currentSeats: number;
  revocationReason?: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    version: string;
  } | null;
  plan?: {
    id: string;
    name: string;
    licenseType: LicenseType;
    durationDays: number;
  } | null;
  publisher?: {
    id: string;
    name: string;
    walletAddress?: string;
  } | null;
  customer?: {
    id: string;
    name: string;
    walletAddress?: string;
  } | null;
  transaction?: BlockchainTx | null;
  verificationUrl?: string;
}

export interface VerificationResult {
  success: boolean;
  verificationStatus: 'VALID' | 'EXPIRED' | 'REVOKED' | 'INVALID / NOT FOUND' | 'VERIFICATION UNAVAILABLE';
  statusMessage?: string;
  message?: string;
  license?: {
    licenseId: number;
    softwareName: string;
    softwareCategory: string;
    softwareVersion: string;
    planName: string;
    publisherAddress: string;
    holderAddress: string;
    issueDate: string;
    expirationDate: string;
    metadataHash: string;
    metadataIntegrityVerified?: boolean;
    revocationReason?: string | null;
    transactionHash: string;
    contractAddress: string;
    network: string;
    explorerUrl?: string;
  };
  verifiedAt?: string;
  blockchainReachable?: boolean;
}

export interface BlockchainTx {
  id: string;
  txHash: string;
  blockNumber?: number;
  fromAddress: string;
  toAddress: string;
  method: string;
  eventName?: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  details?: string | null;
  createdAt: string;
}
