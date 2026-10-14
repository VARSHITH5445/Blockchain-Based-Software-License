import { expect } from "chai";
import { ethers } from "hardhat";
import { SoftwareLicenseManager } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SoftwareLicenseManager Smart Contract", function () {
  let licenseManager: SoftwareLicenseManager;
  let admin: SignerWithAddress;
  let publisher: SignerWithAddress;
  let unauthorizedUser: SignerWithAddress;
  let customer1: SignerWithAddress;
  let customer2: SignerWithAddress;

  const dummyHash = ethers.keccak256(ethers.toUtf8Bytes("CANONICAL_METADATA_JSON"));
  const deviceHash1 = ethers.keccak256(ethers.toUtf8Bytes("DEVICE_NODE_1"));
  const deviceHash2 = ethers.keccak256(ethers.toUtf8Bytes("DEVICE_NODE_2"));

  beforeEach(async function () {
    [admin, publisher, unauthorizedUser, customer1, customer2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SoftwareLicenseManager");
    licenseManager = await Factory.deploy(admin.address);
    await licenseManager.waitForDeployment();

    // Authorize publisher
    await licenseManager.connect(admin).addPublisher(publisher.address);
  });

  describe("1. Access Control & Roles", function () {
    it("Should grant DEFAULT_ADMIN_ROLE and PUBLISHER_ROLE to deployer", async function () {
      const adminRole = await licenseManager.DEFAULT_ADMIN_ROLE();
      const publisherRole = await licenseManager.PUBLISHER_ROLE();

      expect(await licenseManager.hasRole(adminRole, admin.address)).to.be.true;
      expect(await licenseManager.hasRole(publisherRole, admin.address)).to.be.true;
    });

    it("Should allow admin to add and remove publishers", async function () {
      const publisherRole = await licenseManager.PUBLISHER_ROLE();
      expect(await licenseManager.hasRole(publisherRole, publisher.address)).to.be.true;

      await licenseManager.connect(admin).removePublisher(publisher.address);
      expect(await licenseManager.hasRole(publisherRole, publisher.address)).to.be.false;
    });

    it("Should revert if non-admin tries to add a publisher", async function () {
      await expect(
        licenseManager.connect(unauthorizedUser).addPublisher(unauthorizedUser.address)
      ).to.be.revertedWithCustomError(licenseManager, "AccessControlUnauthorizedAccount");
    });
  });

  describe("2. License Issuance", function () {
    it("Should successfully issue a perpetual license", async function () {
      const tx = await licenseManager.connect(publisher).issueLicense(
        "cybershield-pro",
        customer1.address,
        0, // PERPETUAL
        0,
        3, // 3 seats
        dummyHash
      );
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);

      const license = await licenseManager.getLicense(1001);
      expect(license.licenseId).to.equal(1001);
      expect(license.productId).to.equal("cybershield-pro");
      expect(license.publisher).to.equal(publisher.address);
      expect(license.holder).to.equal(customer1.address);
      expect(license.maxActivations).to.equal(3);
      expect(license.expirationTimestamp).to.equal(0);
    });

    it("Should revert issuance if caller lacks PUBLISHER_ROLE", async function () {
      await expect(
        licenseManager.connect(unauthorizedUser).issueLicense(
          "hacked-app",
          customer1.address,
          0,
          0,
          1,
          dummyHash
        )
      ).to.be.revertedWith("Caller is not an authorized publisher or admin");
    });

    it("Should revert if non-perpetual license has 0 duration", async function () {
      await expect(
        licenseManager.connect(publisher).issueLicense(
          "subscription-app",
          customer1.address,
          1, // SUBSCRIPTION
          0, // invalid 0 duration
          1,
          dummyHash
        )
      ).to.be.revertedWith("Duration must be > 0 for non-perpetual licenses");
    });
  });

  describe("3. Activation & Hardware Node-Locking", function () {
    beforeEach(async function () {
      await licenseManager.connect(publisher).issueLicense(
        "cybershield-pro",
        customer1.address,
        0,
        0,
        2, // max 2 seats
        dummyHash
      );
    });

    it("Should allow the license holder to activate a device", async function () {
      await licenseManager.connect(customer1).activateLicense(1001, deviceHash1);
      expect(await licenseManager.isDeviceAuthorized(1001, deviceHash1)).to.be.true;

      const lic = await licenseManager.getLicense(1001);
      expect(lic.currentActivations).to.equal(1);
      expect(lic.status).to.equal(1); // ACTIVE
    });

    it("Should revert if unauthorized user tries to activate another user's license", async function () {
      await expect(
        licenseManager.connect(unauthorizedUser).activateLicense(1001, deviceHash1)
      ).to.be.revertedWith("Caller is not the license holder");
    });

    it("Should revert if activating beyond maximum allowed seats", async function () {
      await licenseManager.connect(customer1).activateLicense(1001, deviceHash1);
      await licenseManager.connect(customer1).activateLicense(1001, deviceHash2);

      const deviceHash3 = ethers.keccak256(ethers.toUtf8Bytes("DEVICE_NODE_3"));
      await expect(
        licenseManager.connect(customer1).activateLicense(1001, deviceHash3)
      ).to.be.revertedWith("Maximum seat activation limit reached");
    });

    it("Should allow deactivating a device to free up a seat", async function () {
      await licenseManager.connect(customer1).activateLicense(1001, deviceHash1);
      await licenseManager.connect(customer1).deactivateLicense(1001, deviceHash1);

      expect(await licenseManager.isDeviceAuthorized(1001, deviceHash1)).to.be.false;
      const lic = await licenseManager.getLicense(1001);
      expect(lic.currentActivations).to.equal(0);
    });
  });

  describe("4. Verification Logic (Zero-Gas View)", function () {
    it("Should return VALID for an active license", async function () {
      await licenseManager.connect(publisher).issueLicense(
        "valid-product",
        customer1.address,
        0,
        0,
        1,
        dummyHash
      );

      const result = await licenseManager.verifyLicense(1001);
      expect(result.isValid).to.be.true;
      expect(result.publisher).to.equal(publisher.address);
      expect(result.holder).to.equal(customer1.address);
    });

    it("Should return EXPIRED if current time exceeds expiration timestamp", async function () {
      // 10 second subscription
      await licenseManager.connect(publisher).issueLicense(
        "timed-app",
        customer1.address,
        1, // SUBSCRIPTION
        10, // 10 seconds
        1,
        dummyHash
      );

      // Fast-forward EVM time by 20 seconds
      await ethers.provider.send("evm_increaseTime", [20]);
      await ethers.provider.send("evm_mine", []);

      const result = await licenseManager.verifyLicense(1001);
      expect(result.isValid).to.be.false;
      expect(result.statusMessage).to.include("EXPIRED");
    });

    it("Should return INVALID / NOT FOUND for non-existent license ID", async function () {
      const result = await licenseManager.verifyLicense(9999);
      expect(result.isValid).to.be.false;
      expect(result.statusMessage).to.equal("INVALID / NOT FOUND");
    });
  });

  describe("5. Revocation & Renewal", function () {
    beforeEach(async function () {
      await licenseManager.connect(publisher).issueLicense(
        "renewable-app",
        customer1.address,
        1, // SUBSCRIPTION
        86400, // 1 day
        1,
        dummyHash
      );
    });

    it("Should allow the issuing publisher to revoke a license with reason", async function () {
      await licenseManager.connect(publisher).revokeLicense(1001, "Terms violation");
      const lic = await licenseManager.getLicense(1001);
      expect(lic.status).to.equal(3); // REVOKED
      expect(lic.revocationReason).to.equal("Terms violation");

      const verifyResult = await licenseManager.verifyLicense(1001);
      expect(verifyResult.isValid).to.be.false;
      expect(verifyResult.statusMessage).to.include("REVOKED: Terms violation");
    });

    it("Should prevent unauthorized users from revoking a license", async function () {
      await expect(
        licenseManager.connect(unauthorizedUser).revokeLicense(1001, "Malicious attempt")
      ).to.be.revertedWith("Only the issuing publisher or admin can revoke this license");
    });

    it("Should reject renewal on a revoked license", async function () {
      await licenseManager.connect(publisher).revokeLicense(1001, "Piracy leak");
      await expect(
        licenseManager.connect(customer1).renewLicense(1001, 86400)
      ).to.be.revertedWith("Revoked licenses cannot be renewed");
    });

    it("Should renew an active subscription extending expiration timestamp", async function () {
      const initialLic = await licenseManager.getLicense(1001);
      const initialExp = initialLic.expirationTimestamp;

      await licenseManager.connect(customer1).renewLicense(1001, 86400 * 30);
      const updatedLic = await licenseManager.getLicense(1001);

      expect(updatedLic.expirationTimestamp).to.equal(initialExp + BigInt(86400 * 30));
    });
  });
});
