import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ShieldX } from 'lucide-react';
import { LicenseStatus } from '../types';

interface StatusBadgeProps {
  status: LicenseStatus | 'VALID' | 'EXPIRED' | 'REVOKED' | 'ISSUED' | 'INVALID / NOT FOUND' | 'VERIFICATION UNAVAILABLE';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const norm = String(status).toUpperCase();

  if (norm === 'VALID' || norm === 'ACTIVE') {
    return (
      <span className={`badge-valid ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>VALID</span>
      </span>
    );
  }

  if (norm === 'EXPIRED') {
    return (
      <span className={`badge-expiring ${className}`}>
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>EXPIRED</span>
      </span>
    );
  }

  if (norm === 'REVOKED') {
    return (
      <span className={`badge-revoked ${className}`}>
        <ShieldX className="w-3.5 h-3.5 text-rose-600" />
        <span>REVOKED</span>
      </span>
    );
  }

  if (norm === 'ISSUED') {
    return (
      <span className={`badge-issued ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
        <span>ISSUED (UNACTIVATED)</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
      <span>{norm}</span>
    </span>
  );
};
