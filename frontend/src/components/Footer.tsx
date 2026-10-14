import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-sm text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight">ChainLicense</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Blockchain-Based Software License Management & Tamper-Evident Verification Platform. B.Tech final-year engineering capstone project.
            </p>
            <div className="text-xs text-slate-400 font-mono">
              Contract: Solidity ^0.8.20 • Network: EVM Chain ID 31337
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors">Software Catalog</Link></li>
              <li><Link to="/verify" className="hover:text-indigo-600 transition-colors">Public License Verification</Link></li>
              <li><Link to="/activity" className="hover:text-indigo-600 transition-colors">On-Chain Activity History</Link></li>
              <li><Link to="/developer" className="hover:text-indigo-600 transition-colors">Developer & Publisher Hub</Link></li>
            </ul>
          </div>

          {/* Academic Deliverables */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Course Deliverables</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-600">Tamper-Evident DRM Contracts</span></li>
              <li><span className="text-slate-600">Canonical Metadata Integrity</span></li>
              <li><span className="text-slate-600">Hardware Node-Locking Proofs</span></li>
              <li><span className="text-slate-600">Zero-Gas eth_call Verification</span></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 ChainLicense Platform. Developed by Varshith Reddy.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Local Hardhat Node Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
