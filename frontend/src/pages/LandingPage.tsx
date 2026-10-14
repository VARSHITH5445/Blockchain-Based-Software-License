import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  Layers, 
  Lock, 
  RefreshCw, 
  Activity, 
  ExternalLink,
  ChevronRight,
  Database,
  KeyRound
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 py-6">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-14">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>B.Tech Final-Year Capstone Project • EVM Smart Contracts</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-6">
          Software Licensing, <br />
          <span className="text-indigo-600">Secured by Blockchain.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Eliminate crack keys, single-point-of-failure activation servers, and opaque software fraud. 
          ChainLicense combines tamper-evident Ethereum smart contracts with hardware node-locking and zero-gas cryptographic verification.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-16">
          <Link to="/products" className="w-full sm:w-auto btn-indigo text-base py-3 px-6 shadow-md hover:shadow-lg">
            <span>Explore Software Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/verify" className="w-full sm:w-auto btn-outline text-base py-3 px-6">
            <Search className="w-4 h-4 text-slate-500" />
            <span>Verify a License</span>
          </Link>
        </div>

        {/* Interactive Verification Preview Card */}
        <div className="max-w-4xl mx-auto app-card p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50/80 border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">CyberShield Pro Enterprise</span>
                  <span className="badge-valid text-[10px]">VERIFIED ON-CHAIN</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Token ID: #1001 • Plan: Enterprise (3 Nodes)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                0 Gas (eth_call view)
              </span>
              <Link to="/verify?id=1001" className="btn-indigo text-xs py-1.5 px-3">
                Live Test
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-left text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Publisher Wallet</span>
              <span className="font-mono font-medium text-slate-800">0x7099...79C8</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Customer Wallet</span>
              <span className="font-mono font-medium text-slate-800">0x3C44...93BC</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Node Fingerprint</span>
              <span className="font-mono font-medium text-indigo-600">0x71c35b8e...</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Contract Status</span>
              <span className="font-bold text-emerald-600">ACTIVE & BOUND</span>
            </div>
          </div>
        </div>

      </section>

      {/* Three-Step How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            How ChainLicense Works
          </h2>
          <p className="text-sm text-slate-600">
            A seamless three-step protocol bridging off-chain application execution with decentralized blockchain consensus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="app-card p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-5 text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Publish & Configure</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Software developers add products and define custom plans: perpetual lifetime, recurring subscription durations, and maximum machine seat quotas.
            </p>
          </div>

          <div className="app-card p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-5 text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Mint On-Chain Token</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon customer acquisition, the smart contract mints an immutable license record with canonical metadata hash and emits transparent event logs.
            </p>
          </div>

          <div className="app-card p-6 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-5 text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Zero-Gas Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Desktop applications query the smart contract via read-only <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">verifyLicense()</code> without spending gas, validating machine hardware bindings instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Architected for Academic & Enterprise Rigor
          </h2>
          <p className="text-sm text-slate-600">
            Engineered to overcome the vulnerabilities inherent in traditional serial numbers and centralized activation databases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="app-card p-5">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tamper-Evident Records</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Licenses exist as cryptographic ledger state. No user or attacker can forge or alter records without changing Ethereum consensus.
            </p>
          </div>

          <div className="app-card p-5">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Hardware Node-Locking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keccak-256 machine fingerprinting prevents unauthorized binary replication or running a single key across unlimited computers.
            </p>
          </div>

          <div className="app-card p-5">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Lifecycle Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforces automated expiration timestamps, seat deactivations, and instant administrative revocations with auditable on-chain reasons.
            </p>
          </div>

          <div className="app-card p-5">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Zero Single-Point-of-Failure</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Eliminates dependence on closed activation servers. Client applications query thousands of decentralized Ethereum nodes worldwide.
            </p>
          </div>

        </div>
      </section>

      {/* Workflow Diagram & Tech Stack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="app-card p-8 bg-slate-900 text-white">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 block mb-2">System Architecture</span>
            <h3 className="text-2xl font-bold text-white mb-2">
              Full-Stack Monorepo Integration
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A hybrid architecture: off-chain PostgreSQL + Prisma indexing for high-speed queries, paired with Solidity smart contracts on Hardhat Ethereum for authoritative license state.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-indigo-300 block">Frontend Tier</span>
              <p className="text-slate-400">React.js + TypeScript + Vite + Tailwind CSS + Ethers.js v6 + Lucide Icons</p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-indigo-300 block">Backend & Database Tier</span>
              <p className="text-slate-400">Node.js + Express.js + PostgreSQL + Prisma ORM + JWT Auth + Rate Limiting</p>
            </div>
            <div className="space-y-2">
              <span className="font-bold text-indigo-300 block">Smart Contract Tier</span>
              <p className="text-slate-400">Solidity ^0.8.20 + Hardhat + OpenZeppelin AccessControl + EVM 31337</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
        <div className="app-card p-10 bg-indigo-50 border-indigo-200">
          <h3 className="text-2xl font-bold text-indigo-950 mb-2">Ready to Demonstrate to Faculty?</h3>
          <p className="text-xs text-indigo-700 max-w-xl mx-auto mb-6">
            Open the Developer Dashboard to issue a test license, test public verification with zero gas, and inspect the confirmed on-chain activity ledger.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/developer" className="btn-indigo text-xs py-2.5 px-5">
              Open Developer Dashboard
            </Link>
            <Link to="/verify" className="btn-outline text-xs py-2.5 px-5 bg-white">
              Launch Public Verifier
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
