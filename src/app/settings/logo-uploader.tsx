"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, CheckCircle, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Issuer } from "@/lib/types";

interface LogoUploaderProps {
  issuer: Issuer;
}

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

export function LogoUploader({ issuer }: LogoUploaderProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(issuer.logo_url);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Type check
    const accepted = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!accepted.includes(file.type)) {
      toast.error("Only PNG, JPG, WebP, or SVG files are accepted for logos.");
      return;
    }

    // 2. Size check — 2 MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(
        `Logo must be under 2 MB. Yours is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`
      );
      return;
    }

    // 3. Dimension check (skip for SVG — no raster dims)
    if (file.type !== "image/svg+xml") {
      let dims: { w: number; h: number };
      try { dims = await getImageDimensions(file); }
      catch { toast.error("Could not read image dimensions. Try a different file."); return; }

      if (dims.w < 80 || dims.h < 80) {
        toast.error(`Too small: ${dims.w}×${dims.h} px. Minimum is 80×80 px.`); return;
      }
      if (dims.w > 2000 || dims.h > 2000) {
        toast.error(`Too large: ${dims.w}×${dims.h} px. Maximum is 2000×2000 px — please resize.`); return;
      }
      const ratio = dims.w / dims.h;
      if (ratio > 3 || ratio < 0.33) {
        // Non-blocking warning — still upload
        toast.warning(`Logo is very non-square (${dims.w}×${dims.h} px). A square or near-square logo (e.g. 256×256) fits best on certificates.`);
      }
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${issuer.id}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        if (
          uploadError.message.toLowerCase().includes("bucket") ||
          uploadError.message.toLowerCase().includes("not found")
        ) {
          toast.error(
            "Storage bucket 'logos' not found. Please run the SQL migration in your Supabase SQL Editor (see supabase/schema.sql at the bottom of the file)."
          );
        } else {
          throw uploadError;
        }
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(path);

      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("issuers")
        .update({ logo_url: publicUrl })
        .eq("id", issuer.id);

      if (updateError) throw updateError;

      setLogoUrl(bustedUrl);
      toast.success("Logo updated successfully.");
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
      await supabase.from("issuers").update({ logo_url: null }).eq("id", issuer.id);
      setLogoUrl(null);
      toast.success("Logo removed.");
    } catch {
      toast.error("Failed to remove logo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Institution Logo</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-xs text-muted-foreground mb-5">
          Appears top-left on all certificates. PNG, JPG, WebP, or SVG
          &nbsp;&middot;&nbsp;max 2 MB &middot; 80–2000 px per side &middot; square recommended (e.g. 256×256 px).
        </p>
        <div className="flex items-center gap-6">
          {/* Preview */}
          <div className="h-20 w-20 rounded-xl border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Institution logo"
                className="h-full w-full object-contain rounded-xl"
              />
            ) : (
              <span className="text-xs text-muted-foreground text-center px-2">
                No logo
              </span>
            )}
          </div>
          {/* Controls */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleUpload}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-lg"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {logoUrl ? "Replace Logo" : "Upload Logo"}
            </Button>
            {logoUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/5"
                disabled={uploading}
                onClick={handleRemove}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            )}
            {logoUrl && (
              <span className="text-xs text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Logo active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
