import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractCertificateFields, buildComparisonResult } from "@/lib/ocr";
import { verifyCertificateOnChain } from "@/lib/blockchain";
import type { Certificate, Issuer } from "@/lib/types";

// Accept up to 10 MB (certificates can be high-res images)
export const maxDuration = 60; // seconds — Doc Intelligence polling can take ~10-20s

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // `hash` is provided by the QR flow (already known from the URL).
    // In upload-only flow it is absent; we extract it from the document.
    const hintHash = (formData.get("hash") as string | null)?.trim() || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mimeType = file.type || "application/octet-stream";

    if (!ACCEPTED_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${mimeType}. Please upload a PDF or image (JPEG, PNG, WebP).`,
        },
        { status: 415 }
      );
    }

    // Validate hintHash format: must be 0x + 64 hex chars if provided
    if (hintHash && !/^0x[0-9a-fA-F]{64}$/.test(hintHash)) {
      return NextResponse.json({ error: "Invalid hash format." }, { status: 400 });
    }

    // ── 1. OCR extraction ──────────────────────────────────────────────────
    // Server-side file size guard (client validation can be bypassed)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size is 10 MB." }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractCertificateFields(buffer, mimeType);

    // ── 2. Determine the lookup hash ──────────────────────────────────────
    //   QR flow  → use the URL hash (authoritative, skip OCR hash)
    //   Upload flow → OCR'd hash first; URI as reliable fallback
    const ocrHash = extracted.certificate_hash;
    const ocrUri  = extracted.uri;

    // Log only in dev
    if (process.env.NODE_ENV !== "production") {
      console.log("[extract] hintHash:", hintHash, "ocrHash:", ocrHash, "ocrUri:", ocrUri);
    }

    // ── 3. DB lookup ──────────────────────────────────────────────────────
    const supabase = await createClient();

    let cert: Certificate | null = null;
    let lookupHash: string | null = hintHash ?? null;

    if (hintHash) {
      // QR flow — hash is known and trusted
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("certificate_hash", hintHash)
        .single<Certificate>();
      cert = data ?? null;
    } else {
      // Upload flow — try hash first, then URI as fallback
      if (ocrHash) {
        const { data } = await supabase
          .from("certificates")
          .select("*")
          .eq("certificate_hash", ocrHash)
          .single<Certificate>();
        cert = data ?? null;
      }

      // Hash lookup failed (OCR error) — try URI which is shorter and more reliably read
      if (!cert && ocrUri) {
        const { data } = await supabase
          .from("certificates")
          .select("*")
          .eq("uri", ocrUri)
          .single<Certificate>();
        cert = data ?? null;
        if (cert) {
          if (process.env.NODE_ENV !== "production") {
            console.log("[extract] Found cert via URI fallback:", ocrUri);
          }
        }
      }

      // Use the authoritative hash from the DB record for blockchain verification
      lookupHash = cert?.certificate_hash ?? ocrHash ?? null;
    }

    if (!lookupHash) {
      return NextResponse.json(
        {
          error:
            "Could not read the certificate hash or URI from the document. " +
            "Please ensure the footer is fully visible and try again.",
          // do not return raw OCR output in production
          ...(process.env.NODE_ENV !== "production" ? { extracted } : {}),
        },
        { status: 422 }
      );
    }

    let issuer: Issuer | null = null;
    if (cert) {
      const { data } = await supabase
        .from("issuers")
        .select("*")
        .eq("id", cert.issuer_id)
        .single<Issuer>();
      issuer = data;
    }

    // ── 4. Blockchain check ───────────────────────────────────────────────
    const onChainData = await verifyCertificateOnChain(lookupHash);

    // ── 5. Build and return the comparison ────────────────────────────────
    const comparison = buildComparisonResult(
      extracted,
      cert ?? null,
      issuer,
      onChainData,
      lookupHash,
      hintHash  // QR flow: skip OCR hash comparison, use URL hash
    );

    return NextResponse.json(comparison);
  } catch (err) {
    console.error("[/api/verify/extract]", err);
    return NextResponse.json(
      {
        error:
          "Analysis failed. Please try a higher-quality image or PDF and try again.",
      },
      { status: 500 }
    );
  }
}
