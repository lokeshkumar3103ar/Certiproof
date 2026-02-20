import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  FileDown,
  ShieldCheck,
} from "lucide-react";
import type { Certificate, Issuer } from "@/lib/types";
import { getPolygonscanUrl } from "@/lib/blockchain";
import { CopyButton } from "./copy-button";
import { generateQRCodeDataUrl } from "@/lib/qr";

interface CertificateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificateDetailPage({
  params,
}: CertificateDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Auth check — only issuer of this cert can view this page
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single<Certificate>();

  if (!cert) notFound();

  // Ensure only the issuer of this cert can access
  if (cert.issuer_id !== user.id) notFound();

  const { data: issuer } = await supabase
    .from("issuers")
    .select("*")
    .eq("id", cert.issuer_id)
    .single<Issuer>();

  // Generate QR code server-side
  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await generateQRCodeDataUrl(cert.certificate_hash);
  } catch {
    // non-fatal
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Certificate Record</CardTitle>
          <CardDescription>
            Issued by{" "}
            <span className="font-medium text-foreground">
              {issuer?.org_name}
            </span>{" "}
            &middot;{" "}
            {new Date(cert.issued_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status badge */}
          <div className="flex justify-center">
            {cert.status === "issued" ? (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Active &middot; On-Chain Confirmed
              </Badge>
            ) : (
              <Badge variant="destructive">Revoked</Badge>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3 rounded-md bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recipient</span>
              <span className="text-sm font-medium">{cert.recipient_name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="text-sm">{cert.course_name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground shrink-0">URI</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{cert.uri}</code>
                <CopyButton text={cert.uri} label="URI" />
              </div>
            </div>
            <Separator />
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-muted-foreground shrink-0">Hash</span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono break-all text-right">
                  {cert.certificate_hash}
                </code>
                <CopyButton text={cert.certificate_hash} label="Hash" />
              </div>
            </div>
            {cert.tx_hash && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Transaction
                  </span>
                  <a
                    href={getPolygonscanUrl(cert.tx_hash)}
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
            {!cert.tx_hash && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Blockchain
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    Pending (testnet may be unavailable)
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="flex justify-center pt-2">
              <div className="text-center space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Verification QR Code"
                  className="w-40 h-40 mx-auto border border-border rounded-md"
                />
                <p className="text-xs text-muted-foreground">
                  Scan to verify this certificate
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href={`/verify/${cert.certificate_hash}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <ShieldCheck className="h-4 w-4" />
                Public Verify Page
              </Button>
            </Link>
            <a
              href={`/api/certificate/${cert.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full gap-2">
                <FileDown className="h-4 w-4" />
                Download Certificate
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
