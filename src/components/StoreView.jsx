import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Cpu, 
  Check, 
  Zap, 
  Clock, 
  Users, 
  Sparkles, 
  ExternalLink, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function StoreView({ 
  products, 
  onPurchase, 
  activeAccount, 
  onViewVault 
}) {
  const [filter, setFilter] = useState('ALL');
  const [purchasingId, setPurchasingId] = useState(null);
  const [txSuccessModal, setTxSuccessModal] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredProducts = products.filter(p => {
    if (filter === 'ALL') return true;
    if (filter === 'PERPETUAL') return p.licenseType === 0;
    if (filter === 'SUBSCRIPTION') return p.licenseType === 1;
    if (filter === 'SEAT_BASED') return p.licenseType === 2;
    return true;
  });

  const handleBuy = async (product) => {
    setErrorMsg('');
    setPurchasingId(product.id);
    try {
      const res = await onPurchase(product.id);
      
      // Trigger confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTxSuccessModal({
        product,
        license: res
      });
    } catch (err) {
      setErrorMsg(err.message || 'Transaction failed');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden glass-panel rounded-2xl p-8 mb-8 border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Software Rights Management
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-3">
            Decentralized Software Licenses <br />
            <span className="gradient-text-cyan">Owned By You, Enforced by Ethereum</span>
          </h1>
          <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-6">
            Eliminate crack keys, centralized activation downtime, and license fraud. Software licenses are issued as on-chain cryptographic tokens bound to machine hardware fingerprints, with peer-to-peer resale royalties for creators.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Check className="w-4 h-4 text-emerald-400" />
              Hardware Machine Fingerprinting
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Check className="w-4 h-4 text-emerald-400" />
              Offline Cryptographic Challenge
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Check className="w-4 h-4 text-emerald-400" />
              Automated Resale Royalties
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'ALL', label: 'All Products' },
            { id: 'PERPETUAL', label: 'Perpetual (Lifetime)' },
            { id: 'SUBSCRIPTION', label: 'Subscription' },
            { id: 'SEAT_BASED', label: 'Seat-Based Enterprise' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filteredProducts.length}</span> verified software suites
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const isPurchasing = purchasingId === product.id;
          const usdPrice = (parseFloat(product.priceETH) * 3200).toFixed(0);

          return (
            <div 
              key={product.id}
              className="glass-card flex flex-col justify-between p-5 border border-slate-800 hover:border-cyan-500/40 relative group"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`badge ${
                    product.licenseType === 0 ? 'badge-violet' : (product.licenseType === 1 ? 'badge-emerald' : 'badge-cyan')
                  }`}>
                    {product.licenseTypeName}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {product.version}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Specs Pill List */}
                <div className="space-y-1.5 mb-5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Hardware Seats:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {product.maxSeatsPerLicense} {product.maxSeatsPerLicense > 1 ? 'Devices' : 'Device'}
                    </span>
                  </div>

                  {product.licenseType === 1 && (
                    <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Billing Cycle:
                      </span>
                      <span className="font-semibold text-emerald-300">
                        30 Days (Renewable)
                      </span>
                    </div>
                  )}

                  {product.licenseType === 0 && (
                    <div className="flex items-center justify-between text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-violet-400" />
                        Resale Royalty:
                      </span>
                      <span className="font-semibold text-violet-300">
                        {product.royaltyBasisPoints / 100}% back to Creator
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Bottom / Price & CTA */}
              <div className="border-t border-slate-800/80 pt-4">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xl font-extrabold text-white font-mono">{product.priceETH} ETH</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">≈ ${usdPrice}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID #{product.id}
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(product)}
                  disabled={isPurchasing}
                  className="w-full btn-primary text-xs py-2.5 font-semibold flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Minting on Ethereum...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>Mint & Purchase License</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Receipt Modal */}
      {txSuccessModal && (
        <div className="modal-backdrop">
          <div className="glass-panel p-6 max-w-md w-full border border-cyan-500/40 relative shadow-2xl bg-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Check className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-center text-white mb-1">
              License Minted on Blockchain!
            </h3>
            <p className="text-xs text-center text-slate-400 mb-5">
              The smart contract has recorded your ownership on the immutable ledger.
            </p>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2.5 mb-5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">License ID:</span>
                <span className="text-cyan-400 font-bold">#{txSuccessModal.license?.licenseId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Software:</span>
                <span className="text-white">{txSuccessModal.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Owner Wallet:</span>
                <span className="text-slate-300">{activeAccount?.address.slice(0, 8)}...{activeAccount?.address.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price Paid:</span>
                <span className="text-emerald-400 font-bold">{txSuccessModal.product?.priceETH} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">ACTIVE & UNLOCKED</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTxSuccessModal(null)}
                className="w-1/2 btn-secondary text-xs py-2"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTxSuccessModal(null);
                  onViewVault();
                }}
                className="w-1/2 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
              >
                <span>View in Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
