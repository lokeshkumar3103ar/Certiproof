import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Settings2 } from "lucide-react";
import type { Issuer } from "@/lib/types";
import { LogoUploader } from "./logo-uploader";
import { SignatureUploader } from "./signature-uploader";

export default async function SettingsPage() {
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Organisation Settings
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your institution profile and branding.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Org info */}
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
            <Building2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Organisation Details
            </h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-xs text-muted-foreground mb-4">
              These were set during sign-up. Contact support to change them.
            </p>
            <div className="space-y-0 divide-y divide-border/60">
              {[
                { label: "Name", value: issuer.org_name, mono: false },
                { label: "Domain", value: issuer.org_domain, mono: true },
                { label: "Email", value: user.email ?? "—", mono: false },
              ].map(({ label, value, mono }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-muted-foreground w-24 shrink-0">
                    {label}
                  </span>
                  {mono ? (
                    <code className="text-xs bg-muted px-2.5 py-1 rounded-lg font-mono text-foreground">
                      {value}
                    </code>
                  ) : (
                    <span className="text-sm font-medium text-foreground text-right">
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Logo */}
        <LogoUploader issuer={issuer} />

        {/* Signature */}
        <SignatureUploader issuer={issuer} />
      </div>
    </div>
  );
}
