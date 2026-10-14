import React, { useState } from 'react';
import { 
  PlusCircle, 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Lock, 
  Check, 
  Cpu, 
  Clock, 
  RefreshCcw,
  Sparkles
} from 'lucide-react';

export default function VendorPortal({ 
  products, 
  licenses, 
  activeAccount, 
  onRegisterProduct, 
  onRevokeLicense 
}) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [revokeModalLicense, setRevokeModalLicense] = useState(null);
  const [revocationReason, setRevocationReason] = useState('Piracy leak detected: license shared illegally');
  const [searchTerm, setSearchTerm] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // New product form fields
  const [newProdName, setNewProdName] = useState('');
  const [newProdVersion, setNewProdVersion] = useState('v1.0.0');
  const [newProdCategory, setNewProdCategory] = useState('Cybersecurity');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('0.25');
  const [newProdType, setNewProdType] = useState('0'); // 0=Perpetual, 1=Sub, 2=Seat
  const [newProdSeats, setNewProdSeats] = useState('3');
  const [newProdDuration, setNewProdDuration] = useState('30');
  const [newProdRoyalty, setNewProdRoyalty] = useState('1000'); // 10%

  // Metrics
  const totalRevenueETH = licenses.reduce((sum, lic) => {
    const prod = products.find(p => p.id === lic.productId);
    return sum + (prod ? parseFloat(prod.priceETH) : 0);
  }, 0).toFixed(2);

  const activeLicensesCount = licenses.filter(l => l.status === 0).length;
  const revokedLicensesCount = licenses.filter(l => l.status === 2).length;
  const totalBoundDevices = licenses.reduce((sum, lic) => sum + (lic.boundDevices?.length || 0), 0);

  const filteredLicenses = licenses.filter(lic => {
    const prod = products.find(p => p.id === lic.productId);
    const search = searchTerm.toLowerCase();
    return (
      lic.licenseId.toString().includes(search) ||
      lic.owner.toLowerCase().includes(search) ||
      (prod && prod.name.toLowerCase().includes(search))
    );
  });

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newProdName) {
      setFormError('Please enter a software name');
      return;
    }

    try {
      await onRegisterProduct({
        name: newProdName,
        version: newProdVersion,
        category: newProdCategory,
        description: newProdDescription || 'Enterprise-grade blockchain protected software application.',
        priceETH: newProdPrice,
        licenseType: Number(newProdType),
        maxSeats: Number(newProdSeats),
        durationDays: Number(newProdDuration),
        royaltyBasisPoints: Number(newProdRoyalty)
      });

      setFormSuccess(`Software "${newProdName}" successfully registered on smart contract!`);
      setShowRegisterModal(false);
      setNewProdName('');
      setNewProdDescription('');
    } catch (err) {
      setFormError(err.message || 'Product registration failed');
    }
  };

  const handleExecuteRevocation = async () => {
    if (!revokeModalLicense) return;
    try {
      await onRevokeLicense(revokeModalLicense.licenseId, revocationReason);
      setRevokeModalLicense(null);
    } catch (err) {
      alert(err.message || 'Revocation failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Vendor Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Software Vendor Operations Hub</h2>
            <span className="badge badge-cyan text-xs">Admin Console</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage software releases, track on-chain tokenized licenses, and enforce piracy mitigation.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Software Product</span>
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Licensing Sales</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalRevenueETH} ETH</div>
          <span className="text-[11px] text-slate-400">≈ ${(parseFloat(totalRevenueETH) * 3200).toLocaleString()} USD</span>
        </div>

        <div className="glass-card p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Minted Licenses</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{licenses.length}</div>
          <span className="text-[11px] text-cyan-400 font-medium">{activeLicensesCount} Active Licenses</span>
        </div>

        <div className="glass-card p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Machine Seats</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{totalBoundDevices}</div>
          <span className="text-[11px] text-slate-400">Cryptographically bound nodes</span>
        </div>

        <div className="glass-card p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Revoked / Blacklisted</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-400 font-mono">{revokedLicensesCount}</div>
          <span className="text-[11px] text-slate-400">Piracy breaches neutralized</span>
        </div>
      </div>

      {/* Global License Audit & Revocation Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Global License Registry</h3>
            <p className="text-xs text-slate-400">Audit all customer license tokens across the decentralized registry</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Address, or App..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 text-xs py-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Token ID</th>
                <th className="py-3 px-3">Software Product</th>
                <th className="py-3 px-3">Owner Wallet</th>
                <th className="py-3 px-3">Seat Occupancy</th>
                <th className="py-3 px-3">License Status</th>
                <th className="py-3 px-3 text-right">Vendor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLicenses.map(lic => {
                const prod = products.find(p => p.id === lic.productId);
                const isRevoked = lic.status === 2;

                return (
                  <tr key={lic.licenseId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-cyan-400">
                      #{lic.licenseId}
                    </td>
                    <td className="py-3.5 px-3 font-sans font-medium text-slate-200">
                      {prod?.name || 'Software App'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {lic.owner.slice(0, 8)}...{lic.owner.slice(-6)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {lic.seatsUsed} / {lic.maxSeats} Nodes
                    </td>
                    <td className="py-3.5 px-3 font-sans">
                      {isRevoked ? (
                        <span className="badge badge-rose text-[10px]">REVOKED</span>
                      ) : (
                        <span className="badge badge-emerald text-[10px]">ACTIVE</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-sans">
                      {!isRevoked ? (
                        <button
                          onClick={() => setRevokeModalLicense(lic)}
                          className="btn-danger text-[11px] py-1 px-2.5"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Revoke Key</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Terminated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Product */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-xl w-full border border-cyan-500/40 relative bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">
              Register New Software Product on Blockchain
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Add a new software catalog item to the Ethereum smart contract registry with custom license parameters.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sentinel Guard X"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Initial Version</label>
                  <input
                    type="text"
                    required
                    placeholder="v1.0.0"
                    value={newProdVersion}
                    onChange={(e) => setNewProdVersion(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="Cybersecurity">Cybersecurity / Network Security</option>
                  <option value="Development Tool">Development Tool / IDE</option>
                  <option value="AI / Data Science">AI / Machine Learning</option>
                  <option value="CAD / Engineering">Engineering / CAD</option>
                  <option value="Enterprise SaaS">Enterprise Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Describe software capabilities..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="input-field"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">License Architecture</label>
                  <select
                    value={newProdType}
                    onChange={(e) => setNewProdType(e.target.value)}
                    className="input-field"
                  >
                    <option value="0">Perpetual (Transferable Lifetime)</option>
                    <option value="1">Subscription (Recurring 30-Day Expiry)</option>
                    <option value="2">Seat-Based (Multi-Node Enterprise)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              {newProdType === '2' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Allowed Hardware Seats</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newProdSeats}
                    onChange={(e) => setNewProdSeats(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              {newProdType === '0' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Resale Royalty to Vendor (%)</label>
                  <select
                    value={newProdRoyalty}
                    onChange={(e) => setNewProdRoyalty(e.target.value)}
                    className="input-field"
                  >
                    <option value="500">5% Royalty on Secondary Resales</option>
                    <option value="1000">10% Royalty on Secondary Resales</option>
                    <option value="1500">15% Royalty on Secondary Resales</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="w-1/2 btn-secondary text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 btn-primary text-xs py-2"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Revoke License */}
      {revokeModalLicense && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-md w-full border border-rose-500/40 relative bg-slate-900 shadow-2xl">
            <div className="h-12 w-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-center text-white mb-1">
              Revoke On-Chain License #{revokeModalLicense.licenseId}
            </h3>
            <p className="text-xs text-center text-slate-400 mb-5">
              Revoking permanently marks this license token as REVOKED on the blockchain ledger. Any software client using this key will immediately lock!
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Revocation Reason (Recorded on-chain)
                </label>
                <select
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  className="input-field text-xs"
                >
                  <option value="Piracy leak detected: license key publicly distributed">Piracy leak detected: license key publicly distributed</option>
                  <option value="Breach of Enterprise Terms of Service (Unauthorized reverse engineering)">Breach of Enterprise Terms of Service</option>
                  <option value="Credit Card Chargeback / Payment Fraud">Payment Fraud / Chargeback</option>
                  <option value="Suspected bot / unauthorized machine sharing">Suspected bot / unauthorized machine sharing</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRevokeModalLicense(null)}
                className="w-1/2 btn-secondary text-xs py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRevocation}
                className="w-1/2 btn-danger text-xs py-2 font-bold"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
