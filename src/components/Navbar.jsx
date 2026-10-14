import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  Cpu, 
  RotateCcw, 
  ShoppingBag, 
  Key, 
  Layers, 
  Terminal, 
  BookOpen, 
  ExternalLink,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { mockBlockchain } from '../services/mockBlockchain';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  activeAccount, 
  onAccountChange, 
  mode, 
  onModeToggle,
  onResetDemo,
  onConnectMetaMask
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const accounts = mockBlockchain.getAccounts();

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 mb-6 backdrop-blur-xl bg-slate-950/85">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white tracking-tight">ChainLicense</span>
              <span className="badge badge-cyan text-[10px]">Smart DRM</span>
            </div>
            <p className="text-xs text-slate-400">Blockchain-Based Software Licensing</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
          <button 
            onClick={() => setCurrentTab('store')} 
            className={`nav-tab ${currentTab === 'store' ? 'active' : ''}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store</span>
          </button>

          <button 
            onClick={() => setCurrentTab('vault')} 
            className={`nav-tab ${currentTab === 'vault' ? 'active' : ''}`}
          >
            <Key className="w-4 h-4" />
            <span>My Licenses</span>
          </button>

          <button 
            onClick={() => setCurrentTab('vendor')} 
            className={`nav-tab ${currentTab === 'vendor' ? 'active' : ''}`}
          >
            <Layers className="w-4 h-4" />
            <span>Vendor Hub</span>
          </button>

          <button 
            onClick={() => setCurrentTab('simulator')} 
            className={`nav-tab relative ${currentTab === 'simulator' ? 'active ring-1 ring-cyan-400/50' : ''}`}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-cyan-300">Client Demo</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          <button 
            onClick={() => setCurrentTab('explorer')} 
            className={`nav-tab ${currentTab === 'explorer' ? 'active' : ''}`}
          >
            <Cpu className="w-4 h-4" />
            <span>Explorer</span>
          </button>

          <button 
            onClick={() => setCurrentTab('docs')} 
            className={`nav-tab ${currentTab === 'docs' ? 'active' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Docs & Viva</span>
          </button>
        </nav>

        {/* Right Action Bar: Mode Toggle & Wallet Account */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          
          {/* Dual Mode Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onModeToggle('simulated')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                mode === 'simulated' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚡ Sim EVM
            </button>
            <button
              onClick={() => onModeToggle('metamask')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                mode === 'metamask' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🦊 MetaMask
            </button>
          </div>

          {/* Account Selector (Simulated Mode) */}
          {mode === 'simulated' ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs transition-all shadow-sm"
              >
                <span className="text-base">{activeAccount?.avatar || '👤'}</span>
                <div className="text-left">
                  <div className="font-semibold text-slate-200 truncate max-w-[110px]">
                    {activeAccount?.name?.split(' ')[0] || 'Select User'}
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400">
                    {activeAccount?.balanceETH} ETH
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 glass-panel border border-slate-700 rounded-xl shadow-2xl p-2 z-50 bg-slate-900">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Switch Test Account
                  </div>
                  {accounts.map(acc => {
                    const isSelected = activeAccount?.address.toLowerCase() === acc.address.toLowerCase();
                    return (
                      <button
                        key={acc.address}
                        onClick={() => {
                          onAccountChange(acc.address);
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all mb-1 ${
                          isSelected ? 'bg-cyan-500/15 border border-cyan-500/30 text-white' : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{acc.avatar}</span>
                          <div>
                            <div className="font-medium text-xs text-white">{acc.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {acc.address.slice(0, 6)}...{acc.address.slice(-4)} • <span className="text-slate-300">{acc.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-cyan-400">{acc.balanceETH} ETH</div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-auto mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              {activeAccount ? (
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300">{activeAccount.address.slice(0, 6)}...{activeAccount.address.slice(-4)}</span>
                  <span className="text-amber-400 font-bold">{activeAccount.balanceETH} ETH</span>
                </div>
              ) : (
                <button
                  onClick={onConnectMetaMask}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Connect Wallet
                </button>
              )}
            </div>
          )}

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemo}
            title="Reset Simulated Blockchain Data to Clean Defaults"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
