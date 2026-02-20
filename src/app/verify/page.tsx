"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function VerifyPage() {
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    router.push(`/verify/${encodeURIComponent(hash.trim())}`);
  }

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
          {/* icon */}
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Verify Certificate
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-md mx-auto">
            Enter a certificate hash to check its authenticity against the
            on-chain registry.{" "}
            <span className="text-foreground font-medium">
              No account required.
            </span>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-border bg-white shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                The hash is printed on the certificate and encoded in the QR
                code.
              </p>
            </div>
            <Button
              type="submit"
              className="btn-primary-shine w-full h-11 rounded-xl font-bold gap-2 text-base"
              disabled={loading || !hash.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Verify Certificate
                </>
              )}
            </Button>
          </form>
        </div>

        {/* How verification works */}
        <div className="mt-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-5 text-center">
            How verification works
          </p>
          <div className="space-y-3">
            {[
              {
                icon: Fingerprint,
                title: "Hash computed",
                desc: "The certificate data is hashed with SHA-256 to produce a unique fingerprint.",
              },
              {
                icon: Lock,
                title: "On-chain lookup",
                desc: "The hash is queried against the CertChain smart contract on Polygon Amoy.",
              },
              {
                icon: FileCheck,
                title: "Issuer confirmed",
                desc: "The result links the hash to the issuer's wallet address and timestamp.",
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
      </div>
    </div>
  );
}
