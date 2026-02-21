"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  Shield,
  Loader2,
  Fingerprint,
  Lock,
  FileCheck,
  ChevronRight,
  Upload,
  Camera,
  FileText,
  X,
  ScanLine,
  ChevronDown,
} from "lucide-react";
import { CertificateComparison } from "@/components/certificate-comparison";
import type { VerificationComparison } from "@/lib/types";

const ACCEPTED = "image/jpeg,image/jpg,image/png,image/webp,application/pdf";
const MAX_MB = 10;

export default function VerifyPage() {
  // ── Upload flow state ──────────────────────────────────────────────────
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationComparison | null>(null);

  // ── Hash flow state ────────────────────────────────────────────────────
  const [showHashForm, setShowHashForm] = useState(false);
  const [hash, setHash] = useState("");
  const [hashLoading, setHashLoading] = useState(false);
  const router = useRouter();

  // ── File handling ──────────────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      setUploadError(`File too large. Max ${MAX_MB} MB.`);
      return;
    }
    setFile(f);
    setUploadError(null);
    setResult(null);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
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
    setUploadError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Upload verify ──────────────────────────────────────────────────────
  const handleUploadVerify = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // no hash hint — extract from document itself

      const res = await fetch("/api/verify/extract", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Analysis failed. Please try again.");
        return;
      }
      setResult(data as VerificationComparison);
    } catch {
      setUploadError("Network error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  // ── Hash submit ────────────────────────────────────────────────────────
  const handleHashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setHashLoading(true);
    router.push(`/verify/${encodeURIComponent(hash.trim())}`);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-[#f0f4ff] via-[#fafaf9] to-[#fafaf9]">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 60% 50%, rgba(58,91,142,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Verify Certificate
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-md mx-auto">
            Upload the physical certificate and we will automatically detect any
            tampering using AI.{" "}
            <span className="text-foreground font-medium">
              No account required.
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        {/* ── Results ─────────────────────────────────────────────────── */}
        {result ? (
          <div className="space-y-4">
            <CertificateComparison result={result} />
            <Button
              variant="outline"
              className="w-full h-10 gap-2"
              onClick={() => {
                clearFile();
                setResult(null);
              }}
            >
              <ScanLine className="h-4 w-4" />
              Verify another certificate
            </Button>
          </div>
        ) : (
          <>
            {/* ── Primary: Upload flow ───────────────────────────────── */}
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ScanLine className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Forensic AI Verification
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Detects name / date / course tampering automatically
                  </p>
                </div>
              </div>

              {!file ? (
                <>
                  {/* Quality tip */}
                  <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-4 py-3 flex gap-3 items-start">
                    <span className="text-blue-500 text-base shrink-0 mt-0.5">💡</span>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      <span className="font-semibold">Best results:</span> Upload the original <span className="font-semibold">PDF certificate</span> for highest accuracy. If using a photo, ensure the entire certificate is in frame, well-lit, and the footer text is sharp.
                    </p>
                  </div>
                  <div
                  className={`rounded-2xl border-2 border-dashed transition-colors cursor-pointer ${
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
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center pointer-events-none">
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
                </>
              ) : (
                <div className="rounded-2xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-4">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
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
                        {file.type || "unknown"}
                      </p>
                      <Button
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

              {uploadError && (
                <div className="mt-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 px-4 py-3">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {uploadError}
                  </p>
                </div>
              )}

              <Button
                type="button"
                className="btn-primary-shine w-full h-11 rounded-xl font-bold gap-2 text-base mt-5"
                disabled={!file || uploading}
                onClick={handleUploadVerify}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing with AI…
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Verify Certificate
                  </>
                )}
              </Button>

              {uploading && (
                <div className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 space-y-2">
                  {[
                    "Reading document fields",
                    "Cross-checking blockchain registry",
                  ].map((step) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Secondary: Hash input (collapsed) ─────────────────── */}
            <div className="mt-4 rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowHashForm((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4" />
                  Enter hash manually instead
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showHashForm ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showHashForm && (
                <div className="px-5 pb-5 border-t border-border/60 pt-4">
                  <form onSubmit={handleHashSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="hash"
                        className="text-sm font-semibold text-foreground"
                      >
                        Certificate Hash or URI
                      </Label>
                      <div className="relative">
                        <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="hash"
                          value={hash}
                          onChange={(e) => setHash(e.target.value)}
                          placeholder="0x… or CP-XXXXXX"
                          className="pl-10 h-11 font-mono text-sm rounded-xl border-border bg-[#fafaf9] focus-visible:ring-primary/30"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The hash is printed on the certificate and encoded in
                        the QR code. This shows blockchain result only — no
                        tamper detection.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full h-10 rounded-xl font-bold gap-2"
                      disabled={hashLoading || !hash.trim()}
                    >
                      {hashLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Looking up…
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Look up by Hash
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* How it works */}
            <div className="mt-10">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-5 text-center">
                How verification works
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: ScanLine,
                    title: "AI field extraction",
                    desc: "Our AI reads every field from the document and converts it into structured data for comparison.",
                  },
                  {
                    icon: Lock,
                    title: "On-chain lookup",
                    desc: "The extracted hash is queried against the CertChain smart contract on Polygon Amoy.",
                  },
                  {
                    icon: FileCheck,
                    title: "Field-by-field comparison",
                    desc: "Every field is compared against the immutable registry. Any mismatch is flagged immediately.",
                  },
                ].map(({ icon: Icon, title, desc }, i) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-xl border border-border/60 bg-white p-4"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {i + 1}. {title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                    {i < 2 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8 leading-relaxed max-w-sm mx-auto">
              Even if this website is cloned, the Polygonscan link independently
              proves whether a hash exists in the real smart contract.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
