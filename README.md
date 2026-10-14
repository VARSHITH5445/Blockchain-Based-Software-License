# 🛡️ Blockchain-Based Software License Management and Verification Platform

> **B.Tech Final-Year Capstone Project**  
> **Course**: Blockchain & Smart Contract Technologies  
> **Student Name**: Varshith Reddy  
> **Smart Contract Language**: EVM Solidity `^0.8.20`  
> **Backend Service**: Node.js + Express.js + TypeScript + REST APIs + JWT Auth  
> **Database**: PostgreSQL with Prisma ORM (with automatic resilient fallback)  
> **Frontend Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + Ethers.js v6  

---

## 🌟 Executive Summary & Objectives

Traditional software licensing depends heavily on centralized Digital Rights Management (DRM) servers and static algorithmic strings. This architecture suffers from critical points of failure:
- **Keygens & Cracks**: Algorithmic modulus string checks can be disassembled and key-generators created.
- **Server Downtime (SPOF)**: Centralized activation outages lock out paying customers.
- **Opacity**: Lack of transparent audit trails for seat allocation, revocations, and lifecycle history.

**ChainLicense** solves this problem by using **Ethereum smart contracts (`SoftwareLicenseManager.sol`)** to manage software license lifecycles.
1. **Tamper-Evident Issuance**: Licenses are minted as unique on-chain records bound to canonical metadata hashes.
2. **Zero-Gas Verification**: Client software verifies validity in milliseconds using read-only `eth_call` view queries without consuming gas.
3. **Hardware Node-Locking**: Anti-piracy cryptographic fingerprinting ($\text{Keccak-256}(\text{CPUID} \parallel \text{UUID} \parallel \text{MAC})$) enforces machine seat limits.
4. **Permanent Auditability**: On-chain event logs (`LicenseIssued`, `LicenseActivated`, `LicenseRevoked`, `LicenseRenewed`) provide transparent provenance.
5. **Decentralized Revocation**: Immediate blacklisting of leaked or compromised keys with immutable audit reasons.

---

## 🏗️ System Architecture & Monorepo Structure

```
software-license-platform/
├── frontend/                          # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/                # Navbar, Footer, StatusBadge, QRModal, IssueModal, etc.
│   │   ├── pages/                     # 11 Full-featured pages
│   │   │   ├── LandingPage.tsx        # Hero, workflow diagram, verification preview
│   │   │   ├── LoginPage.tsx          # Authentication with 1-click test personas
│   │   │   ├── RegisterPage.tsx       # Role-aware registration (Publisher, Customer, Admin)
│   │   │   ├── DeveloperDashboard.tsx # Publisher analytics, issuance velocity chart, license table
│   │   │   ├── SoftwareCatalog.tsx    # Product cards, plan details, simulated checkout
│   │   │   ├── AddEditSoftware.tsx    # Add new software products and configure license plans
│   │   │   ├── CustomerDashboard.tsx  # Customer owned licenses vault and quick actions
│   │   │   ├── LicenseDetails.tsx     # Deep cryptographic metadata, hash inspector, QR code
│   │   │   ├── PublicVerification.tsx # Public zero-gas verification portal with clear status
│   │   │   ├── AdminDashboard.tsx     # Administrator metrics, user access controls, audit logs
│   │   │   └── ActivityHistory.tsx    # Live on-chain event ledger and transaction history
│   │   ├── context/                   # AuthContext, Web3Context (MetaMask + fallback)
│   │   ├── services/                  # api.ts (REST client)
│   │   ├── types/                     # TypeScript data contracts
│   │   ├── App.tsx                    # React Router configuration
│   │   ├── index.css                  # Modern light theme with indigo accents
│   │   └── main.tsx                   # Entrypoint
│   └── package.json
├── backend/                           # Express.js + TypeScript REST API
│   ├── src/
│   │   ├── controllers/               # Auth, Software, License, Verification, Admin
│   │   ├── middleware/                # JWT verification, Role-based access control, Rate limiter
│   │   ├── routes/                    # REST route endpoints
│   │   ├── services/                  # prisma.ts, blockchainSync.ts
│   │   ├── validators/                # Zod validation schemas
│   │   ├── app.ts                     # Express setup with Helmet & CORS
│   │   └── server.ts                  # Server entrypoint (Port 5000)
│   └── package.json
├── blockchain/                        # Hardhat Development Environment
│   ├── contracts/
│   │   └── SoftwareLicenseManager.sol # Production Solidity smart contract
│   ├── scripts/
│   │   └── deploy.ts                  # Deployment & initial seeding script
│   ├── test/
│   │   └── SoftwareLicenseManager.test.ts # Automated unit test suite
│   ├── hardhat.config.ts              # Hardhat configuration
│   └── package.json
├── prisma/
│   ├── schema.prisma                  # PostgreSQL models: User, SoftwareProduct, LicensePlan, etc.
│   └── seed.ts                        # Database seeding script
├── docs/
│   ├── architecture.md                # System architecture specification
│   ├── setup.md                       # Setup and installation instructions
│   ├── workflow.md                    # Detailed workflows A through F
│   └── demo-script.md                 # 5-10 minute presentation script for faculty review
├── .env.example                       # Environment variables template
├── package.json                       # Monorepo root script runner
└── README.md
```

---

## ⚡ Quick Start & Execution

### 1. Start the Local Blockchain Node (Hardhat)
```bash
cd blockchain
npx hardhat node
```
*Starts local Ethereum JSON-RPC node on `http://127.0.0.1:8545` with Chain ID `31337`.*

### 2. Deploy Contract & Seed Real On-Chain Licenses
In a new terminal window:
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```
*Deploys `SoftwareLicenseManager.sol` to `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`, authorizes the publisher, mints 5 on-chain licenses (#1001-#1005) across all lifecycle states, advances EVM time for expiration, revokes #1005 with reason, and exports deployment configurations to frontend and backend.*

### 3. Start the Backend API (Port 5000)
```bash
cd backend
npm run build
node dist/server.js
```
*API running at: `http://localhost:5000/api` with persistent disk storage in `backend/data/store.json`.*

### 4. Start the Frontend Dashboard (Port 5173)
```bash
cd frontend
npm run dev
```
*Frontend running at: `http://localhost:5173/`.*

---

## 🧪 Automated Testing

### 1. Smart Contract Test Suite (Solidity / Hardhat)
```bash
cd blockchain
npx hardhat test
```
**Results: 17 passing (6s)**
- Authorized and unauthorized license issuance
- Zero-gas view verification (`verifyLicense`)
- Subscription expiration time calculations
- Machine hardware node-locking & seat limit enforcement
- Deactivation and reactivation
- License revocation with audit trail
- License renewal & duration extension
- Publisher role administration & event emissions

### 2. End-to-End Backend & Chain Integration Suite
```bash
cd backend
npx ts-node src/scripts/testE2E.ts
```
**Results: 23 passing (3s)**
- JWT authentication for Publisher, Customer, and Admin personas
- Password hashing verification (no plaintext passwords)
- Software Product full CRUD operations (Create, Read, Update, Delete)
- Disk persistence across mutations
- On-chain license issuance with real transaction receipt
- On-chain hardware node-locking binding
- Seat count enforcement
- On-chain license revocation with reason
- Zero-gas public verification against contract state
- Error handling for invalid IDs

---

## 🔑 Pre-Configured Test Personas (1-Click Switcher)

To make evaluation during project review fast and seamless, the application includes a **Role Switcher** directly in the top navigation bar as well as 1-click test credentials on the login screen:

| Role | Name | Email | Password | Pre-Funded Wallet Address |
| :--- | :--- | :--- | :--- | :--- |
| **Developer / Publisher** | TechSoft Cyber Labs | `publisher@cybershield.io` | `Password123!` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| **Customer Holder** | Alice Johnson (Enterprise) | `customer@enterprise.com` | `Password123!` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| **Administrator** | System Administrator | `admin@licensechain.org` | `Password123!` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |

---

## 📦 Preloaded Demonstration Licenses (Real On-Chain Data)

All demo licenses are mined directly on the local Hardhat blockchain with real transaction hashes and cryptographic metadata hashes:

| License ID | Software Product | License Type | On-Chain Status | Hardware Seats | Notes / Test Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1001** | DevIDE Studio 2026 | Perpetual | **VALID** | 1 / 1 Active | Default perpetual valid license |
| **#1002** | SecureVault Pro | Seat-Based | **VALID** | 2 / 5 Active | Multi-device node-locking test |
| **#1003** | CloudSync Manager | Subscription | **VALID** | 1 / 3 Active | Active 30-day recurring subscription |
| **#1004** | DesignFlow Studio | Subscription | **EXPIRED** | 0 / 1 Active | Real expired state (EVM time advanced by 3600s) |
| **#1005** | DataLens Analytics | Seat-Based | **REVOKED** | 1 / 5 Active | Real revoked state with on-chain piracy audit reason |
| **#9999** | Non-Existent | N/A | **INVALID** | 0 / 0 Active | Unminted token ID verification test |

---

## 📋 Comprehensive Page Guide

1. **Homepage (`/`)**: Hero section, live on-chain verification preview, 3-step protocol overview, architecture diagrams, and technology stack breakdown.
2. **Authentication (`/login` & `/register`)**: JWT-based login with password visibility toggle, role selector, and 1-click persona buttons.
3. **Developer Dashboard (`/developer`)**: Publisher metrics, issuance velocity area chart, quick actions (*Add Software*, *Issue License*), and searchable licenses table.
4. **Software Catalog (`/products`)**: Filterable product cards, plan details, and simulated checkout modal with confetti confirmation.
5. **Add / Edit Software (`/products/new`)**: Validated product creation form with customizable license tiers (Perpetual, Subscription, Seat-Based).
6. **Customer Vault (`/customer`)**: Owned license tokens, validity countdowns, seat progress, and 1-click verification.
7. **License Details (`/licenses/:id`)**: Detailed cryptographic metadata, canonical JSON inspector, Keccak-256 hash copy, and verification QR code.
8. **Public Verification (`/verify`)**: Zero-gas public portal showing clear status (**VALID**, **EXPIRED**, **REVOKED**, or **INVALID / NOT FOUND**), metadata hash integrity confirmation, and transaction link.
9. **Admin Console (`/admin`)**: User account management, disable/enable login toggles, and security audit log search.
10. **Activity History (`/activity`)**: Real-time blockchain event log showing confirmed transaction hashes and smart contract method invocations.

---

## 🎯 Demonstration Walkthrough & Seeded Verification Checks

1. Open **`http://localhost:5173/`** to view the landing page.
2. Navigate directly to **"Verify License"** (`/verify`). Test the preloaded states using the 1-click test buttons:
   - **ID #1001**: Shows **VALID** (Green badge, Perpetual, 0 Gas read-only call).
   - **ID #1002**: Shows **VALID** (Green badge, Seat-Based, 2/5 seats active).
   - **ID #1003**: Shows **VALID** (Green badge, Subscription, 30 days active).
   - **ID #1004**: Shows **EXPIRED** (Orange badge, EVM timestamp genuinely elapsed).
   - **ID #1005**: Shows **REVOKED** (Red badge, displaying the immutable on-chain reason: *"Software piracy detected: Key leaked on unauthorized public forum"*).
   - **ID #9999**: Shows **INVALID / NOT FOUND** (Gray badge, unminted token ID).
3. In the top-right persona switcher, select **"Customer"** (`customer@enterprise.com`).
4. Open **"My Licenses"** (`/customer`):
   - View owned licenses and seat quotas.
   - Click **"+ Bind Machine"** to bind a hardware fingerprint on-chain; note seat count increase.
5. In the top-right persona switcher, select **"Publisher"** (`publisher@cybershield.io`).
6. Open **"Developer Hub"** (`/developer`):
   - Inspect live statistics calculated from actual database & contract events.
   - Revoke or renew licenses directly.
7. Open **"Ledger Activity"** (`/activity`) to inspect confirmed transaction receipts and event logs.

---

## 🔄 End-to-End Dynamic CRUD Acceptance Workflow

The application is completely dynamic and persists changes to disk (`backend/data/store.json`) and the blockchain:

1. **Create New Software**:
   - Log in as `publisher@cybershield.io` (`Password123!`).
   - Go to `/products/new` and submit a new product:
     - Name: `DevSecOps Shield 2026`
     - Category: `Security Software`
     - Price: `$249.00`
     - License Type: `SEAT_BASED` (Max Seats: `5`, Validity: `365` days).
   - Refresh the page (`F5`) or restart backend — the product persists in the catalog.
2. **Issue Genuine License On-Chain**:
   - In Developer Dashboard (`/developer`), click **"Issue License"**.
   - Select `DevSecOps Shield 2026`, Customer `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`.
   - Submit: Ethers signer broadcasts `issueLicense(...)` to `SoftwareLicenseManager.sol`.
   - Transaction is mined on Hardhat (e.g., License ID **#1006**).
3. **Customer Seat Binding**:
   - Switch to Customer (`customer@enterprise.com`).
   - Open `/customer` — License **#1006** is listed.
   - Click **"+ Bind Machine"** — broadcasts `activateLicense(1006, fingerprint)` on-chain.
4. **Public Zero-Gas Verification**:
   - Open `/verify` in any browser or incognito tab (no login required).
   - Enter `1006` and click **"Verify License"**.
   - Contract returns **VALID** with metadata hash match.
5. **Decentralized Revocation**:
   - Switch back to Publisher (`/developer`).
   - Click **"Revoke"** on License #1006 with reason: *"Security audit breach"*.
   - Contract records `revokeLicense(1006, reason)` on-chain.
6. **Instant Verification Re-Check**:
   - Return to `/verify`, enter `1006`, and click **"Verify License"**.
   - Status instantly updates to **REVOKED** with the audit reason displayed directly from contract memory.

---

## 📄 Academic Documentation Index

All academic deliverables and diagrams are organized in the [`docs/`](docs/) directory:
- 🏛️ **System Architecture**: [`docs/architecture.md`](docs/architecture.md) - Component interaction diagrams and tech stack rationale.
- ⚙️ **Setup & Execution Guide**: [`docs/setup.md`](docs/setup.md) - Terminal setup, prerequisites, and runtime configurations.
- 🔄 **Core Workflows**: [`docs/workflow.md`](docs/workflow.md) - Workflows A through F with sequence diagrams.
- 🎤 **Faculty Demo Script**: [`docs/demo-script.md`](docs/demo-script.md) - 5-10 minute review script with viva Q&A answers.
- 🗄️ **Database ER Diagram**: [`docs/database-er-diagram.md`](docs/database-er-diagram.md) - PostgreSQL Mermaid schema with relationship keys.
- 🧭 **License Lifecycle Flowchart**: [`docs/license-lifecycle-flowchart.md`](docs/license-lifecycle-flowchart.md) - State machine transitions and rules.
- 📜 **Smart Contract Reference**: [`docs/smart-contract.md`](docs/smart-contract.md) - Functions, gas analysis, events, and invariants.
- 🔌 **REST API Specification**: [`docs/api-documentation.md`](docs/api-documentation.md) - Complete endpoints, headers, and schemas.
- 🛡️ **Security & Threat Model**: [`docs/security.md`](docs/security.md) - Anti-piracy, CEI pattern, node-locking, and attack vectors.
- 📑 **Comprehensive Capstone Project Report**: [`PROJECT_REPORT.md`](PROJECT_REPORT.md) - Full university project report formatted for submission.

