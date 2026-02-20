import { createHash } from "crypto";

/**
 * Generate a deterministic SHA-256 hash for a certificate.
 * The hash is the unique fingerprint used for on-chain verification.
 */
export function generateCertificateHash(data: {
  issuerId: string;
  recipientName: string;
  courseName: string;
  issuedAt: string;
  uniqueId: string;
}): string {
  const payload = [
    data.issuerId,
    data.recipientName.trim().toLowerCase(),
    data.courseName.trim().toLowerCase(),
    data.issuedAt,
    data.uniqueId,
  ].join("|");

  return "0x" + createHash("sha256").update(payload).digest("hex");
}

/**
 * Generate a short ID for the DigiLocker-compatible URI scheme.
 * Format: {org_domain}-CERT-{shortId}
 */
export function generateCertificateUri(
  orgDomain: string,
  shortId: string
): string {
  return `${orgDomain}-CERT-${shortId}`;
}

/**
 * Generate a short alphanumeric ID (6 chars).
 */
export function generateShortId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
