/**
 * Certificate OCR + forensic field comparison.
 *
 * Strategy:
 *  ALL files (PDF + images) → Azure Document Intelligence (prebuilt-read)
 *  → raw text lines → deterministic regex parser (zero GPT calls)
 */

import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  type AnalyzeOperationOutput,
} from "@azure-rest/ai-document-intelligence";

import type {
  Certificate,
  CertificateFields,
  FieldComparison,
  FieldMatchStatus,
  Issuer,
  VerificationComparison,
  VerificationVerdict,
} from "@/lib/types";

// ── Cert-type subtitle → DB key ──────────────────────────────────────────────
const CERT_TYPE_LABEL_TO_KEY: Record<string, string> = {
  "certificate of completion": "course_completion",
  "certificate of degree / diploma": "degree_diploma",
  "certificate of excellence": "achievement_award",
  "certificate of participation": "workshop_seminar",
  "certificate of internship": "internship",
};

// Known subtitle strings (from CERTIFICATE_WORDING in certificate-pdf.tsx)
const SUBTITLES = [
  "CERTIFICATE OF DEGREE / DIPLOMA",
  "CERTIFICATE OF COMPLETION",
  "CERTIFICATE OF EXCELLENCE",
  "CERTIFICATE OF PARTICIPATION",
  "CERTIFICATE OF INTERNSHIP",
];

// Pre-texts that immediately precede the recipient name
const PRE_TEXTS = [
  "This is to certify that",
  "This certificate is presented to",
];

// Post-texts that immediately follow the recipient name
const POST_TEXTS = [
  "has fulfilled all requirements prescribed for the",
  "has successfully completed the course",
  "in recognition of outstanding achievement in",
  "has successfully participated in and completed",
  "has successfully completed an internship in",
];

// ── Azure client ──────────────────────────────────────────────────────────────
function getDocIntelClient() {
  return DocumentIntelligence(
    process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT!,
    { key: process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY! }
  );
}

// ── Doc Intelligence → raw text (PDF AND images) ─────────────────────────────
// Uses @azure-rest/ai-document-intelligence (API 2024-11-30), the modern
// replacement for the deprecated @azure/ai-form-recognizer SDK.
// Retries up to 3 times with exponential backoff to handle transient Azure 500s.
async function extractTextWithDocIntel(buffer: Buffer, attempt = 1): Promise<string> {
  const MAX_ATTEMPTS = 3;
  try {
    const client = getDocIntelClient();

    // Validate env vars are present before calling Azure
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
    if (!endpoint || !key) {
      throw new Error(
        `[ocr] Missing env vars: AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=${endpoint ? "set" : "MISSING"}, KEY=${key ? "set" : "MISSING"}`
      );
    }

    // New SDK takes base64Source as JSON body (not a raw binary stream)
    const base64Source = buffer.toString("base64");

    const initialResponse = await client
      .path("/documentModels/{modelId}:analyze", "prebuilt-read")
      .post({
        contentType: "application/json",
        body: { base64Source },
      });

    // Always log the raw response status so we can diagnose Azure issues
    console.log(
      `[ocr] Azure initial response: HTTP ${initialResponse.status} (attempt ${attempt})`
    );

    if (isUnexpected(initialResponse)) {
      // Dump the full body so we can see the real error
      console.error("[ocr] Azure error body:", JSON.stringify(initialResponse.body, null, 2));
      const errBody = initialResponse.body as { error?: { code?: string; message?: string } };
      throw new Error(
        `Azure Document Intelligence error: HTTP ${initialResponse.status} — ${errBody?.error?.code ?? "unknown"}: ${errBody?.error?.message ?? JSON.stringify(initialResponse.body)}`
      );
    }

    const poller = getLongRunningPoller(client, initialResponse);
    const pollResult = await poller.pollUntilDone();
    const result = pollResult.body as AnalyzeOperationOutput;

    console.log(`[ocr] Azure poll complete: HTTP ${pollResult.status}`);

    const lines: string[] = [];
    for (const page of result.analyzeResult?.pages ?? []) {
      for (const line of page.lines ?? []) {
        lines.push(line.content);
      }
    }
    return lines.join("\n");
  } catch (err: unknown) {
    console.error(`[ocr] Error on attempt ${attempt}:`, err);

    const message = err instanceof Error ? err.message : String(err);
    // Check if it looks like a transient 5xx
    const isTransient = /HTTP 5\d\d|500|503|502|504/.test(message);

    if (isTransient && attempt < MAX_ATTEMPTS) {
      const delayMs = 2000 * 2 ** (attempt - 1); // 2s, 4s
      console.warn(`[ocr] Transient error, retrying in ${delayMs / 1000}s (attempt ${attempt}/${MAX_ATTEMPTS})…`);
      await new Promise((res) => setTimeout(res, delayMs));
      return extractTextWithDocIntel(buffer, attempt + 1);
    }
    throw err;
  }
}


// ── Deterministic regex field parser ─────────────────────────────────────────
function parseTextFields(text: string): CertificateFields {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const upper = text.toUpperCase();

  // 1. Certificate hash ─────────────────────────────────────────────────────
  //    The PDF prints it split over two ~33-char lines.
  //    Strategy: collect all hex-looking tokens starting with 0x or pure hex
  //    adjacent to a "0x...", then join until we have 66 chars (0x + 64 hex).
  let certificate_hash: string | null = null;

  // First try: full hash on a single line
  const fullHashMatch = text.match(/\b(0x[0-9a-fA-F]{64})\b/);
  if (fullHashMatch) {
    certificate_hash = fullHashMatch[1].toLowerCase();
  }

  // Second try: split across two adjacent lines
  if (!certificate_hash) {
    for (let i = 0; i < lines.length - 1; i++) {
      const a = lines[i].replace(/\s/g, "");
      const b = lines[i + 1].replace(/\s/g, "");
      // Line i starts with 0x, line i+1 is pure hex continuation
      if (/^0x[0-9a-fA-F]+$/i.test(a) && /^[0-9a-fA-F]+$/i.test(b)) {
        const joined = a + b;
        if (/^0x[0-9a-fA-F]{64}$/i.test(joined)) {
          certificate_hash = joined.toLowerCase();
          break;
        }
      }
    }
  }

  // 2. Certificate URI ───────────────────────────────────────────────────────
  //    Anchored to "-CERT-" so it won't match domain or hash.
  const uriMatch = text.match(/\b([\w.-]+-CERT-[A-Z0-9]+)\b/);
  const uri = uriMatch ? uriMatch[1] : null;

  // 3. Institution domain ───────────────────────────────────────────────────
  //    A lone line that looks like "word.word.tld" — no spaces, has a dot,
  //    not a URI (no -CERT-), not a hash.
  let org_domain: string | null = null;
  for (const line of lines) {
    if (
      /^[a-z0-9][-a-z0-9]*(\.[a-z0-9][-a-z0-9]*){1,4}$/i.test(line) &&
      !line.includes("-CERT-") &&
      !line.startsWith("0x")
    ) {
      org_domain = line.toLowerCase();
      break;
    }
  }

  // 4. Issue date ───────────────────────────────────────────────────────────
  //    PDF renders as "Issued on 21 February 2026"
  const dateMatch = text.match(/Issued on\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  const issue_date = dateMatch ? dateMatch[1] : null;

  // 5. Subtitle / cert type ─────────────────────────────────────────────────
  let certificate_type_label: string | null = null;
  for (const sub of SUBTITLES) {
    if (upper.includes(sub)) {
      certificate_type_label = sub;
      break;
    }
  }

  // 6. Recipient name & course name ─────────────────────────────────────────
  //    Layout: preText → recipient_name → postText → course_name → "Issued on"
  let recipient_name: string | null = null;
  let course_name: string | null = null;

  let preIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (PRE_TEXTS.some((p) => lines[i].toLowerCase().includes(p.toLowerCase()))) {
      preIdx = i;
      break;
    }
  }

  if (preIdx >= 0) {
    let postIdx = -1;
    for (let i = preIdx + 1; i < lines.length && i <= preIdx + 4; i++) {
      if (POST_TEXTS.some((p) => lines[i].toLowerCase().includes(p.toLowerCase()))) {
        postIdx = i;
        break;
      }
    }

    if (postIdx > preIdx + 1) {
      recipient_name = lines.slice(preIdx + 1, postIdx).join(" ").trim();
    } else if (preIdx + 1 < lines.length) {
      recipient_name = lines[preIdx + 1].trim();
    }

    if (postIdx >= 0) {
      const courseLines: string[] = [];
      for (let i = postIdx + 1; i < lines.length; i++) {
        const l = lines[i];
        if (/Issued on/i.test(l)) break;
        if (l.length < 3) continue;
        // Stop at footer markers
        if (/Digitally Certified|Blockchain Verified|SHA-256|Scan to verify|Authorised/i.test(l)) break;
        courseLines.push(l);
        if (courseLines.length >= 3) break;
      }
      course_name = courseLines.join(" ").trim() || null;
    }
  }

  // 7. Organisation name ────────────────────────────────────────────────────
  //    Printed as the first large text before the subtitle. It appears before
  //    the subtitle line in the OCR output.
  let org_name: string | null = null;
  if (certificate_type_label) {
    const subIdx = lines.findIndex((l) =>
      l.toUpperCase().includes(certificate_type_label!)
    );
    if (subIdx > 0) {
      // Walk backwards: skip the domain line, grab the first substantive line
      for (let i = subIdx - 1; i >= 0; i--) {
        const l = lines[i];
        if (l.length < 4) continue;
        if (org_domain && l.toLowerCase() === org_domain) continue;
        if (/^[0-9a-f]/i.test(l) || l.includes("-CERT-")) continue;
        org_name = l;
        break;
      }
    }
  }

  return {
    recipient_name,
    course_name,
    org_name,
    org_domain,
    issue_date,
    uri,
    certificate_hash,
    certificate_type_label,
  };
}

// ── Public extraction entry-point ─────────────────────────────────────────────
// Azure Document Intelligence handles PDF + all image types.
// All field parsing is done with deterministic regex — no GPT calls.
export async function extractCertificateFields(
  buffer: Buffer,
  mimeType: string
): Promise<CertificateFields> {
  void mimeType; // Doc Intel auto-detects format from binary magic bytes
  const text = await extractTextWithDocIntel(buffer);
  if (process.env.NODE_ENV !== "production") {
    console.log("[ocr] extracted text:\n", text);
  }
  return parseTextFields(text);
}

// ── Normalizers ───────────────────────────────────────────────────────────────
function normText(s: string | null): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normHash(s: string | null): string {
  return (s ?? "").trim().toLowerCase();
}

const MONTH_MAP: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
  jan: "01", feb: "02", mar: "03", apr: "04",
  jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function normDate(s: string | null): string | null {
  if (!s) return null;
  const clean = s.trim();

  // ISO / Postgres timestamp "2026-02-21T00:00:00+00:00" — grab date part directly
  const isoMatch = clean.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // Printed date "21 February 2026" or "21 Feb 2026" — parse without timezone
  const dmy = clean.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dmy) {
    const month = MONTH_MAP[dmy[2].toLowerCase()];
    if (month) return `${dmy[3]}-${month}-${dmy[1].padStart(2, "0")}`;
  }

  // Last-resort: Date() parse — extract UTC date only
  try {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  } catch { /* ignore */ }

  return clean.toLowerCase();
}

// ── Format a raw DB date for human-readable display ──────────────────────────
function formatDisplayDate(s: string | null): string | null {
  if (!s) return null;
  // ISO / Postgres: "2026-02-21" or "2026-02-21T00:00:00+00:00"
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const months = ["","January","February","March","April","May","June",
      "July","August","September","October","November","December"];
    return `${parseInt(d)} ${months[parseInt(m)]} ${y}`;
  }
  return s;
}

type Normalizer = (s: string | null) => string | null;

function makeField(
  field: string,
  label: string,
  extracted: string | null,
  registered: string | null,
  norm: Normalizer = normText
): FieldComparison {
  let status: FieldMatchStatus;
  if (extracted === null) {
    status = "unread";
  } else {
    status = norm(extracted) === norm(registered) ? "match" : "mismatch";
  }
  return { field, label, extracted, registered, status };
}

// ── Build the full comparison result ─────────────────────────────────────────
export function buildComparisonResult(
  extracted: CertificateFields,
  cert: Certificate | null,
  issuer: Issuer | null,
  onChainData: { issuer: string; issuedAt: number; revokedAt: number } | null,
  lookupHash: string,
  // QR flow: hash is already confirmed via URL — skip unreliable OCR read
  knownHash: string | null = null
): VerificationComparison {
  const hashFound = !!cert;
  const isOnChain = !!onChainData;
  const isRevoked =
    cert?.status === "revoked" || (onChainData?.revokedAt ?? 0) > 0;

  const fields: FieldComparison[] = [];

  if (cert && issuer) {
    fields.push(
      makeField(
        "recipient_name",
        "Recipient Name",
        extracted.recipient_name,
        cert.recipient_name
      )
    );
    fields.push(
      makeField(
        "course_name",
        "Course / Degree",
        extracted.course_name,
        cert.course_name
      )
    );
    fields.push(
      makeField("org_name", "Institution Name", extracted.org_name, issuer.org_name)
    );
    fields.push(
      makeField(
        "org_domain",
        "Institution Domain",
        extracted.org_domain,
        issuer.org_domain,
        (s) => (s ?? "").trim().toLowerCase()
      )
    );
    fields.push(
      makeField(
        "issue_date",
        "Issue Date",
        extracted.issue_date,
        // Format for display (e.g. "21 February 2026") — normDate handles comparison
        formatDisplayDate(cert.issued_at),
        normDate
      )
    );
    fields.push(
      makeField(
        "uri",
        "Certificate URI",
        extracted.uri,
        cert.uri,
        (s) => (s ?? "").trim()
      )
    );
    fields.push(
      makeField(
        "certificate_hash",
        "Certificate Hash",
        // QR flow: use the URL hash (authoritative); upload flow: use OCR output
        knownHash ?? extracted.certificate_hash,
        cert.certificate_hash,
        normHash
      )
    );

    // Map subtitle label → DB key for comparison
    const mappedKey = extracted.certificate_type_label
      ? (CERT_TYPE_LABEL_TO_KEY[
          extracted.certificate_type_label.toLowerCase().trim()
        ] ?? null)
      : null;

    fields.push({
      field: "certificate_type",
      label: "Certificate Type",
      extracted: extracted.certificate_type_label,
      registered: cert.certificate_type,
      status:
        mappedKey === null
          ? "unread"
          : mappedKey === cert.certificate_type
          ? "match"
          : "mismatch",
    });
  }

  const hasMismatch = fields.some((f) => f.status === "mismatch");

  let verdict: VerificationVerdict;
  if (!hashFound || !isOnChain) {
    verdict = "not_found";
  } else if (isRevoked) {
    verdict = "revoked";
  } else if (hasMismatch) {
    verdict = "tampered";
  } else {
    verdict = "authentic";
  }

  return {
    verdict,
    hashFound,
    isOnChain,
    isRevoked,
    fields,
    extracted,
    cert,
    issuer,
    onChain: onChainData
      ? {
          issuerAddress: onChainData.issuer,
          issuedAt: onChainData.issuedAt,
          revokedAt: onChainData.revokedAt,
        }
      : null,
  };
}
