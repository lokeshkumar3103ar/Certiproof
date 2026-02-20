import { createClient } from "@/lib/supabase/server";
import {
  verifyCertificateOnChain,
  getPolygonscanUrl,
  getPolygonscanAddressUrl,
} from "@/lib/blockchain";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Clock,
  Building2,
  Fingerprint,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Certificate, Issuer } from "@/lib/types";

interface VerifyResultPageProps {
  params: Promise<{ hash: string }>;
}

export default async function VerifyResultPage({
  params,
}: VerifyResultPageProps) {
  const { hash } = await params;
  const decodedHash = decodeURIComponent(hash);

  const supabase = await createClient();

  // Look up certificate in database
  const { data: cert } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_hash", decodedHash)
    .single<Certificate>();

  let issuer: Issuer | null = null;
  if (cert) {
    const { data } = await supabase
      .from("issuers")
      .select("*")
      .eq("id", cert.issuer_id)
      .single<Issuer>();
    issuer = data;
  }

  // Query blockchain
  const onChainData = await verifyCertificateOnChain(decodedHash);

  // Determine verification status
  const isOnChain = !!onChainData;
  const isInDb = !!cert;
  const isRevoked = cert?.status === "revoked" || (onChainData?.revokedAt ?? 0) > 0;
  const isValid = isOnChain && isInDb && !isRevoked;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Status Banner */}
      <div className="text-center mb-8">
        {isValid ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Certificate Verified
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
              Authentic &middot; On-Chain Confirmed
            </Badge>
          </div>
        ) : isRevoked ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Certificate Revoked
            </h1>
            <Badge variant="destructive">
              This certificate has been revoked by the issuer
            </Badge>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Not Found
            </h1>
            <Badge variant="secondary">
              No matching certificate found
            </Badge>
          </div>
        )}
      </div>

      {/* Certificate Details */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Fingerprint className="h-4 w-4 text-muted-foreground" />
            Certificate Hash
          </CardTitle>
        </CardHeader>
        <CardContent>
          <code className="text-xs sm:text-sm font-mono break-all text-foreground bg-muted px-3 py-2 rounded-md block">
            {decodedHash}
          </code>
        </CardContent>
      </Card>

      {/* On-Chain Record */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            On-Chain Record
          </CardTitle>
          <CardDescription>
            Data from the Certitrust smart contract on Polygon Amoy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isOnChain && onChainData ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-muted-foreground shrink-0">
                  Issuer Address
                </span>
                <a
                  href={getPolygonscanAddressUrl(onChainData.issuer)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline flex items-center gap-1 break-all text-right"
                >
                  {onChainData.issuer}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Issued At
                </span>
                <span className="text-sm flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(onChainData.issuedAt * 1000).toLocaleString(
                    "en-IN",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </span>
              </div>
              {onChainData.revokedAt > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Revoked At
                    </span>
                    <span className="text-sm text-destructive">
                      {new Date(onChainData.revokedAt * 1000).toLocaleString(
                        "en-IN",
                        {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }
                      )}
                    </span>
                  </div>
                </>
              )}
              {cert?.tx_hash && (
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No on-chain record found for this hash. The certificate may not
              have been anchored on blockchain, or the hash may be incorrect.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Database Record */}
      {isInDb && cert && issuer && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Recipient
              </span>
              <span className="text-sm font-medium">
                {cert.recipient_name}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Course</span>
              <span className="text-sm">{cert.course_name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Issuer</span>
              <span className="text-sm">{issuer.org_name}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">URI</span>
              <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                {cert.uri}
              </code>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Issue Date
              </span>
              <span className="text-sm">
                {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Notice */}
      <div className="rounded-md bg-muted/50 border border-border px-4 py-3 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">About this verification:</strong>{" "}
        The hash shown above is checked against the Certitrust smart contract
        deployed on Polygon Amoy (Chain ID: 80002). Even if this page is
        cloned, anyone can independently verify the hash on{" "}
        <a
          href="https://amoy.polygonscan.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Polygonscan
        </a>
        .
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link href="/verify" className="flex-1">
          <Button variant="outline" className="w-full">
            Verify Another
          </Button>
        </Link>
        {isInDb && cert && (
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
        )}
      </div>
    </div>
  );
}
