"use server";

import { createClient } from "@/lib/supabase/server";
import { issueCertificateSchema } from "@/lib/validations";
import {
  generateCertificateHash,
  generateCertificateUri,
  generateShortId,
} from "@/lib/hash";
import { issueCertificateOnChain } from "@/lib/blockchain";
import { generateQRCodeDataUrl } from "@/lib/qr";
import type { Issuer } from "@/lib/types";

export async function issueCertificateAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Get issuer profile
  const { data: issuer } = await supabase
    .from("issuers")
    .select("*")
    .eq("id", user.id)
    .single<Issuer>();

  if (!issuer) return { error: "Issuer profile not found" };

  // Validate input
  const parsed = issueCertificateSchema.safeParse({
    recipientName: formData.get("recipientName"),
    recipientEmail: formData.get("recipientEmail"),
    courseName: formData.get("courseName"),
    issueDate: formData.get("issueDate"),
    certificateType: formData.get("certificateType") || "course_completion",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const shortId = generateShortId();
  const certId = crypto.randomUUID();

  // Generate deterministic hash
  const certificateHash = generateCertificateHash({
    issuerId: user.id,
    recipientName: parsed.data.recipientName,
    courseName: parsed.data.courseName,
    issuedAt: parsed.data.issueDate,
    uniqueId: certId,
  });

  // Generate DigiLocker-compatible URI
  const uri = generateCertificateUri(issuer.org_domain, shortId);

  // Issue on blockchain
  let txHash: string | null = null;
  try {
    txHash = await issueCertificateOnChain(certificateHash);
  } catch (err) {
    console.error("Blockchain issuance failed:", err);
    // Continue without blockchain if testnet is down
  }

  // Generate QR code
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await generateQRCodeDataUrl(certificateHash);
  } catch (err) {
    console.error("QR generation failed:", err);
  }

  // Insert certificate record
  const { data: cert, error: insertError } = await supabase
    .from("certificates")
    .insert({
      id: certId,
      uri,
      issuer_id: user.id,
      recipient_name: parsed.data.recipientName,
      recipient_email: parsed.data.recipientEmail,
      course_name: parsed.data.courseName,
      certificate_hash: certificateHash,
      certificate_type: parsed.data.certificateType,
      tx_hash: txHash,
      status: "issued",
      issued_at: new Date(parsed.data.issueDate).toISOString(),
      metadata: {},
    })
    .select()
    .single();

  if (insertError) {
    console.error("DB insert failed:", insertError);
    return { error: "Failed to save certificate. Please try again." };
  }

  return {
    success: true,
    certificate: {
      id: certId,
      hash: certificateHash,
      uri,
      txHash,
      qrDataUrl,
    },
  };
}
