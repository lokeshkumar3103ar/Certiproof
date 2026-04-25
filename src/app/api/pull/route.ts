import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Certificate, Issuer } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText);
    const { uri, docType } = body;

    // HMAC Authentication Check
    const hmacSecret = process.env.DIGILOCKER_HMAC_SECRET;
    if (hmacSecret) {
      const signature = request.headers.get("X-Digilocker-HMAC");
      if (!signature) {
        return NextResponse.json(
          { responseCode: "ERR-01", responseMessage: "Missing authentication signature" },
          { status: 401 }
        );
      }

      const expectedSignature = createHmac("sha256", hmacSecret)
        .update(bodyText)
        .digest("hex");

      if (signature !== expectedSignature) {
        return NextResponse.json(
          { responseCode: "ERR-01", responseMessage: "Invalid authentication signature" },
          { status: 401 }
        );
      }
    }

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
      "HMAC-SHA256 (Enforced). " +
      "Requires X-Digilocker-HMAC header containing hex digest of request body.",
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
