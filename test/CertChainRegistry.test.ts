import { expect } from "chai";
import { ethers } from "hardhat";

describe("CertChainRegistry", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const CertChainRegistry = await ethers.getContractFactory("CertChainRegistry");
    const registry = await CertChainRegistry.deploy();
    return { registry, owner, otherAccount };
  }

  const sampleHash = ethers.id("test-certificate-hash-123");

  describe("Issue", function () {
    it("should issue a certificate and emit event", async function () {
      const { registry, owner } = await deployFixture();

      await expect(registry.issue(sampleHash))
        .to.emit(registry, "CertIssued")
        .withArgs(sampleHash, owner.address);

      const record = await registry.verify(sampleHash);
      expect(record.issuer).to.equal(owner.address);
      expect(record.issuedAt).to.be.greaterThan(0);
      expect(record.revokedAt).to.equal(0);
    });

    it("should reject duplicate hash", async function () {
      const { registry } = await deployFixture();
      await registry.issue(sampleHash);
      await expect(registry.issue(sampleHash)).to.be.revertedWith(
        "Certificate already exists"
      );
    });
  });

  describe("Revoke", function () {
    it("should revoke a certificate and emit event", async function () {
      const { registry, owner } = await deployFixture();
      await registry.issue(sampleHash);

      await expect(registry.revoke(sampleHash))
        .to.emit(registry, "CertRevoked")
        .withArgs(sampleHash, owner.address);

      const record = await registry.verify(sampleHash);
      expect(record.revokedAt).to.be.greaterThan(0);
    });

    it("should reject revocation by non-issuer", async function () {
      const { registry, otherAccount } = await deployFixture();
      await registry.issue(sampleHash);

      await expect(
        registry.connect(otherAccount).revoke(sampleHash)
      ).to.be.revertedWith("Only issuer can revoke");
    });

    it("should reject double revocation", async function () {
      const { registry } = await deployFixture();
      await registry.issue(sampleHash);
      await registry.revoke(sampleHash);

      await expect(registry.revoke(sampleHash)).to.be.revertedWith(
        "Already revoked"
      );
    });
  });

  describe("Verify", function () {
    it("should return zero address for unknown hash", async function () {
      const { registry } = await deployFixture();
      const unknownHash = ethers.id("unknown");
      const record = await registry.verify(unknownHash);
      expect(record.issuer).to.equal(ethers.ZeroAddress);
      expect(record.issuedAt).to.equal(0);
    });
  });
});
