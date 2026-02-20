"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generateCertificateHash,
  generateCertificateUri,
  generateShortId,
} from "@/lib/hash";
import { issueCertificateOnChain } from "@/lib/blockchain";
import type { Issuer } from "@/lib/types";

export interface BulkRow {
  recipientName: string;
  recipientEmail: string;
}

export interface BulkResult {
  row: number;
  recipientName: string;
  recipientEmail: string;
  status: "success" | "failed";
  hash?: string;
  uri?: string;
  txHash?: string | null;
  error?: string;
}

export interface BulkIssueResponse {
  total: number;
  succeeded: number;
  failed: number;
  results: BulkResult[];
}

export async function bulkIssueAction(formData: FormData): Promise<{ error: string } | { data: BulkIssueResponse }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: issuer } = await supabase
    .from("issuers")
    .select("*")
    .eq("id", user.id)
    .single<Issuer>();
  if (!issuer) return { error: "Issuer profile not found" };

  const courseName = (formData.get("courseName") as string)?.trim();
  const issueDate = formData.get("issueDate") as string;
  const certificateType = (formData.get("certificateType") as string) || "course_completion";
  const skipBlockchain = formData.get("skipBlockchain") === "true";
  const csvContent = formData.get("csvContent") as string;

  if (!courseName || courseName.length < 2)
    return { error: "Course name is required." };
  if (!issueDate)
    return { error: "Issue date is required." };
  if (!csvContent?.trim())
    return { error: "CSV content is empty." };

  // Parse CSV — skip header row, parse name + email columns
  const lines = csvContent.trim().split(/\r?\n/);
  const dataLines = lines[0]?.toLowerCase().includes("name") ? lines.slice(1) : lines;

  const rows: BulkRow[] = [];
  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
    const recipientName = parts[0];
    const recipientEmail = parts[1];
    if (!recipientName || !recipientEmail) continue;
    rows.push({ recipientName, recipientEmail });
  }

  if (rows.length === 0)
    return { error: "No valid rows found. Expected columns: recipient_name, recipient_email" };
  if (rows.length > 200)
    return { error: "Maximum 200 recipients per batch." };

  const results: BulkResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const { recipientName, recipientEmail } = rows[i];
    try {
      const certId = crypto.randomUUID();
      const shortId = generateShortId();

      const certificateHash = generateCertificateHash({
        issuerId: user.id,
        recipientName,
        courseName,
        issuedAt: issueDate,
        uniqueId: certId,
      });

      const uri = generateCertificateUri(issuer.org_domain, shortId);

      let txHash: string | null = null;
      if (!skipBlockchain) {
        try {
          txHash = await issueCertificateOnChain(certificateHash);
        } catch {
          // Non-fatal — continue without blockchain if testnet is down or insufficient funds
        }
      }

      const { error: insertError } = await supabase.from("certificates").insert({
        id: certId,
        uri,
        issuer_id: user.id,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        course_name: courseName,
        certificate_hash: certificateHash,
        certificate_type: certificateType,
        tx_hash: txHash,
        status: "issued",
        issued_at: new Date(issueDate).toISOString(),
        metadata: {},
      });

      if (insertError) {
        results.push({
          row: i + 1,
          recipientName,
          recipientEmail,
          status: "failed",
          error: insertError.message,
        });
        continue;
      }

      results.push({
        row: i + 1,
        recipientName,
        recipientEmail,
        status: "success",
        hash: certificateHash,
        uri,
        txHash,
      });
    } catch (err: unknown) {
      results.push({
        row: i + 1,
        recipientName,
        recipientEmail,
        status: "failed",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return {
    data: {
      total: rows.length,
      succeeded: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    },
  };
}
