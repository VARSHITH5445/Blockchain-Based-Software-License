import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Layers, 
  Key, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  UserX, 
  UserCheck 
} from 'lucide-react';
import { api } from '../services/api';
import { BlockchainTx, AuditLogItem } from '../types';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, usersRes] = await Promise.all([
        api.getAdminMetrics(),
        api.listUsers(),
      ]);
      setMetrics(metricsRes.metrics);
      setTransactions(metricsRes.recentTransactions || []);
      setAuditLogs(metricsRes.recentAuditLogs || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await api.toggleUserStatus(userId);
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(''), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Status toggle failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const filteredLogs = auditLogs.filter(l => {
    const q = logSearch.toLowerCase();
    return l.action.toLowerCase().includes(q) || (l.details && l.details.toLowerCase().includes(q));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Platform Administration Console</h1>
          <span className="badge-revoked text-xs">Admin Access</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Monitor platform users, verify on-chain transaction throughput, inspect audit records, and manage access authorizations.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          {actionSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Registered Users</span>
          <div className="text-2xl font-bold font-mono text-slate-900">{metrics?.totalUsers || 0}</div>
          <span className="text-[11px] text-slate-400">
            {metrics?.publisherCount || 0} Publishers • {metrics?.customerCount || 0} Customers
          </span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Software Products</span>
          <div className="text-2xl font-bold font-mono text-indigo-600">{metrics?.totalProducts || 0}</div>
          <span className="text-[11px] text-slate-400">Active catalog items</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Licenses Issued</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{metrics?.totalLicenses || 0}</div>
          <span className="text-[11px] text-slate-400">{metrics?.activeLicenses || 0} active</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Revocation Records</span>
          <div className="text-2xl font-bold font-mono text-rose-600">{metrics?.revokedLicenses || 0}</div>
          <span className="text-[11px] text-slate-400">Mitigated breaches</span>
        </div>
      </div>

      {/* User Management Section */}
      <div className="app-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">User Account & Permission Management</h3>
            <p className="text-xs text-slate-500">Enable or disable platform login access for accounts</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="form-input pl-8 text-xs py-1.5 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Wallet Address</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-sans font-medium text-slate-900">{u.name}</td>
                  <td className="py-3 px-3 text-slate-600 font-sans">{u.email}</td>
                  <td className="py-3 px-3 font-sans">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-xs">
                    {u.walletAddress || 'Unlinked'}
                  </td>
                  <td className="py-3 px-3 font-sans">
                    {u.isActive ? (
                      <span className="text-emerald-700 font-bold text-[11px]">ACTIVE</span>
                    ) : (
                      <span className="text-rose-600 font-bold text-[11px]">DISABLED</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => handleToggleUserStatus(u.id)}
                      className={`text-xs py-1 px-2.5 rounded font-medium ${
                        u.isActive 
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.isActive ? 'Disable Access' : 'Enable Access'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit History Logs */}
      <div className="app-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Platform Audit Logs</h3>
            <p className="text-xs text-slate-500">Immutable trail of critical lifecycle and verification events</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter audit events..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="form-input pl-8 text-xs py-1.5 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Target ID</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(l.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-indigo-700">
                    {l.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans">{l.entityType}</td>
                  <td className="py-2.5 px-3 text-slate-800">#{l.entityId}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans truncate max-w-sm">
                    {l.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
