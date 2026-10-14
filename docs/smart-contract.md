# Smart Contract Architecture & Technical Reference

**Contract Name**: `SoftwareLicenseManager.sol`  
**Compiler Version**: Solidity `^0.8.20`  
**Standard**: EVM Compatible with OpenZeppelin v5 Contracts  
**Security Libraries**: `@openzeppelin/contracts/access/AccessControl.sol`, `@openzeppelin/contracts/utils/ReentrancyGuard.sol`  

---

## 1. Role-Based Access Control Model

| Role Identifier | Constant Hash | Allowed Operations |
| :--- | :--- | :--- |
| **`DEFAULT_ADMIN_ROLE`** | `0x0000...0000` | Authorize new publishers (`addPublisher`), revoke publisher status (`removePublisher`), emergency license revocation. |
| **`PUBLISHER_ROLE`** | `keccak256("PUBLISHER_ROLE")` | Mint/Issue software licenses (`issueLicense`), revoke issued licenses (`revokeLicense`), manage software releases. |
| **`CUSTOMER / HOLDER`** | Wallet Address (`lic.holder`) | Activate machine hardware nodes (`activateLicense`), deactivate nodes (`deactivateLicense`), renew subscription (`renewLicense`). |
| **`PUBLIC / CLIENT APP`** | Any Address (`msg.sender`) | Zero-gas license verification (`verifyLicense`), check device authorization (`isDeviceAuthorized`). |

---

## 2. Core Smart Contract Functions

### `issueLicense()`
```solidity
function issueLicense(
    string calldata productId,
    address holder,
    LicenseType licenseType,
    uint256 durationInSeconds,
    uint256 maxActivations,
    bytes32 metadataHash
) external onlyAuthorizedPublisher nonReentrant returns (uint256)
```
- **Access Control**: Requires caller to hold `PUBLISHER_ROLE` or `DEFAULT_ADMIN_ROLE`.
- **Validation**:
  - `productId` length $> 0$.
  - `holder != address(0)`.
  - `maxActivations >= 1`.
  - Non-perpetual licenses require `durationInSeconds > 0`.
- **Effects**:
  - Increments `_licenseIdCounter`.
  - Stores license struct in `_licenses[newId]`.
  - Indexes license in `_holderLicenses[holder]` and `_publisherLicenses[msg.sender]`.
  - Emits `LicenseIssued(newId, productId, msg.sender, holder, ...)`.

---

### `activateLicense()`
```solidity
function activateLicense(
    uint256 licenseId,
    bytes32 deviceFingerprint
) external licenseExists(licenseId) nonReentrant
```
- **Access Control**: Caller must be `lic.holder` or platform admin.
- **Validation**:
  - Status must not be `REVOKED`.
  - If subscription, `block.timestamp <= lic.expirationTimestamp`.
  - Device must not be already bound (`!_boundDevices[licenseId][deviceFingerprint]`).
  - `currentActivations < maxActivations`.
- **Effects**:
  - Marks `_boundDevices[licenseId][deviceFingerprint] = true`.
  - Increments `lic.currentActivations += 1`.
  - Updates status to `ACTIVE`.
  - Emits `LicenseActivated(licenseId, holder, deviceFingerprint, ...)`.

---

### `verifyLicense()` (Zero-Gas View)
```solidity
function verifyLicense(uint256 licenseId)
    external
    view
    returns (
        bool isValid,
        LicenseStatus effectiveStatus,
        string memory statusMessage,
        address publisher,
        address holder,
        uint256 issueTimestamp,
        uint256 expirationTimestamp,
        bytes32 metadataHash
    )
```
- **Gas Used**: **0 Gas** (Local `eth_call` view).
- **Evaluation Order**:
  1. If `licenseId == 0`: Returns `(false, EXPIRED, "INVALID / NOT FOUND", ...)`.
  2. If `status == REVOKED`: Returns `(false, REVOKED, "REVOKED: <reason>", ...)`.
  3. If `expirationTimestamp != 0` and `block.timestamp > expirationTimestamp`: Returns `(false, EXPIRED, "EXPIRED: License validity period elapsed", ...)`.
  4. Otherwise: Returns `(true, status, "VALID: Verified authentic on-chain", ...)`.

---

### `revokeLicense()`
```solidity
function revokeLicense(uint256 licenseId, string calldata reason)
    external
    licenseExists(licenseId)
    nonReentrant
```
- **Access Control**: Caller must be the original issuing publisher (`msg.sender == lic.publisher`) or platform admin.
- **Effects**:
  - Sets `lic.status = LicenseStatus.REVOKED`.
  - Records immutable `lic.revocationReason = reason`.
  - Emits `LicenseRevoked(licenseId, msg.sender, reason)`.

---

### `renewLicense()`
```solidity
function renewLicense(uint256 licenseId, uint256 additionalDurationInSeconds)
    external
    licenseExists(licenseId)
    nonReentrant
```
- **Access Control**: Caller must be publisher, holder, or platform admin.
- **Validation**:
  - License cannot be perpetual.
  - License cannot be `REVOKED`.
  - `additionalDurationInSeconds > 0`.
- **Effects**:
  - Extends `lic.expirationTimestamp`.
  - Emits `LicenseRenewed(licenseId, oldExpiration, newExpiration)`.
