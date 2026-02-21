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

// ── OCR / Forensic Verification ─────────────────────────────────────────────

export interface CertificateFields {
  recipient_name: string | null;
  course_name: string | null;
  org_name: string | null;
  org_domain: string | null;
  issue_date: string | null;
  uri: string | null;
  certificate_hash: string | null;
  certificate_type_label: string | null;
}

export type FieldMatchStatus = "match" | "mismatch" | "unread";

export interface FieldComparison {
  field: string;
  label: string;
  extracted: string | null;   // what OCR read from the physical document
  registered: string | null;  // what is stored in our database
  status: FieldMatchStatus;
}

export type VerificationVerdict = "authentic" | "tampered" | "revoked" | "not_found";

export interface VerificationComparison {
  verdict: VerificationVerdict;
  hashFound: boolean;
  isOnChain: boolean;
  isRevoked: boolean;
  fields: FieldComparison[];
  extracted: CertificateFields;
  cert: Certificate | null;
  issuer: Issuer | null;
  onChain: {
    issuerAddress: string;
    issuedAt: number;
    revokedAt: number;
  } | null;
  error?: string;
}
