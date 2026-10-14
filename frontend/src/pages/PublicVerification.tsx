import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  Cpu,
  Hash,
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';
import { VerificationResult } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const PublicVerification: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '1001';

  const [inputLicenseId, setInputLicenseId] = useState(initialId);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const executeVerification = async (targetId: string) => {
    if (!targetId || isNaN(Number(targetId))) {
      setErrorMsg('Please enter a valid numeric License ID (e.g. 1001)');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.verifyLicense(targetId);
      setResult(data);
    } catch (err: any) {
      setResult({
        success: false,
        verificationStatus: 'VERIFICATION UNAVAILABLE',
        message: err.message || 'Verification service could not be reached',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      executeVerification(initialId);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ id: inputLicenseId });
    executeVerification(inputLicenseId);
  };

  const status = result?.verificationStatus;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Public Cryptographic Verification Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Verify Software License Authenticity
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Query the Ethereum smart contract ledger in real-time. Checks token existence, cryptographic metadata hash integrity, expiration timestamps, and revocation status with <strong>0 Gas cost</strong>.
        </p>
      </div>

      {/* License Search Bar */}
      <div className="app-card p-6 max-w-xl mx-auto shadow-md">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              required
              min={1}
              value={inputLicenseId}
              onChange={(e) => setInputLicenseId(e.target.value)}
              placeholder="Enter License Token ID (e.g. 1001)"
              className="form-input pl-9 font-mono text-sm font-semibold text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-indigo text-xs py-2.5 px-5 flex items-center gap-1.5 font-semibold"
          >
            {isLoading ? <span>Verifying...</span> : <span>Verify On-Chain</span>}
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Quick Test Records:</span>
          <button
            type="button"
            onClick={() => { setInputLicenseId('1001'); executeVerification('1001'); }}
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[10px]"
          >
            #1001 (Valid)
          </button>
          <button
            type="button"
            onClick={() => { setInputLicenseId('1002'); executeVerification('1002'); }}
            className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-[10px]"
          >
            #1002 (Seats)
          </button>
          <button
            type="button"
            onClick={() => { setInputLicenseId('1003'); executeVerification('1003'); }}
            className="text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-[10px]"
          >
            #1003 (Active Sub)
          </button>
          <button
            type="button"
            onClick={() => { setInputLicenseId('1004'); executeVerification('1004'); }}
            className="text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 font-mono text-[10px]"
          >
            #1004 (Expired)
          </button>
          <button
            type="button"
            onClick={() => { setInputLicenseId('1005'); executeVerification('1005'); }}
            className="text-rose-700 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 font-mono text-[10px]"
          >
            #1005 (Revoked)
          </button>
          <button
            type="button"
            onClick={() => { setInputLicenseId('9999'); executeVerification('9999'); }}
            className="text-slate-700 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]"
          >
            #9999 (Invalid)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-xl mx-auto p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className="app-card overflow-hidden shadow-lg border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Status Header Banner */}
          <div className={`p-6 text-center border-b ${
            status === 'VALID' 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : (status === 'REVOKED' 
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900' 
                  : (status === 'EXPIRED' 
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                      : 'bg-slate-100 border-slate-200 text-slate-900'))
          }`}>
            <div className="flex items-center justify-center mb-2">
              <StatusBadge status={status as any} className="text-sm px-3.5 py-1.5" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight mb-1">
              {status === 'VALID' && 'Genuine & Authenticated License'}
              {status === 'REVOKED' && 'License Has Been Revoked'}
              {status === 'EXPIRED' && 'License Subscription Expired'}
              {status === 'INVALID / NOT FOUND' && 'License Token Not Found'}
              {status === 'VERIFICATION UNAVAILABLE' && 'Blockchain Verification Unavailable'}
            </h2>

            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              {result.statusMessage || result.message}
            </p>
          </div>

          {/* License Metadata Details */}
          {result.license && (
            <div className="p-6 sm:p-8 space-y-6 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Software Product</span>
                    <span className="text-base font-bold text-slate-900">
                      {result.license.softwareName}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px] block">
                      Version: {result.license.softwareVersion} • {result.license.softwareCategory}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">License Plan</span>
                    <span className="font-semibold text-slate-800">{result.license.planName}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Registered Publisher</span>
                    <span className="font-mono text-slate-700">{result.license.publisherAddress}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">License Holder (Public Mask)</span>
                    <span className="font-mono text-indigo-700 font-semibold">{result.license.holderAddress}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Issuance Date</span>
                      <span className="font-medium text-slate-800">
                        {new Date(result.license.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-0.5">Expiration Date</span>
                      <span className="font-medium text-slate-800">
                        {result.license.expirationDate.includes('PERPETUAL')
                          ? 'Perpetual Lifetime'
                          : new Date(result.license.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">On-Chain Metadata Hash (Keccak-256)</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate block bg-slate-50 p-2 rounded border border-slate-200">
                      {result.license.metadataHash}
                    </span>
                    {result.license.metadataIntegrityVerified && (
                      <span className="text-emerald-700 text-[11px] flex items-center gap-1 mt-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Metadata hash matches canonical record. No tampering detected.
                      </span>
                    )}
                  </div>

                  {result.license.revocationReason && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                      <strong>Revocation Audit Note:</strong> {result.license.revocationReason}
                    </div>
                  )}

                  <div>
                    <span className="text-slate-400 block mb-0.5">Blockchain Transaction Hash</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate block bg-slate-50 p-2 rounded border border-slate-200">
                      {result.license.transactionHash}
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Network & Node Info */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Network: <strong>{result.license.network}</strong></span>
                  <span>•</span>
                  <span>Contract: <code className="font-mono text-slate-700">{result.license.contractAddress.slice(0, 10)}...</code></span>
                </div>

                <div>
                  Verified at: {result.verifiedAt ? new Date(result.verifiedAt).toLocaleTimeString() : 'Just now'}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
