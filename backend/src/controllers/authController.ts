import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/prisma';
import { registerSchema, loginSchema, updateWalletSchema } from '../validators/schemas';
import { blockchainSync } from '../services/blockchainSync';

const JWT_SECRET = process.env.JWT_SECRET || 'blockchain_license_jwt_secret_key_2026';

export async function register(req: Request, res: Response) {
  try {
    const validated = registerSchema.parse(req.body);

    // Check duplicate email
    const existing = db.store.users.find(u => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
    }

    // Check duplicate wallet if provided
    if (validated.walletAddress) {
      const existingWallet = db.store.users.find(
        u => u.walletAddress?.toLowerCase() === validated.walletAddress?.toLowerCase()
      );
      if (existingWallet) {
        return res.status(409).json({ success: false, error: 'This wallet address is already linked to another account.' });
      }
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: validated.email.toLowerCase(),
      passwordHash,
      name: validated.name,
      role: validated.role,
      walletAddress: validated.walletAddress || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.store.users.push(newUser);

    blockchainSync.logAudit(newUser.id, 'USER_REGISTERED', 'User', newUser.id, {
      role: newUser.role,
      wallet: newUser.walletAddress,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        walletAddress: newUser.walletAddress,
      },
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message || 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validated = loginSchema.parse(req.body);

    const user = db.store.users.find(u => u.email.toLowerCase() === validated.email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Your account has been deactivated by the administrator.' });
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    blockchainSync.logAudit(user.id, 'USER_LOGIN', 'User', user.id);

    return res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message || 'Login failed' });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }

  const user = db.store.users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
    },
  });
}

export async function updateWallet(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const validated = updateWalletSchema.parse(req.body);

    const user = db.store.users.find(u => u.id === req.user?.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.walletAddress = validated.walletAddress;
    user.updatedAt = new Date();

    blockchainSync.logAudit(user.id, 'WALLET_CONNECTED', 'User', user.id, {
      walletAddress: validated.walletAddress,
    });

    return res.json({
      success: true,
      message: 'Wallet address associated successfully.',
      walletAddress: user.walletAddress,
    });
  } catch (err: any) {
    if (err.errors) {
      return res.status(400).json({ success: false, error: err.errors[0].message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}
