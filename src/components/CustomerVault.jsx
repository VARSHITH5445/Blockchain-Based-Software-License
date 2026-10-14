import React, { useState } from 'react';
import { 
  Key, 
  Cpu, 
  Laptop, 
  Plus, 
  Trash2, 
  Share2, 
  DollarSign, 
  RefreshCw, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { PRESET_DEVICES, getDeviceFingerprint } from '../services/hardwareIdService';

export default function CustomerVault({ 
  licenses, 
  products, 
  activeAccount, 
  onBindDevice, 
  onUnbindDevice, 
  onTransferLicense, 
  onResellLicense, 
  onRenewSubscription,
  onLaunchInSimulator 
}) {
  const [bindModalLicense, setBindModalLicense] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('live_device');
  const [customDeviceName, setCustomDeviceName] = useState('');

  const [transferModalLicense, setTransferModalLicense] = useState(null);
  const [transferToAddress, setTransferToAddress] = useState('');

  const [resellModalLicense, setResellModalLicense] = useState(null);
  const [resellPrice, setResellPrice] = useState('0.18');

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filter licenses owned by the current active account
  const myLicenses = licenses.filter(
    l => l.owner.toLowerCase() === (activeAccount?.address || '').toLowerCase()
  );

  const getProductInfo = (productId) => {
    return products.find(p => p.id === productId) || {
      name: 'Unknown Software',
      version: 'v1.0.0',
      licenseTypeName: 'Standard'
    };
  };

  const handleExecuteBind = async () => {
    if (!bindModalLicense) return;
    setActionError('');
    setActionSuccess('');

    try {
      const deviceData = getDeviceFingerprint(selectedPresetId);
      const name = customDeviceName || deviceData.name;
      await onBindDevice(bindModalLicense.licenseId, deviceData.hash, name);
      setActionSuccess(`Device "${name}" successfully node-locked to License #${bindModalLicense.licenseId}!`);
      setBindModalLicense(null);
      setCustomDeviceName('');
    } catch (err) {
      setActionError(err.message || 'Failed to bind device');
    }
  };

  const handleExecuteUnbind = async (licenseId, fingerprint) => {
    setActionError('');
    setActionSuccess('');
    try {
      await onUnbindDevice(licenseId, fingerprint);
      setActionSuccess(`Device unbound successfully. Seat freed up!`);
    } catch (err) {
      setActionError(err.message || 'Failed to unbind device');
    }
  };

  const handleExecuteTransfer = async () => {
    if (!transferModalLicense || !transferToAddress) return;
    setActionError('');
    setActionSuccess('');
    try {
      await onTransferLicense(transferModalLicense.licenseId, transferToAddress);
      setActionSuccess(`License #${transferModalLicense.licenseId} transferred to ${transferToAddress.slice(0, 8)}...`);
      setTransferModalLicense(null);
      setTransferToAddress('');
    } catch (err) {
      setActionError(err.message || 'Transfer failed');
    }
  };

  const handleExecuteResell = async () => {
    if (!resellModalLicense || !resellPrice) return;
    setActionError('');
    setActionSuccess('');
    try {
      await onResellLicense(resellModalLicense.licenseId, resellPrice);
      setActionSuccess(`License #${resellModalLicense.licenseId} resold on secondary market for ${resellPrice} ETH!`);
      setResellModalLicense(null);
    } catch (err) {
      setActionError(err.message || 'Resale failed');
    }
  };

  const handleRenew = async (licenseId) => {
    setActionError('');
    setActionSuccess('');
    try {
      await onRenewSubscription(licenseId);
      setActionSuccess(`Subscription for License #${licenseId} extended by 30 days!`);
    } catch (err) {
      setActionError(err.message || 'Renewal failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Vault Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">My License Vault</h2>
            <span className="badge badge-cyan text-xs">{myLicenses.length} Owned</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cryptographic licenses tied to your Ethereum wallet: <span className="font-mono text-cyan-400">{activeAccount?.address}</span>
          </p>
        </div>

        {/* Info Pill */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-slate-300">
          <HelpCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>Licenses are immutable smart contract records. Node-lock hardware to prevent piracy.</span>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Empty State */}
      {myLicenses.length === 0 ? (
        <div className="glass-panel text-center py-16 px-4 rounded-2xl border border-slate-800">
          <div className="h-16 w-16 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Key className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Licenses in this Wallet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            You don't own any software licenses on this Ethereum account. Visit the Software Store to mint your first decentralized license token or switch to another simulated persona.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myLicenses.map(license => {
            const product = getProductInfo(license.productId);
            const isSubscription = product.licenseType === 1;
            const now = Math.floor(Date.now() / 1000);
            const isExpired = license.expiryTimestamp !== 0 && license.expiryTimestamp < now;
            const isRevoked = license.status === 2; // REVOKED

            // Calculate days left
            const daysLeft = license.expiryTimestamp !== 0 
              ? Math.max(0, Math.ceil((license.expiryTimestamp - now) / 86400))
              : null;

            return (
              <div 
                key={license.licenseId}
                className="glass-card p-6 border border-slate-800 relative flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/50">
                          LICENSE #{license.licenseId}
                        </span>
                        {isRevoked ? (
                          <span className="badge badge-rose text-[10px]">REVOKED</span>
                        ) : isExpired ? (
                          <span className="badge badge-amber text-[10px]">EXPIRED</span>
                        ) : (
                          <span className="badge badge-emerald text-[10px]">ACTIVE & VALID</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        Product ID: #{product.id} • Version: {product.version}
                      </p>
                    </div>

                    {/* Launch in Simulator CTA */}
                    <button
                      onClick={() => onLaunchInSimulator(license.licenseId)}
                      title="Test this license inside the Client Software Simulator"
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Test in App</span>
                    </button>
                  </div>

                  {/* Revocation Warning if Revoked */}
                  {isRevoked && (
                    <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                      <span>Revoked by Vendor: <strong>{license.revocationReason || 'Violation of terms'}</strong></span>
                    </div>
                  )}

                  {/* Expiration or Lifetime Info */}
                  <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1">License Term:</span>
                      <span className="font-semibold text-white">
                        {product.licenseTypeName}
                      </span>
                    </div>

                    <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block mb-1">Validity Status:</span>
                      {isSubscription ? (
                        <span className={`font-semibold flex items-center gap-1.5 ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          {isExpired ? 'Expired' : `${daysLeft} days remaining`}
                        </span>
                      ) : (
                        <span className="font-semibold text-cyan-300">
                          Lifetime / Perpetual
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hardware Device Binding Section */}
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-semibold text-slate-200">
                          Authorized Hardware Nodes (Node-Locking)
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400">
                        {license.seatsUsed} / {license.maxSeats} Seats Used
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          license.seatsUsed >= license.maxSeats ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(100, (license.seatsUsed / license.maxSeats) * 100)}%` }}
                      ></div>
                    </div>

                    {/* Bound Device Chips */}
                    {license.boundDevices && license.boundDevices.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {license.boundDevices.map((dev, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center justify-between bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Laptop className="w-3.5 h-3.5 text-slate-400" />
                              <div>
                                <div className="text-slate-200 font-medium">{dev.deviceName}</div>
                                <div className="font-mono text-[10px] text-slate-500">
                                  {dev.fingerprint.slice(0, 10)}...{dev.fingerprint.slice(-8)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleExecuteUnbind(license.licenseId, dev.fingerprint)}
                              title="Unbind this device and free seat"
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic mb-3">
                        No hardware machines bound yet. Bind your workstation to unlock desktop software.
                      </div>
                    )}

                    {/* Bind Machine Button */}
                    {license.seatsUsed < license.maxSeats && !isRevoked && (
                      <button
                        onClick={() => setBindModalLicense(license)}
                        className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Authorize / Bind Device Hardware ID</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer Controls: Resell, Transfer, Renew */}
                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between gap-2 flex-wrap text-xs">
                  {isSubscription ? (
                    <button
                      onClick={() => handleRenew(license.licenseId)}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew Subscription ({product.priceETH} ETH)</span>
                    </button>
                  ) : license.transferable && !isRevoked ? (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => setResellModalLicense(license)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-violet-300 hover:text-white"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Resell on Market</span>
                      </button>
                      <button
                        onClick={() => setTransferModalLicense(license)}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Transfer Ownership</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Non-transferable Enterprise License
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Bind Device */}
      {bindModalLicense && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-lg w-full border border-cyan-500/40 relative bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">
              Authorize Hardware Node (Anti-Piracy)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cryptographically bind this license token (#{bindModalLicense.licenseId}) to a specific machine hardware signature.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select Machine / Environment
                </label>
                <div className="space-y-2">
                  {PRESET_DEVICES.map(dev => (
                    <div
                      key={dev.id}
                      onClick={() => setSelectedPresetId(dev.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedPresetId === dev.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200 mb-0.5">
                        <span>{dev.name}</span>
                        {selectedPresetId === dev.id && (
                          <span className="text-cyan-400 font-bold text-[10px]">SELECTED</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mb-1">{dev.os} • {dev.specs}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate">
                        Hash: {getDeviceFingerprint(dev.id).hash}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Device Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Office Workstation"
                  value={customDeviceName}
                  onChange={(e) => setCustomDeviceName(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setBindModalLicense(null)}
                className="w-1/2 btn-secondary text-xs py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBind}
                className="w-1/2 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Confirm Hardware Binding</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transfer License */}
      {transferModalLicense && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-md w-full border border-violet-500/40 relative bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">
              Transfer License Ownership
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Transfer License #{transferModalLicense.licenseId} to another Ethereum address. All previous hardware bindings will be cleared automatically.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recipient Ethereum Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={transferToAddress}
                  onChange={(e) => setTransferToAddress(e.target.value)}
                  className="input-field font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTransferModalLicense(null)}
                className="w-1/2 btn-secondary text-xs py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteTransfer}
                disabled={!transferToAddress}
                className="w-1/2 btn-primary text-xs py-2"
              >
                Sign & Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Resell License */}
      {resellModalLicense && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-md w-full border border-violet-500/40 relative bg-slate-900 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">
              Secondary Market Resale
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Resell License #{resellModalLicense.licenseId}. Smart contract automatically distributes creator royalty to original software developer!
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Resale Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={resellPrice}
                  onChange={(e) => setResellPrice(e.target.value)}
                  className="input-field font-mono text-base font-bold text-white"
                />
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Resale Asking Price:</span>
                  <span className="text-white font-mono">{resellPrice} ETH</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vendor Royalty (10%):</span>
                  <span className="text-violet-400 font-mono">{(parseFloat(resellPrice || 0) * 0.1).toFixed(3)} ETH</span>
                </div>
                <div className="flex justify-between text-slate-300 font-semibold border-t border-slate-800 pt-1.5">
                  <span>Net Proceeds to Seller:</span>
                  <span className="text-emerald-400 font-mono">{(parseFloat(resellPrice || 0) * 0.9).toFixed(3)} ETH</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setResellModalLicense(null)}
                className="w-1/2 btn-secondary text-xs py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteResell}
                className="w-1/2 btn-primary text-xs py-2"
              >
                List for Resale
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
