"use server";

import { createClient } from "@/lib/supabase/server";
import { revokeCertificateOnChain } from "@/lib/blockchain";

export async function revokeAction(certificateId: string, certificateHash: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .eq("issuer_id", user.id)
    .single();

  if (!cert) return { error: "Certificate not found or not owned by you" };
  if (cert.status === "revoked") return { error: "Certificate already revoked" };

  // Revoke on-chain
  try {
    await revokeCertificateOnChain(certificateHash);
  } catch (err) {
    console.error("Blockchain revocation failed:", err);
    // Continue with DB update even if on-chain fails (testnet may be down)
  }

  // Update database
  const { error } = await supabase
    .from("certificates")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
    })
    .eq("id", certificateId);

  if (error) return { error: "Failed to revoke certificate" };

  return { success: true };
}
