# Blockchain-Based Software Licensing and Decentralized DRM System
**Course Project Report & Technical Specification**  
**Course**: Blockchain & Smart Contract Technologies  
**Student Name**: Varshith Reddy  
**Repository**: `c:\Users\VARSHITH_REDDY\OneDrive\Desktop\blockchain`  
**Contract Version**: EVM Solidity `^0.8.20`  

---

## 1. Abstract
Traditional software licensing relies on centralized digital rights management (DRM) servers and static license keys. This architecture suffers from critical vulnerabilities: algorithmic key generation cracks ("keygens"), single points of failure (server downtime locking out paying customers), inability to resale or transfer licenses transparently, and opaque vendor lock-in. 

This project presents **ChainLicense**, an end-to-end decentralized software licensing and DRM platform powered by Ethereum smart contracts. Software licenses are minted as unique, verifiable on-chain tokens bound to machine hardware fingerprints through low-level cryptographic hashing (Keccak-256). The platform features:
1. **Multi-Model Licensing**: Perpetual (lifetime), recurring subscriptions (timestamp-based auto-expiry), and seat-based enterprise multi-node licenses.
2. **Zero-Gas Client Verification**: Client desktop applications query the smart contract state via `eth_call` view functions without spending gas or needing transaction confirmations.
3. **Hardware Node-Locking**: Anti-piracy binding preventing unauthorized execution across cloned machines or virtualized containers.
4. **Secondary Market Resale with Creator Royalties**: Customers can legally transfer or resell perpetual licenses, with smart contracts automatically deducting a percentage royalty (e.g., 5–10%) back to the original software developer.
5. **Instant Administrative Revocation**: Vendors can instantly blacklist leaked keys with immutable on-chain audit trails.

---

## 2. Problem Statement & Motivation

### 2.1 Shortcomings of Traditional Software Licensing
| Limitation | Traditional Licensing Mechanism | Blockchain-Based Solution (Proposed) |
| :--- | :--- | :--- |
| **Piracy & Keygens** | Static strings validated via mathematical modulus checks easily reverse-engineered in disassemblers. | Smart contract state verification; keys cannot be faked without altering the global blockchain ledger. |
| **Server Outages & SPOF** | Centralized activation servers (e.g. Adobe, Microsoft) can crash, preventing users from opening valid software. | Ethereum's distributed consensus has 100% uptime with thousands of validator nodes worldwide. |
| **Secondary Market Rights** | License resale is blocked or gray-market fraudulent (users sell passwords or compromised keys). | Trustless peer-to-peer transfer with programmatic creator royalty splits enforced by smart contract. |
| **Audit Transparency** | License counts and seat utilization hidden in proprietary closed databases. | Transparent, immutable on-chain event logs (`LicensePurchased`, `DeviceBound`, `LicenseRevoked`). |
| **Subscription Fraud** | Credit card chargebacks and subscription synchronization bugs. | Deterministic on-chain timestamp verification (`block.timestamp <= expiryTimestamp`). |

---

## 3. Mathematical & Cryptographic Formulation

### 3.1 Hardware Machine Fingerprinting (Node-Locking)
To prevent one license token from being shared among thousands of users, the client software queries machine-level identifiers:
$$\text{HardwareRaw} = \text{CPUID} \parallel \text{MotherboardUUID} \parallel \text{NIC\_MAC} \parallel \text{OS\_Serial}$$

The client application hashes this string using Ethereum's cryptographic hash primitive:
$$\mathcal{H}_{device} = \text{Keccak-256}(\text{HardwareRaw})$$

When the user authorizes a device, $\mathcal{H}_{device}$ is recorded in the smart contract mapping:
$$\text{isDeviceBound}[\text{licenseId}][\mathcal{H}_{device}] = \text{true}$$
$$\text{seatsUsed} \leftarrow \text{seatsUsed} + 1 \quad (\text{subject to } \text{seatsUsed} \le \text{maxSeats})$$

### 3.2 Offline EIP-712 Challenge-Response Verification
For machines operating in restricted networks, cryptographic challenge verification is executed:
1. Software client generates a nonce challenge:
   $$\mathcal{C} = \text{Keccak-256}(\mathcal{H}_{device} \parallel \text{Timestamp} \parallel \text{Nonce})$$
2. The license owner signs $\mathcal{C}$ with their Web3 private key $SK$:
   $$\sigma = \text{Sign}_{SK}(\mathcal{C}) = (r, s, v)$$
3. The smart contract recovers the signer address:
   $$\mathcal{A}_{signer} = \text{ecrecover}(\mathcal{C}, v, r, s)$$
4. The smart contract validates:
   $$\mathcal{A}_{signer} \stackrel{?}{=} \text{licenses}[\text{licenseId}].\text{owner}$$

### 3.3 Secondary Resale Royalty Distribution
When a perpetual license is resold at price $P_{resale}$:
$$\text{Royalty} = P_{resale} \times \frac{\text{RoyaltyBasisPoints}}{10000}$$
$$\text{SellerProceeds} = P_{resale} - \text{Royalty}$$

Payments are dispatched atomically in the same transaction:
- $\text{vendor}.\text{transfer}(\text{Royalty})$
- $\text{seller}.\text{transfer}(\text{SellerProceeds})$
- $\text{licenses}[\text{licenseId}].\text{owner} \leftarrow \text{buyer}$
- All bound devices are cleared to prevent the seller from retaining access.

---

## 4. System Architecture & Component Design

```
+-------------------------------------------------------------------------+
|                         APPLICATION CLIENT LAYER                        |
|                                                                         |
|  +--------------------+  +--------------------+  +-------------------+  |
|  | Web Store & Vault  |  | Vendor Operations  |  | Client Simulator  |  |
|  | (React / Ethers)   |  | (Analytics / Revoke|  | ("CyberShield IDE")|  |
|  +--------------------+  +--------------------+  +-------------------+  |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                      CRYPTOGRAPHIC VERIFICATION LAYER                   |
|                                                                         |
|  - Hardware Fingerprint Derivation: Keccak-256(Hardware Identifiers)   |
|  - EIP-712 Challenge-Response Signature Verifier                        |
|  - Zero-Gas View Invocation: eth_call verifyLicense()                   |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                         ETHEREUM SMART CONTRACT                         |
|                    (SoftwareLicenseManager.sol)                         |
|                                                                         |
|  - Product Registry (Pricing, Model, Vendor, Royalty)                   |
|  - License Token Registry (ID, Owner, IssueDate, Expiry, Seats, Status) |
|  - Node-Locking Registry (mapping: licenseId => deviceHash => bool)     |
|  - Access Control (onlyLicenseOwner, onlyVendor, onlyContractOwner)    |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                  ETHEREUM CONSENSUS & LEDGER LAYER                      |
|                                                                         |
|  - State Persistence & Mined Blocks                                     |
|  - Event Logs: LicensePurchased, DeviceBound, LicenseRevoked            |
+-------------------------------------------------------------------------+
```

---

## 5. Security & Threat Modeling

| Attack Vector | Attacker Action | System Defense Mechanism |
| :--- | :--- | :--- |
| **Keygen Generation** | Attacker creates an offline mathematical key generator. | **Defeated**: Keys are state records on the Ethereum blockchain. An offline key generator cannot write to the smart contract ledger. |
| **License Duplication** | User copies their license token ID to friends or colleagues. | **Defeated**: Each license token enforces a maximum seat limit (`maxSeats`). Computers must register their hardware hash `H_device`. Exceeding seats reverts the transaction. |
| **Replay Attacks** | Attacker captures a verification network packet and replays it. | **Defeated**: Challenge nonces incorporate timestamps and ephemeral nonces, rendering replayed payloads invalid. |
| **Virtual Machine Cloning** | Attacker copies a VM image to multiple physical hosts. | **Defeated**: Hardware fingerprinting gathers host motherboard UUID and NIC MAC addresses which change upon VM cloning or migration. |
| **Fraudulent Resale** | Seller attempts to continue using software after selling it. | **Defeated**: The smart contract `resellLicense` function atomically wipes `_licenseBoundDevices[licenseId]`, immediately locking the seller's machines. |
| **Chargeback Fraud** | Enterprise client requests credit card chargeback after receiving software. | **Defeated**: Vendor invokes `revokeLicense(id, reason)`, blacklisting the token on-chain. Future client verifications instantly lock the app. |

---

## 6. Viva Voce Examination Preparation (Key Questions & Answers)

1. **Q: Why is Blockchain superior to a cloud database (PostgreSQL/MongoDB) for software licensing?**  
   *A:* A cloud database is centralized and controlled by a single party. If the vendor shuts down, suffers a cyberattack, or changes terms unilaterally, all customer licenses can vanish. Blockchain provides trustless immutability, 100% uptime, sovereign ownership of license tokens by the user's private key, and allows programmable secondary resale.

2. **Q: How does the software client verify a license without charging the user gas fees?**  
   *A:* The client application uses `eth_call` to invoke the `verifyLicense` function. `eth_call` executes read-only on the local EVM node without broadcasting a transaction to the network, resulting in 0 gas consumed and sub-second response times.

3. **Q: How does the system handle hardware changes (e.g. user buys a new graphics card or laptop)?**  
   *A:* The user accesses their Customer License Vault and clicks `unbindDevice(deviceFingerprint)`. This decrements `seatsUsed` and frees up the seat, allowing them to bind their new hardware node.

4. **Q: What is the difference between ERC-721 and this custom licensing contract?**  
   *A:* ERC-721 is a general standard for non-fungible art/collectibles. Software licenses require specialized logic that ERC-721 lacks: node-locking device binding hashes, seat count enforcement, subscription expiration timestamps, and administrative revocation registries.

5. **Q: How are software creators protected when users resell their licenses?**  
   *A:* Through programmable royalties specified in basis points (e.g. 500 = 5%). The smart contract automatically transfers this percentage directly to the creator's address before releasing funds to the reseller.

---

## 7. Conclusion & Future Work
This project demonstrates that blockchain technology provides an optimal foundation for modern software digital rights management. By combining on-chain tokenization with low-level hardware fingerprinting, **ChainLicense** solves keygen vulnerabilities, eliminates single-point-of-failure activation outages, and empowers legitimate software resale while guaranteeing creator compensation.

Future extensions include:
- **Zero-Knowledge Proofs (zk-SNARKs)**: Proving hardware compliance without revealing low-level hardware serial numbers on public networks.
- **Decentralized Oracles (Chainlink)**: Automatically verifying real-world chargebacks or dispute resolutions.
- **Layer-2 Rollups**: Deploying on Arbitrum/Optimism for sub-cent gas fees during initial license minting.
