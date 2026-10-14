import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink } from 'lucide-react';

interface QRModalProps {
  licenseId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ licenseId, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const verifyUrl = `${window.location.origin}/verify?id=${licenseId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative text-center">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          License Verification QR Code
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Scan to verify License #{licenseId} directly on the public verification portal.
        </p>

        {/* Dynamic QR Code representation */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block mx-auto mb-5">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}&bgcolor=f8fafc&color=0f172a`}
            alt={`QR Code for License #${licenseId}`}
            className="w-44 h-44 mx-auto rounded"
          />
        </div>

        <div className="text-xs font-mono text-slate-600 bg-slate-100 p-2.5 rounded-lg border border-slate-200 truncate mb-4">
          {verifyUrl}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="w-1/2 btn-outline text-xs py-2 flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <a
            href={verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-1/2 btn-indigo text-xs py-2 flex items-center justify-center gap-1.5"
          >
            <span>Open Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </div>
  );
};
