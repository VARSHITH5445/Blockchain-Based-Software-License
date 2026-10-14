# 🚀 ChainLicense: Transfer & Run on Another System Guide

This guide explains how to package, share, and run this project on any other computer (Windows, macOS, or Linux).

---

## 📍 1. Project Location on Your Computer

Your project is located at:
```text
C:\Users\VARSHITH_REDDY\OneDrive\Desktop\blockchain
```

---

## 📦 2. How to Prepare the Folder to Send to Your Friend

### ⚠️ IMPORTANT: Exclude `node_modules` (To make it fast to send)
The `node_modules` folders are huge (over 1.5 GB), but the code itself is only **~5 MB**. Your friend will regenerate `node_modules` in seconds using one command.

### Recommended Steps to Zip:
1. Open File Explorer to:
   `C:\Users\VARSHITH_REDDY\OneDrive\Desktop`
2. **Right-click** on the **`blockchain`** folder.
3. Select **Compress to ZIP file** (or Send to → Compressed (zipped) folder).
4. *Tip:* If you want the zip to be super small (~5 MB), delete or skip the `node_modules` folders inside `blockchain/`, `backend/`, and `frontend/` before zipping.
5. Send the `.zip` file to your friend via Google Drive, Pen Drive, or WhatsApp/Telegram.

---

## 💻 3. Steps for Your Friend (On the New System)

### Step 3.1: Prerequisites
Your friend needs to have **Node.js** installed:
* Download & install Node.js (v18, v20, or v22 LTS) from [https://nodejs.org](https://nodejs.org).

---

### Step 3.2: Extract the Project
Extract the zip file to any folder (for example: `Desktop\blockchain`).

---

### Step 3.3: Install Dependencies (Run Once)
Open a terminal (PowerShell, Command Prompt, or Terminal) in the root `blockchain` folder and run:
```bash
npm run install:all
```
*(This automatically installs dependencies for the root, smart contract blockchain, backend, and frontend).*

---

### Step 3.4: Start the System (Open 3 Terminals)

#### 🟢 Terminal 1: Start the Local Blockchain (Hardhat)
```bash
cd blockchain
npx hardhat node
```
*Keep this terminal running. It starts the local Ethereum blockchain at `http://127.0.0.1:8545`.*

#### ⚡ Deploy Contracts & Seed Licenses (Run once in a sub-shell)
In a new terminal window or tab, deploy the smart contract to the local chain:
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
```
*This deploys `SoftwareLicenseManager.sol`, authorizes the publisher, mints licenses #1001-#1005, advances the EVM clock for expiration, and revokes #1005.*

#### 🟢 Terminal 2: Start the Backend API Server
```bash
cd backend
npm run build
node dist/server.js
```
*Backend API will run at `http://localhost:5000/api` with disk persistence in `backend/data/store.json`.*

#### 🟢 Terminal 3: Start the React Frontend Dashboard
```bash
cd frontend
npm run dev
```
*Frontend will open at **`http://localhost:5173`**.*

---

## 🌐 4. Open in Browser & Demo Logins

Open browser and navigate to:
👉 **`http://localhost:5173`**

### Pre-Configured Test Personas (1-Click Switcher Available in Top Navbar):

| Persona / Role | Email | Password | Pre-Funded Wallet Address |
| :--- | :--- | :--- | :--- |
| **Developer / Publisher** | `publisher@cybershield.io` | `Password123!` | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| **Customer Holder** | `customer@enterprise.com` | `Password123!` | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |
| **Administrator** | `admin@licensechain.org` | `Password123!` | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |

---

## 🔍 5. Pre-Seeded Verification Tests (Zero-Gas Public Portal)

Navigate to **`http://localhost:5173/verify`** and click the quick test buttons:
* **Token #1001**: **VALID** (Perpetual Lifetime License)
* **Token #1002**: **VALID** (Multi-Seat Enterprise with 2 active bound nodes)
* **Token #1003**: **VALID** (Active 30-day Subscription)
* **Token #1004**: **EXPIRED** (Genuinely elapsed on-chain timestamp)
* **Token #1005**: **REVOKED** (Shows immutable on-chain reason: *"Software piracy detected: Key leaked on unauthorized public forum"*)
* **Token #9999**: **INVALID / NOT FOUND** (Unminted ID)

---

## 🧪 6. Automated Testing Commands

To show faculty or verify everything works in 5 seconds:

### Run Smart Contract Tests (17 Tests):
```bash
cd blockchain
npx hardhat test
```

### Run End-to-End Backend & Verification Tests (30 Tests):
```bash
cd backend
npx ts-node src/scripts/testE2E.ts
```

### Run Full 15-Step Acceptance Workflow:
```bash
cd backend
npx ts-node src/scripts/acceptanceWorkflow.ts
```
