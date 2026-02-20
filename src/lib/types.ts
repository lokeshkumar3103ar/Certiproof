export interface Issuer {
  id: string;
  org_name: string;
  org_domain: string;
  wallet_address: string | null;
  logo_url: string | null;
  signature_url: string | null;
  created_at: string;
}

export interface Certificate {
  id: string;
  uri: string;
  issuer_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  certificate_hash: string;
  certificate_type: string;
  tx_hash: string | null;
  pdf_url: string | null;
  qr_url: string | null;
  status: "issued" | "revoked";
  issued_at: string;
  revoked_at: string | null;
  metadata: Record<string, string> | null;
}

export interface CertificateWithIssuer extends Certificate {
  issuer: Issuer;
}

export interface VerificationResult {
  found: boolean;
  onChain: boolean;
  certificate: Certificate | null;
  issuer: Issuer | null;
  blockchain: {
    issuerAddress: string;
    issuedAt: number;
    revokedAt: number;
  } | null;
}
