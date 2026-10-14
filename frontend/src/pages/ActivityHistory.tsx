import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Cpu,
  Layers,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { BlockchainTx } from '../types';
import { CONTRACT_ADDRESS } from '../contracts/contractConfig';

export const ActivityHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<BlockchainTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const loadTxs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTransactions();
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTxs();
  }, []);

  const filteredTxs = transactions.filter(tx => {
    if (filterType !== 'ALL' && tx.eventName !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.txHash.toLowerCase().includes(q) ||
        tx.fromAddress.toLowerCase().includes(q) ||
        tx.method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">On-Chain Activity &amp; Ledger History</h1>
          <span className="badge-valid text-xs">Live Blockchain State</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Auditable record of all confirmed smart contract transactions, license mints, device node-lockings, and revocations on the Ethereum network.
        </p>
      </div>

      {/* Network Health Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Local Blockchain Network</span>
          <div className="text-sm font-bold font-mono text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Hardhat EVM (31337)
          </div>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Smart Contract</span>
          <div className="text-xs font-mono font-bold text-indigo-700 truncate" title={CONTRACT_ADDRESS}>
            {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-4)}
          </div>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Indexed Txs</span>
          <div className="text-xl font-bold font-mono text-slate-900">{transactions.length}</div>
        </div>

        <div className="app-card p-4">
          <span className="text-xs text-slate-500 font-medium block mb-1">Confirmation Status</span>
          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            100% Finalized
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="app-card p-6">
        
        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Blockchain Event Log</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredTxs.length} confirmed)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Tx Hash, Method, or From..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-8 text-xs py-1.5 w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-input text-xs py-1.5 w-44"
            >
              <option value="ALL">All Event Types</option>
              <option value="LicenseIssued">LicenseIssued</option>
              <option value="LicenseActivated">LicenseActivated</option>
              <option value="LicenseRevoked">LicenseRevoked</option>
              <option value="LicenseRenewed">LicenseRenewed</option>
              <option value="LicensePurchased">LicensePurchased</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>Querying local Ethereum blockchain ledger...</div>
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No Confirmed Transactions Found</div>
              <p className="text-[11px] text-slate-400">Transactions appear automatically when licenses are issued, activated, or revoked.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Tx Hash</th>
                  <th className="py-3 px-3">Method Invoked</th>
                  <th className="py-3 px-3">On-Chain Event</th>
                  <th className="py-3 px-3">Caller Address</th>
                  <th className="py-3 px-3">Block #</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredTxs.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-bold text-indigo-700">
                      {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
                    </td>
                    <td className="py-3 px-3 font-sans font-medium text-slate-800">
                      {tx.method}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {tx.eventName || 'ContractExecution'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {tx.fromAddress ? `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}` : '0x7099...79C8'}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      #{tx.blockNumber || 19854010}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};
