# Installation, Prerequisites, and Execution Guide

## Prerequisites
1. **Node.js**: v18.0.0 or higher (v24.x tested & supported).
2. **npm**: v9.0.0 or higher.
3. **MetaMask**: Browser extension (optional for simulated demo, recommended for full Web3 demonstration).
4. **PostgreSQL** (Optional): If PostgreSQL is not active, the backend automatically transitions to the built-in high-availability in-memory/SQLite store with pre-seeded demo records.

---

## Quick Start (Run in 3 Terminals)

### Terminal 1: Local Blockchain (Hardhat)
```bash
cd blockchain
npm install
npx hardhat node
```
*Starts local Ethereum node on `http://127.0.0.1:8545` with 20 pre-funded test accounts.*

In a separate sub-shell, deploy the smart contract:
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```

### Terminal 2: Express REST API Backend
```bash
cd backend
npm install
npm run dev
```
*Starts backend API on `http://localhost:5000`.*

### Terminal 3: React Vite Frontend
```bash
cd frontend
npm install
npm run dev
```
*Starts frontend dashboard on `http://localhost:5173`.*

---

## Environment Variables Configuration

Copy `.env.example` to `.env` in the root:
```env
PORT=5000
JWT_SECRET=blockchain_license_jwt_secret_key_2026
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/licensedb?schema=public"
```

---

## Automated Test Suites

### 1. Smart Contract Test Suite (17 Tests)
```bash
cd blockchain
npx hardhat test
```
*Tests license issuance, unauthorized rejection, zero-gas verification, expiration calculations, hardware node-locking limits, revocation with reason, and publisher role administration.*

### 2. Backend & Blockchain End-to-End Test Suite (23 Tests)
```bash
cd backend
npx ts-node src/scripts/testE2E.ts
```
*Tests authentication for all 3 personas, software CRUD lifecycle, on-chain issuance, on-chain device activation, seat enforcement, on-chain revocation, zero-gas verification, and persistent JSON store consistency.*

---

## Pre-Configured Test Accounts (1-Click Login)
| Role | Email | Password | Pre-Funded Wallet Address |
| :--- | :--- | :--- | :--- |
| **Publisher** | `publisher@cybershield.io` | `Password123!` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| **Customer** | `customer@enterprise.com` | `Password123!` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| **Administrator** | `admin@licensechain.org` | `Password123!` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |

---

## Demonstration Seeded Licenses (Real On-Chain State)

| License ID | Software Product | License Type | On-Chain Status | Hardware Seats | Notes / Test Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1001** | DevIDE Studio 2026 | Perpetual | **VALID** (Active) | 1 / 1 Active | Default perpetual valid license |
| **#1002** | SecureVault Pro | Seat-Based | **VALID** (Active) | 2 / 5 Active | Multi-device node-locking test |
| **#1003** | CloudSync Manager | Subscription | **VALID** (Active) | 1 / 3 Active | Active 30-day recurring subscription |
| **#1004** | DesignFlow Studio | Subscription | **EXPIRED** | 0 / 1 Active | Real expired state (EVM time advanced by 3600s) |
| **#1005** | DataLens Analytics | Seat-Based | **REVOKED** | 1 / 5 Active | Real revoked state with on-chain piracy audit reason |
| **#9999** | Non-Existent | N/A | **INVALID** | 0 / 0 Active | Unminted token ID verification test |
