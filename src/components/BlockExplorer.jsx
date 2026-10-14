import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Hash, 
  Activity, 
  ArrowUpRight,
  Database
} from 'lucide-react';

export default function BlockExplorer({ blocks, transactions, products, licenses }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('txs'); // 'txs' | 'blocks' | 'state'

  const filteredTxs = transactions.filter(tx => {
    const s = searchTerm.toLowerCase();
    return (
      tx.hash.toLowerCase().includes(s) ||
      tx.from.toLowerCase().includes(s) ||
      tx.method.toLowerCase().includes(s) ||
      tx.event.toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      
      {/* Explorer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Decentralized Ledger Explorer</h2>
            <span className="badge badge-cyan text-xs">Live On-Chain State</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transparently audit every software license mint, hardware binding, secondary resale, and administrative revocation.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Tx Hash, Address, or Event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9 text-xs py-2 font-mono"
          />
        </div>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Latest Block Height</span>
          <span className="text-xl font-bold font-mono text-cyan-400">
            #{blocks[0]?.blockNumber || 19854010}
          </span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Total Verified Transactions</span>
          <span className="text-xl font-bold font-mono text-white">
            {transactions.length}
          </span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">DRM Smart Contract</span>
          <span className="text-xs font-mono text-emerald-400 truncate block font-bold">
            0x5FbDB2315678...
          </span>
        </div>

        <div className="glass-card p-4 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">Consensus Network</span>
          <span className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            EVM Proof-of-Stake (PoS)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('txs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'txs'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transactions & Events ({filteredTxs.length})
        </button>

        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'blocks'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Mined Blocks ({blocks.length})
        </button>
      </div>

      {/* Table: Transactions */}
      {activeTab === 'txs' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Tx Hash</th>
                  <th className="py-3 px-3">Method / Action</th>
                  <th className="py-3 px-3">Emitted Event</th>
                  <th className="py-3 px-3">From</th>
                  <th className="py-3 px-3">Value</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTxs.map(tx => (
                  <tr key={tx.hash} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-[11px]">
                      {tx.method}
                    </td>
                    <td className="py-3 px-3">
                      <span className="badge badge-cyan text-[10px] font-sans">
                        {tx.event}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {tx.valueETH} ETH
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Blocks */}
      {activeTab === 'blocks' && (
        <div className="glass-panel rounded-2xl border border-slate-800 p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Block #</th>
                  <th className="py-3 px-3">Block Hash</th>
                  <th className="py-3 px-3">Tx Count</th>
                  <th className="py-3 px-3">Gas Used</th>
                  <th className="py-3 px-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blocks.map(block => (
                  <tr key={block.blockNumber} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      #{block.blockNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {block.blockHash.slice(0, 12)}...{block.blockHash.slice(-10)}
                    </td>
                    <td className="py-3 px-3 text-slate-200">
                      {block.txCount} txs
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {block.gasUsed}
                    </td>
                    <td className="py-3 px-3 text-right font-sans text-slate-400">
                      {Math.max(1, Math.floor((Date.now() / 1000 - block.timestamp) / 60))} mins ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
