"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FilePlus,
  Loader2,
  CheckCircle,
  ExternalLink,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { issueCertificateAction } from "./actions";
import { toast } from "sonner";
import { CERTIFICATE_TYPES } from "@/lib/validations";

interface IssuedCertificate {
  id: string;
  hash: string;
  uri: string;
  txHash: string | null;
  qrDataUrl: string | null;
}

export default function IssuePage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState<IssuedCertificate | null>(null);
  const [certType, setCertType] = useState("course_completion");

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);

    const result = await issueCertificateAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.certificate) {
      setIssued(result.certificate);
      toast.success("Certificate issued successfully");
    }
    setLoading(false);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }

  // Success state
  if (issued) {
    return (
      <div className="min-h-screen bg-[#fafaf9]">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-14">
          {/* success card */}
          <div className="rounded-2xl border border-emerald-200 bg-white overflow-hidden shadow-sm">
            {/* green top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="px-8 py-8">
              {/* icon */}
              <div className="flex justify-center mb-5">
                <div className="h-16 w-16 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-center text-xl font-extrabold text-foreground mb-1">
                Certificate Issued!
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-7">
                Cryptographic proof recorded and anchored on-chain.
              </p>

              {/* detail rows */}
              <div className="rounded-xl border border-border bg-[#fafaf9] divide-y divide-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    URI
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground">
                      {issued.uri}
                    </code>
                    <button
                      onClick={() => copyToClipboard(issued.uri, "URI")}
                      className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide shrink-0">
                    Hash
                  </span>
                  <div className="flex items-start gap-2">
                    <code className="text-xs font-mono break-all text-right text-foreground">
                      {issued.hash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(issued.hash, "Hash")}
                      className="text-muted-foreground hover:text-primary transition-colors p-1 rounded shrink-0 mt-0.5"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Blockchain
                  </span>
                  {issued.txHash ? (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${issued.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      View on Polygonscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-xs rounded-full bg-amber-50 text-amber-700 border-amber-200"
                    >
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              {/* QR code */}
              {issued.qrDataUrl && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="rounded-xl border border-border p-3 bg-white shadow-sm">
                    <img
                      src={issued.qrDataUrl}
                      alt="Verification QR"
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan to verify this certificate
                  </p>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground mt-5">
                This certificate has a permanent page —{" "}
                <Link
                  href={`/certificate/${issued.id}`}
                  className="text-primary hover:underline font-medium"
                >
                  view it anytime
                </Link>{" "}
                from your dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link href="/dashboard" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2 font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href={`/verify/${issued.hash}`} className="flex-1">
                  <Button className="btn-primary-shine w-full rounded-xl gap-2 font-semibold">
                    Verify Certificate
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Page header */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Issue Certificate
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Fill in the details. A SHA-256 hash will be computed and
                recorded on Polygon Amoy.
              </p>
            </div>
            <Link href="/issue/bulk">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5 shrink-0"
              >
                <FilePlus className="h-3.5 w-3.5" />
                Bulk Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-border bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground">
              Certificate Details
            </h2>
          </div>
          <div className="px-6 py-6">
            <form action={handleSubmit} className="space-y-5">
              {/* Recipient row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="recipientName"
                    className="text-sm font-medium text-foreground"
                  >
                    Recipient Name
                  </label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    placeholder="Full name as on certificate"
                    required
                    className="h-10 rounded-lg border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="recipientEmail"
                    className="text-sm font-medium text-foreground"
                  >
                    Recipient Email
                  </label>
                  <Input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    placeholder="student@email.com"
                    required
                    className="h-10 rounded-lg border-border"
                  />
                </div>
              </div>

              {/* Course */}
              <div className="space-y-1.5">
                <label
                  htmlFor="courseName"
                  className="text-sm font-medium text-foreground"
                >
                  Course / Certificate Title
                </label>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="e.g., Bachelor of Technology in Computer Science"
                  required
                  className="h-10 rounded-lg border-border"
                />
              </div>

              {/* Type & Date row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="certificateType"
                    className="text-sm font-medium text-foreground"
                  >
                    Certificate Type
                  </label>
                  <Select
                    name="certificateType"
                    value={certType}
                    onValueChange={setCertType}
                  >
                    <SelectTrigger
                      id="certificateType"
                      className="h-10 rounded-lg border-border"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CERTIFICATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controls wording on the PDF.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="issueDate"
                    className="text-sm font-medium text-foreground"
                  >
                    Issue Date
                  </label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="h-10 rounded-lg border-border"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="btn-primary-shine w-full h-11 rounded-xl gap-2 font-bold text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Issuing Certificate…
                    </>
                  ) : (
                    <>
                      <FilePlus className="h-4 w-4" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
