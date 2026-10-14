import { ethers } from 'ethers';
import { mockBlockchain } from './mockBlockchain';
import contractABI from '../contracts/contractABI.json';

// Default mock deployed address for local/simulated representation
export const DEFAULT_CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

class LicenseService {
  constructor() {
    this.mode = localStorage.getItem('blockchain_license_mode') || 'simulated'; // 'simulated' | 'metamask'
    this.metaMaskAccount = null;
    this.activeSimAccount = mockBlockchain.getAccounts()[1]; // Alice Johnson by default
    this.contractAddress = localStorage.getItem('deployed_contract_address') || DEFAULT_CONTRACT_ADDRESS;
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode) {
    this.mode = newMode;
    localStorage.setItem('blockchain_license_mode', newMode);
  }

  getActiveAccount() {
    if (this.mode === 'metamask') {
      return this.metaMaskAccount
        ? {
            address: this.metaMaskAccount,
            name: 'MetaMask Connected Wallet',
            role: 'Web3 User',
            balanceETH: this.metaMaskBalance || '0.00',
            avatar: '🦊'
          }
        : null;
    }
    return this.activeSimAccount;
  }

  setActiveSimAccount(accountAddress) {
    const acc = mockBlockchain.getAccounts().find(a => a.address.toLowerCase() === accountAddress.toLowerCase());
    if (acc) {
      this.activeSimAccount = acc;
    }
  }

  async connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask or Web3 wallet extension not found in browser. Please install MetaMask to use live Web3 mode, or switch to In-Browser Simulated mode.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts selected in MetaMask');
    }

    this.metaMaskAccount = accounts[0];
    const balance = await provider.getBalance(this.metaMaskAccount);
    this.metaMaskBalance = parseFloat(ethers.formatEther(balance)).toFixed(4);

    return {
      address: this.metaMaskAccount,
      balance: this.metaMaskBalance
    };
  }

  // --- UNIFIED FACADE METHODS ---

  getProducts() {
    return mockBlockchain.getProducts();
  }

  getLicenses() {
    return mockBlockchain.getLicenses();
  }

  getBlocks() {
    return mockBlockchain.getBlocks();
  }

  getTransactions() {
    return mockBlockchain.getTransactions();
  }

  async purchaseLicense(productId) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('Please select an active wallet or connect MetaMask');

    if (this.mode === 'metamask') {
      // In live MetaMask mode, call contract if configured
      if (!window.ethereum) throw new Error('MetaMask required');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // If user connects live contract:
      try {
        const contract = new ethers.Contract(this.contractAddress, contractABI, signer);
        const product = mockBlockchain.getProducts().find(p => p.id === Number(productId));
        const tx = await contract.purchaseLicense(productId, {
          value: ethers.parseEther(product ? product.priceETH : '0.1')
        });
        await tx.wait();
        // Update mock state for UI consistency
        return mockBlockchain.purchaseLicense(productId, active.address);
      } catch (err) {
        console.warn('Real contract purchase failed or contract not deployed on this network, executing via simulation ledger:', err);
        return mockBlockchain.purchaseLicense(productId, active.address);
      }
    } else {
      return mockBlockchain.purchaseLicense(productId, active.address);
    }
  }

  async bindDevice(licenseId, deviceFingerprint, deviceName) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.bindDevice(licenseId, deviceFingerprint, deviceName, active.address);
  }

  async unbindDevice(licenseId, deviceFingerprint) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.unbindDevice(licenseId, deviceFingerprint, active.address);
  }

  async transferLicense(licenseId, toAddress) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.transferLicense(licenseId, toAddress, active.address);
  }

  async resellLicense(licenseId, priceETH) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.resellLicense(licenseId, active.address, priceETH);
  }

  async renewSubscription(licenseId) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.renewSubscription(licenseId, active.address);
  }

  async revokeLicense(licenseId, reason) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.revokeLicense(licenseId, reason, active.address);
  }

  async registerProduct(productData) {
    const active = this.getActiveAccount();
    if (!active) throw new Error('No active account selected');
    return mockBlockchain.registerProduct(productData, active.address);
  }

  verifyLicense(licenseId, deviceFingerprint, userAddress) {
    return mockBlockchain.verifyLicense(licenseId, deviceFingerprint, userAddress);
  }

  resetDemoData() {
    return mockBlockchain.resetState();
  }
}

export const licenseService = new LicenseService();
