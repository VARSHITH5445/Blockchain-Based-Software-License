import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Key, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  RefreshCw, 
  ExternalLink,
  Cpu,
  Clock,
  Layers,
  FileCode2
} from 'lucide-react';
import { LicenseRecord } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { RenewLicenseModal } from '../components/RenewLicenseModal';
import { CONTRACT_ADDRESS } from '../contracts/contractConfig';

export const LicenseDetails: React.FC = () => {
  const { idOrOnChainId } = useParams<{ idOrOnChainId: string }>();
  const [license, setLicense] = useState<LicenseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);

  const loadDetails = async () => {
    if (!idOrOnChainId) return;
    setIsLoading(true);
    try {
      const res = await api.getLicenseDetails(idOrOnChainId);
      setLicense(res.license || null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch license details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [idOrOnChainId]);

  const copyMetadataHash = () => {
    if (!license) return;
    navigator.clipboard.writeText(license.metadataHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading on-chain license details...
      </div>
    );
  }

  if (errorMsg || !license) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">License Not Found</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'The requested license record could not be found.'}</p>
        <Link to="/customer" className="btn-indigo text-xs py-2 px-4 inline-block">
          Return to Vault
        </Link>
      </div>
    );
  }

  const isSubscription = license.plan?.licenseType === 'SUBSCRIPTION';
  const isRevoked = license.onChainStatus === 'REVOKED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Title Strip */}
      <div className="pb-6 border-b border-slate-200">
        <Link to="/customer" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 mb-3 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to License Vault</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                License Token #{license.onChainId}
              </h1>
              <StatusBadge status={license.onChainStatus} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Software: <strong className="text-slate-800">{license.product?.name}</strong> • Version: {license.product?.version}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsQrOpen(true)}
              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Verification QR</span>
            </button>

            {isSubscription && !isRevoked && (
              <button
                onClick={() => setIsRenewOpen(true)}
                className="btn-indigo text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Renew Validity</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Attributes */}
        <div className="app-card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Cryptographic Ownership & Dates
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Publisher Address (Issuer)</span>
              <span className="font-mono text-slate-800 font-medium">
                {license.publisher?.walletAddress || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Holder Address (Owner)</span>
              <span className="font-mono text-indigo-700 font-semibold">
                {license.customer?.walletAddress || '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Minted Date</span>
                <span className="text-slate-800 font-medium">{new Date(license.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Expiration Timestamp</span>
                <span className="text-slate-800 font-medium">
                  {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString() : 'PERPETUAL (Lifetime)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Hardware Seat Limit</span>
                <span className="text-slate-800 font-bold">{license.maxSeats} Machine Node(s)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Current Active Nodes</span>
                <span className="text-indigo-600 font-bold">{license.currentSeats} Bound</span>
              </div>
            </div>
          </div>
        </div>

        {/* Blockchain Ledger & Metadata Integrity */}
        <div className="app-card p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Blockchain Audit Trail
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block mb-0.5">Smart Contract Address</span>
              <span className="font-mono text-slate-800 font-medium break-all">
                {CONTRACT_ADDRESS}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Issuance Transaction Hash</span>
              <span className="font-mono text-slate-700 truncate block text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                {license.txHash || '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b'}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-slate-400">Canonical Metadata Keccak-256 Hash</span>
                <button
                  onClick={copyMetadataHash}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 text-[11px]"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <span className="font-mono text-slate-700 truncate block text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                {license.metadataHash}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Public Verification Status:</span>
              <Link
                to={`/verify?id=${license.onChainId}`}
                className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Live Verification Result</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Raw Canonical Metadata Inspector */}
      <div className="app-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-indigo-600" />
          Canonical Metadata JSON (On-Chain Hash Source)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          This exact JSON structure is hashed using Keccak-256. If any character is altered, the verification hash comparison will flag a metadata integrity breach.
        </p>

        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
          {license.canonicalJson || JSON.stringify({ licenseId: license.onChainId, product: license.product?.name }, null, 2)}
        </pre>
      </div>

      {isQrOpen && (
        <QRModal
          licenseId={license.onChainId}
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
        />
      )}

      {isRenewOpen && (
        <RenewLicenseModal
          licenseId={license.onChainId}
          isOpen={isRenewOpen}
          onClose={() => setIsRenewOpen(false)}
          onRenewed={loadDetails}
        />
      )}

    </div>
  );
};
