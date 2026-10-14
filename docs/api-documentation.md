# ChainLicense REST API Specification

This document provides a comprehensive reference for the ChainLicense REST API service (`http://localhost:5000/api`).

---

## 1. Overview & Conventions

- **Base URL**: `http://localhost:5000/api`
- **Protocol**: HTTP/1.1 & HTTPS
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer token in the `Authorization` header (`Authorization: Bearer <token>`)
- **Public Endpoints**: Health checks and zero-gas license verification do not require authentication or wallet connectivity.

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Human-readable explanation of error condition",
  "code": "ERROR_CODE_STRING",
  "details": {}
}
```

### HTTP Status Code Reference
| Code | Meaning | Context |
|---|---|---|
| `200 OK` | Request succeeded | Verification, retrieval, successful updates |
| `201 Created` | Resource created | User registration, software publication, license minting |
| `400 Bad Request` | Missing or invalid parameters | Malformed JSON, missing mandatory fields, invalid dates |
| `401 Unauthorized` | Missing or invalid JWT | Expired token, forged signature, missing auth header |
| `403 Forbidden` | Insufficient permissions | Non-publisher attempting to issue, non-admin toggling users |
| `404 Not Found` | Resource does not exist | Unknown license ID, non-existent software product |
| `429 Too Many Requests` | Rate limit exceeded | Exceeding 100 requests / 15 minutes window |
| `500 Internal Error` | Unhandled server exception | Node/database connectivity failures |

---

## 2. Authentication & User Management

### 2.1 User Login
Authenticates an existing user and issues an HMAC SHA-256 JWT bearer token.

- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "publisher@cybershield.io",
  "password": "Password123!"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-pub-01",
    "email": "publisher@cybershield.io",
    "name": "Alex Vance (Publisher)",
    "role": "PUBLISHER",
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "companyName": "CyberShield Defense Corp"
  }
}
```

### 2.2 User Registration
Registers a new developer publisher or customer account.

- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@enterprise.com",
  "password": "SecurePassword123!",
  "role": "CUSTOMER",
  "walletAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "companyName": "Acme Innovations"
}
```
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr-1728901234",
    "email": "jane@enterprise.com",
    "name": "Jane Doe",
    "role": "CUSTOMER",
    "walletAddress": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "companyName": "Acme Innovations"
  }
}
```

### 2.3 Get Current User Profile
Retrieves the authenticated user's profile and active session details.

- **Endpoint**: `GET /auth/me`
- **Access**: Authenticated (`Bearer <JWT>`)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "user": {
    "id": "usr-pub-01",
    "email": "publisher@cybershield.io",
    "name": "Alex Vance (Publisher)",
    "role": "PUBLISHER",
    "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "companyName": "CyberShield Defense Corp",
    "isActive": true,
    "createdAt": "2026-10-01T00:00:00.000Z"
  }
}
```

---

## 3. Software Catalog & Licensing Plans

### 3.1 List All Software Products
Retrieves available software catalog with associated pricing tiers and licensing models.

- **Endpoint**: `GET /software`
- **Access**: Public
- **Query Parameters**:
  - `category` (optional, string): Filter by category (e.g. `Security`, `Developer Tools`).
  - `search` (optional, string): Search query across name and description.
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "count": 3,
  "software": [
    {
      "id": "soft-001",
      "name": "CyberShield Pro Enterprise",
      "slug": "cybershield-pro",
      "category": "Cybersecurity",
      "version": "v4.2.0",
      "description": "Zero-trust network defense agent with AI threat detection.",
      "publisher": {
        "id": "usr-pub-01",
        "name": "Alex Vance (Publisher)",
        "companyName": "CyberShield Defense Corp",
        "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
      },
      "plans": [
        {
          "id": "plan-001",
          "name": "Multi-Seat Enterprise (3 Nodes)",
          "licenseType": "SEAT_BASED",
          "priceUsd": 299,
          "durationDays": null,
          "maxActivations": 3,
          "isPerpetual": true
        }
      ]
    }
  ]
}
```

### 3.2 Create Software Product
Publishes a new software package into the catalog.

- **Endpoint**: `POST /software`
- **Access**: Authenticated (`PUBLISHER` or `ADMIN`)
- **Request Body**:
```json
{
  "name": "NeuralMesh Distributed DB",
  "category": "Database / Cloud",
  "version": "v1.0.0",
  "description": "Decentralized, fault-tolerant vector database engine.",
  "plans": [
    {
      "name": "Developer Pro",
      "licenseType": "SUBSCRIPTION",
      "priceUsd": 49,
      "durationDays": 365,
      "maxActivations": 2,
      "features": ["Vector Search", "10M Embeddings", "Community Support"]
    }
  ]
}
```
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "product": {
    "id": "soft-1728901999",
    "name": "NeuralMesh Distributed DB",
    "slug": "neuralmesh-distributed-db",
    "category": "Database / Cloud",
    "version": "v1.0.0"
  }
}
```

---

## 4. License Lifecycle Management

### 4.1 Issue / Mint License
Mints a new software license on the smart contract and persists metadata in the database.

- **Endpoint**: `POST /licenses/issue`
- **Access**: Authenticated (`PUBLISHER` or `ADMIN`)
- **Request Body**:
```json
{
  "softwareId": "soft-001",
  "planId": "plan-001",
  "customerWallet": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "customerEmail": "customer@enterprise.com",
  "durationDays": 0,
  "maxActivations": 3,
  "features": ["Real-time Shield", "DDoS Mitigation", "Audit Logging"]
}
```
- **Success Response (`201 Created`)**:
```json
{
  "success": true,
  "licenseId": 1004,
  "transactionHash": "0x8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
  "metadataHash": "0x3f5d2b9a7c8e1a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b",
  "license": {
    "id": "lic-1004",
    "onChainId": 1004,
    "softwareName": "CyberShield Pro Enterprise",
    "licenseType": "SEAT_BASED",
    "status": "ISSUED",
    "maxActivations": 3,
    "currentActivations": 0,
    "createdAt": "2026-10-14T08:35:00.000Z"
  }
}
```

### 4.2 Activate License on Client Machine
Binds a cryptographic hardware fingerprint to the license on-chain.

- **Endpoint**: `POST /licenses/:id/activate`
- **Access**: Authenticated (`CUSTOMER`, `PUBLISHER`, or `ADMIN`)
- **Request Body**:
```json
{
  "deviceFingerprint": "0x4b72c91fa023e198b5f3a098c1d3f982a17cb6e1f08e4d2938ab4c1092837461",
  "deviceName": "Workstation-NorthAmerica-01"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "Device successfully activated on blockchain",
  "licenseId": 1001,
  "currentActivations": 2,
  "maxActivations": 3,
  "transactionHash": "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
}
```

### 4.3 Revoke License
Immediately and permanently invalidates a license on-chain.

- **Endpoint**: `POST /licenses/:id/revoke`
- **Access**: Authenticated (`PUBLISHER` who owns the product or `ADMIN`)
- **Request Body**:
```json
{
  "reason": "Payment dispute chargeback initiated by customer"
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "License revoked permanently on blockchain",
  "licenseId": 1002,
  "status": "REVOKED",
  "revocationReason": "Payment dispute chargeback initiated by customer",
  "transactionHash": "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b"
}
```

### 4.4 Renew Subscription License
Extends the expiration timestamp of an active or expired subscription license.

- **Endpoint**: `POST /licenses/:id/renew`
- **Access**: Authenticated (`PUBLISHER` or `ADMIN`)
- **Request Body**:
```json
{
  "additionalDays": 365
}
```
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "License renewed successfully",
  "licenseId": 1002,
  "oldExpiration": "2026-09-01T00:00:00.000Z",
  "newExpiration": "2027-09-01T00:00:00.000Z",
  "transactionHash": "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d"
}
```

---

## 5. Zero-Gas Public Verification

### 5.1 Verify by License ID
Executes a zero-gas read-only inspection against the smart contract state and cryptographically validates off-chain metadata integrity.

- **Endpoint**: `GET /verify/:licenseId`
- **Access**: **Public (No authentication, 0 Gas)**
- **Response Codes**:
  - `VALID`: License is valid and active.
  - `EXPIRED`: Validity period elapsed.
  - `REVOKED`: Revoked on-chain with immutable reason.
  - `INVALID / NOT FOUND`: ID does not exist on contract.
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "verificationStatus": "VALID",
  "statusMessage": "VALID: Verified on ledger",
  "license": {
    "licenseId": 1001,
    "softwareName": "CyberShield Pro Enterprise",
    "softwareCategory": "Cybersecurity",
    "softwareVersion": "v4.2.0",
    "planName": "Multi-Seat Enterprise (3 Nodes)",
    "publisherAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "holderAddress": "0x3C44...93BC",
    "issueDate": "2026-10-09T08:32:52.000Z",
    "expirationDate": "PERPETUAL (Lifetime)",
    "metadataHash": "0x71c35b8e92a10bf8a27b9a6741b65c5a89832819876543210abcdef012345678",
    "metadataIntegrityVerified": true,
    "revocationReason": null,
    "transactionHash": "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "network": "Hardhat Localhost (Chain ID: 31337)"
  },
  "verifiedAt": "2026-10-14T08:33:22.746Z",
  "blockchainReachable": true
}
```

---

## 6. Administrator Governance

### 6.1 List Users
Retrieves all registered system personas with their status, company, and role.

- **Endpoint**: `GET /admin/users`
- **Access**: Authenticated (`ADMIN` only)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "users": [
    {
      "id": "usr-admin-01",
      "email": "admin@licensechain.org",
      "name": "System Administrator",
      "role": "ADMIN",
      "walletAddress": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "isActive": true
    }
  ]
}
```

### 6.2 Toggle User Status
Enables or disables a user account from issuing or purchasing software.

- **Endpoint**: `PATCH /admin/users/:id/toggle-active`
- **Access**: Authenticated (`ADMIN` only)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "message": "User status updated successfully",
  "user": {
    "id": "usr-pub-01",
    "isActive": false
  }
}
```

### 6.3 Audit Trail & On-Chain Event Ledger
Lists all state modifications, transaction receipts, and system events.

- **Endpoint**: `GET /admin/audit-logs`
- **Access**: Authenticated (`ADMIN` only)
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "auditLogs": [
    {
      "id": "log-001",
      "action": "REVOKE_LICENSE",
      "entityType": "LICENSE",
      "entityId": "1002",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-10T12:00:00.000Z"
    }
  ]
}
```
