import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { api } from '../services/api';

interface RevokeLicenseModalProps {
  licenseId: number;
  isOpen: boolean;
  onClose: () => void;
  onRevoked: () => void;
}

export const RevokeLicenseModal: React.FC<RevokeLicenseModalProps> = ({ licenseId, isOpen, onClose, onRevoked }) => {
  const { sendLicenseTransaction } = useWeb3();
  const [reason, setReason] = useState('Software piracy detected: Key leaked on unauthorized public forum');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Execute on-chain revocation via backend smart contract signer
      await api.revokeLicense({
        licenseId,
        reason,
      });

      onRevoked();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Revocation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="h-11 w-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
          Revoke License #{licenseId}
        </h3>
        <p className="text-xs text-slate-500 text-center mb-5 leading-relaxed">
          Revoking permanently marks this license token as <strong>REVOKED</strong> on the blockchain ledger. Client applications querying this key will immediately fail verification.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRevoke} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Revocation Audit Reason (Recorded on-chain)
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-input text-xs"
              placeholder="Explain the violation..."
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>This action generates an immutable on-chain event. Revoked licenses cannot be made valid again merely through the frontend.</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="w-1/2 btn-outline text-xs py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 btn-danger text-xs py-2 font-bold"
            >
              {isSubmitting ? 'Signing on Blockchain...' : 'Confirm Revocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
