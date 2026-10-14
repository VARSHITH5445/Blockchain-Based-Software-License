import React, { useState } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { SoftwareProduct, LicensePlan } from '../types';
import { useWeb3 } from '../context/Web3Context';
import { api } from '../services/api';

interface IssueLicenseModalProps {
  products: SoftwareProduct[];
  isOpen: boolean;
  onClose: () => void;
  onIssued: () => void;
}

export const IssueLicenseModal: React.FC<IssueLicenseModalProps> = ({ products, isOpen, onClose, onIssued }) => {
  const { account, sendLicenseTransaction } = useWeb3();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [customerWallet, setCustomerWallet] = useState('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ onChainId: number; txHash: string } | null>(null);

  if (!isOpen) return null;

  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const plans = currentProduct?.plans || [];
  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessInfo(null);
    setIsSubmitting(true);

    try {
      if (!customerWallet || !customerWallet.startsWith('0x') || customerWallet.length !== 42) {
        throw new Error('Please enter a valid 42-character Ethereum wallet address (0x...)');
      }

      // Step: Call backend to execute transaction on local Hardhat blockchain using authorized publisher signer
      const issueRes = await api.issueLicense({
        productId: currentProduct.id,
        planId: currentPlan ? currentPlan.id : plans[0].id,
        customerWalletAddress: customerWallet,
      });

      if (!issueRes.success || !issueRes.license?.onChainId) {
        throw new Error(issueRes.error || 'Failed to issue license on smart contract');
      }

      const finalId = issueRes.license.onChainId;
      const finalTx = issueRes.license.txHash;

      setSuccessInfo({ onChainId: finalId, txHash: finalTx });
      onIssued();
    } catch (err: any) {
      setErrorMsg(err.message || 'License issuance failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <Key className="w-5 h-5" />
          <h3 className="text-xl font-bold text-slate-900">Issue On-Chain License</h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Mint a verifiable license token on the Ethereum blockchain for an authorized customer wallet address.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successInfo ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-base mb-1">License Successfully Issued!</div>
              <p className="text-xs text-emerald-700 mb-3">
                On-Chain Token ID: <strong>#{successInfo.onChainId}</strong> has been registered on the blockchain.
              </p>
              <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 truncate">
                Tx Hash: {successInfo.txHash}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="w-1/2 btn-outline text-xs py-2">
                Close
              </button>
              <a
                href={`/verify?id=${successInfo.onChainId}`}
                target="_blank"
                rel="noreferrer"
                className="w-1/2 btn-indigo text-xs py-2 text-center"
              >
                Verify on Public Portal
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleIssue} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Software Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSelectedPlanId('');
                }}
                className="form-input"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.version})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select License Plan</label>
              <select
                value={selectedPlanId || (plans[0]?.id || '')}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="form-input"
              >
                {plans.map(pl => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} — {pl.licenseType} ({pl.durationDays > 0 ? `${pl.durationDays} Days` : 'Perpetual'}, {pl.maxSeats} Seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Ethereum Wallet Address</label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={customerWallet}
                onChange={(e) => setCustomerWallet(e.target.value)}
                className="form-input font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                The smart contract binds immutable license ownership to this Ethereum address.
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Issuer Wallet:</span>
                <span className="font-mono font-medium">{account ? `${account.slice(0, 8)}...${account.slice(-6)}` : '0x7099...79C8 (Publisher)'}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Node Seats:</span>
                <span className="font-bold text-slate-800">{currentPlan?.maxSeats || 1} Machine(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Term:</span>
                <span className="font-bold text-slate-800">{currentPlan?.durationDays ? `${currentPlan.durationDays} Days` : 'Lifetime Perpetual'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="w-1/2 btn-outline text-xs py-2">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 btn-indigo text-xs py-2 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Signing On-Chain...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirm & Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
