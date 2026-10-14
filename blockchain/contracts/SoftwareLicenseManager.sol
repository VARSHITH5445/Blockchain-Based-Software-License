// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SoftwareLicenseManager
 * @dev Comprehensive decentralized software licensing and verification platform.
 *      Enforces publisher authorization, tamper-evident issuance, cryptographic metadata
 *      integrity, lifecycle status tracking, device activation limits, renewal, and revocation.
 * @author Varshith Reddy (B.Tech Final Year Project)
 */
contract SoftwareLicenseManager is AccessControl, ReentrancyGuard {

    bytes32 public constant PUBLISHER_ROLE = keccak256("PUBLISHER_ROLE");

    enum LicenseType {
        PERPETUAL,      // 0: Lifetime access
        SUBSCRIPTION,   // 1: Time-bounded subscription
        TRIAL,          // 2: Short-term evaluation
        SEAT_BASED      // 3: Enterprise multi-device/seat license
    }

    enum LicenseStatus {
        ISSUED,         // 0: Issued but not yet activated on a client machine
        ACTIVE,         // 1: Valid and actively running
        EXPIRED,        // 2: Expiration timestamp passed
        REVOKED         // 3: Revoked by publisher or administrator
    }

    struct License {
        uint256 licenseId;
        string productId;             // Off-chain software UUID or slug
        address publisher;             // Publisher wallet address who issued it
        address holder;                // Customer wallet address owning the license
        uint256 issueTimestamp;        // Block timestamp when minted
        uint256 expirationTimestamp;   // 0 for perpetual, otherwise unix epoch
        LicenseType licenseType;
        LicenseStatus status;
        bytes32 metadataHash;          // SHA-256 / Keccak-256 hash of canonical JSON metadata
        uint256 maxActivations;        // Maximum allowed hardware machines / seats
        uint256 currentActivations;    // Current active machine bindings
        string revocationReason;       // Immutable audit reason if revoked
    }

    // State Variables
    uint256 private _licenseIdCounter;
    mapping(uint256 => License) private _licenses;
    mapping(address => uint256[]) private _holderLicenses;
    mapping(address => uint256[]) private _publisherLicenses;
    mapping(uint256 => mapping(bytes32 => bool)) private _boundDevices;

    // Events
    event LicenseIssued(
        uint256 indexed licenseId,
        string productId,
        address indexed publisher,
        address indexed holder,
        uint8 licenseType,
        uint256 expirationTimestamp,
        bytes32 metadataHash
    );

    event LicenseActivated(
        uint256 indexed licenseId,
        address indexed holder,
        bytes32 indexed deviceFingerprint,
        uint256 currentActivations
    );

    event LicenseDeactivated(
        uint256 indexed licenseId,
        address indexed holder,
        bytes32 indexed deviceFingerprint,
        uint256 remainingActivations
    );

    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed revokedBy,
        string reason
    );

    event LicenseRenewed(
        uint256 indexed licenseId,
        uint256 oldExpiration,
        uint256 newExpiration
    );

    event PublisherAuthorized(address indexed publisher);
    event PublisherRevoked(address indexed publisher);

    modifier onlyAuthorizedPublisher() {
        require(
            hasRole(PUBLISHER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not an authorized publisher or admin"
        );
        _;
    }

    modifier licenseExists(uint256 licenseId) {
        require(_licenses[licenseId].licenseId != 0, "License does not exist");
        _;
    }

    constructor(address initialAdmin) {
        address admin = initialAdmin == address(0) ? msg.sender : initialAdmin;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PUBLISHER_ROLE, admin);
        _licenseIdCounter = 1000; // Starting license IDs from 1001 for readability
    }

    // =========================================================================
    // ADMIN FUNCTIONS
    // =========================================================================

    function addPublisher(address publisher) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(publisher != address(0), "Cannot add zero address");
        grantRole(PUBLISHER_ROLE, publisher);
        emit PublisherAuthorized(publisher);
    }

    function removePublisher(address publisher) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(PUBLISHER_ROLE, publisher);
        emit PublisherRevoked(publisher);
    }

    // =========================================================================
    // LICENSE LIFECYCLE: ISSUANCE
    // =========================================================================

    /**
     * @notice Issue a tamper-evident software license on the Ethereum blockchain.
     * @param productId String identifier of the software product.
     * @param holder The customer wallet address.
     * @param licenseType Perpetual, Subscription, Trial, or Seat-Based.
     * @param durationInSeconds Validity period (0 for perpetual).
     * @param maxActivations Maximum allowed machine seats (minimum 1).
     * @param metadataHash Cryptographic hash of canonical off-chain metadata JSON.
     */
    function issueLicense(
        string calldata productId,
        address holder,
        LicenseType licenseType,
        uint256 durationInSeconds,
        uint256 maxActivations,
        bytes32 metadataHash
    ) external onlyAuthorizedPublisher nonReentrant returns (uint256) {
        require(bytes(productId).length > 0, "Product ID cannot be empty");
        require(holder != address(0), "Holder cannot be zero address");
        require(maxActivations >= 1, "Max activations must be at least 1");

        uint256 expiration = 0;
        if (licenseType != LicenseType.PERPETUAL) {
            require(durationInSeconds > 0, "Duration must be > 0 for non-perpetual licenses");
            expiration = block.timestamp + durationInSeconds;
        }

        _licenseIdCounter++;
        uint256 newId = _licenseIdCounter;

        _licenses[newId] = License({
            licenseId: newId,
            productId: productId,
            publisher: msg.sender,
            holder: holder,
            issueTimestamp: block.timestamp,
            expirationTimestamp: expiration,
            licenseType: licenseType,
            status: LicenseStatus.ISSUED,
            metadataHash: metadataHash,
            maxActivations: maxActivations,
            currentActivations: 0,
            revocationReason: ""
        });

        _holderLicenses[holder].push(newId);
        _publisherLicenses[msg.sender].push(newId);

        emit LicenseIssued(
            newId,
            productId,
            msg.sender,
            holder,
            uint8(licenseType),
            expiration,
            metadataHash
        );

        return newId;
    }

    // =========================================================================
    // LICENSE LIFECYCLE: ACTIVATION & DEACTIVATION
    // =========================================================================

    /**
     * @notice Activate a license on a specific machine hardware fingerprint.
     */
    function activateLicense(uint256 licenseId, bytes32 deviceFingerprint)
        external
        licenseExists(licenseId)
        nonReentrant
    {
        License storage lic = _licenses[licenseId];

        require(
            msg.sender == lic.holder || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not the license holder"
        );
        require(lic.status != LicenseStatus.REVOKED, "Cannot activate a revoked license");
        if (lic.expirationTimestamp != 0) {
            require(block.timestamp <= lic.expirationTimestamp, "Cannot activate an expired license");
        }
        require(deviceFingerprint != bytes32(0), "Invalid device fingerprint");
        require(!_boundDevices[licenseId][deviceFingerprint], "Device is already activated on this license");
        require(lic.currentActivations < lic.maxActivations, "Maximum seat activation limit reached");

        _boundDevices[licenseId][deviceFingerprint] = true;
        lic.currentActivations += 1;
        lic.status = LicenseStatus.ACTIVE;

        emit LicenseActivated(licenseId, lic.holder, deviceFingerprint, lic.currentActivations);
    }

    /**
     * @notice Deactivate a machine to transfer the seat to another machine.
     */
    function deactivateLicense(uint256 licenseId, bytes32 deviceFingerprint)
        external
        licenseExists(licenseId)
        nonReentrant
    {
        License storage lic = _licenses[licenseId];
        require(
            msg.sender == lic.holder || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not the license holder"
        );
        require(_boundDevices[licenseId][deviceFingerprint], "Device is not bound to this license");

        _boundDevices[licenseId][deviceFingerprint] = false;
        lic.currentActivations -= 1;

        if (lic.currentActivations == 0 && lic.status == LicenseStatus.ACTIVE) {
            lic.status = LicenseStatus.ISSUED;
        }

        emit LicenseDeactivated(licenseId, lic.holder, deviceFingerprint, lic.currentActivations);
    }

    // =========================================================================
    // LICENSE LIFECYCLE: RENEWAL & REVOCATION
    // =========================================================================

    /**
     * @notice Renew an active or expired subscription license.
     */
    function renewLicense(uint256 licenseId, uint256 additionalDurationInSeconds)
        external
        licenseExists(licenseId)
        nonReentrant
    {
        License storage lic = _licenses[licenseId];

        require(
            msg.sender == lic.publisher || msg.sender == lic.holder || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Caller is not authorized to renew this license"
        );
        require(lic.licenseType != LicenseType.PERPETUAL, "Perpetual licenses do not require renewal");
        require(lic.status != LicenseStatus.REVOKED, "Revoked licenses cannot be renewed");
        require(additionalDurationInSeconds > 0, "Additional duration must be > 0");

        uint256 oldExpiration = lic.expirationTimestamp;
        if (oldExpiration < block.timestamp) {
            lic.expirationTimestamp = block.timestamp + additionalDurationInSeconds;
        } else {
            lic.expirationTimestamp = oldExpiration + additionalDurationInSeconds;
        }

        if (lic.status == LicenseStatus.EXPIRED) {
            lic.status = lic.currentActivations > 0 ? LicenseStatus.ACTIVE : LicenseStatus.ISSUED;
        }

        emit LicenseRenewed(licenseId, oldExpiration, lic.expirationTimestamp);
    }

    /**
     * @notice Revoke a license in case of piracy breach, chargeback, or ToS violation.
     */
    function revokeLicense(uint256 licenseId, string calldata reason)
        external
        licenseExists(licenseId)
        nonReentrant
    {
        License storage lic = _licenses[licenseId];

        require(
            msg.sender == lic.publisher || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Only the issuing publisher or admin can revoke this license"
        );
        require(lic.status != LicenseStatus.REVOKED, "License is already revoked");

        lic.status = LicenseStatus.REVOKED;
        lic.revocationReason = reason;

        emit LicenseRevoked(licenseId, msg.sender, reason);
    }

    // =========================================================================
    // VERIFICATION (ZERO-GAS VIEW FUNCTION)
    // =========================================================================

    /**
     * @notice Public verification endpoint. Computes status in real time against on-chain state.
     */
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
    {
        License memory lic = _licenses[licenseId];
        if (lic.licenseId == 0) {
            return (false, LicenseStatus.EXPIRED, "INVALID / NOT FOUND", address(0), address(0), 0, 0, bytes32(0));
        }

        if (lic.status == LicenseStatus.REVOKED) {
            return (false, LicenseStatus.REVOKED, string(abi.encodePacked("REVOKED: ", lic.revocationReason)), lic.publisher, lic.holder, lic.issueTimestamp, lic.expirationTimestamp, lic.metadataHash);
        }

        if (lic.expirationTimestamp != 0 && block.timestamp > lic.expirationTimestamp) {
            return (false, LicenseStatus.EXPIRED, "EXPIRED: License validity period elapsed", lic.publisher, lic.holder, lic.issueTimestamp, lic.expirationTimestamp, lic.metadataHash);
        }

        // Active or Issued and within validity
        return (true, lic.status, "VALID: Verified authentic on-chain", lic.publisher, lic.holder, lic.issueTimestamp, lic.expirationTimestamp, lic.metadataHash);
    }

    /**
     * @notice Checks if a device is specifically authorized for node-locking.
     */
    function isDeviceAuthorized(uint256 licenseId, bytes32 deviceFingerprint)
        external
        view
        returns (bool)
    {
        return _boundDevices[licenseId][deviceFingerprint];
    }

    // =========================================================================
    // GETTERS & ENUMERATION
    // =========================================================================

    function getLicense(uint256 licenseId)
        external
        view
        licenseExists(licenseId)
        returns (License memory)
    {
        return _licenses[licenseId];
    }

    function getLicensesByHolder(address holder) external view returns (uint256[] memory) {
        return _holderLicenses[holder];
    }

    function getLicensesByPublisher(address publisher) external view returns (uint256[] memory) {
        return _publisherLicenses[publisher];
    }

    function getTotalLicensesIssued() external view returns (uint256) {
        return _licenseIdCounter - 1000;
    }
}
