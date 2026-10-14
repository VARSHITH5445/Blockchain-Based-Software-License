import { Request, Response } from 'express';
import { db } from '../services/prisma';
import { blockchainSync } from '../services/blockchainSync';

export async function getAdminMetrics(req: Request, res: Response) {
  try {
    const totalUsers = db.store.users.length;
    const publisherCount = db.store.users.filter(u => u.role === 'PUBLISHER').length;
    const customerCount = db.store.users.filter(u => u.role === 'CUSTOMER').length;

    const totalProducts = db.store.products.length;
    const totalLicenses = db.store.licenses.length;
    const activeLicenses = db.store.licenses.filter(l => l.onChainStatus === 'ACTIVE' || l.onChainStatus === 'ISSUED').length;
    const revokedLicenses = db.store.licenses.filter(l => l.onChainStatus === 'REVOKED').length;
    const expiredLicenses = db.store.licenses.filter(l => l.expirationDate && new Date(l.expirationDate).getTime() < Date.now()).length;

    const transactions = db.store.transactions.slice(0, 10);
    const recentAuditLogs = db.store.auditLogs.slice(0, 15);

    return res.json({
      success: true,
      metrics: {
        totalUsers,
        publisherCount,
        customerCount,
        totalProducts,
        totalLicenses,
        activeLicenses,
        revokedLicenses,
        expiredLicenses,
      },
      recentTransactions: transactions,
      recentAuditLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function listAllUsers(req: Request, res: Response) {
  try {
    const users = db.store.users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      walletAddress: u.walletAddress,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function toggleUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const user = db.store.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.isActive = !user.isActive;
    user.updatedAt = new Date();
    db.save();

    blockchainSync.logAudit(req.user?.id || 'admin', 'USER_STATUS_TOGGLED', 'User', user.id, {
      isActive: user.isActive,
    });

    return res.json({
      success: true,
      message: `User ${user.email} is now ${user.isActive ? 'Active' : 'Disabled'}.`,
      user: { id: user.id, email: user.email, isActive: user.isActive },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const { action, search } = req.query;
    let logs = db.store.auditLogs;

    if (action) {
      logs = logs.filter(l => l.action.toLowerCase() === String(action).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      logs = logs.filter(l => l.action.toLowerCase().includes(q) || l.details?.toLowerCase().includes(q));
    }

    return res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getBlockchainTransactions(req: Request, res: Response) {
  try {
    const transactions = db.store.transactions;
    return res.json({ success: true, count: transactions.length, transactions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
