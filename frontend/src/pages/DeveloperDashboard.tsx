import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  Key, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Plus, 
  Search, 
  QrCode, 
  ExternalLink,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SoftwareProduct, LicenseRecord } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { IssueLicenseModal } from '../components/IssueLicenseModal';
import { RevokeLicenseModal } from '../components/RevokeLicenseModal';
import { QRModal } from '../components/QRModal';

export const DeveloperDashboard: React.FC = () => {
  const [products, setProducts] = useState<SoftwareProduct[]>([]);
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [revokeLicenseId, setRevokeLicenseId] = useState<number | null>(null);
  const [qrLicenseId, setQrLicenseId] = useState<number | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, licRes] = await Promise.all([
        api.getProducts(),
        api.getPublisherLicenses(),
      ]);
      setProducts(prodRes.products || []);
      setLicenses(licRes.licenses || []);
    } catch (err) {
      console.error('Error loading developer dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const totalProducts = products.length;
  const totalIssued = licenses.length;
  const activeCount = licenses.filter(l => l.onChainStatus === 'ACTIVE' || l.onChainStatus === 'ISSUED').length;
  const revokedCount = licenses.filter(l => l.onChainStatus === 'REVOKED').length;
  const expiredCount = licenses.filter(l => l.expirationDate && new Date(l.expirationDate).getTime() < Date.now()).length;

  const filteredLicenses = licenses.filter(lic => {
    if (statusFilter !== 'ALL' && lic.onChainStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const prodName = lic.product?.name?.toLowerCase() || '';
      const holder = lic.customer?.walletAddress?.toLowerCase() || '';
      const id = String(lic.onChainId);
      return prodName.includes(q) || holder.includes(q) || id.includes(q);
    }
    return true;
  });

  // Mock Trend Chart Data
  const chartData = [
    { date: 'Oct 08', issued: 4, verified: 12 },
    { date: 'Oct 09', issued: 7, verified: 19 },
    { date: 'Oct 10', issued: 5, verified: 15 },
    { date: 'Oct 11', issued: 11, verified: 28 },
    { date: 'Oct 12', issued: 8, verified: 24 },
    { date: 'Oct 13', issued: 14, verified: 36 },
    { date: 'Oct 14', issued: 19, verified: 48 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Developer & Publisher Hub</h1>
            <span className="badge-issued text-xs">Publisher Portal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage software releases, issue on-chain cryptographic licenses, and enforce revocation rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/products/new" className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Software</span>
          </Link>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="btn-indigo text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Issue License On-Chain</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Software Releases</span>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalProducts}</div>
          <span className="text-[11px] text-slate-400">Published suites</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Issued</span>
          <div className="text-2xl font-bold font-mono text-indigo-600">{totalIssued}</div>
          <span className="text-[11px] text-slate-400">On-chain tokens</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Active / Bound</span>
          <div className="text-2xl font-bold font-mono text-emerald-600">{activeCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Valid nodes</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Expiring / Expired</span>
          <div className="text-2xl font-bold font-mono text-amber-600">{expiredCount}</div>
          <span className="text-[11px] text-slate-400">Subscription cycles</span>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Revoked</span>
          <div className="text-2xl font-bold font-mono text-rose-600">{revokedCount}</div>
          <span className="text-[11px] text-slate-400">Piracy mitigated</span>
        </div>

      </div>

      {/* Issuance & Verification Activity Chart */}
      <div className="app-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">License Issuance & Verification Velocity</h3>
            <p className="text-xs text-slate-500">Weekly audit volume on Ethereum smart contract</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span>
              Issued Tokens
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              Verifications
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="issued" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
              <Area type="monotone" dataKey="verified" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVerified)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Issued Licenses Table */}
      <div className="app-card p-6">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Issued Licenses Registry</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredLicenses.length})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, Software, or Wallet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-8 text-xs py-1.5 w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-32"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ISSUED">Issued</option>
              <option value="REVOKED">Revoked</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Token ID</th>
                <th className="py-3 px-3">Software Product</th>
                <th className="py-3 px-3">Plan / Type</th>
                <th className="py-3 px-3">Customer Wallet</th>
                <th className="py-3 px-3">Seats</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLicenses.map(lic => {
                const isRevoked = lic.onChainStatus === 'REVOKED';

                return (
                  <tr key={lic.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-indigo-600">
                      #{lic.onChainId}
                    </td>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-900">
                      {lic.product?.name || 'Software Product'}
                    </td>
                    <td className="py-3.5 px-3 font-sans text-slate-600">
                      {lic.plan?.name || 'Standard'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {lic.customer?.walletAddress ? (
                        `${lic.customer.walletAddress.slice(0, 6)}...${lic.customer.walletAddress.slice(-4)}`
                      ) : (
                        '0x3C44...93BC'
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {lic.currentSeats} / {lic.maxSeats}
                    </td>
                    <td className="py-3.5 px-3 font-sans">
                      <StatusBadge status={lic.onChainStatus} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setQrLicenseId(lic.onChainId)}
                        title="View Verification QR Code"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/licenses/${lic.onChainId}`}
                        title="View Details"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {!isRevoked && (
                        <button
                          onClick={() => setRevokeLicenseId(lic.onChainId)}
                          className="btn-danger py-1 px-2 font-medium"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modals */}
      <IssueLicenseModal
        products={products}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onIssued={loadData}
      />

      {revokeLicenseId && (
        <RevokeLicenseModal
          licenseId={revokeLicenseId}
          isOpen={!!revokeLicenseId}
          onClose={() => setRevokeLicenseId(null)}
          onRevoked={loadData}
        />
      )}

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
