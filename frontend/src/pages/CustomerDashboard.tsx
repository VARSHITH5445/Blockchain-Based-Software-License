import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Key, 
  CheckCircle2, 
  Clock, 
  Search, 
  QrCode, 
  ExternalLink, 
  ShoppingBag,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { LicenseRecord } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [qrLicenseId, setQrLicenseId] = useState<number | null>(null);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const handleActivateDevice = async (id: number) => {
    setIsActivating(id);
    try {
      await api.activateDevice(id, { deviceName: 'Local Workstation Node' });
      await loadLicenses();
    } catch (err: any) {
      alert(err.message || 'Device activation failed');
    } finally {
      setIsActivating(null);
    }
  };

  const handleDeactivateDevice = async (id: number) => {
    setIsActivating(id);
    try {
      await api.deactivateDevice(id);
      await loadLicenses();
    } catch (err: any) {
      alert(err.message || 'Device deactivation failed');
    } finally {
      setIsActivating(null);
    }
  };

  const loadLicenses = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCustomerLicenses();
      setLicenses(res.licenses || []);
    } catch (err) {
      console.error('Error loading customer licenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, [user]);

  const handleCopy = (id: number) => {
    navigator.clipboard.writeText(String(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Metrics
  const activeCount = licenses.filter(l => l.onChainStatus === 'ACTIVE' || l.onChainStatus === 'ISSUED').length;
  const expiredCount = licenses.filter(l => l.expirationDate && new Date(l.expirationDate).getTime() < Date.now()).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title & Wallet Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Customer License Vault</h1>
            <span className="badge-issued text-xs">Customer Portal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident software licenses registered to wallet:{' '}
            <span className="font-mono text-indigo-600 font-semibold">
              {user?.walletAddress || '0x3C44...93BC'}
            </span>
          </p>
        </div>

        <Link to="/products" className="btn-indigo text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse Software Catalog</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Owned Licenses</span>
          <div className="text-2xl font-bold font-mono text-slate-900">{licenses.length}</div>
          <span className="text-[11px] text-slate-400">Recorded on-chain</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Active & Valid</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Ready for activation</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Expired Licenses</span>
          <div className="text-2xl font-bold font-mono text-amber-600">{expiredCount}</div>
          <span className="text-[11px] text-slate-400">Renewal eligible</span>
        </div>

      </div>

      {/* Licenses Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">My Licensed Software Products</h2>
          <span className="text-xs text-slate-400 font-mono">({licenses.length} items)</span>
        </div>

        {licenses.length === 0 ? (
          <div className="app-card p-12 text-center">
            <Key className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base mb-1">No Licenses Found in this Account</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
              You haven't acquired any software licenses yet. Visit the catalog to simulate a demo purchase.
            </p>
            <Link to="/products" className="btn-indigo text-xs py-2 px-4">
              Browse Software Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map(lic => {
              const isRevoked = lic.onChainStatus === 'REVOKED';
              const expiration = lic.expirationDate ? new Date(lic.expirationDate).toLocaleDateString() : 'Perpetual (Lifetime)';

              return (
                <div key={lic.id} className="app-card p-5 flex flex-col justify-between">
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          LICENSE #{lic.onChainId}
                        </span>
                      </div>
                      <StatusBadge status={lic.onChainStatus} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {lic.product?.name || 'Software Application'}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      Plan: {lic.plan?.name || 'Standard'} • Version: {lic.product?.version || '1.0.0'}
                    </p>

                    {/* Expiration & Node Specs */}
                    <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-500">Validity:</span>
                        <span className="font-semibold text-slate-800">{expiration}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-500">Node Seats:</span>
                        <span className="font-semibold text-slate-800">{lic.currentSeats} / {lic.maxSeats} Machine(s)</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-slate-500 text-[11px]">Hardware Node-Lock:</span>
                        <div className="flex items-center gap-1.5">
                          {lic.currentSeats < lic.maxSeats && !isRevoked && (
                            <button
                              onClick={() => handleActivateDevice(lic.onChainId)}
                              disabled={isActivating === lic.onChainId}
                              className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition cursor-pointer"
                            >
                              {isActivating === lic.onChainId ? 'Binding...' : '+ Bind Machine'}
                            </button>
                          )}
                          {lic.currentSeats > 0 && !isRevoked && (
                            <button
                              onClick={() => handleDeactivateDevice(lic.onChainId)}
                              disabled={isActivating === lic.onChainId}
                              className="text-[10px] font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                            >
                              Unbind
                            </button>
                          )}
                          {lic.currentSeats >= lic.maxSeats && !isRevoked && (
                            <span className="text-[10px] text-amber-700 font-medium">All Seats Active</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isRevoked && (
                      <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] mb-4">
                        <strong>Revoked by Publisher:</strong> {lic.revocationReason || 'Violation'}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA & Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(lic.onChainId)}
                        className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] p-1"
                        title="Copy License ID"
                      >
                        {copiedId === lic.onChainId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>ID</span>
                      </button>

                      <button
                        onClick={() => setQrLicenseId(lic.onChainId)}
                        className="text-slate-500 hover:text-indigo-600 p-1"
                        title="View Verification QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/verify?id=${lic.onChainId}`}
                        className="btn-outline text-[11px] py-1 px-2.5 flex items-center gap-1"
                      >
                        <Search className="w-3 h-3 text-slate-400" />
                        <span>Verify</span>
                      </Link>

                      <Link
                        to={`/licenses/${lic.onChainId}`}
                        className="btn-indigo text-[11px] py-1 px-2.5"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {qrLicenseId && (
        <QRModal
          licenseId={qrLicenseId}
          isOpen={!!qrLicenseId}
          onClose={() => setQrLicenseId(null)}
        />
      )}

    </div>
  );
};
