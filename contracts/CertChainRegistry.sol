// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CertChainRegistry
 * @notice On-chain registry for certificate hash verification.
 *         Each certificate's SHA-256 hash is stored with the issuer's address
 *         and timestamps. Only the original issuer can revoke a certificate.
 */
contract CertChainRegistry {
    struct CertRecord {
        address issuer;
        uint256 issuedAt;
        uint256 revokedAt;
    }

    mapping(bytes32 => CertRecord) public records;

    event CertIssued(bytes32 indexed certHash, address indexed issuer);
    event CertRevoked(bytes32 indexed certHash, address indexed issuer);

    /**
     * @notice Issue a new certificate by recording its hash on-chain.
     * @param certHash The SHA-256 hash of the certificate metadata.
     */
    function issue(bytes32 certHash) external {
        require(records[certHash].issuer == address(0), "Certificate already exists");
        records[certHash] = CertRecord({
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revokedAt: 0
        });
        emit CertIssued(certHash, msg.sender);
    }

    /**
     * @notice Revoke a previously issued certificate.
     * @param certHash The SHA-256 hash of the certificate to revoke.
     */
    function revoke(bytes32 certHash) external {
        require(records[certHash].issuer == msg.sender, "Only the issuer can revoke");
        require(records[certHash].revokedAt == 0, "Already revoked");
        records[certHash].revokedAt = block.timestamp;
        emit CertRevoked(certHash, msg.sender);
    }

    /**
     * @notice Verify a certificate hash. Returns the issuer, issuance time, and revocation time.
     * @param certHash The SHA-256 hash to look up.
     * @return issuer The address that issued the certificate (zero address if not found).
     * @return issuedAt The block timestamp when the certificate was issued.
     * @return revokedAt The block timestamp when revoked (0 if still active).
     */
    function verify(bytes32 certHash) external view returns (
        address issuer,
        uint256 issuedAt,
        uint256 revokedAt
    ) {
        CertRecord memory record = records[certHash];
        return (record.issuer, record.issuedAt, record.revokedAt);
    }
}
