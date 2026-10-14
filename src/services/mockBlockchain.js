import { ethers } from 'ethers';
import { PRESET_DEVICES, getDeviceFingerprint } from './hardwareIdService';

const STORAGE_KEY = 'blockchain_software_license_state_v1';

export const INITIAL_ACCOUNTS = [
  {
    address: '0x71C949113271DFe8A279b9a6741b65C5A8983281',
    name: 'TechSoft Global (Vendor)',
    role: 'Vendor / Creator',
    balanceETH: '18.45',
    avatar: '🏢'
  },
  {
    address: '0x3Fa892c9E3926839358b688F9A5D64E19F4770Ac',
    name: 'Alice Johnson (Developer)',
    role: 'Customer',
    balanceETH: '4.85',
    avatar: '👩‍💻'
  },
  {
    address: '0x88B35b30Eca926E63e12089cEcC110d704F94Ec3',
    name: 'Bob Smith (Enterprise IT Admin)',
    role: 'Customer',
    balanceETH: '14.20',
    avatar: '👨‍💼'
  },
  {
    address: '0x99C23Da7b0496E75DeB33b1e3604f3d1b7D6789c',
    name: 'Charlie Davis (Security Auditor)',
    role: 'Customer',
    balanceETH: '2.50',
    avatar: '🧑‍🔬'
  }
];

export const LICENSE_TYPES = {
  PERPETUAL: 0,
  SUBSCRIPTION: 1,
  SEAT_BASED: 2
};

export const LICENSE_STATUS = {
  ACTIVE: 0,
  SUSPENDED: 1,
  REVOKED: 2,
  EXPIRED: 3
};

function generateTxHash() {
  return ethers.hexlify(ethers.randomBytes(32));
}

function generateBlockHash() {
  return ethers.hexlify(ethers.randomBytes(32));
}

function getDefaultState() {
  const defaultDevice1 = getDeviceFingerprint('device_win11');
  const now = Math.floor(Date.now() / 1000);

  const products = [
    {
      id: 1,
      name: 'CyberShield Pro Enterprise',
      version: 'v4.2.0',
      description: 'Zero-trust endpoint firewall, packet sniffer, and threat mitigation engine with seat-based cryptographic licensing.',
      priceWei: ethers.parseEther('0.35').toString(),
      priceETH: '0.35',
      licenseType: LICENSE_TYPES.SEAT_BASED,
      licenseTypeName: 'Seat-Based (Multi-Device)',
      durationInSeconds: 0,
      maxSeatsPerLicense: 3,
      royaltyBasisPoints: 500, // 5%
      vendor: INITIAL_ACCOUNTS[0].address,
      isActive: true,
      category: 'Cybersecurity',
      badgeColor: 'cyan'
    },
    {
      id: 2,
      name: 'DevIDE Studio 2026',
      version: 'v2.5.1',
      description: 'Modern developer environment with offline token validation, smart contract debugging, and secondary peer resale support.',
      priceWei: ethers.parseEther('0.20').toString(),
      priceETH: '0.20',
      licenseType: LICENSE_TYPES.PERPETUAL,
      licenseTypeName: 'Perpetual (Lifetime)',
      durationInSeconds: 0,
      maxSeatsPerLicense: 1,
      royaltyBasisPoints: 1000, // 10%
      vendor: INITIAL_ACCOUNTS[0].address,
      isActive: true,
      category: 'Development Tool',
      badgeColor: 'violet'
    },
    {
      id: 3,
      name: 'NeuralData AI Pipeline',
      version: 'v1.8.0',
      description: 'High-throughput neural network training suite and model serving pipeline with 30-day recurring subscription.',
      priceWei: ethers.parseEther('0.12').toString(),
      priceETH: '0.12',
      licenseType: LICENSE_TYPES.SUBSCRIPTION,
      licenseTypeName: 'Subscription (30 Days)',
      durationInSeconds: 30 * 24 * 3600, // 30 days
      maxSeatsPerLicense: 1,
      royaltyBasisPoints: 0,
      vendor: INITIAL_ACCOUNTS[0].address,
      isActive: true,
      category: 'AI / Data Science',
      badgeColor: 'emerald'
    },
    {
      id: 4,
      name: 'QuantumCAD Design Suite',
      version: 'v5.0.0',
      description: 'Parametric 3D mechanical CAD and structural analysis system with immutable license ownership and node-locking.',
      priceWei: ethers.parseEther('0.50').toString(),
      priceETH: '0.50',
      licenseType: LICENSE_TYPES.PERPETUAL,
      licenseTypeName: 'Perpetual (Lifetime)',
      durationInSeconds: 0,
      maxSeatsPerLicense: 1,
      royaltyBasisPoints: 800, // 8%
      vendor: INITIAL_ACCOUNTS[0].address,
      isActive: true,
      category: 'CAD / Engineering',
      badgeColor: 'amber'
    }
  ];

  const licenses = [
    {
      licenseId: 1001,
      productId: 1,
      owner: INITIAL_ACCOUNTS[1].address, // Alice
      issueTimestamp: now - 86400 * 5,
      expiryTimestamp: 0,
      maxSeats: 3,
      seatsUsed: 1,
      status: LICENSE_STATUS.ACTIVE,
      statusName: 'ACTIVE',
      revocationReason: '',
      transferable: false,
      boundDevices: [
        {
          fingerprint: defaultDevice1.hash,
          deviceName: defaultDevice1.name,
          boundAt: now - 86400 * 5
        }
      ]
    },
    {
      licenseId: 1002,
      productId: 2,
      owner: INITIAL_ACCOUNTS[1].address, // Alice
      issueTimestamp: now - 86400 * 3,
      expiryTimestamp: 0,
      maxSeats: 1,
      seatsUsed: 0,
      status: LICENSE_STATUS.ACTIVE,
      statusName: 'ACTIVE',
      revocationReason: '',
      transferable: true,
      boundDevices: []
    },
    {
      licenseId: 1003,
      productId: 3,
      owner: INITIAL_ACCOUNTS[2].address, // Bob
      issueTimestamp: now - 86400 * 4,
      expiryTimestamp: now + 86400 * 26, // 26 days left
      maxSeats: 1,
      seatsUsed: 0,
      status: LICENSE_STATUS.ACTIVE,
      statusName: 'ACTIVE',
      revocationReason: '',
      transferable: false,
      boundDevices: []
    }
  ];

  const blocks = [
    {
      blockNumber: 19854010,
      timestamp: now - 86400 * 5,
      blockHash: generateBlockHash(),
      txCount: 2,
      gasUsed: '245,180'
    },
    {
      blockNumber: 19854011,
      timestamp: now - 86400 * 3,
      blockHash: generateBlockHash(),
      txCount: 1,
      gasUsed: '182,400'
    },
    {
      blockNumber: 19854012,
      timestamp: now - 86400 * 2,
      blockHash: generateBlockHash(),
      txCount: 1,
      gasUsed: '198,320'
    }
  ];

  const transactions = [
    {
      hash: generateTxHash(),
      blockNumber: 19854010,
      timestamp: now - 86400 * 5,
      from: INITIAL_ACCOUNTS[1].address,
      to: '0xContract...SoftwareLicenseManager',
      method: 'purchaseLicense(productId: 1)',
      valueETH: '0.35',
      status: 'CONFIRMED',
      event: 'LicensePurchased (ID #1001)'
    },
    {
      hash: generateTxHash(),
      blockNumber: 19854010,
      timestamp: now - 86400 * 5,
      from: INITIAL_ACCOUNTS[1].address,
      to: '0xContract...SoftwareLicenseManager',
      method: 'bindDevice(licenseId: 1001, deviceHash: ' + defaultDevice1.shortHash + ')',
      valueETH: '0.00',
      status: 'CONFIRMED',
      event: 'DeviceBound'
    },
    {
      hash: generateTxHash(),
      blockNumber: 19854011,
      timestamp: now - 86400 * 3,
      from: INITIAL_ACCOUNTS[1].address,
      to: '0xContract...SoftwareLicenseManager',
      method: 'purchaseLicense(productId: 2)',
      valueETH: '0.20',
      status: 'CONFIRMED',
      event: 'LicensePurchased (ID #1002)'
    },
    {
      hash: generateTxHash(),
      blockNumber: 19854012,
      timestamp: now - 86400 * 2,
      from: INITIAL_ACCOUNTS[2].address,
      to: '0xContract...SoftwareLicenseManager',
      method: 'purchaseLicense(productId: 3)',
      valueETH: '0.12',
      status: 'CONFIRMED',
      event: 'LicensePurchased (ID #1003)'
    }
  ];

  return {
    accounts: INITIAL_ACCOUNTS,
    currentBlockNumber: 19854013,
    products,
    licenses,
    blocks,
    transactions,
    nextLicenseId: 1004,
    nextProductId: 5
  };
}

class MockBlockchainService {
  constructor() {
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
      } else {
        this.state = getDefaultState();
        this.saveState();
      }
    } catch (e) {
      console.warn('Failed to load mock blockchain state from storage, using defaults', e);
      this.state = getDefaultState();
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving mock blockchain state', e);
    }
  }

  resetState() {
    this.state = getDefaultState();
    this.saveState();
    return this.state;
  }

  getAccounts() {
    return this.state.accounts;
  }

  getProducts() {
    return this.state.products;
  }

  getLicenses() {
    return this.state.licenses;
  }

  getBlocks() {
    return [...this.state.blocks].reverse();
  }

  getTransactions() {
    return [...this.state.transactions].reverse();
  }

  mineBlock(txs = []) {
    const newBlockNumber = ++this.state.currentBlockNumber;
    const block = {
      blockNumber: newBlockNumber,
      timestamp: Math.floor(Date.now() / 1000),
      blockHash: generateBlockHash(),
      txCount: txs.length || 1,
      gasUsed: (140000 + Math.floor(Math.random() * 80000)).toLocaleString()
    };
    this.state.blocks.push(block);
    return block;
  }

  logTx(from, method, valueETH, eventName) {
    const tx = {
      hash: generateTxHash(),
      blockNumber: this.state.currentBlockNumber,
      timestamp: Math.floor(Date.now() / 1000),
      from,
      to: '0x5F98...SoftwareLicenseManager',
      method,
      valueETH: valueETH || '0.00',
      status: 'CONFIRMED',
      event: eventName
    };
    this.state.transactions.push(tx);
    this.mineBlock([tx]);
    return tx;
  }

  // --- CONTRACT METHODS ---

  purchaseLicense(productId, buyerAddress) {
    const product = this.state.products.find(p => p.id === Number(productId));
    if (!product) throw new Error('Product not found');
    if (!product.isActive) throw new Error('Product is discontinued');

    const buyer = this.state.accounts.find(a => a.address.toLowerCase() === buyerAddress.toLowerCase());
    if (buyer) {
      const price = parseFloat(product.priceETH);
      const balance = parseFloat(buyer.balanceETH);
      if (balance < price) {
        throw new Error(`Insufficient funds: Balance is ${balance} ETH, price is ${price} ETH`);
      }
      buyer.balanceETH = (balance - price).toFixed(3);

      // Vendor payout
      const vendor = this.state.accounts.find(a => a.address.toLowerCase() === product.vendor.toLowerCase());
      if (vendor) {
        vendor.balanceETH = (parseFloat(vendor.balanceETH) + price * 0.99).toFixed(3);
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const expiry = product.licenseType === LICENSE_TYPES.SUBSCRIPTION 
      ? now + product.durationInSeconds 
      : 0;

    const licenseId = this.state.nextLicenseId++;
    const newLicense = {
      licenseId,
      productId: product.id,
      owner: buyerAddress,
      issueTimestamp: now,
      expiryTimestamp: expiry,
      maxSeats: product.maxSeatsPerLicense,
      seatsUsed: 0,
      status: LICENSE_STATUS.ACTIVE,
      statusName: 'ACTIVE',
      revocationReason: '',
      transferable: product.licenseType === LICENSE_TYPES.PERPETUAL,
      boundDevices: []
    };

    this.state.licenses.push(newLicense);
    this.logTx(
      buyerAddress,
      `purchaseLicense(productId: ${productId})`,
      product.priceETH,
      `LicensePurchased (#${licenseId})`
    );

    this.saveState();
    return newLicense;
  }

  bindDevice(licenseId, deviceFingerprint, deviceName, callerAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');
    if (license.owner.toLowerCase() !== callerAddress.toLowerCase()) {
      throw new Error('Caller is not the license owner');
    }
    if (license.status !== LICENSE_STATUS.ACTIVE) {
      throw new Error(`License is not active (Status: ${license.statusName})`);
    }
    if (license.expiryTimestamp !== 0 && license.expiryTimestamp < Math.floor(Date.now() / 1000)) {
      throw new Error('Subscription has expired');
    }
    if (license.seatsUsed >= license.maxSeats) {
      throw new Error(`Max seats limit reached (${license.seatsUsed}/${license.maxSeats})`);
    }
    const alreadyBound = license.boundDevices.some(d => d.fingerprint === deviceFingerprint);
    if (alreadyBound) {
      throw new Error('This hardware fingerprint is already bound to this license');
    }

    const now = Math.floor(Date.now() / 1000);
    license.boundDevices.push({
      fingerprint: deviceFingerprint,
      deviceName: deviceName || 'Hardware Device',
      boundAt: now
    });
    license.seatsUsed = license.boundDevices.length;

    this.logTx(
      callerAddress,
      `bindDevice(licenseId: ${licenseId}, deviceHash: ${deviceFingerprint.slice(0, 10)}...)`,
      '0.00',
      `DeviceBound (Seats: ${license.seatsUsed}/${license.maxSeats})`
    );

    this.saveState();
    return license;
  }

  unbindDevice(licenseId, deviceFingerprint, callerAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');
    if (license.owner.toLowerCase() !== callerAddress.toLowerCase()) {
      throw new Error('Caller is not the license owner');
    }

    license.boundDevices = license.boundDevices.filter(d => d.fingerprint !== deviceFingerprint);
    license.seatsUsed = license.boundDevices.length;

    this.logTx(
      callerAddress,
      `unbindDevice(licenseId: ${licenseId}, deviceHash: ${deviceFingerprint.slice(0, 10)}...)`,
      '0.00',
      `DeviceUnbound (Seats remaining: ${license.seatsUsed}/${license.maxSeats})`
    );

    this.saveState();
    return license;
  }

  transferLicense(licenseId, toAddress, callerAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');
    if (license.owner.toLowerCase() !== callerAddress.toLowerCase()) {
      throw new Error('Caller does not own this license');
    }
    if (!license.transferable) {
      throw new Error('This license type is non-transferable (Subscription or Seat-based)');
    }
    if (license.status !== LICENSE_STATUS.ACTIVE) {
      throw new Error('Only active licenses can be transferred');
    }
    if (!toAddress || toAddress === callerAddress) {
      throw new Error('Invalid recipient address');
    }

    // Clear bound devices for anti-piracy
    license.boundDevices = [];
    license.seatsUsed = 0;
    license.owner = toAddress;

    this.logTx(
      callerAddress,
      `transferLicense(to: ${toAddress.slice(0, 8)}..., licenseId: ${licenseId})`,
      '0.00',
      `LicenseTransferred (#${licenseId})`
    );

    this.saveState();
    return license;
  }

  resellLicense(licenseId, buyerAddress, resalePriceETH) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');
    if (!license.transferable) throw new Error('License is not transferable');
    if (license.status !== LICENSE_STATUS.ACTIVE) throw new Error('License is not active');

    const product = this.state.products.find(p => p.id === license.productId);
    const seller = this.state.accounts.find(a => a.address.toLowerCase() === license.owner.toLowerCase());
    const buyer = this.state.accounts.find(a => a.address.toLowerCase() === buyerAddress.toLowerCase());
    const vendor = this.state.accounts.find(a => a.address.toLowerCase() === (product?.vendor || '').toLowerCase());

    const price = parseFloat(resalePriceETH);
    if (buyer) {
      if (parseFloat(buyer.balanceETH) < price) {
        throw new Error('Buyer has insufficient ETH balance');
      }
      buyer.balanceETH = (parseFloat(buyer.balanceETH) - price).toFixed(3);
    }

    // Calculate royalty
    const royaltyRate = (product?.royaltyBasisPoints || 500) / 10000;
    const royaltyETH = price * royaltyRate;
    const sellerETH = price - royaltyETH;

    if (seller) {
      seller.balanceETH = (parseFloat(seller.balanceETH) + sellerETH).toFixed(3);
    }
    if (vendor && royaltyETH > 0) {
      vendor.balanceETH = (parseFloat(vendor.balanceETH) + royaltyETH).toFixed(3);
    }

    const previousOwner = license.owner;
    license.owner = buyerAddress;
    license.boundDevices = [];
    license.seatsUsed = 0;

    this.logTx(
      buyerAddress,
      `resellLicense(licenseId: ${licenseId}, price: ${price} ETH)`,
      price.toString(),
      `LicenseResold (#${licenseId}, Royalty: ${royaltyETH.toFixed(3)} ETH)`
    );

    this.saveState();
    return license;
  }

  renewSubscription(licenseId, callerAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');
    const product = this.state.products.find(p => p.id === license.productId);
    if (!product || product.licenseType !== LICENSE_TYPES.SUBSCRIPTION) {
      throw new Error('Only subscription licenses can be renewed');
    }
    if (license.status === LICENSE_STATUS.REVOKED) {
      throw new Error('Cannot renew a revoked license');
    }

    const price = parseFloat(product.priceETH);
    const caller = this.state.accounts.find(a => a.address.toLowerCase() === callerAddress.toLowerCase());
    if (caller) {
      if (parseFloat(caller.balanceETH) < price) {
        throw new Error('Insufficient balance to renew subscription');
      }
      caller.balanceETH = (parseFloat(caller.balanceETH) - price).toFixed(3);
    }

    const now = Math.floor(Date.now() / 1000);
    const currentExpiry = license.expiryTimestamp;
    if (currentExpiry < now) {
      license.expiryTimestamp = now + product.durationInSeconds;
    } else {
      license.expiryTimestamp = currentExpiry + product.durationInSeconds;
    }

    license.status = LICENSE_STATUS.ACTIVE;
    license.statusName = 'ACTIVE';

    this.logTx(
      callerAddress,
      `renewSubscription(licenseId: ${licenseId})`,
      product.priceETH,
      `LicenseRenewed (#${licenseId})`
    );

    this.saveState();
    return license;
  }

  revokeLicense(licenseId, reason, vendorAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) throw new Error('License not found');

    license.status = LICENSE_STATUS.REVOKED;
    license.statusName = 'REVOKED';
    license.revocationReason = reason || 'Breach of Terms / Piracy Mitigation';

    this.logTx(
      vendorAddress,
      `revokeLicense(licenseId: ${licenseId}, reason: "${license.revocationReason}")`,
      '0.00',
      `LicenseRevoked (#${licenseId})`
    );

    this.saveState();
    return license;
  }

  registerProduct(productData, vendorAddress) {
    const id = this.state.nextProductId++;
    const priceETH = productData.priceETH || '0.25';
    const newProduct = {
      id,
      name: productData.name,
      version: productData.version || 'v1.0.0',
      description: productData.description || 'Enterprise decentralized software product.',
      priceWei: ethers.parseEther(priceETH).toString(),
      priceETH: priceETH,
      licenseType: Number(productData.licenseType),
      licenseTypeName: productData.licenseType === 0 ? 'Perpetual (Lifetime)' : (productData.licenseType === 1 ? 'Subscription' : 'Seat-Based'),
      durationInSeconds: productData.licenseType === 1 ? (productData.durationDays || 30) * 86400 : 0,
      maxSeatsPerLicense: productData.licenseType === 2 ? Number(productData.maxSeats || 3) : 1,
      royaltyBasisPoints: Number(productData.royaltyBasisPoints || 500),
      vendor: vendorAddress,
      isActive: true,
      category: productData.category || 'Security Tool',
      badgeColor: 'cyan'
    };

    this.state.products.push(newProduct);
    this.logTx(
      vendorAddress,
      `registerProduct(name: "${productData.name}", price: ${priceETH} ETH)`,
      '0.00',
      `ProductRegistered (#${id}: ${productData.name})`
    );

    this.saveState();
    return newProduct;
  }

  verifyLicense(licenseId, deviceFingerprint, userAddress) {
    const license = this.state.licenses.find(l => l.licenseId === Number(licenseId));
    if (!license) {
      return {
        isValid: false,
        code: 'ERR_NON_EXISTENT',
        message: 'License ID does not exist on the blockchain ledger.'
      };
    }

    if (userAddress && license.owner.toLowerCase() !== userAddress.toLowerCase()) {
      return {
        isValid: false,
        code: 'ERR_OWNERSHIP_MISMATCH',
        message: `Ownership mismatch: Token belongs to ${license.owner.slice(0, 8)}..., not ${userAddress.slice(0, 8)}...`
      };
    }

    if (license.status === LICENSE_STATUS.REVOKED) {
      return {
        isValid: false,
        code: 'ERR_REVOKED',
        message: `License REVOKED by vendor. Reason: "${license.revocationReason}"`
      };
    }

    if (license.status === LICENSE_STATUS.SUSPENDED) {
      return {
        isValid: false,
        code: 'ERR_SUSPENDED',
        message: 'License is temporarily suspended by vendor administrative order.'
      };
    }

    const now = Math.floor(Date.now() / 1000);
    if (license.expiryTimestamp !== 0 && now > license.expiryTimestamp) {
      return {
        isValid: false,
        code: 'ERR_EXPIRED',
        message: `Subscription expired on ${new Date(license.expiryTimestamp * 1000).toLocaleDateString()}. Please renew.`
      };
    }

    if (deviceFingerprint) {
      const isBound = license.boundDevices.some(d => d.fingerprint === deviceFingerprint);
      if (!isBound) {
        return {
          isValid: false,
          code: 'ERR_HARDWARE_MISMATCH',
          message: `Hardware node-lock failure: Device fingerprint (${deviceFingerprint.slice(0, 10)}...) is not authorized on this license. (Seats: ${license.seatsUsed}/${license.maxSeats})`
        };
      }
    }

    const product = this.state.products.find(p => p.id === license.productId);
    return {
      isValid: true,
      code: 'AUTH_SUCCESS',
      message: 'Cryptographic on-chain license validated successfully.',
      license,
      product
    };
  }
}

export const mockBlockchain = new MockBlockchainService();
