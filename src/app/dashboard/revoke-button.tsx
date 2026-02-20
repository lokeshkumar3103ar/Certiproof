"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileX, Loader2 } from "lucide-react";
import { revokeAction } from "./actions";

export function RevokeButton({
  certificateId,
  certificateHash,
}: {
  certificateId: string;
  certificateHash: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRevoke() {
    if (!confirm("Are you sure you want to revoke this certificate? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    const result = await revokeAction(certificateId, certificateHash);
    if (result?.error) {
      alert(result.error);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRevoke}
      disabled={loading}
      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
      title="Revoke certificate"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileX className="h-4 w-4" />
      )}
    </Button>
  );
}
