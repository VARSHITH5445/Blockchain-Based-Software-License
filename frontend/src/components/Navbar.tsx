import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Wallet, 
  Search, 
  Key, 
  Layers, 
  Activity, 
  ShieldAlert, 
  LogOut, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';
import { Role } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchTestRole } = useAuth();
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-slate-900 tracking-tight leading-none">
              ChainLicense
            </div>
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Decentralized DRM
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/products"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isActive('/products') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Software Catalog
          </Link>

          <Link
            to="/verify"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive('/verify') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Verify License</span>
          </Link>

          {user?.role === 'PUBLISHER' && (
            <Link
              to="/developer"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/developer') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Developer Hub</span>
            </Link>
          )}

          {user?.role === 'CUSTOMER' && (
            <Link
              to="/customer"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/customer') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>My Licenses</span>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/admin') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}

          <Link
            to="/activity"
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              isActive('/activity') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Ledger Activity</span>
          </Link>
        </nav>

        {/* Right Tools: Role Switcher & MetaMask */}
        <div className="flex items-center gap-2.5">
          
          {/* Quick Demo Persona Switcher (For academic evaluation) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-700 transition-colors"
              title="Switch demo persona for project review"
            >
              <span className="font-semibold text-indigo-700">Role:</span>
              <span>{user?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Persona Switcher
                </div>
                {(['PUBLISHER', 'CUSTOMER', 'ADMIN'] as Role[]).map(r => (
                  <button
                    key={r}
                    onClick={async () => {
                      setRoleMenuOpen(false);
                      await switchTestRole(r);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-between ${
                      user?.role === r ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r === 'PUBLISHER' ? 'Developer / Publisher' : (r === 'CUSTOMER' ? 'Customer Holder' : 'Administrator')}</span>
                    {user?.role === r && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MetaMask Connect */}
          {account ? (
            <button
              onClick={disconnectWallet}
              title="Click to disconnect wallet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}

          {/* User Profile / Auth */}
          {user ? (
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link to="/login" className="btn-indigo text-xs py-1.5 px-3">
              Sign In
            </Link>
          )}

        </div>

      </div>
    </header>
  );
};
