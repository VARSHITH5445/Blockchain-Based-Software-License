# Database Entity-Relationship (ER) Diagram

This document models the relational schema implemented via **Prisma ORM** for the **ChainLicense Platform**.

---

## 1. Mermaid Entity-Relationship Model

```mermaid
erDiagram
    USER ||--o{ SOFTWARE_PRODUCT : "publishes"
    USER ||--o{ LICENSE_METADATA : "issues (as publisher)"
    USER ||--o{ LICENSE_METADATA : "holds (as customer)"
    USER ||--o{ LICENSE_PURCHASE : "purchases"
    USER ||--o{ AUDIT_LOG : "triggers"

    SOFTWARE_PRODUCT ||--|{ LICENSE_PLAN : "offers"
    SOFTWARE_PRODUCT ||--o{ LICENSE_METADATA : "licensed_under"

    LICENSE_PLAN ||--o{ LICENSE_METADATA : "structures"
    LICENSE_METADATA ||--o| LICENSE_PURCHASE : "records_order"

    USER {
        string id PK "UUID"
        string email UK "Unique email address"
        string passwordHash "Bcrypt (salt rounds=10)"
        string name "Full name or organization"
        string role "ADMIN | PUBLISHER | CUSTOMER"
        string walletAddress UK "Ethereum 0x address"
        boolean isActive "Access control status"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last modification timestamp"
    }

    SOFTWARE_PRODUCT {
        string id PK "UUID"
        string name "Product title"
        string slug UK "URL-friendly unique slug"
        string description "System capabilities & ToS"
        string category "Cybersecurity | DevTools | AI | SaaS"
        string version "Semantic version tag (v1.0.0)"
        string imageUrl "Product banner asset URL"
        string publisherId FK "References User.id"
        boolean isActive "Publication visibility"
        datetime createdAt "Publication timestamp"
        datetime updatedAt "Last modification timestamp"
    }

    LICENSE_PLAN {
        string id PK "UUID"
        string productId FK "References SoftwareProduct.id"
        string name "Plan name (e.g. Single Node Perpetual)"
        string licenseType "PERPETUAL | SUBSCRIPTION | TRIAL | SEAT_BASED"
        int durationDays "0 for perpetual, otherwise positive"
        int maxSeats "Allowed hardware machine nodes"
        decimal priceDemo "Price in demo ETH"
        boolean isDefault "Default selected tier"
        datetime createdAt "Plan creation timestamp"
    }

    LICENSE_METADATA {
        string id PK "UUID"
        int onChainId UK "Smart contract uint256 token ID"
        string productId FK "References SoftwareProduct.id"
        string planId FK "References LicensePlan.id"
        string publisherId FK "References User.id (Publisher)"
        string customerId FK "References User.id (Holder)"
        string metadataHash "Keccak-256 hash of canonical JSON"
        string canonicalJson "Normalized JSON representation"
        string onChainStatus "ISSUED | ACTIVE | EXPIRED | REVOKED"
        string txHash "Blockchain issuance transaction hash"
        datetime expirationDate "Nullable for perpetual"
        int maxSeats "Machine seat quota"
        int currentSeats "Active hardware bindings"
        string revocationReason "Immutable audit note if revoked"
        datetime createdAt "Minting timestamp"
        datetime updatedAt "State update timestamp"
    }

    LICENSE_PURCHASE {
        string id PK "UUID"
        string metadataId FK,UK "References LicenseMetadata.id"
        string buyerId FK "References User.id"
        decimal pricePaid "Price in demo ETH"
        string txHash "Transaction receipt reference"
        string status "PENDING | CONFIRMED | FAILED"
        datetime createdAt "Purchase timestamp"
    }

    BLOCKCHAIN_TRANSACTION {
        string id PK "UUID"
        string txHash UK "Ethereum transaction hash (0x...)"
        int blockNumber "Mined block height"
        string fromAddress "Transaction originator"
        string toAddress "Target contract address"
        string method "Contract function called"
        string eventName "Emitted Solidity event"
        string status "CONFIRMED | PENDING | FAILED"
        string errorReason "Revert reason if failed"
        datetime createdAt "Block timestamp"
    }

    AUDIT_LOG {
        string id PK "UUID"
        string userId FK "Nullable (system or user)"
        string action "Event code (e.g. LICENSE_REVOKED)"
        string entityType "License | Product | User"
        string entityId "Target entity key"
        string ipAddress "Originating client IP"
        string details "JSON context parameters"
        datetime createdAt "Audit log timestamp"
    }
```

---

## 2. Table Indexing & Performance Strategy
- **`User`**: Indexed on `email`, `walletAddress`, and `role` for high-throughput authentication queries.
- **`SoftwareProduct`**: Indexed on `slug` for clean URL resolution and `publisherId` for vendor dashboard aggregation.
- **`LicenseMetadata`**: Indexed on `onChainId` for sub-millisecond lookup during verification, and `metadataHash` for integrity checks.
- **`BlockchainTransaction`**: Indexed on `txHash` to eliminate duplicate transaction records.
