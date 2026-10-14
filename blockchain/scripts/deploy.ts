import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Precomputed verified bcrypt hash of "Password123!" with 10 salt rounds (compatible with bcryptjs)
const DEFAULT_PASSWORD_HASH = "$2a$10$wg9gHTaRSo0FGaQbDYezkekx5volnDTndkq3Mu0UU2xGY84paAhJe";




async function main() {
  console.log("=================================================");
  console.log("  Deploying SoftwareLicenseManager Smart Contract");
  console.log("=================================================");

  const [admin, publisher, customer, customer2] = await ethers.getSigners();
  console.log(`Admin (Deployer): ${admin.address}`);
  console.log(`Publisher:        ${publisher.address}`);
  console.log(`Customer:         ${customer.address}`);

  const SoftwareLicenseManager = await ethers.getContractFactory("SoftwareLicenseManager");
  const licenseManager = await SoftwareLicenseManager.deploy(admin.address);
  await licenseManager.waitForDeployment();

  const contractAddress = await licenseManager.getAddress();
  console.log(`\n✔ SoftwareLicenseManager deployed to: ${contractAddress}`);

  // Authorize publisher
  const txAuth = await licenseManager.connect(admin).addPublisher(publisher.address);
  const authReceipt = await txAuth.wait();
  console.log(`✔ Granted PUBLISHER_ROLE to: ${publisher.address} (Tx: ${authReceipt?.hash})`);

  // Canonical helper
  function computeHash(obj: any): string {
    const sorted = JSON.stringify(obj, Object.keys(obj).sort());
    return ethers.keccak256(ethers.toUtf8Bytes(sorted));
  }

  console.log("\n--- Minting Real On-Chain Demonstration Licenses ---");

  // 1. License #1001: Perpetual License (SecureVault Pro)
  const metaObj1001 = {
    licenseId: 1001,
    product: "SecureVault Pro",
    plan: "Multi-Seat Enterprise (3 Nodes)",
    type: "SEAT_BASED",
    maxSeats: 3,
    publisher: publisher.address,
    holder: customer.address,
    issuedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  };
  const metaHash1001 = computeHash(metaObj1001);
  const tx1 = await licenseManager.connect(publisher).issueLicense(
    "securevault-pro",
    customer.address,
    0, // PERPETUAL
    0, // duration
    3, // maxSeats
    metaHash1001
  );
  const r1 = await tx1.wait();
  console.log(`✔ Issued Perpetual License #1001 (Tx: ${r1?.hash})`);

  // Activate 1 seat on #1001
  const devFingerprint1 = ethers.keccak256(ethers.toUtf8Bytes("DEVICE_SECURE_NODE_ALPHA"));
  const txAct1 = await licenseManager.connect(customer).activateLicense(1001, devFingerprint1);
  const rAct1 = await txAct1.wait();
  console.log(`  -> Activated Seat 1 on License #1001 (Tx: ${rAct1?.hash})`);

  // 2. License #1002: Seat-Based License (DevIDE Studio 2026)
  const metaObj1002 = {
    licenseId: 1002,
    product: "DevIDE Studio 2026",
    plan: "Annual Team Subscription",
    type: "SEAT_BASED",
    maxSeats: 5,
    publisher: publisher.address,
    holder: customer.address,
    issuedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  };
  const metaHash1002 = computeHash(metaObj1002);
  const tx2 = await licenseManager.connect(publisher).issueLicense(
    "devide-studio",
    customer.address,
    3, // SEAT_BASED
    365 * 86400, // 365 days
    5, // 5 seats
    metaHash1002
  );
  const r2 = await tx2.wait();
  console.log(`✔ Issued Seat-Based License #1002 (Tx: ${r2?.hash})`);

  // Activate 2 seats on #1002
  const devFp2A = ethers.keccak256(ethers.toUtf8Bytes("DEV_WORKSTATION_01"));
  const devFp2B = ethers.keccak256(ethers.toUtf8Bytes("DEV_WORKSTATION_02"));
  const txAct2A = await licenseManager.connect(customer).activateLicense(1002, devFp2A);
  await txAct2A.wait();
  const txAct2B = await licenseManager.connect(customer).activateLicense(1002, devFp2B);
  await txAct2B.wait();
  console.log(`  -> Activated 2 Seats on License #1002`);

  // 3. License #1003: Active Subscription License (CloudSync Manager)
  const metaObj1003 = {
    licenseId: 1003,
    product: "CloudSync Manager",
    plan: "Monthly Professional",
    type: "SUBSCRIPTION",
    maxSeats: 2,
    publisher: publisher.address,
    holder: customer.address,
    issuedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  };
  const metaHash1003 = computeHash(metaObj1003);
  const tx3 = await licenseManager.connect(publisher).issueLicense(
    "cloudsync-manager",
    customer.address,
    1, // SUBSCRIPTION
    30 * 86400, // 30 days
    2,
    metaHash1003
  );
  const r3 = await tx3.wait();
  console.log(`✔ Issued Active Subscription License #1003 (Tx: ${r3?.hash})`);

  // 4. License #1004: Genuinely Expired License (DesignFlow Studio)
  const metaObj1004 = {
    licenseId: 1004,
    product: "DesignFlow Studio",
    plan: "Freelancer Single Seat",
    type: "SUBSCRIPTION",
    maxSeats: 1,
    publisher: publisher.address,
    holder: customer.address,
    issuedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  };
  const metaHash1004 = computeHash(metaObj1004);
  const tx4 = await licenseManager.connect(publisher).issueLicense(
    "designflow-studio",
    customer.address,
    1, // SUBSCRIPTION
    5, // 5 seconds validity
    1,
    metaHash1004
  );
  const r4 = await tx4.wait();
  console.log(`✔ Issued Short-Duration License #1004 (Tx: ${r4?.hash})`);

  // Advance time on Hardhat node by 1 hour (3600 seconds) so #1004 is genuinely EXPIRED on-chain
  await ethers.provider.send("evm_increaseTime", [3600]);
  await ethers.provider.send("evm_mine", []);
  console.log(`  -> Advanced Hardhat blockchain clock by 3600s: License #1004 is now genuinely EXPIRED on-chain`);

  // 5. License #1005: Revoked License (DataLens Analytics)
  const metaObj1005 = {
    licenseId: 1005,
    product: "DataLens Analytics",
    plan: "Enterprise Node License",
    type: "SEAT_BASED",
    maxSeats: 4,
    publisher: publisher.address,
    holder: customer.address,
    issuedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  };
  const metaHash1005 = computeHash(metaObj1005);
  const tx5 = await licenseManager.connect(publisher).issueLicense(
    "datalens-analytics",
    customer.address,
    3, // SEAT_BASED
    365 * 86400, // 365 days validity
    4,
    metaHash1005
  );
  const r5 = await tx5.wait();
  const txRevoke = await licenseManager.connect(publisher).revokeLicense(
    1005,
    "Software piracy detected: Key leaked on unauthorized public forum"
  );
  const rRevoke = await txRevoke.wait();
  console.log(`✔ Issued and Revoked License #1005 (Revoke Tx: ${rRevoke?.hash})`);

  // Verify all 5 licenses on-chain to double-check
  console.log("\n--- Validating Live Smart Contract Verification ---");
  for (const id of [1001, 1002, 1003, 1004, 1005, 9999]) {
    const v = await licenseManager.verifyLicense(id);
    console.log(`License #${id} => Valid: ${v[0]}, Status: ${v[1]}, Message: "${v[2]}"`);
  }

  // Contract ABI definition
  const contractAbi = [
    "function issueLicense(string productId, address holder, uint8 licenseType, uint256 durationInSeconds, uint256 maxActivations, bytes32 metadataHash) external returns (uint256)",
    "function activateLicense(uint256 licenseId, bytes32 deviceFingerprint) external",
    "function deactivateLicense(uint256 licenseId, bytes32 deviceFingerprint) external",
    "function renewLicense(uint256 licenseId, uint256 additionalDurationInSeconds) external",
    "function revokeLicense(uint256 licenseId, string reason) external",
    "function verifyLicense(uint256 licenseId) external view returns (bool isValid, uint8 effectiveStatus, string memory statusMessage, address publisher, address holder, uint256 issueTimestamp, uint256 expirationTimestamp, bytes32 metadataHash)",
    "function getLicense(uint256 licenseId) external view returns (tuple(uint256 licenseId, string productId, address publisher, address holder, uint256 issueTimestamp, uint256 expirationTimestamp, uint8 licenseType, uint8 status, bytes32 metadataHash, uint256 maxActivations, uint256 currentActivations, string revocationReason))",
    "function isDeviceAuthorized(uint256 licenseId, bytes32 deviceFingerprint) external view returns (bool)",
    "function addPublisher(address publisher) external",
    "function removePublisher(address publisher) external",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "event LicenseIssued(uint256 indexed licenseId, string productId, address indexed publisher, address indexed holder, uint8 licenseType, uint256 expirationTimestamp, bytes32 metadataHash)",
    "event LicenseActivated(uint256 indexed licenseId, address indexed holder, bytes32 indexed deviceFingerprint, uint256 currentActivations)",
    "event LicenseDeactivated(uint256 indexed licenseId, address indexed holder, bytes32 indexed deviceFingerprint, uint256 currentActivations)",
    "event LicenseRevoked(uint256 indexed licenseId, address indexed revokedBy, string reason)",
    "event LicenseRenewed(uint256 indexed licenseId, uint256 oldExpiration, uint256 newExpiration)",
    "event PublisherAuthorized(address indexed publisher)",
    "event PublisherRevoked(address indexed publisher)"
  ];

  // Export deployment JSON
  const deploymentInfo = {
    address: contractAddress,
    network: "Hardhat Localhost",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    deployedAt: new Date().toISOString(),
    admin: admin.address,
    publisher: publisher.address,
    customer: customer.address,
    abi: contractAbi,
    licenses: {
      "1001": { status: "VALID", type: "PERPETUAL", txHash: r1?.hash },
      "1002": { status: "VALID", type: "SEAT_BASED", txHash: r2?.hash },
      "1003": { status: "VALID", type: "SUBSCRIPTION", txHash: r3?.hash },
      "1004": { status: "EXPIRED", type: "SUBSCRIPTION", txHash: r4?.hash },
      "1005": { status: "REVOKED", type: "SEAT_BASED", txHash: rRevoke?.hash },
    }
  };

  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir, { recursive: true });
  fs.writeFileSync(path.join(deployDir, "localhost.json"), JSON.stringify(deploymentInfo, null, 2));

  // Save to backend deployments
  const backendDeployDir = path.join(__dirname, "..", "..", "backend", "src", "deployments");
  if (!fs.existsSync(backendDeployDir)) fs.mkdirSync(backendDeployDir, { recursive: true });
  fs.writeFileSync(path.join(backendDeployDir, "localhost.json"), JSON.stringify(deploymentInfo, null, 2));

  // Save frontend config
  const frontendConfigDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendConfigDir)) fs.mkdirSync(frontendConfigDir, { recursive: true });
  const frontendConfigContent = `// Automatically generated by Hardhat deploy script
export const CONTRACT_ADDRESS = "${contractAddress}";
export const CHAIN_ID = 31337;
export const RPC_URL = "http://127.0.0.1:8545";
export const NETWORK_NAME = "Hardhat Localhost (31337)";
export const CONTRACT_ABI = ${JSON.stringify(contractAbi, null, 2)};
`;
  fs.writeFileSync(path.join(frontendConfigDir, "contractConfig.ts"), frontendConfigContent);

  // Seed the persistent database store
  const passwordHash = DEFAULT_PASSWORD_HASH;
  const now = new Date();

  const userAdmin = {
    id: "usr-admin-01",
    email: "admin@licensechain.org",
    passwordHash,
    name: "System Administrator",
    role: "ADMIN",
    walletAddress: admin.address,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const userPublisher = {
    id: "usr-pub-01",
    email: "publisher@cybershield.io",
    passwordHash,
    name: "TechSoft Cyber Labs",
    role: "PUBLISHER",
    walletAddress: publisher.address,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const userCustomer = {
    id: "usr-cust-01",
    email: "customer@enterprise.com",
    passwordHash,
    name: "Alice Johnson (Enterprise)",
    role: "CUSTOMER",
    walletAddress: customer.address,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const users = [userAdmin, userPublisher, userCustomer];

  // 5 Software Products
  const products = [
    {
      id: "prod-01",
      name: "DevIDE Studio 2026",
      slug: "devide-studio",
      description: "Cloud-native IDE with smart contract static analysis, gas profiler, and on-chain license verification.",
      category: "Developer Tools",
      version: "v2.5.1",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
      publisherId: userPublisher.id,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 20),
      updatedAt: now,
    },
    {
      id: "prod-02",
      name: "SecureVault Pro",
      slug: "securevault-pro",
      description: "Zero-trust endpoint defense, kernel packet sniffer, and threat mitigation with seat-based cryptographic licensing.",
      category: "Security Software",
      version: "v4.2.0",
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
      publisherId: userPublisher.id,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 18),
      updatedAt: now,
    },
    {
      id: "prod-03",
      name: "CloudSync Manager",
      slug: "cloudsync-manager",
      description: "Real-time hybrid cloud storage synchronization and encrypted distributed backup manager.",
      category: "Productivity",
      version: "v3.1.0",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      publisherId: userPublisher.id,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 15),
      updatedAt: now,
    },
    {
      id: "prod-04",
      name: "DesignFlow Studio",
      slug: "designflow-studio",
      description: "Vector UI/UX prototyping suite with real-time multiplayer canvas and asset crypto-watermarking.",
      category: "Design Software",
      version: "v5.0.2",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
      publisherId: userPublisher.id,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 12),
      updatedAt: now,
    },
    {
      id: "prod-05",
      name: "DataLens Analytics",
      slug: "datalens-analytics",
      description: "Enterprise vector database intelligence, high-throughput batch query orchestrator, and real-time telemetry.",
      category: "Data Analytics",
      version: "v2.1.4",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      publisherId: userPublisher.id,
      isActive: true,
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: now,
    },
  ];

  // Plans for each product
  const plans = [
    // DevIDE Studio
    {
      id: "plan-01",
      productId: "prod-01",
      name: "Perpetual Developer License",
      licenseType: "PERPETUAL",
      durationDays: 0,
      maxSeats: 1,
      priceDemo: 0.20,
      isDefault: true,
      createdAt: now,
    },
    {
      id: "plan-02",
      productId: "prod-01",
      name: "Annual Team Subscription",
      licenseType: "SEAT_BASED",
      durationDays: 365,
      maxSeats: 5,
      priceDemo: 0.50,
      isDefault: false,
      createdAt: now,
    },
    // SecureVault Pro
    {
      id: "plan-03",
      productId: "prod-02",
      name: "Multi-Seat Enterprise (3 Nodes)",
      licenseType: "SEAT_BASED",
      durationDays: 0,
      maxSeats: 3,
      priceDemo: 0.35,
      isDefault: true,
      createdAt: now,
    },
    {
      id: "plan-04",
      productId: "prod-02",
      name: "Single Workstation Security",
      licenseType: "SUBSCRIPTION",
      durationDays: 365,
      maxSeats: 1,
      priceDemo: 0.15,
      isDefault: false,
      createdAt: now,
    },
    // CloudSync Manager
    {
      id: "plan-05",
      productId: "prod-03",
      name: "Monthly Professional",
      licenseType: "SUBSCRIPTION",
      durationDays: 30,
      maxSeats: 2,
      priceDemo: 0.05,
      isDefault: true,
      createdAt: now,
    },
    {
      id: "plan-06",
      productId: "prod-03",
      name: "Lifetime Unlimited",
      licenseType: "PERPETUAL",
      durationDays: 0,
      maxSeats: 10,
      priceDemo: 0.40,
      isDefault: false,
      createdAt: now,
    },
    // DesignFlow Studio
    {
      id: "plan-07",
      productId: "prod-04",
      name: "Freelancer Single Seat",
      licenseType: "SUBSCRIPTION",
      durationDays: 30,
      maxSeats: 1,
      priceDemo: 0.08,
      isDefault: true,
      createdAt: now,
    },
    {
      id: "plan-08",
      productId: "prod-04",
      name: "Studio Multi-Seat",
      licenseType: "SEAT_BASED",
      durationDays: 0,
      maxSeats: 5,
      priceDemo: 0.45,
      isDefault: false,
      createdAt: now,
    },
    // DataLens Analytics
    {
      id: "plan-09",
      productId: "prod-05",
      name: "Enterprise Node License",
      licenseType: "SEAT_BASED",
      durationDays: 0,
      maxSeats: 4,
      priceDemo: 0.60,
      isDefault: true,
      createdAt: now,
    },
    {
      id: "plan-10",
      productId: "prod-05",
      name: "Quarterly Subscription",
      licenseType: "SUBSCRIPTION",
      durationDays: 90,
      maxSeats: 2,
      priceDemo: 0.25,
      isDefault: false,
      createdAt: now,
    },
  ];

  // Licenses mapping real on-chain IDs
  const licenses = [
    {
      id: "lic-meta-1001",
      onChainId: 1001,
      productId: "prod-02", // SecureVault Pro
      planId: "plan-03",
      publisherId: userPublisher.id,
      customerId: userCustomer.id,
      metadataHash: metaHash1001,
      canonicalJson: JSON.stringify(metaObj1001),
      onChainStatus: "ACTIVE",
      txHash: r1?.hash,
      expirationDate: null,
      maxSeats: 3,
      currentSeats: 1,
      revocationReason: null,
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: now,
    },
    {
      id: "lic-meta-1002",
      onChainId: 1002,
      productId: "prod-01", // DevIDE Studio 2026
      planId: "plan-02",
      publisherId: userPublisher.id,
      customerId: userCustomer.id,
      metadataHash: metaHash1002,
      canonicalJson: JSON.stringify(metaObj1002),
      onChainStatus: "ACTIVE",
      txHash: r2?.hash,
      expirationDate: new Date(Date.now() + 365 * 86400000),
      maxSeats: 5,
      currentSeats: 2,
      revocationReason: null,
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: now,
    },
    {
      id: "lic-meta-1003",
      onChainId: 1003,
      productId: "prod-03", // CloudSync Manager
      planId: "plan-05",
      publisherId: userPublisher.id,
      customerId: userCustomer.id,
      metadataHash: metaHash1003,
      canonicalJson: JSON.stringify(metaObj1003),
      onChainStatus: "ACTIVE",
      txHash: r3?.hash,
      expirationDate: new Date(Date.now() + 30 * 86400000),
      maxSeats: 2,
      currentSeats: 0,
      revocationReason: null,
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: now,
    },
    {
      id: "lic-meta-1004",
      onChainId: 1004,
      productId: "prod-04", // DesignFlow Studio
      planId: "plan-07",
      publisherId: userPublisher.id,
      customerId: userCustomer.id,
      metadataHash: metaHash1004,
      canonicalJson: JSON.stringify(metaObj1004),
      onChainStatus: "EXPIRED",
      txHash: r4?.hash,
      expirationDate: new Date(Date.now() - 3600000),
      maxSeats: 1,
      currentSeats: 0,
      revocationReason: null,
      createdAt: new Date(Date.now() - 86400000 * 10),
      updatedAt: now,
    },
    {
      id: "lic-meta-1005",
      onChainId: 1005,
      productId: "prod-05", // DataLens Analytics
      planId: "plan-09",
      publisherId: userPublisher.id,
      customerId: userCustomer.id,
      metadataHash: metaHash1005,
      canonicalJson: JSON.stringify(metaObj1005),
      onChainStatus: "REVOKED",
      txHash: rRevoke?.hash,
      expirationDate: null,
      maxSeats: 4,
      currentSeats: 0,
      revocationReason: "Software piracy detected: Key leaked on unauthorized public forum",
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: now,
    },
  ];

  // Transactions list with real tx hashes from local chain
  const transactions = [
    {
      id: "tx-deploy",
      txHash: authReceipt?.hash || "0xauth",
      blockNumber: authReceipt?.blockNumber || 1,
      fromAddress: admin.address,
      toAddress: contractAddress,
      method: "addPublisher(0x7099...79C8)",
      eventName: "PublisherAuthorized",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: "tx-lic-1001",
      txHash: r1?.hash || "0xlic1",
      blockNumber: r1?.blockNumber || 2,
      fromAddress: publisher.address,
      toAddress: contractAddress,
      method: "issueLicense(securevault-pro, 1001)",
      eventName: "LicenseIssued",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: "tx-act-1001",
      txHash: rAct1?.hash || "0xact1",
      blockNumber: rAct1?.blockNumber || 3,
      fromAddress: customer.address,
      toAddress: contractAddress,
      method: "activateLicense(1001, DEVICE_SECURE_NODE_ALPHA)",
      eventName: "LicenseActivated",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 4),
    },
    {
      id: "tx-lic-1002",
      txHash: r2?.hash || "0xlic2",
      blockNumber: r2?.blockNumber || 4,
      fromAddress: publisher.address,
      toAddress: contractAddress,
      method: "issueLicense(devide-studio, 1002)",
      eventName: "LicenseIssued",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: "tx-lic-1003",
      txHash: r3?.hash || "0xlic3",
      blockNumber: r3?.blockNumber || 5,
      fromAddress: publisher.address,
      toAddress: contractAddress,
      method: "issueLicense(cloudsync-manager, 1003)",
      eventName: "LicenseIssued",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: "tx-lic-1004",
      txHash: r4?.hash || "0xlic4",
      blockNumber: r4?.blockNumber || 6,
      fromAddress: publisher.address,
      toAddress: contractAddress,
      method: "issueLicense(designflow-studio, 1004)",
      eventName: "LicenseIssued",
      status: "CONFIRMED",
      createdAt: new Date(Date.now() - 86400000 * 1),
    },
    {
      id: "tx-lic-1005",
      txHash: rRevoke?.hash || "0xlic5",
      blockNumber: rRevoke?.blockNumber || 7,
      fromAddress: publisher.address,
      toAddress: contractAddress,
      method: "revokeLicense(1005, 'Software piracy detected')",
      eventName: "LicenseRevoked",
      status: "CONFIRMED",
      createdAt: now,
    },
  ];

  // Audit Logs
  const auditLogs = [
    {
      id: "log-001",
      userId: userAdmin.id,
      action: "GRANT_PUBLISHER_ROLE",
      entityType: "User",
      entityId: userPublisher.id,
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ role: "PUBLISHER_ROLE", address: publisher.address, txHash: authReceipt?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: "log-002",
      userId: userPublisher.id,
      action: "LICENSE_ISSUED",
      entityType: "License",
      entityId: "1001",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ product: "SecureVault Pro", holder: customer.address, txHash: r1?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
    {
      id: "log-003",
      userId: userCustomer.id,
      action: "DEVICE_ACTIVATED",
      entityType: "License",
      entityId: "1001",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ deviceFingerprint: devFingerprint1, txHash: rAct1?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 4),
    },
    {
      id: "log-004",
      userId: userPublisher.id,
      action: "LICENSE_ISSUED",
      entityType: "License",
      entityId: "1002",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ product: "DevIDE Studio 2026", holder: customer.address, txHash: r2?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 3),
    },
    {
      id: "log-005",
      userId: userPublisher.id,
      action: "LICENSE_ISSUED",
      entityType: "License",
      entityId: "1003",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ product: "CloudSync Manager", holder: customer.address, txHash: r3?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 2),
    },
    {
      id: "log-006",
      userId: userPublisher.id,
      action: "LICENSE_ISSUED",
      entityType: "License",
      entityId: "1004",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ product: "DesignFlow Studio", holder: customer.address, txHash: r4?.hash }),
      createdAt: new Date(Date.now() - 86400000 * 1),
    },
    {
      id: "log-007",
      userId: userPublisher.id,
      action: "LICENSE_REVOKED",
      entityType: "License",
      entityId: "1005",
      ipAddress: "127.0.0.1",
      details: JSON.stringify({ reason: "Software piracy detected: Key leaked on unauthorized public forum", txHash: rRevoke?.hash }),
      createdAt: now,
    },
  ];

  const dbStore = {
    contractAddress,
    users,
    products,
    plans,
    licenses,
    purchases: [],
    transactions,
    auditLogs,
  };

  const backendDataDir = path.join(__dirname, "..", "..", "backend", "data");
  if (!fs.existsSync(backendDataDir)) fs.mkdirSync(backendDataDir, { recursive: true });
  fs.writeFileSync(path.join(backendDataDir, "store.json"), JSON.stringify(dbStore, null, 2));

  console.log(`\n✔ Saved persistent database store to: ${path.join(backendDataDir, "store.json")}`);
  console.log(`✔ Saved frontend config to:          ${path.join(frontendConfigDir, "contractConfig.ts")}`);
  console.log(`✔ Saved localhost.json artifacts.`);
  console.log("=================================================");
  console.log("  Deployment and Demo Seeding Successfully Completed!");
  console.log("=================================================\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
