# ChainLicense Security Architecture & Threat Analysis

This document outlines the security architecture, threat models, cryptographic proofs, and defense-in-depth mechanisms implemented across the **ChainLicense** platform.

---

## 1. Threat Model & Attack Vectors

The ChainLicense platform is designed to counteract classical software piracy, cryptographic tampering, and unauthorized privilege escalation.

```
                      +------------------------------------+
                      |     Potential Attack Vectors       |
                      +------------------------------------+
                                      |
       +------------------+-----------+-----------+------------------+
       |                  |                       |                  |
       v                  v                       v                  v
[Keygen & Replay]  [Metadata Tamper]       [Seat Over-alloc]  [Privilege Escalation]
       |                  |                       |                  |
       v                  v                       v                  v
Tamper-proof EVM    Deterministic Keccak    Cryptographic Node-   OpenZeppelin RBAC
State Machine       Integrity Hash          Locking Fingerprint   (PUBLISHER_ROLE)
```

### 1.1 Threat Matrix
| Threat Scenario | Classical Impact | ChainLicense Countermeasure | Verification Mechanism |
|---|---|---|---|
| **Keygen / Serial Forgery** | Attackers synthesize mathematical keys locally without payment. | Licenses are non-forgeable EVM storage states indexed by unique integer counters. | `verifyLicense()` on-chain check returns `INVALID / NOT FOUND` for synthetic keys. |
| **Metadata Tampering (MITM)** | Malicious proxy modifies seat count or expiration date in transit. | Deterministic `metadataHash` stored immutably on smart contract at issuance. | Keccak-256 hash comparison between payload and contract state. |
| **Seat Over-allocation** | Single license shared across unlimited computers. | Hardware node-locking fingerprint binding with explicit `maxActivations` bounds. | Smart contract checks `_boundDevices[licenseId][fingerprint]` and increments `currentActivations`. |
| **Unauthorized Minting** | Rogue user mints enterprise licenses directly on the contract. | `AccessControl` restricts `issueLicense` to audited accounts holding `PUBLISHER_ROLE`. | EVM `revert` on missing role with descriptive error string. |
| **Reentrancy Exploits** | External calls manipulate balances or license counts before state commits. | `ReentrancyGuard` non-reentrant modifier + Checks-Effects-Interactions pattern. | State changes execute before emitting events; no external untrusted calls. |

---

## 2. Smart Contract Security Implementation

### 2.1 Role-Based Access Control (RBAC)
The smart contract inherits from OpenZeppelin's audited `AccessControl`:

```solidity
bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER_ROLE");

function issueLicense(...) external onlyRole(PUBLISHER_ROLE) nonReentrant returns (uint256) {
    // Only verified software publishers can issue licenses
}

function revokeLicense(uint256 licenseId, string calldata reason) external nonReentrant {
    License storage lic = _licenses[licenseId];
    require(
        msg.sender == lic.publisher || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
        "Unauthorized: Only publisher or admin can revoke"
    );
    // Revocation logic
}
```

- **Separation of Concerns**: Administrators manage system-level governance and role grants; publishers manage their software products and licenses; customers possess activation privileges.
- **Fail-Safe Defaults**: Accounts have no issuance capabilities until granted `PUBLISHER_ROLE` by the contract administrator (`DEFAULT_ADMIN_ROLE`).

### 2.2 Checks-Effects-Interactions (CEI) Pattern
Every mutating function updates internal storage before triggering events or interactions:

```solidity
function activateLicense(uint256 licenseId, bytes32 deviceFingerprint) external nonReentrant {
    License storage lic = _licenses[licenseId];
    
    // 1. CHECKS
    require(lic.licenseId != 0, "License does not exist");
    require(lic.status != LicenseStatus.REVOKED, "License is revoked");
    require(!_boundDevices[licenseId][deviceFingerprint], "Device already activated");
    require(lic.currentActivations < lic.maxActivations, "Maximum seat activations reached");
    
    // 2. EFFECTS
    _boundDevices[licenseId][deviceFingerprint] = true;
    lic.currentActivations += 1;
    if (lic.status == LicenseStatus.ISSUED) {
        lic.status = LicenseStatus.ACTIVE;
    }
    
    // 3. INTERACTIONS / LOGS
    emit LicenseActivated(licenseId, msg.sender, deviceFingerprint, lic.currentActivations);
}
```

### 2.3 Cryptographic Metadata Integrity Hash
To prevent off-chain database manipulation from presenting falsified terms (e.g. claiming a 1-year subscription is perpetual):
1. When a license is minted, the publisher's client creates a canonical JSON object:
   ```json
   {
     "features": ["All Modules"],
     "holder": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
     "maxActivations": 3,
     "plan": "Enterprise",
     "product": "CyberShield Pro"
   }
   ```
2. The JSON keys are sorted alphabetically and hashed using `keccak256`:
   $$\text{MetadataHash} = \text{keccak256}(\text{CanonicalJSONString})$$
3. The resulting 32-byte digest is passed into `issueLicense(..., metadataHash)`.
4. Anyone verifying the license compares their metadata copy against the on-chain hash. If a single byte differs, the integrity check fails immediately.

---

## 3. Hardware Node-Locking & Anti-Piracy

To prevent credential sharing and unauthorized deployment across server clusters:

### 3.1 Fingerprint Generation Pipeline
Each client workstation executes a deterministic fingerprinting algorithm:
1. Collects immutable machine identifiers:
   - CPU Processor ID
   - Motherboard Serial Number
   - Primary Storage Drive UUID
   - Primary Network MAC Address
2. Normalizes strings to uppercase without whitespace.
3. Computes SHA-256 / Keccak-256 hash:
   $$\text{DeviceFingerprint} = \text{keccak256}(\text{CPUID} \parallel \text{MotherboardSerial} \parallel \text{DriveUUID})$$
4. The 32-byte hash is transmitted to `activateLicense()`.

### 3.2 Anti-Sybil Protection
- The smart contract maintains a nested mapping `mapping(uint256 => mapping(bytes32 => bool)) private _boundDevices`.
- Re-activation of the identical machine is idempotent and rejected from consuming additional seats.
- When `currentActivations >= maxActivations`, subsequent activation transactions revert with `"Maximum seat activations reached"`.

---

## 4. Zero-Gas Read-Only Verification

```
+---------------+     eth_call: verifyLicense(1001)     +-------------------+
| Public Client | -----------------------------------> | Smart Contract    |
| (Web Browser) | <----------------------------------- | (0 Gas Executed)  |
+---------------+     Tuple: (isValid, status, ...)    +-------------------+
```

- Public verification endpoints use EVM `view` functions (`eth_call`).
- Execution occurs locally on the node's EVM sandbox without mining or state change.
- **Gas Cost**: **0 ETH / 0 Wei**
- **Latency**: Under 25ms.
- **Privacy & Security**: Read-only queries cannot be front-run or manipulated by MEV bots.

---

## 5. Web Application & Backend Hardening

### 5.1 JSON Web Tokens (JWT)
- Signed with HMAC SHA-256 with strong environment secret keys (`JWT_SECRET`).
- Short expiration windows (24 hours).
- Payloads store only non-sensitive identity metadata (`userId`, `role`, `walletAddress`).

### 5.2 Role-Based Access Control Middleware
All protected endpoints pass through `requireRole(['PUBLISHER', 'ADMIN'])` guards before controllers execute:
```typescript
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
```

### 5.3 Rate Limiting
- Configured via `express-rate-limit` restricting public access to 100 requests per 15 minutes per IP address.
- Prevents resource exhaustion attacks against database lookups and blockchain RPC proxies.

---

## 6. Audit Trail & Non-Repudiation

Every administrative action, issuance, revocation, and renewal generates:
1. **On-Chain Event**: Emitted with indexed parameters for real-time indexing by Subgraphs and WebSockets.
2. **Audit Log Record**: Storing timestamp, IP address, user identity, and cryptographic state diffs.
3. **Revocation Immutability**: Once revoked, a license can never transition back to `ACTIVE`, and the original revocation reason is stored on-chain forever.
