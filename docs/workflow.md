# End-to-End Application Workflows

This document outlines the six core workflows implemented in ChainLicense.

---

## Workflow A: Publisher Registration & Wallet Association
1. The publisher navigates to the registration page (`/register`) and creates an account with the `PUBLISHER` role.
2. The publisher signs in (`/login`) and connects their MetaMask wallet.
3. The backend updates the user profile with the associated Ethereum address via `PUT /api/auth/wallet`.
4. The smart contract validates that the wallet address has `PUBLISHER_ROLE`.
5. The publisher dashboard unlocks software creation and on-chain license issuance privileges.

---

## Workflow B: Software Publication & Plan Configuration
1. The publisher clicks **"Add Software"** (`/products/new`).
2. The publisher enters:
   - Product name (e.g. *SentinelZero Guard*)
   - Description and system requirements
   - Category (e.g. *Cybersecurity*)
   - Version tag (e.g. *v1.0.0*)
   - One or more license plans (Perpetual, 30-Day Subscription, 5-Seat Enterprise)
3. The backend validates the inputs using Zod schemas and saves the product in PostgreSQL.
4. The newly registered software immediately appears on the public Software Catalog (`/products`).

---

## Workflow C: License Purchase & On-Chain Issuance
1. A customer registers and connects their MetaMask wallet (`0x3C44...93BC`).
2. The customer browses the Software Catalog and clicks **"Purchase License"**.
3. The customer reviews the terms in the simulated checkout modal.
4. The customer confirms checkout.
5. The smart contract mints the license token:
   `issueLicense(productId, holderWallet, licenseType, duration, maxSeats, metadataHash)`
6. The transaction confirms on Hardhat with an immutable transaction hash (e.g., `0x9a8b...`).
7. The backend computes the canonical metadata hash and stores the license record.
8. The customer sees the new license in their Customer License Vault (`/customer`).

---

## Workflow D: Zero-Gas Public License Verification
1. An auditor, customer, or software client opens the public verification portal (`/verify?id=1001`) or scans the QR code.
2. The frontend or software client executes a read-only `eth_call`:
   `SoftwareLicenseManager.verifyLicense(1001)`
3. The contract evaluates:
   - Does token ID exist?
   - Is status equal to `REVOKED`?
   - Has `block.timestamp` exceeded `expirationTimestamp`?
4. The backend computes the SHA-256 / Keccak-256 hash of the canonical JSON metadata and confirms hash equivalence.
5. The UI displays the verified result: **VALID**, **EXPIRED**, **REVOKED**, or **INVALID / NOT FOUND** alongside the transaction hash and network reference.
6. **Gas Cost**: Exactly 0 Gas.

---

## Workflow E: License Revocation (Piracy Mitigation)
1. An authorized publisher detects a compromised key.
2. In the Developer Dashboard, the publisher clicks **"Revoke"** on the target license (e.g. License #1003).
3. The publisher enters the reason: *"Software piracy detected: Key leaked on unauthorized public forum"*.
4. MetaMask prompts for a transaction signature invoking:
   `SoftwareLicenseManager.revokeLicense(1003, reason)`
5. The transaction confirms and emits the `LicenseRevoked` event.
6. The backend updates the database status to `REVOKED`.
7. Any subsequent verification attempt on the public portal or client application returns `REVOKED` with the exact on-chain reason displayed.

---

## Workflow F: Subscription License Renewal
1. A customer or publisher selects an active or expired subscription license.
2. Clicks **"Renew Validity"** and selects an extension period (e.g. +30 Days).
3. The caller signs the on-chain renewal transaction:
   `SoftwareLicenseManager.renewLicense(licenseId, 2592000)`
4. The smart contract updates `expirationTimestamp = expirationTimestamp + duration`.
5. The UI updates the validity timer, and verification returns `VALID`.
