import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FilePlus,
  FileCheck,
  FileX,
  ExternalLink,
  FileDown,
  Eye,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  Award,
  LayoutDashboard,
} from "lucide-react";
import type { Certificate, Issuer } from "@/lib/types";
import { getPolygonscanUrl } from "@/lib/blockchain";
import { RevokeButton } from "./revoke-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: issuer } = await supabase
    .from("issuers")
    .select("*")
    .eq("id", user.id)
    .single<Issuer>();

  if (!issuer) redirect("/login");

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("issuer_id", user.id)
    .order("issued_at", { ascending: false })
    .returns<Certificate[]>();

  const certs = certificates || [];
  const issuedCount = certs.filter((c) => c.status === "issued").length;
  const revokedCount = certs.filter((c) => c.status === "revoked").length;

  /* initials for org avatar */
  const initials = issuer.org_name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* ── Page header banner ── */}
      <div className="relative overflow-hidden border-b border-border bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 50%, rgba(58,91,142,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            {/* Org identity */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
                {issuer.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={issuer.logo_url}
                    alt={issuer.org_name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-primary font-extrabold text-sm">
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  {issuer.org_name}
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {issuer.org_domain}
                </p>
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Button>
              </Link>
              <Link href="/issue/bulk">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Bulk Issue
                </Button>
              </Link>
              <Link href="/issue">
                <Button
                  size="sm"
                  className="btn-primary-shine gap-1.5 rounded-lg font-semibold"
                >
                  <FilePlus className="h-3.5 w-3.5" />
                  Issue Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Certificates",
              value: certs.length,
              icon: Award,
              color: "text-foreground",
              bg: "bg-muted/60",
              iconColor: "text-muted-foreground",
            },
            {
              label: "Active",
              value: issuedCount,
              icon: FileCheck,
              color: "text-primary",
              bg: "bg-primary/5",
              iconColor: "text-primary/60",
              ring: "ring-1 ring-primary/15",
            },
            {
              label: "Revoked",
              value: revokedCount,
              icon: FileX,
              color: "text-destructive",
              bg: "bg-destructive/5",
              iconColor: "text-destructive/60",
              ring: "ring-1 ring-destructive/15",
            },
          ].map(({ label, value, icon: Icon, color, bg, iconColor, ring }) => (
            <Card
              key={label}
              className={`border-border shadow-none transition-all hover:shadow-sm ${ring ?? ""}`}
            >
              <CardContent className="flex items-center justify-between pt-5 pb-5 px-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                    {label}
                  </p>
                  <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
                </div>
                <div
                  className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Certificates table ── */}
        <Card className="border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Issued Certificates
              </CardTitle>
              <CardDescription className="mt-0.5">
                {certs.length} certificate{certs.length !== 1 ? "s" : ""} issued
                by your organisation
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {certs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="h-16 w-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                  <FileCheck className="h-7 w-7 opacity-40" />
                </div>
                <p className="font-medium text-foreground">
                  No certificates yet
                </p>
                <p className="text-sm mt-1">
                  Issue your first certificate to get started.
                </p>
                <Link href="/issue">
                  <Button
                    size="sm"
                    className="mt-5 btn-primary-shine rounded-lg gap-1.5"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                    Issue Certificate
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wide">
                        Recipient
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">
                        Course
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">
                        URI
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wide">
                        Issued
                      </TableHead>
                      <TableHead className="text-right pr-6 font-semibold text-xs uppercase tracking-wide">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certs.map((cert) => (
                      <TableRow
                        key={cert.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-6 font-semibold text-sm text-foreground py-4">
                          {cert.recipient_name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                          {cert.course_name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded-md font-mono text-muted-foreground">
                            {cert.uri}
                          </code>
                        </TableCell>
                        <TableCell>
                          {cert.status === "issued" ? (
                            <Badge className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold">
                              ● Active
                            </Badge>
                          ) : (
                            <Badge className="rounded-full bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 text-xs font-semibold">
                              ● Revoked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(cert.issued_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/certificate/${cert.id}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            {cert.tx_hash && (
                              <a
                                href={getPolygonscanUrl(cert.tx_hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                title="View on Polygonscan"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <a
                              href={`/api/certificate/${cert.id}/pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                              title="Download PDF"
                            >
                              <FileDown className="h-3.5 w-3.5" />
                            </a>
                            {cert.status === "issued" && (
                              <RevokeButton
                                certificateId={cert.id}
                                certificateHash={cert.certificate_hash}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
