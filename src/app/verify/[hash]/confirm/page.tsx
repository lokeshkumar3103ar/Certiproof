"use client";

import { useParams, useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import {
  Upload,
  Camera,
  FileText,
  X,
  Loader2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CertificateComparison } from "@/components/certificate-comparison";
import type { VerificationComparison } from "@/lib/types";

const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp,application/pdf";
const MAX_MB = 10;

export default function ConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const rawHash = Array.isArray(params.hash) ? params.hash[0] : params.hash ?? "";
  const hash = decodeURIComponent(rawHash);

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationComparison | null>(null);

  // ── File selection ──────────────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Please upload a file under ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null); // PDF — no visual preview, show name instead
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("hash", hash); // QR flow: hint hash from URL

      const res = await fetch("/api/verify/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      setResult(data as VerificationComparison);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Skip ────────────────────────────────────────────────────────────────
  const handleSkip = () => {
    router.push(`/verify/${encodeURIComponent(hash)}`);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20 mb-4">
          <ShieldCheck className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Upload the Certificate
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Upload a photo or PDF of the certificate you scanned. We will
          automatically compare every field against the registered record.
        </p>
      </div>

      {/* Show results if available */}
      {result ? (
        <CertificateComparison
          result={result}
          verifyHref={`/verify/${encodeURIComponent(hash)}`}
        />
      ) : (
        <>
          {/* Upload zone */}
          {!file ? (
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
                dragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center pointer-events-none">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Upload className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground mb-1">
                  Drop certificate here or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, JPEG, PNG, WebP — up to {MAX_MB} MB
                </p>
                <div className="mt-5 flex gap-3 pointer-events-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (inputRef.current) {
                        inputRef.current.accept = "image/*";
                        inputRef.current.setAttribute("capture", "environment");
                        inputRef.current.click();
                        // Reset for non-camera usage next time
                        setTimeout(() => {
                          if (inputRef.current) {
                            inputRef.current.accept = ACCEPTED;
                            inputRef.current.removeAttribute("capture");
                          }
                        }, 500);
                      }
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      inputRef.current?.click();
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="sr-only"
                onChange={onInputChange}
              />
            </div>
          ) : (
            /* File preview */
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="Certificate preview"
                    className="h-24 w-36 object-cover rounded-lg border border-border shrink-0"
                  />
                ) : (
                  <div className="h-24 w-36 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB &middot;{" "}
                    {file.type || "unknown type"}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    onClick={clearFile}
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              className="flex-1 h-11 gap-2 font-semibold"
              disabled={!file || loading}
              onClick={handleVerify}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing with AI…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify Certificate
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-11 gap-1 text-muted-foreground"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip — view blockchain result only
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* What we check */}
          {!loading && !file && (
            <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
              For best results, upload the original PDF certificate.
              If using a photo, ensure the full certificate and footer are clearly visible.
            </p>
          )}

          {loading && (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 px-4 py-4 space-y-2">
              <p className="text-sm font-semibold text-foreground text-center">
                Analysing document…
              </p>
              {[
                "Reading document fields",
                "Verifying authenticity",
                "Cross-checking blockchain registry",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
