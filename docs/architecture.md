# System Architecture Specification

## 1. Overview
The **ChainLicense Platform** is an enterprise-grade decentralized digital rights management (DRM) and software license verification system. It combines off-chain relational indexing (PostgreSQL + Prisma) with on-chain cryptographic state guarantees (EVM Solidity Smart Contracts on Hardhat/Ethereum).

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION TIER                                  |
|                                                                                       |
|   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts + React Router|
|   - Landing Page                                 - Software Catalog (Demo Checkout)   |
|   - Developer Dashboard (Metrics & Plans)        - Customer Vault (Owned Licenses)    |
|   - Public Verification Portal (0-Gas eth_call)  - Admin Console (Audit & Permissions)|
+-----------------------------+------------------------------------+--------------------+
                              |                                    |
                 (REST APIs / JWT / JSON)                     (RPC / Web3)
                              |                                    |
                              v                                    v
+-----------------------------+---------+   +----------------------+--------------------+
|               APPLICATION TIER         |   |                 BLOCKCHAIN TIER            |
|                                        |   |                                            |
|   Node.js + Express.js + TypeScript    |   |   Hardhat Local Ethereum Network (31337)   |
|   - JWT Authentication & RBAC          |   |   SoftwareLicenseManager.sol (^0.8.20)     |
|   - Zod Input Validation               |   |   - AccessControl (PUBLISHER_ROLE)         |
|   - Rate Limiting (express-rate-limit) |   |   - License Struct & Status Enumeration    |
|   - Canonical Metadata Keccak-256 Hash |   |   - Hardware Node-Locking (Device Binding) |
|   - Security Logging & Auditing        |   |   - Zero-Gas verifyLicense() View Function |
|   - High-Availability Fallback Store   |   |   - Administrative Revocation & Renewal    |
+-----------------------------+----------+   +----------------------+---------------------+
                              |                                     |
                       (Prisma ORM)                           (EVM Ledger)
                              |                                     |
                              v                                     v
+-----------------------------+----------+   +----------------------+---------------------+
|                 PERSISTENCE TIER        |   |              CONSENSUS & EVENTS            |
|                                        |   |                                            |
|   PostgreSQL Database                  |   |   Mined Blocks & Transaction Receipts      |
|   - Users (Publishers, Customers, Admin|   |   Event Logs:                              |
|   - Software Products & License Plans  |   |   - LicenseIssued                          |
|   - License Metadata & Purchase Orders |   |   - LicenseActivated                       |
|   - Blockchain Transactions & Audits   |   |   - LicenseRevoked / LicenseRenewed        |
+----------------------------------------+   +--------------------------------------------+
```

---

## 2. Smart Contract Design (`SoftwareLicenseManager.sol`)

### 2.1 State Representation
```solidity
struct License {
    uint256 licenseId;
    string productId;             // Off-chain software UUID or slug
    address publisher;             // Publisher wallet address who issued it
    address holder;                // Customer wallet address owning the license
    uint256 issueTimestamp;        // Block timestamp when minted
    uint256 expirationTimestamp;   // 0 for perpetual, otherwise unix epoch
    LicenseType licenseType;       // PERPETUAL, SUBSCRIPTION, TRIAL, SEAT_BASED
    LicenseStatus status;          // ISSUED, ACTIVE, EXPIRED, REVOKED
    bytes32 metadataHash;          // Keccak-256 hash of canonical JSON metadata
    uint256 maxActivations;        // Maximum allowed hardware machines / seats
    uint256 currentActivations;    // Current active machine bindings
    string revocationReason;       // Immutable audit reason if revoked
}
```

### 2.2 Access Control & Security
- Leverages OpenZeppelin `AccessControl`.
- `DEFAULT_ADMIN_ROLE`: Authorizes or revokes publishers, platform administration.
- `PUBLISHER_ROLE`: Authorizes software publishers to issue and revoke licenses.
- ReentrancyGuard: Protects all state-modifying functions against reentrancy attacks.
- Non-Transferable Checks: Only the registered customer wallet or admin can activate a device.
- Immutability: Revoked licenses cannot be resurrected merely by modifying frontend claims.

---

## 3. Cryptographic Verification & Anti-Piracy Architecture

### 3.1 Hardware Node-Locking (Device Binding)
$$\mathcal{H}_{device} = \text{Keccak-256}(\text{HardwareRaw})$$
The client software hashes low-level machine identifiers (CPU UUID, motherboard serial, MAC address). The smart contract enforces:
$$\text{currentActivations} < \text{maxActivations}$$

### 3.2 Canonical Metadata Integrity
To ensure off-chain software metadata has not been tampered with:
$$\mathcal{H}_{metadata} = \text{Keccak-256}(\text{CanonicalJSONString})$$
During verification, the backend and smart contract compare $\mathcal{H}_{metadata}$ stored on-chain with the computed hash of the database record.

### 3.3 Zero-Gas Cost Model
License verification executes as an Ethereum `view` function via `eth_call`. It queries local EVM node memory directly:
- **Gas Used**: 0 Wei
- **Latency**: < 20 ms
- **MetaMask Signature Required**: No
