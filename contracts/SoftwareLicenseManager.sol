// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SoftwareLicenseManager
 * @dev Decentralized, Anti-Piracy Software Licensing and Digital Rights Management (DRM)
 *      on the Ethereum Blockchain with Hardware ID Node-Locking, Subscription Expiry,
 *      and Secondary Transfer Royalties.
 * @author Varshith Reddy (Course Project: Blockchain-Based Software License)
 */
contract SoftwareLicenseManager {

    // --- ENUMS ---
    enum LicenseType {
        PERPETUAL,      // Lifetime access, transferable (optional)
        SUBSCRIPTION,   // Time-bound access, renew with recurring fee
        SEAT_BASED      // Multi-user / enterprise seat license
    }

    enum LicenseStatus {
        ACTIVE,         // Valid and in good standing
        SUSPENDED,      // Temporarily locked by vendor
        REVOKED,        // Permanently cancelled (breach of ToS, fraud)
        EXPIRED         // Subscription period lapsed
    }

    // --- STRUCTS ---
    struct Product {
        uint256 id;
        string name;
        string version;
        string description;
        uint256 priceWei;               // Price in Wei
        LicenseType licenseType;
        uint256 durationInSeconds;       // For subscription licenses (e.g. 30 days = 2592000)
        uint256 maxSeatsPerLicense;      // For seat-based licenses (default 1 for perpetual)
        uint256 royaltyBasisPoints;      // Secondary sale royalty to vendor (500 = 5%)
        address payable vendor;
        bool isActive;
    }

    struct License {
        uint256 licenseId;
        uint256 productId;
        address owner;
        uint256 issueTimestamp;
        uint256 expiryTimestamp;        // 0 for perpetual licenses
        uint256 maxSeats;
        uint256 seatsUsed;
        LicenseStatus status;
        string revocationReason;
        bool transferable;
    }

    // --- STATE VARIABLES ---
    uint256 public nextProductId = 1;
    uint256 public nextLicenseId = 1001;
    address public contractOwner;

    // Platform fee (e.g., 1% platform fee on purchases)
    uint256 public platformFeeBasisPoints = 100; // 1%

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => License) public licenses;
    mapping(uint256 => bytes32[]) private _licenseBoundDevices;
    mapping(uint256 => mapping(bytes32 => bool)) public isDeviceBound;
    mapping(address => uint256[]) private _userLicenses;
    mapping(address => uint256[]) private _vendorProducts;

    // --- EVENTS ---
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        string version,
        uint256 priceWei,
        LicenseType licenseType,
        address indexed vendor
    );

    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed productId,
        address indexed buyer,
        uint256 issueTimestamp,
        uint256 expiryTimestamp,
        uint256 pricePaid
    );

    event DeviceBound(
        uint256 indexed licenseId,
        bytes32 indexed deviceFingerprint,
        address indexed owner,
        uint256 currentSeatsUsed,
        uint256 maxSeats
    );

    event DeviceUnbound(
        uint256 indexed licenseId,
        bytes32 indexed deviceFingerprint,
        address indexed owner
    );

    event LicenseTransferred(
        uint256 indexed licenseId,
        address indexed from,
        address indexed to
    );

    event LicenseRenewed(
        uint256 indexed licenseId,
        uint256 newExpiryTimestamp,
        uint256 pricePaid
    );

    event LicenseRevoked(
        uint256 indexed licenseId,
        string reason,
        address indexed revokedBy
    );

    event LicenseStatusChanged(
        uint256 indexed licenseId,
        LicenseStatus newStatus
    );

    event LicenseResold(
        uint256 indexed licenseId,
        address indexed seller,
        address indexed buyer,
        uint256 salePrice,
        uint256 royaltyPaid
    );

    // --- MODIFIERS ---
    modifier onlyContractOwner() {
        require(msg.sender == contractOwner, "Caller is not platform owner");
        _;
    }

    modifier onlyVendor(uint256 productId) {
        require(products[productId].vendor == msg.sender, "Caller is not the product vendor");
        _;
    }

    modifier onlyLicenseOwner(uint256 licenseId) {
        require(licenses[licenseId].owner == msg.sender, "Caller does not own this license");
        _;
    }

    modifier licenseExists(uint256 licenseId) {
        require(licenses[licenseId].licenseId != 0, "License does not exist");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    // =========================================================================
    // VENDOR ACTIONS: PRODUCT MANAGEMENT
    // =========================================================================

    /**
     * @dev Register a new software product in the licensing registry.
     */
    function registerProduct(
        string memory name,
        string memory version,
        string memory description,
        uint256 priceWei,
        LicenseType licenseType,
        uint256 durationInSeconds,
        uint256 maxSeatsPerLicense,
        uint256 royaltyBasisPoints
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Product name cannot be empty");
        require(royaltyBasisPoints <= 2500, "Royalty cannot exceed 25%");
        if (licenseType == LicenseType.SEAT_BASED) {
            require(maxSeatsPerLicense > 0, "Seat-based licenses must have >= 1 seats");
        } else {
            maxSeatsPerLicense = 1;
        }

        uint256 productId = nextProductId++;
        products[productId] = Product({
            id: productId,
            name: name,
            version: version,
            description: description,
            priceWei: priceWei,
            licenseType: licenseType,
            durationInSeconds: durationInSeconds,
            maxSeatsPerLicense: maxSeatsPerLicense,
            royaltyBasisPoints: royaltyBasisPoints,
            vendor: payable(msg.sender),
            isActive: true
        });

        _vendorProducts[msg.sender].push(productId);

        emit ProductRegistered(
            productId,
            name,
            version,
            priceWei,
            licenseType,
            msg.sender
        );

        return productId;
    }

    /**
     * @dev Toggle product active status (e.g. discontinue deprecated software)
     */
    function toggleProductStatus(uint256 productId) external onlyVendor(productId) {
        products[productId].isActive = !products[productId].isActive;
    }

    // =========================================================================
    // CUSTOMER ACTIONS: LICENSE PURCHASE & MANAGEMENT
    // =========================================================================

    /**
     * @dev Purchase a new software license.
     */
    function purchaseLicense(uint256 productId) external payable returns (uint256) {
        Product storage product = products[productId];
        require(product.id != 0, "Product does not exist");
        require(product.isActive, "Product is currently inactive");
        require(msg.value >= product.priceWei, "Insufficient payment for license");

        uint256 expiry = 0;
        if (product.licenseType == LicenseType.SUBSCRIPTION) {
            expiry = block.timestamp + product.durationInSeconds;
        }

        uint256 licenseId = nextLicenseId++;
        licenses[licenseId] = License({
            licenseId: licenseId,
            productId: productId,
            owner: msg.sender,
            issueTimestamp: block.timestamp,
            expiryTimestamp: expiry,
            maxSeats: product.maxSeatsPerLicense,
            seatsUsed: 0,
            status: LicenseStatus.ACTIVE,
            revocationReason: "",
            transferable: (product.licenseType == LicenseType.PERPETUAL)
        });

        _userLicenses[msg.sender].push(licenseId);

        // Distribute payment to vendor (minus minimal platform fee)
        uint256 platformFee = (msg.value * platformFeeBasisPoints) / 10000;
        uint256 vendorPayout = msg.value - platformFee;

        product.vendor.transfer(vendorPayout);
        if (platformFee > 0) {
            payable(contractOwner).transfer(platformFee);
        }

        emit LicensePurchased(
            licenseId,
            productId,
            msg.sender,
            block.timestamp,
            expiry,
            msg.value
        );

        return licenseId;
    }

    /**
     * @dev Bind a hardware machine fingerprint (keccak256 hash) to this license.
     * Prevents piracy and ensures node-locking enforcement.
     */
    function bindDevice(uint256 licenseId, bytes32 deviceFingerprint) 
        external 
        onlyLicenseOwner(licenseId) 
        licenseExists(licenseId) 
    {
        License storage lic = licenses[licenseId];
        require(lic.status == LicenseStatus.ACTIVE, "License is not active");
        if (lic.expiryTimestamp != 0) {
            require(block.timestamp < lic.expiryTimestamp, "License has expired");
        }
        require(!isDeviceBound[licenseId][deviceFingerprint], "Device already bound to this license");
        require(lic.seatsUsed < lic.maxSeats, "Maximum machine seats reached for this license");

        isDeviceBound[licenseId][deviceFingerprint] = true;
        _licenseBoundDevices[licenseId].push(deviceFingerprint);
        lic.seatsUsed += 1;

        emit DeviceBound(licenseId, deviceFingerprint, msg.sender, lic.seatsUsed, lic.maxSeats);
    }

    /**
     * @dev Unbind a previously authorized device to free up a seat.
     */
    function unbindDevice(uint256 licenseId, bytes32 deviceFingerprint)
        external
        onlyLicenseOwner(licenseId)
        licenseExists(licenseId)
    {
        require(isDeviceBound[licenseId][deviceFingerprint], "Device is not bound to this license");

        isDeviceBound[licenseId][deviceFingerprint] = false;

        // Remove from bound devices array
        bytes32[] storage devices = _licenseBoundDevices[licenseId];
        for (uint256 i = 0; i < devices.length; i++) {
            if (devices[i] == deviceFingerprint) {
                devices[i] = devices[devices.length - 1];
                devices.pop();
                break;
            }
        }

        if (licenses[licenseId].seatsUsed > 0) {
            licenses[licenseId].seatsUsed -= 1;
        }

        emit DeviceUnbound(licenseId, deviceFingerprint, msg.sender);
    }

    /**
     * @dev Transfer a perpetual license to a new owner (peer-to-peer gift or transfer).
     * Clears all hardware device bindings for security.
     */
    function transferLicense(address to, uint256 licenseId)
        external
        onlyLicenseOwner(licenseId)
        licenseExists(licenseId)
    {
        require(to != address(0), "Cannot transfer to zero address");
        require(to != msg.sender, "Cannot transfer to yourself");
        License storage lic = licenses[licenseId];
        require(lic.transferable, "This license type is non-transferable (Subscription/Seat-locked)");
        require(lic.status == LicenseStatus.ACTIVE, "License is not active");

        // Clear all bound devices for security
        _clearBoundDevices(licenseId);
        lic.seatsUsed = 0;

        // Remove from sender's license list
        _removeLicenseFromUser(msg.sender, licenseId);

        // Assign to new owner
        lic.owner = to;
        _userLicenses[to].push(licenseId);

        emit LicenseTransferred(licenseId, msg.sender, to);
    }

    /**
     * @dev Resell license on secondary market with automated royalty payout to vendor.
     */
    function resellLicense(uint256 licenseId, address newOwner)
        external
        payable
        licenseExists(licenseId)
    {
        License storage lic = licenses[licenseId];
        Product storage prod = products[lic.productId];

        require(lic.transferable, "License is non-transferable");
        require(lic.status == LicenseStatus.ACTIVE, "License is not active");
        address currentOwner = lic.owner;
        require(msg.sender == newOwner, "Caller must be the buyer");
        require(msg.value > 0, "Resale price must be > 0");

        // Calculate royalty for original software vendor
        uint256 royalty = (msg.value * prod.royaltyBasisPoints) / 10000;
        uint256 sellerProceeds = msg.value - royalty;

        // Reset device bindings
        _clearBoundDevices(licenseId);
        lic.seatsUsed = 0;

        // Change ownership
        _removeLicenseFromUser(currentOwner, licenseId);
        lic.owner = newOwner;
        _userLicenses[newOwner].push(licenseId);

        // Payout seller and vendor
        payable(currentOwner).transfer(sellerProceeds);
        if (royalty > 0) {
            prod.vendor.transfer(royalty);
        }

        emit LicenseResold(licenseId, currentOwner, newOwner, msg.value, royalty);
    }

    /**
     * @dev Renew a subscription-based license for another billing period.
     */
    function renewSubscription(uint256 licenseId) 
        external 
        payable 
        licenseExists(licenseId) 
    {
        License storage lic = licenses[licenseId];
        Product storage prod = products[lic.productId];

        require(prod.licenseType == LicenseType.SUBSCRIPTION, "Only subscriptions can be renewed");
        require(msg.value >= prod.priceWei, "Insufficient renewal payment");
        require(lic.status != LicenseStatus.REVOKED, "Cannot renew a revoked license");

        uint256 currentExpiry = lic.expiryTimestamp;
        if (currentExpiry < block.timestamp) {
            // Already expired, start new cycle from now
            lic.expiryTimestamp = block.timestamp + prod.durationInSeconds;
        } else {
            // Still active, extend current expiry
            lic.expiryTimestamp = currentExpiry + prod.durationInSeconds;
        }

        lic.status = LicenseStatus.ACTIVE;

        // Payout vendor
        prod.vendor.transfer(msg.value);

        emit LicenseRenewed(licenseId, lic.expiryTimestamp, msg.value);
    }

    // =========================================================================
    // CLIENT SOFTWARE / VERIFICATION ENGINE (ON-CHAIN DRM)
    // =========================================================================

    /**
     * @dev Verify if a license is currently valid for a specific hardware machine and user.
     * Can be called by software client via JSON-RPC eth_call without any gas fee!
     */
    function verifyLicense(
        uint256 licenseId,
        bytes32 deviceFingerprint,
        address user
    ) external view returns (bool isValid, string memory message) {
        License memory lic = licenses[licenseId];
        if (lic.licenseId == 0) {
            return (false, "ERR: License ID does not exist");
        }
        if (lic.owner != user) {
            return (false, "ERR: Specified user is not the license owner");
        }
        if (lic.status == LicenseStatus.REVOKED) {
            return (false, string(abi.encodePacked("ERR: Revoked by vendor - ", lic.revocationReason)));
        }
        if (lic.status == LicenseStatus.SUSPENDED) {
            return (false, "ERR: License is temporarily suspended");
        }
        if (lic.expiryTimestamp != 0 && block.timestamp > lic.expiryTimestamp) {
            return (false, "ERR: License subscription has expired");
        }
        if (deviceFingerprint != bytes32(0) && !isDeviceBound[licenseId][deviceFingerprint]) {
            return (false, "ERR: Machine hardware ID is not bound to this license");
        }

        return (true, "OK: License is active, verified, and authorized");
    }

    /**
     * @dev Cryptographic Challenge-Response Verification:
     * Software client provides a challenge nonce signed by the license owner's private key.
     * Validates that the client really possesses the private key corresponding to license owner.
     */
    function verifySignatureChallenge(
        uint256 licenseId,
        bytes32 challengeHash,
        bytes memory signature,
        bytes32 deviceFingerprint
    ) external view returns (bool isValid, string memory message) {
        License memory lic = licenses[licenseId];
        if (lic.licenseId == 0) return (false, "ERR: Non-existent license");
        if (lic.status != LicenseStatus.ACTIVE) return (false, "ERR: License not active");
        if (lic.expiryTimestamp != 0 && block.timestamp > lic.expiryTimestamp) {
            return (false, "ERR: Subscription expired");
        }

        // Recover signer from Ethereum Signed Message
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challengeHash)
        );
        address recoveredSigner = _recoverSigner(ethSignedMessageHash, signature);

        if (recoveredSigner != lic.owner) {
            return (false, "ERR: Cryptographic challenge signature does not match license owner");
        }

        if (deviceFingerprint != bytes32(0) && !isDeviceBound[licenseId][deviceFingerprint]) {
            return (false, "ERR: Device hardware fingerprint is not registered");
        }

        return (true, "OK: Cryptographic challenge and hardware binding verified successfully");
    }

    // =========================================================================
    // VENDOR ADMINISTRATIVE CONTROLS
    // =========================================================================

    /**
     * @dev Revoke a license in case of fraud, chargeback, or piracy leak.
     */
    function revokeLicense(uint256 licenseId, string memory reason)
        external
        licenseExists(licenseId)
    {
        License storage lic = licenses[licenseId];
        Product memory prod = products[lic.productId];

        require(
            msg.sender == prod.vendor || msg.sender == contractOwner,
            "Only vendor or platform admin can revoke"
        );

        lic.status = LicenseStatus.REVOKED;
        lic.revocationReason = reason;

        emit LicenseRevoked(licenseId, reason, msg.sender);
    }

    /**
     * @dev Suspend or unsuspend license.
     */
    function setLicenseStatus(uint256 licenseId, LicenseStatus newStatus)
        external
        licenseExists(licenseId)
    {
        License storage lic = licenses[licenseId];
        Product memory prod = products[lic.productId];

        require(
            msg.sender == prod.vendor || msg.sender == contractOwner,
            "Only vendor or admin can change status"
        );

        lic.status = newStatus;
        emit LicenseStatusChanged(licenseId, newStatus);
    }

    // =========================================================================
    // VIEW / UTILITY GETTERS
    // =========================================================================

    function getBoundDevices(uint256 licenseId) external view returns (bytes32[] memory) {
        return _licenseBoundDevices[licenseId];
    }

    function getUserLicenses(address user) external view returns (uint256[] memory) {
        return _userLicenses[user];
    }

    function getVendorProducts(address vendor) external view returns (uint256[] memory) {
        return _vendorProducts[vendor];
    }

    function getLicenseDetails(uint256 licenseId) external view returns (
        License memory licenseData,
        Product memory productData,
        bytes32[] memory boundDevices
    ) {
        License memory lic = licenses[licenseId];
        Product memory prod = products[lic.productId];
        bytes32[] memory devices = _licenseBoundDevices[licenseId];
        return (lic, prod, devices);
    }

    // --- INTERNAL HELPERS ---
    function _clearBoundDevices(uint256 licenseId) internal {
        bytes32[] storage devices = _licenseBoundDevices[licenseId];
        for (uint256 i = 0; i < devices.length; i++) {
            isDeviceBound[licenseId][devices[i]] = false;
        }
        delete _licenseBoundDevices[licenseId];
    }

    function _removeLicenseFromUser(address user, uint256 licenseId) internal {
        uint256[] storage userLics = _userLicenses[user];
        for (uint256 i = 0; i < userLics.length; i++) {
            if (userLics[i] == licenseId) {
                userLics[i] = userLics[userLics.length - 1];
                userLics.pop();
                break;
            }
        }
    }

    function _recoverSigner(bytes32 ethSignedMessageHash, bytes memory sig)
        internal
        pure
        returns (address)
    {
        require(sig.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return ecrecover(ethSignedMessageHash, v, r, s);
    }
}
