import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { CertificatePDF } from "@/lib/certificate-pdf";
import { generateQRCodeDataUrl } from "@/lib/qr";
import type { Certificate, Issuer } from "@/lib/types";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch certificate
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single<Certificate>();

  if (!cert) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 }
    );
  }

  // Fetch issuer
  const { data: issuer } = await supabase
    .from("issuers")
    .select("*")
    .eq("id", cert.issuer_id)
    .single<Issuer>();

  if (!issuer) {
    return NextResponse.json(
      { error: "Issuer not found" },
      { status: 404 }
    );
  }

  // Generate QR code
  let qrDataUrl: string | undefined;
  try {
    qrDataUrl = await generateQRCodeDataUrl(cert.certificate_hash);
  } catch {
    // Continue without QR
  }

  // Render PDF
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfElement = React.createElement(CertificatePDF as any, {
    recipientName: cert.recipient_name,
    courseName: cert.course_name,
    orgName: issuer.org_name,
    orgDomain: issuer.org_domain,
    issueDate: cert.issued_at,
    certificateHash: cert.certificate_hash,
    uri: cert.uri,
    qrDataUrl,
    logoUrl: issuer.logo_url ?? undefined,
    signatureUrl: issuer.signature_url ?? undefined,
    certificateType: cert.certificate_type ?? "course_completion",
  });

  const pdfBuffer = await renderToBuffer(pdfElement as any);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${cert.uri}.pdf"`,
    },
  });
}
