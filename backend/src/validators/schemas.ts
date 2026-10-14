import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  role: z.enum(['ADMIN', 'PUBLISHER', 'CUSTOMER']).default('CUSTOMER'),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address').optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
});

export const createSoftwareSchema = z.object({
  name: z.string().min(2, 'Software name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  version: z.string().default('1.0.0'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  plans: z.array(z.object({
    name: z.string().min(2, 'Plan name required'),
    licenseType: z.enum(['PERPETUAL', 'SUBSCRIPTION', 'TRIAL', 'SEAT_BASED']),
    durationDays: z.number().int().min(0),
    maxSeats: z.number().int().min(1),
    priceDemo: z.number().min(0),
    isDefault: z.boolean().default(false),
  })).min(1, 'At least one license plan must be defined'),
});

export const issueLicenseSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  customerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid customer Ethereum wallet address'),
  customerId: z.string().optional(),
  onChainId: z.number().int().positive('On-chain ID must be a positive integer').optional(),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash format').optional(),
});

export const activateLicenseSchema = z.object({
  deviceFingerprint: z.string().min(8, 'Device fingerprint must be at least 8 characters long').optional(),
  deviceName: z.string().optional(),
});

export const purchaseCheckoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  customerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

export const revokeLicenseSchema = z.object({
  licenseId: z.number().int().positive(),
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters long'),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
});

export const renewLicenseSchema = z.object({
  licenseId: z.number().int().positive(),
  additionalDays: z.number().int().positive('Additional days must be greater than zero'),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional(),
});

export const verifyLicenseSchema = z.object({
  licenseId: z.coerce.number().int().positive('License ID must be a positive integer'),
});
