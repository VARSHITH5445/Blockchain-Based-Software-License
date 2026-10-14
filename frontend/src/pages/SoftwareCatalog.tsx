import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  Key, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  Users, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SoftwareProduct, LicensePlan } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export const SoftwareCatalog: React.FC = () => {
  const { user } = useAuth();
  const { account, connectWallet } = useWeb3();

  const [products, setProducts] = useState<SoftwareProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Checkout modal
  const [checkoutProduct, setCheckoutProduct] = useState<SoftwareProduct | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<LicensePlan | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<any>(null);
  const [checkoutError, setCheckoutError] = useState('');

  const loadProducts = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await api.getProducts({
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
      });
      setProducts(res.products || []);
    } catch (err: any) {
      console.error('Failed to load software catalog:', err);
      setLoadError(err.message || 'Unable to connect to software catalog service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const openCheckout = (product: SoftwareProduct) => {
    setCheckoutProduct(product);
    setSelectedPlan(product.plans?.[0] || null);
    setCheckoutSuccess(null);
    setCheckoutError('');
  };

  const handleExecuteCheckout = async () => {
    if (!checkoutProduct || !selectedPlan) return;
    setIsCheckingOut(true);
    setCheckoutError('');

    try {
      const walletToUse = account || user?.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC';

      const res = await api.purchaseCheckout({
        productId: checkoutProduct.id,
        planId: selectedPlan.id,
        customerWalletAddress: walletToUse,
      });

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 }
        });
      } catch (e) {}

      setCheckoutSuccess(res);
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Software Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse decentralized verified software products with tamper-evident on-chain licensing.
          </p>
        </div>

        {/* Demo currency disclaimer */}
        <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs text-indigo-700 font-medium">
          💡 Simulated checkout for academic demo evaluation (No real fiat required)
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Software' },
            { id: 'Developer Tools', label: 'Developer Tools' },
            { id: 'Security Software', label: 'Security Software' },
            { id: 'Productivity', label: 'Productivity' },
            { id: 'Design Software', label: 'Design Software' },
            { id: 'Data Analytics', label: 'Data Analytics' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                categoryFilter === cat.id 
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search software products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-8 text-xs py-1.5"
          />
        </form>

      </div>

      {/* Error State */}
      {loadError && (
        <div className="app-card p-6 bg-rose-50 border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <div className="text-sm font-bold text-rose-900">Failed to Load Software Products</div>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{loadError}</p>
          <button
            onClick={loadProducts}
            className="btn-outline text-xs py-1.5 px-3 bg-white"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="app-card overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-200"></div>
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                <div className="h-3 bg-slate-200 rounded w-full"></div>
                <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !loadError && products.length === 0 && (
        <div className="app-card p-12 text-center space-y-3 border-dashed border-2 border-slate-300">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Software Products Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No products match the selected category &quot;{categoryFilter}&quot; or search query.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setSearchTerm('');
              }}
              className="btn-indigo text-xs py-2 px-4"
            >
              Clear Filters &amp; View All
            </button>
          </div>
        </div>
      )}

      {/* Product Cards Grid */}
      {!isLoading && !loadError && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => {
            const defaultPlan = product.plans?.[0];

            return (
              <div key={product.id} className="app-card flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Image */}
                  <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold text-slate-700 shadow-xs">
                      {product.version}
                    </div>
                    <div className="absolute top-3 left-3 bg-indigo-600/90 text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {product.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{product.name}</h3>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Plan Features Pill */}
                    <div className="space-y-2 mb-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          Machine Seats:
                        </span>
                        <span className="font-semibold text-slate-800">{defaultPlan?.maxSeats || 1} Device(s)</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          License Architecture:
                        </span>
                        <span className="font-semibold text-indigo-700">{defaultPlan?.licenseType || 'PERPETUAL'}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Publisher: {product.publisher?.walletAddress || '0x7099...79C8'}
                    </div>
                  </div>
                </div>

                {/* Bottom Price & CTA */}
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {defaultPlan?.priceDemo || 0.25} ETH
                    </span>
                    <span className="text-[10px] text-slate-400 block">Demo Price</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openCheckout(product)}
                      className="btn-indigo text-xs py-2 px-3.5 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Purchase License</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setCheckoutProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Simulated License Checkout
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Review terms and mint on-chain license for <strong>{checkoutProduct.name}</strong>.
            </p>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {checkoutError}
              </div>
            )}

            {checkoutSuccess ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                  <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <div className="font-bold text-base mb-1">License Minted on Blockchain!</div>
                  <p className="text-xs text-emerald-700 mb-2">
                    License ID: <strong>#{checkoutSuccess.license.onChainId}</strong>
                  </p>
                  <div className="font-mono text-[10px] bg-white p-2 rounded border border-emerald-200 truncate">
                    Tx: {checkoutSuccess.purchase?.txHash}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="w-1/2 btn-outline text-xs py-2"
                  >
                    Close
                  </button>
                  <Link
                    to="/customer"
                    className="w-1/2 btn-indigo text-xs py-2 text-center"
                  >
                    View in My Licenses
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Plan Selection */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select License Plan</label>
                  <div className="space-y-2">
                    {checkoutProduct.plans?.map(pl => (
                      <div
                        key={pl.id}
                        onClick={() => setSelectedPlan(pl)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedPlan?.id === pl.id
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-bold">{pl.name}</span>
                          <span className="font-mono font-bold text-indigo-600">{pl.priceDemo} ETH</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {pl.licenseType} • {pl.durationDays > 0 ? `${pl.durationDays} Days` : 'Perpetual Lifetime'} • {pl.maxSeats} Machine Seat(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Wallet */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Customer Wallet Address</label>
                  <input
                    type="text"
                    readOnly
                    value={account || user?.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'}
                    className="form-input font-mono bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                  {!account && (
                    <button
                      onClick={connectWallet}
                      className="text-[11px] text-indigo-600 hover:underline mt-1 font-medium"
                    >
                      Connect your MetaMask wallet
                    </button>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedPlan?.priceDemo || 0.25} ETH</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gas Fee:</span>
                    <span className="font-mono text-emerald-600">0.000 ETH (Demo)</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="w-1/2 btn-outline text-xs py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteCheckout}
                    disabled={isCheckingOut}
                    className="w-1/2 btn-indigo text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    {isCheckingOut ? (
                      <span>Minting on Ethereum...</span>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Confirm Demo Purchase</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
