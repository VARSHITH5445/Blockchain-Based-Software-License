import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StoreView from './components/StoreView';
import CustomerVault from './components/CustomerVault';
import VendorPortal from './components/VendorPortal';
import SoftwareSimulator from './components/SoftwareSimulator';
import BlockExplorer from './components/BlockExplorer';
import AcademicDocs from './components/AcademicDocs';
import { licenseService } from './services/web3Service';
import { mockBlockchain } from './services/mockBlockchain';
import { Shield, ExternalLink, Terminal, BookOpen } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('store');
  const [mode, setMode] = useState(licenseService.getMode());
  const [activeAccount, setActiveAccount] = useState(licenseService.getActiveAccount());
  const [products, setProducts] = useState(licenseService.getProducts());
  const [licenses, setLicenses] = useState(licenseService.getLicenses());
  const [blocks, setBlocks] = useState(licenseService.getBlocks());
  const [transactions, setTransactions] = useState(licenseService.getTransactions());
  const [simulatorLicenseId, setSimulatorLicenseId] = useState(null);

  const refreshState = () => {
    setActiveAccount(licenseService.getActiveAccount());
    setProducts([...licenseService.getProducts()]);
    setLicenses([...licenseService.getLicenses()]);
    setBlocks([...licenseService.getBlocks()]);
    setTransactions([...licenseService.getTransactions()]);
  };

  useEffect(() => {
    refreshState();
  }, [mode]);

  const handleModeToggle = async (newMode) => {
    licenseService.setMode(newMode);
    setMode(newMode);
    if (newMode === 'metamask') {
      try {
        await licenseService.connectMetaMask();
      } catch (err) {
        console.warn('MetaMask connection prompt:', err.message);
      }
    }
    refreshState();
  };

  const handleAccountChange = (address) => {
    licenseService.setActiveSimAccount(address);
    refreshState();
  };

  const handleConnectMetaMask = async () => {
    try {
      await licenseService.connectMetaMask();
      refreshState();
    } catch (err) {
      alert(err.message || 'MetaMask connection failed');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all simulated blockchain data, licenses, and blocks to initial defaults?')) {
      licenseService.resetDemoData();
      refreshState();
    }
  };

  // Actions
  const handlePurchase = async (productId) => {
    const res = await licenseService.purchaseLicense(productId);
    refreshState();
    return res;
  };

  const handleBindDevice = async (licenseId, fingerprint, name) => {
    const res = await licenseService.bindDevice(licenseId, fingerprint, name);
    refreshState();
    return res;
  };

  const handleUnbindDevice = async (licenseId, fingerprint) => {
    const res = await licenseService.unbindDevice(licenseId, fingerprint);
    refreshState();
    return res;
  };

  const handleTransferLicense = async (licenseId, toAddress) => {
    const res = await licenseService.transferLicense(licenseId, toAddress);
    refreshState();
    return res;
  };

  const handleResellLicense = async (licenseId, priceETH) => {
    const res = await licenseService.resellLicense(licenseId, priceETH);
    refreshState();
    return res;
  };

  const handleRenewSubscription = async (licenseId) => {
    const res = await licenseService.renewSubscription(licenseId);
    refreshState();
    return res;
  };

  const handleRegisterProduct = async (productData) => {
    const res = await licenseService.registerProduct(productData);
    refreshState();
    return res;
  };

  const handleRevokeLicense = async (licenseId, reason) => {
    const res = await licenseService.revokeLicense(licenseId, reason);
    refreshState();
    return res;
  };

  const handleVerifyLicense = (licenseId, fingerprint, user) => {
    return licenseService.verifyLicense(licenseId, fingerprint, user);
  };

  const handleLaunchInSimulator = (licenseId) => {
    setSimulatorLicenseId(licenseId);
    setCurrentTab('simulator');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar 
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeAccount={activeAccount}
          onAccountChange={handleAccountChange}
          mode={mode}
          onModeToggle={handleModeToggle}
          onResetDemo={handleResetDemo}
          onConnectMetaMask={handleConnectMetaMask}
        />

        {/* Tab Router */}
        <main className="pb-12">
          {currentTab === 'store' && (
            <StoreView 
              products={products}
              onPurchase={handlePurchase}
              activeAccount={activeAccount}
              onViewVault={() => setCurrentTab('vault')}
            />
          )}

          {currentTab === 'vault' && (
            <CustomerVault 
              licenses={licenses}
              products={products}
              activeAccount={activeAccount}
              onBindDevice={handleBindDevice}
              onUnbindDevice={handleUnbindDevice}
              onTransferLicense={handleTransferLicense}
              onResellLicense={handleResellLicense}
              onRenewSubscription={handleRenewSubscription}
              onLaunchInSimulator={handleLaunchInSimulator}
            />
          )}

          {currentTab === 'vendor' && (
            <VendorPortal 
              products={products}
              licenses={licenses}
              activeAccount={activeAccount}
              onRegisterProduct={handleRegisterProduct}
              onRevokeLicense={handleRevokeLicense}
            />
          )}

          {currentTab === 'simulator' && (
            <SoftwareSimulator 
              licenses={licenses}
              products={products}
              activeAccount={activeAccount}
              initialLicenseId={simulatorLicenseId}
              onVerifyLicense={handleVerifyLicense}
            />
          )}

          {currentTab === 'explorer' && (
            <BlockExplorer 
              blocks={blocks}
              transactions={transactions}
              products={products}
              licenses={licenses}
            />
          )}

          {currentTab === 'docs' && (
            <AcademicDocs />
          )}
        </main>
      </div>

      {/* Course Project Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 lg:px-8 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white font-display text-sm">
                Blockchain-Based Software License System
              </div>
              <div className="text-[11px] text-slate-500">
                Course Final Project • Solidity Smart Contracts & Web3 Anti-Piracy DRM
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={() => setCurrentTab('docs')}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Project Report & Viva Q&A</span>
            </button>
            <button 
              onClick={() => setCurrentTab('simulator')}
              className="text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Client Demo Simulator</span>
            </button>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-500">EVM ^0.8.20 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
