import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(__dirname, '../../data/store.json');
const DEPLOYMENT_PATH = path.join(__dirname, '../deployments/localhost.json');

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'PUBLISHER' | 'CUSTOMER';
  walletAddress?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftwareProductEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  imageUrl?: string;
  publisherId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicensePlanEntity {
  id: string;
  productId: string;
  name: string;
  licenseType: 'PERPETUAL' | 'SUBSCRIPTION' | 'TRIAL' | 'SEAT_BASED';
  durationDays: number;
  maxSeats: number;
  priceDemo: number;
  isDefault: boolean;
  createdAt: Date;
}

export interface LicenseMetadataEntity {
  id: string;
  onChainId: number;
  productId: string;
  planId: string;
  publisherId: string;
  customerId: string;
  metadataHash: string;
  canonicalJson: string;
  onChainStatus: 'ISSUED' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  txHash: string;
  expirationDate: Date | null;
  maxSeats: number;
  currentSeats: number;
  revocationReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionEntity {
  id: string;
  txHash: string;
  blockNumber: number;
  fromAddress: string;
  toAddress: string;
  method: string;
  eventName: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
  createdAt: Date;
}

export interface AuditLogEntity {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  details: string;
  createdAt: Date;
}

class PersistentDataStore {
  contractAddress: string = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';
  users: UserEntity[] = [];
  products: SoftwareProductEntity[] = [];
  plans: LicensePlanEntity[] = [];
  licenses: LicenseMetadataEntity[] = [];
  purchases: any[] = [];
  transactions: TransactionEntity[] = [];
  auditLogs: AuditLogEntity[] = [];

  constructor() {
    this.init();
  }

  init() {
    // Check if deployment artifact exists to update contract address
    if (fs.existsSync(DEPLOYMENT_PATH)) {
      try {
        const dep = JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, 'utf-8'));
        if (dep.address) {
          this.contractAddress = dep.address;
        }
      } catch (e) {
        // use default
      }
    }

    if (fs.existsSync(STORE_PATH)) {
      try {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.contractAddress) this.contractAddress = parsed.contractAddress;
        if (Array.isArray(parsed.users) && parsed.users.length > 0) this.users = parsed.users;
        if (Array.isArray(parsed.products) && parsed.products.length > 0) this.products = parsed.products;
        if (Array.isArray(parsed.plans) && parsed.plans.length > 0) this.plans = parsed.plans;
        if (Array.isArray(parsed.licenses)) this.licenses = parsed.licenses;
        if (Array.isArray(parsed.purchases)) this.purchases = parsed.purchases;
        if (Array.isArray(parsed.transactions)) this.transactions = parsed.transactions;
        if (Array.isArray(parsed.auditLogs)) this.auditLogs = parsed.auditLogs;
        console.log(`[Database] Loaded persistent data store (${this.products.length} products, ${this.licenses.length} licenses, ${this.users.length} users).`);
        return;
      } catch (err: any) {
        console.warn('[Database] Could not parse existing store.json, regenerating defaults:', err.message);
      }
    }

    this.seedDefaults();
    this.save();
  }

  save() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        contractAddress: this.contractAddress,
        users: this.users,
        products: this.products,
        plans: this.plans,
        licenses: this.licenses,
        purchases: this.purchases,
        transactions: this.transactions,
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[Database] Error saving data store to disk:', err.message);
    }
  }

  seedDefaults() {
    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const now = new Date();

    const adminUser: UserEntity = {
      id: 'usr-admin-01',
      email: 'admin@licensechain.org',
      passwordHash,
      name: 'System Administrator',
      role: 'ADMIN',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const publisherUser: UserEntity = {
      id: 'usr-pub-01',
      email: 'publisher@cybershield.io',
      passwordHash,
      name: 'TechSoft Cyber Labs',
      role: 'PUBLISHER',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const customerUser: UserEntity = {
      id: 'usr-cust-01',
      email: 'customer@enterprise.com',
      passwordHash,
      name: 'Alice Johnson (Enterprise)',
      role: 'CUSTOMER',
      walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.users = [adminUser, publisherUser, customerUser];

    // 5 Comprehensive Software Products
    this.products = [
      {
        id: 'prod-01',
        name: 'DevIDE Studio 2026',
        slug: 'devide-studio',
        description: 'Cloud-native IDE with smart contract static analysis, gas profiler, and on-chain license verification.',
        category: 'Developer Tools',
        version: 'v2.5.1',
        imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
        publisherId: publisherUser.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 20),
        updatedAt: now,
      },
      {
        id: 'prod-02',
        name: 'SecureVault Pro',
        slug: 'securevault-pro',
        description: 'Zero-trust endpoint defense, kernel packet sniffer, and threat mitigation with seat-based cryptographic licensing.',
        category: 'Security Software',
        version: 'v4.2.0',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
        publisherId: publisherUser.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 18),
        updatedAt: now,
      },
      {
        id: 'prod-03',
        name: 'CloudSync Manager',
        slug: 'cloudsync-manager',
        description: 'Real-time hybrid cloud storage synchronization and encrypted distributed backup manager.',
        category: 'Productivity',
        version: 'v3.1.0',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        publisherId: publisherUser.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: now,
      },
      {
        id: 'prod-04',
        name: 'DesignFlow Studio',
        slug: 'designflow-studio',
        description: 'Vector UI/UX prototyping suite with real-time multiplayer canvas and asset crypto-watermarking.',
        category: 'Design Software',
        version: 'v5.0.2',
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
        publisherId: publisherUser.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 12),
        updatedAt: now,
      },
      {
        id: 'prod-05',
        name: 'DataLens Analytics',
        slug: 'datalens-analytics',
        description: 'Enterprise vector database intelligence, high-throughput batch query orchestrator, and real-time telemetry.',
        category: 'Data Analytics',
        version: 'v2.1.4',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
        publisherId: publisherUser.id,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000 * 10),
        updatedAt: now,
      },
    ];

    this.plans = [
      {
        id: 'plan-01',
        productId: 'prod-01',
        name: 'Perpetual Developer License',
        licenseType: 'PERPETUAL',
        durationDays: 0,
        maxSeats: 1,
        priceDemo: 0.20,
        isDefault: true,
        createdAt: now,
      },
      {
        id: 'plan-02',
        productId: 'prod-01',
        name: 'Annual Team Subscription',
        licenseType: 'SEAT_BASED',
        durationDays: 365,
        maxSeats: 5,
        priceDemo: 0.50,
        isDefault: false,
        createdAt: now,
      },
      {
        id: 'plan-03',
        productId: 'prod-02',
        name: 'Multi-Seat Enterprise (3 Nodes)',
        licenseType: 'SEAT_BASED',
        durationDays: 0,
        maxSeats: 3,
        priceDemo: 0.35,
        isDefault: true,
        createdAt: now,
      },
      {
        id: 'plan-04',
        productId: 'prod-02',
        name: 'Single Workstation Security',
        licenseType: 'SUBSCRIPTION',
        durationDays: 365,
        maxSeats: 1,
        priceDemo: 0.15,
        isDefault: false,
        createdAt: now,
      },
      {
        id: 'plan-05',
        productId: 'prod-03',
        name: 'Monthly Professional',
        licenseType: 'SUBSCRIPTION',
        durationDays: 30,
        maxSeats: 2,
        priceDemo: 0.05,
        isDefault: true,
        createdAt: now,
      },
      {
        id: 'plan-06',
        productId: 'prod-03',
        name: 'Lifetime Unlimited',
        licenseType: 'PERPETUAL',
        durationDays: 0,
        maxSeats: 10,
        priceDemo: 0.40,
        isDefault: false,
        createdAt: now,
      },
      {
        id: 'plan-07',
        productId: 'prod-04',
        name: 'Freelancer Single Seat',
        licenseType: 'SUBSCRIPTION',
        durationDays: 30,
        maxSeats: 1,
        priceDemo: 0.08,
        isDefault: true,
        createdAt: now,
      },
      {
        id: 'plan-08',
        productId: 'prod-04',
        name: 'Studio Multi-Seat',
        licenseType: 'SEAT_BASED',
        durationDays: 0,
        maxSeats: 5,
        priceDemo: 0.45,
        isDefault: false,
        createdAt: now,
      },
      {
        id: 'plan-09',
        productId: 'prod-05',
        name: 'Enterprise Node License',
        licenseType: 'SEAT_BASED',
        durationDays: 0,
        maxSeats: 4,
        priceDemo: 0.60,
        isDefault: true,
        createdAt: now,
      },
      {
        id: 'plan-10',
        productId: 'prod-05',
        name: 'Quarterly Subscription',
        licenseType: 'SUBSCRIPTION',
        durationDays: 90,
        maxSeats: 2,
        priceDemo: 0.25,
        isDefault: false,
        createdAt: now,
      },
    ];

    this.licenses = [];
    this.purchases = [];
    this.transactions = [];
    this.auditLogs = [];
  }
}

const storeInstance = new PersistentDataStore();

export const db = {
  store: storeInstance,
  save: () => storeInstance.save(),
};

export async function testDbConnection(): Promise<boolean> {
  console.log(`✔ Persistent Data Store active at: ${STORE_PATH}`);
  console.log(`✔ Smart Contract Target:           ${storeInstance.contractAddress}`);
  console.log(`✔ Products Indexed:                ${storeInstance.products.length}`);
  console.log(`✔ Licenses Indexed:                ${storeInstance.licenses.length}`);
  return true;
}

