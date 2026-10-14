import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { api } from '../services/api';

interface RenewLicenseModalProps {
  licenseId: number;
  isOpen: boolean;
  onClose: () => void;
  onRenewed: () => void;
}

export const RenewLicenseModal: React.FC<RenewLicenseModalProps> = ({ licenseId, isOpen, onClose, onRenewed }) => {
  const { sendLicenseTransaction } = useWeb3();
  const [additionalDays, setAdditionalDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.renewLicense({
        licenseId,
        additionalDays,
      });

      onRenewed();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Renewal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="h-11 w-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <RefreshCw className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
          Renew Subscription License #{licenseId}
        </h3>
        <p className="text-xs text-slate-500 text-center mb-5">
          Extends the on-chain validity timestamp on the smart contract.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRenew} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Extension Period</label>
            <select
              value={additionalDays}
              onChange={(e) => setAdditionalDays(Number(e.target.value))}
              className="form-input"
            >
              <option value={30}>+ 30 Days (1 Month)</option>
              <option value={90}>+ 90 Days (Quarterly)</option>
              <option value={365}>+ 365 Days (1 Year)</option>
            </select>
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
              {isSubmitting ? 'Signing on Blockchain...' : 'Confirm Renewal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
