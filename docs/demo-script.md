# 5–10 Minute Faculty Presentation & Project Demonstration Script

**Project Title**: Blockchain-Based Software License Management and Verification Platform  
**Candidate Name**: Varshith Reddy  
**Role During Demo**: Presenter (Senior Full-Stack & Blockchain Developer)  

---

## ⏱️ Timeline & Presentation Flow

### [Minute 0:00 - 1:30] Introduction & Problem Statement
1. **Open Landing Page** (`http://localhost:5173/`).
2. **Statement to Faculty**:
   > *"Good morning respected evaluators. My final-year project addresses a critical problem in the software industry: software piracy, crack keygens, and centralized digital rights management (DRM) server failures. Traditional DRM servers represent a single point of failure (SPOF); if Adobe or Microsoft activation servers suffer outages, paying customers are locked out of their software. Conversely, static serial keys can be easily reverse-engineered using offline disassemblers.
   > 
   > In **ChainLicense**, software licenses are minted as unique, tamper-evident tokens on the Ethereum blockchain, tied to hardware node-locking machine fingerprints with zero-gas public verification."*

---

### [Minute 1:30 - 3:00] Software Catalog & Purchase Checkout (Customer Persona)
1. In the header, click the **Role Switcher** -> select **"Customer"** (Alice Johnson).
2. Click **"Software Catalog"** (`/products`).
3. Show the available software products (*CyberShield Pro*, *DevIDE Studio*, *NeuralData Pipeline*).
4. Click **"Purchase License"** on *DevIDE Studio 2026*.
5. Show the simulated checkout modal displaying price in demo ETH, plan duration, and customer wallet.
6. Click **"Confirm Demo Purchase"**.
7. Observe the confetti celebratory animation and receipt showing on-chain Token ID and transaction hash.
8. Click **"View in My Licenses"** (`/customer`).
9. Show how the newly acquired license appears in the Customer Vault with active status.

---

### [Minute 3:00 - 5:00] Developer / Publisher Hub & License Issuance
1. In the header, switch role to **"Publisher"** (TechSoft Cyber Labs).
2. Navigate to **Developer Hub** (`/developer`).
3. Point out the real-time analytics:
   - Total software products published
   - Total licenses issued
   - Active nodes and revoked license counts
   - Weekly issuance & verification velocity area chart (Recharts)
4. Click **"Issue License On-Chain"**.
5. Select *CyberShield Pro Enterprise*, enter a customer wallet, choose a plan, and click **"Confirm & Issue"**.
6. Show the confirmed transaction hash (`0x...`) generated on the blockchain.

---

### [Minute 5:00 - 7:00] The Public Verification Engine (0-Gas Demonstration)
1. Click **"Verify License"** in the top navigation bar (`/verify`).
2. Explain to faculty:
   > *"Notice that anyone—including an offline software installer or client application—can verify a license without logging in. Crucially, this execution uses an Ethereum `view` function via `eth_call`, meaning it consumes **0 Gas** and completes in milliseconds."*
3. Test **License #1001**:
   - Status: **VALID**
   - Green badge, verified on-chain, metadata integrity confirmed, and issuer/holder addresses displayed.
4. Test **License #1003**:
   - Status: **REVOKED**
   - Red badge, clearly displaying the on-chain revocation reason: *"Software piracy detected: Key leaked on unauthorized public forum"*.
5. Explain to faculty:
   > *"Notice that revoked licenses cannot be made valid again merely by altering a field in the database or frontend; the smart contract code strictly checks the immutable on-chain status."*

---

### [Minute 7:00 - 8:30] Smart Contract Architecture & Hardhat Test Suite
1. Switch to terminal/code view and show `SoftwareLicenseManager.sol`.
2. Highlight:
   - `AccessControl` and `PUBLISHER_ROLE`.
   - `activateLicense` enforcing machine seat quotas.
   - `verifyLicense` returning real-time validity.
3. Show Hardhat test suite in `blockchain/test/SoftwareLicenseManager.test.ts`:
   - Unit tests covering unauthorized issuance, invalid expiration, unauthorized revocation, and verification.

---

### [Minute 8:30 - 10:00] Conclusion & Viva Voce Q&A Handling
1. Navigate to `/activity` to show the on-chain ledger activity table with real confirmed transaction hashes.
2. Summarize the academic contribution:
   - Tamper-evident issuance
   - Zero-gas verification
   - Node-locking anti-piracy
   - Auditable lifecycle transitions
3. Open floor for faculty questions. Refer to Section 6 of `PROJECT_REPORT.md` for answers!
