import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Issuer } from "@/lib/types";

/**
 * DigiLocker-Compatible PULL API
 *
 * This endpoint mirrors the DigiLocker Issuer PULL API structure.
 * It accepts a document URI and returns certificate metadata + PDF location.
 *
 * In production, this would use HMAC authentication matching DigiLocker's spec.
 * For the hackathon demo, authentication is documented but not enforced.
 *
 * DigiLocker PULL API Spec Reference:
 * - POST request with document URI
 * - Returns XML/JSON with document metadata
 * - HMAC-SHA256 authentication header
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uri, docType } = body;

    if (!uri) {
      return NextResponse.json(
        {
          responseCode: "ERR-01",
          responseMessage: "Document URI is required",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up certificate by URI
    const { data: cert } = await supabase
      .from("certificates")
      .select("*")
      .eq("uri", uri)
      .single<Certificate>();

    if (!cert) {
      return NextResponse.json(
        {
          responseCode: "ERR-02",
          responseMessage: "Document not found",
        },
        { status: 404 }
      );
    }

    // Fetch issuer details
    const { data: issuer } = await supabase
      .from("issuers")
      .select("*")
      .eq("id", cert.issuer_id)
      .single<Issuer>();

    // Return DigiLocker-compatible response format
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      responseCode: "SUCCESS",
      responseMessage: "Document found",
      document: {
        uri: cert.uri,
        docType: "CERT",
        issuerId: issuer?.org_domain || "unknown",
        issuerName: issuer?.org_name || "Unknown Issuer",
        metadata: {
          recipientName: cert.recipient_name,
          recipientEmail: cert.recipient_email,
          courseName: cert.course_name,
          issueDate: cert.issued_at,
          status: cert.status,
          revokedAt: cert.revoked_at,
        },
        verification: {
          certificateHash: cert.certificate_hash,
          txHash: cert.tx_hash,
          blockchainNetwork: "Polygon Amoy (Chain ID: 80002)",
          verificationUrl: `${appUrl}/verify/${cert.certificate_hash}`,
          polygonscanUrl: cert.tx_hash
            ? `https://amoy.polygonscan.com/tx/${cert.tx_hash}`
            : null,
        },
        documentUrl: cert.pdf_url || `${appUrl}/api/certificate/${cert.id}/pdf`,
      },
    });
  } catch {
    return NextResponse.json(
      {
        responseCode: "ERR-99",
        responseMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    api: "CertChain DigiLocker-Compatible PULL API",
    version: "1.0.0",
    description:
      "This endpoint mirrors the DigiLocker Issuer PULL API structure. " +
      "Submit a POST request with a document URI to retrieve certificate metadata.",
    endpoint: "POST /api/pull",
    authentication:
      "HMAC-SHA256 (documented, not enforced in testnet demo). " +
      "Production integration with apisetu.gov.in requires endpoint configuration only.",
    request: {
      method: "POST",
      contentType: "application/json",
      body: {
        uri: "string (required) — DigiLocker-format document URI, e.g., iitd.ac.in-CERT-X7K9M2",
        docType: "string (optional) — Document type filter",
      },
    },
    response: {
      responseCode: "SUCCESS | ERR-01 | ERR-02 | ERR-99",
      document: {
        uri: "Document URI",
        metadata: "Recipient and course details",
        verification: "On-chain hash, tx hash, Polygonscan link",
        documentUrl: "PDF download URL",
      },
    },
  });
}
