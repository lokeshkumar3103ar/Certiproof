"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/** Returns pixel dimensions of a raster image File via the browser Image API */
function getImageDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Cannot read image dimensions.")); };
    img.src = url;
  });
}
import { Loader2, Upload, CheckCircle, Trash2, PenLine } from "lucide-react";
import { toast } from "sonner";
import type { Issuer } from "@/lib/types";

// Limits
const MAX_SIGNATURE_BYTES = 500 * 1024; // 500 KB
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXT = "PNG, JPG, WebP";

interface SignatureUploaderProps {
  issuer: Issuer;
}

export function SignatureUploader({ issuer }: SignatureUploaderProps) {
  const [sigUrl, setSigUrl] = useState<string | null>(issuer.signature_url);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Type validation
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error(`Only ${ACCEPTED_EXT} files are accepted for signatures.`);
      return;
    }
    // Size validation (500 KB)
    if (file.size > MAX_SIGNATURE_BYTES) {
      toast.error(
        `Signature image must be under 500 KB. Yours is ${(file.size / 1024).toFixed(0)} KB.`
      );
      return;
    }

    // Dimension validation
    let dims: { w: number; h: number };
    try { dims = await getImageDimensions(file); }
    catch { toast.error("Could not read image dimensions. Try a different file."); return; }

    // Must be landscape (wider than tall) — portrait looks bad in the cert footer
    if (dims.h >= dims.w) {
      toast.error(
        `Signature must be landscape orientation (wider than tall). Yours is ${dims.w}×${dims.h} px. Crop to landscape (e.g. 400×130 px).`
      );
      return;
    }
    // Minimum usable size
    if (dims.w < 150 || dims.h < 40) {
      toast.error(`Signature is too small (${dims.w}×${dims.h} px). Minimum is 150×40 px.`);
      return;
    }
    // Maximum size
    if (dims.w > 1200 || dims.h > 400) {
      toast.error(
        `Signature is too large (${dims.w}×${dims.h} px). Maximum is 1200×400 px — please resize.`
      );
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${issuer.id}/signature.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes("bucket") || uploadError.message.toLowerCase().includes("not found")) {
          toast.error("Storage bucket 'signatures' not found. Run the SQL migration at the bottom of supabase/schema.sql in your Supabase SQL Editor.");
        } else {
          toast.error(uploadError.message);
        }
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("signatures").getPublicUrl(path);

      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("issuers")
        .update({ signature_url: publicUrl })
        .eq("id", issuer.id);

      if (updateError) throw updateError;

      setSigUrl(bustedUrl);
      toast.success("Signature updated successfully.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove() {
    setUploading(true);
    try {
      await supabase
        .from("issuers")
        .update({ signature_url: null })
        .eq("id", issuer.id);
      setSigUrl(null);
      toast.success("Signature removed.");
    } catch {
      toast.error("Failed to remove signature.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
        <PenLine className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Authorised Signatory Signature
        </h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-xs text-muted-foreground mb-5">
          Appears on the bottom-right of all certificates.{" "}
          {ACCEPTED_EXT} &middot; max 500 KB &middot; 150–1200 px wide, 40–400 px tall &middot;
          must be landscape (wider than tall) &middot; transparent PNG recommended (e.g. 400×130 px).
        </p>
        <div className="flex items-start gap-6">
          {/* Preview box */}
          <div className="h-20 w-44 rounded-xl border border-dashed border-border bg-muted/40 flex items-center justify-center shrink-0 overflow-hidden">
            {sigUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sigUrl}
                alt="Signature preview"
                className="max-h-full max-w-full object-contain p-1"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">
                No signature
              </span>
            )}
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <input
              ref={fileRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {sigUrl ? "Replace Signature" : "Upload Signature"}
            </button>
            {sigUrl && (
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm font-semibold hover:bg-destructive/5 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
            {sigUrl && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />
                Signature active
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
