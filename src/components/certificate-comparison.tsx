"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Shield,
  Minus,
  ExternalLink,
  Clock,
  Building2,
  GraduationCap,
  User,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { FieldComparison, VerificationComparison } from "@/lib/types";
import { getPolygonscanAddressUrl, getPolygonscanUrl } from "@/lib/blockchain";

// ── Verdict config ────────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  authentic: {
    icon: CheckCircle2,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
    borderClass: "border-primary/30",
    label: "Certificate Authentic",
    sub: "All fields match the registered record",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  tampered: {
    icon: ShieldAlert,
    iconClass: "text-red-600",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    borderClass: "border-red-400",
    label: "Document Tampered",
    sub: "One or more fields do not match the registered certificate",
    badgeClass: "bg-red-100 text-red-700 border-red-300",
  },
  revoked: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    label: "Certificate Revoked",
    sub: "This certificate has been revoked by the issuing institution",
    badgeClass: "",
  },
  not_found: {
    icon: XCircle,
    iconClass: "text-destructive",
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    label: "Certificate Not Found",
    sub: "No record matching this hash exists in the registry",
    badgeClass: "",
  },
};

// ── Field row ─────────────────────────────────────────────────────────────────
function FieldRow({ field }: { field: FieldComparison }) {
  const isMatch = field.status === "match";
  const isMismatch = field.status === "mismatch";
  const isUnread = field.status === "unread";

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isMismatch
          ? "border-red-300 bg-red-50 dark:bg-red-950/20"
          : isMatch
          ? "border-border bg-background"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            {field.label}
          </p>

          {/* Registered (ground truth) */}
          <p className="text-sm font-medium text-foreground break-all">
            {field.registered ?? (
              <span className="text-muted-foreground italic">Not in registry</span>
            )}
          </p>

          {/* Show what OCR read if it differs */}
          {isMismatch && field.extracted && (
            <div className="mt-2 flex items-start gap-2">
              <span className="text-xs text-red-600 font-semibold shrink-0 mt-0.5">
                Found on document:
              </span>
              <span className="text-xs text-red-700 dark:text-red-400 break-all font-mono">
                {field.extracted}
              </span>
            </div>
          )}

          {isUnread && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              Could not be read from the document
            </p>
          )}
        </div>

        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {isMatch && <CheckCircle2 className="h-5 w-5 text-primary" />}
          {isMismatch && <XCircle className="h-5 w-5 text-red-600" />}
          {isUnread && <Minus className="h-5 w-5 text-muted-foreground" />}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface CertificateComparisonProps {
  result: VerificationComparison;
  /** If provided, shows a "View full blockchain details" link */
  verifyHref?: string;
}

export function CertificateComparison({
  result,
  verifyHref,
}: CertificateComparisonProps) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const VerdictIcon = cfg.icon;

  const mismatchedFields = result.fields.filter((f) => f.status === "mismatch");
  const matchedFields = result.fields.filter((f) => f.status === "match");
  const unreadFields = result.fields.filter((f) => f.status === "unread");

  return (
    <div className="space-y-5">
      {/* ── Verdict Banner ── */}
      <div
        className={`rounded-2xl border-2 ${cfg.borderClass} ${cfg.bgClass} p-6 text-center space-y-3`}
      >
        <div className="flex justify-center">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center ${cfg.bgClass}`}
          >
            <VerdictIcon className={`h-8 w-8 ${cfg.iconClass}`} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{cfg.label}</h2>
        <p className="text-sm text-muted-foreground">{cfg.sub}</p>

        {result.verdict === "authentic" && (
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge className={cfg.badgeClass} variant="outline">
              {matchedFields.length}/{result.fields.length} fields verified
            </Badge>
            {result.isOnChain && (
              <Badge className={cfg.badgeClass} variant="outline">
                On-Chain Confirmed
              </Badge>
            )}
          </div>
        )}

        {result.verdict === "tampered" && (
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge className={cfg.badgeClass} variant="outline">
              {mismatchedFields.length} tampered field
              {mismatchedFields.length > 1 ? "s" : ""} detected
            </Badge>
          </div>
        )}
      </div>

      {/* ── Tampered warning with what's real ── */}
      {result.verdict === "tampered" && result.cert && result.issuer && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/20 px-5 py-4">
          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            The real certificate belongs to:
          </p>
          <div className="space-y-1 pl-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-sm font-bold text-foreground">
                {result.cert.recipient_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-sm text-foreground">
                {result.cert.course_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-red-600 shrink-0" />
              <span className="text-sm text-foreground">
                {result.issuer.org_name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Registered identity (authentic) ── */}
      {result.verdict === "authentic" && result.cert && result.issuer && (
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary text-center">
            Registered Certificate Identity
          </p>
          <div className="flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary/70" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Awarded to
              </span>
            </div>
            <span className="text-3xl font-extrabold text-foreground">
              {result.cert.recipient_name}
            </span>
          </div>
          <Separator className="bg-primary/20" />
          <div className="text-center">
            <span className="text-base font-semibold text-foreground">
              {result.cert.course_name}
            </span>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {result.issuer.org_name} &middot; {result.issuer.org_domain}
          </div>
        </div>
      )}

      {/* ── Per-field forensic table ── */}
      {result.fields.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Field-by-Field Forensic Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Mismatches first */}
            {mismatchedFields.map((f) => (
              <FieldRow key={f.field} field={f} />
            ))}
            {/* Then matches */}
            {matchedFields.map((f) => (
              <FieldRow key={f.field} field={f} />
            ))}
            {/* Then unread */}
            {unreadFields.map((f) => (
              <FieldRow key={f.field} field={f} />
            ))}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Match
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5 text-red-600" /> Mismatch
              </span>
              <span className="flex items-center gap-1">
                <Minus className="h-3.5 w-3.5 text-muted-foreground" /> Could not read
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Blockchain status ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Blockchain Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">On-Chain Record</span>
            {result.isOnChain ? (
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                Confirmed
              </Badge>
            ) : (
              <Badge variant="secondary">Not found</Badge>
            )}
          </div>

          {result.onChain && (
            <>
              <Separator />
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Issuer Address
                </span>
                <a
                  href={getPolygonscanAddressUrl(result.onChain.issuerAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline flex items-center gap-1 break-all text-right"
                >
                  {result.onChain.issuerAddress}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Issued At</span>
                <span className="text-sm flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(result.onChain.issuedAt * 1000).toLocaleString(
                    "en-IN",
                    { dateStyle: "medium", timeStyle: "short" }
                  )}
                </span>
              </div>
              {result.cert?.tx_hash && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Transaction
                    </span>
                    <a
                      href={getPolygonscanUrl(result.cert.tx_hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View on Polygonscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/verify" className="flex-1">
          <Button variant="outline" className="w-full">
            Verify Another
          </Button>
        </Link>
        {verifyHref && (
          <Link href={verifyHref} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Shield className="h-4 w-4" />
              Full Blockchain Details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
