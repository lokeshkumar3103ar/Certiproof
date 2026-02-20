import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  FileCheck,
  Link2,
  ArrowRight,
  Lock,
  Globe,
  Fingerprint,
  CheckCircle2,
  Zap,
  ChevronRight,
} from "lucide-react";

/* ─── tiny inline helpers (no extra deps) ─── */
function GradientOrb({ className }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 ${className}`}
    />
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
      {n}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ════════════ HERO ════════════ */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#f0f4ff] via-[#fafaf9] to-[#fff8ee] py-24 sm:py-32 lg:py-40">
        {/* ambient orbs */}
        <GradientOrb className="left-[-10%] top-[-5%] h-[520px] w-[520px] bg-primary/25" />
        <GradientOrb className="right-[-8%] bottom-[-10%] h-[400px] w-[400px] bg-accent/30" />
        {/* subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(58,91,142,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(58,91,142,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:gap-16">
            {/* left copy */}
            <div className="flex-1 max-w-2xl">
              <Badge
                variant="secondary"
                className="mb-6 gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
              >
                <Zap className="h-3 w-3" />
                Polygon Amoy Testnet
              </Badge>

              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.05]">
                Certificate
                <br />
                verification
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary via-[#2e4a78] to-primary bg-clip-text text-transparent">
                    you can trust.
                  </span>
                  {/* underline accent */}
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-accent via-accent/70 to-transparent"
                  />
                </span>
              </h1>

              <p className="mt-7 text-lg text-muted-foreground leading-relaxed max-w-xl">
                Issue digitally signed certificates anchored on blockchain.
                Verify authenticity in seconds with cryptographic proof&nbsp;—
                not trust in a website.
              </p>

              {/* trust signals */}
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  "SHA-256 hashed",
                  "On-chain registry",
                  "Tamper-evident",
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary/70" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/verify">
                  <Button
                    size="lg"
                    className="btn-primary-shine w-full sm:w-auto gap-2 rounded-full px-7 text-base font-semibold transition-transform"
                  >
                    <Search className="h-4 w-4" />
                    Verify a Certificate
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto gap-2 rounded-full border-primary/30 px-7 text-base font-semibold hover:border-primary hover:bg-primary/5"
                  >
                    Issuer Portal
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* right — decorative certificate card */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="relative w-[340px]">
                {/* glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
                <div className="relative rounded-2xl border border-primary/15 bg-white/80 p-8 shadow-[0_20px_60px_rgba(58,91,142,0.15)] backdrop-blur-sm">
                  {/* mock cert top */}
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Certitrust
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        Verified Certificate
                      </p>
                    </div>
                    <span className="ml-auto inline-flex h-6 items-center rounded-full bg-emerald-50 px-2.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-200">
                      ✓ Valid
                    </span>
                  </div>
                  {/* mock lines */}
                  {["Recipient Name", "Course / Program", "Issue Date", "Certificate ID"].map((label, i) => (
                    <div key={label} className="mb-4">
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                        {label}
                      </p>
                      <div
                        className={`h-2.5 rounded-full bg-muted ${i === 0 ? "w-3/4" : i === 1 ? "w-2/3" : i === 2 ? "w-1/2" : "w-full"}`}
                      />
                    </div>
                  ))}
                  {/* hash row */}
                  <div className="mt-5 rounded-lg border border-primary/10 bg-primary/[0.03] p-3">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">
                      Blockchain Hash
                    </p>
                    <p className="font-mono text-[10px] text-primary/80 break-all leading-relaxed">
                      0x3a5b8e…f4c2d1e9
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════ STATS STRIP ════════════ */}
      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
            {[
              { value: "SHA-256", label: "Hash Algorithm" },
              { value: "Polygon", label: "Blockchain Network" },
              { value: "< 2 s", label: "Verification Speed" },
              { value: "100%", label: "Tamper Evidence" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center py-8 px-4 text-center">
                <span className="text-2xl font-extrabold text-primary sm:text-3xl">
                  {value}
                </span>
                <span className="mt-1 text-xs text-muted-foreground uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ PROBLEM STATEMENT ════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 rounded-full border border-destructive/20 bg-destructive/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-destructive"
            >
              The Problem
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight">
              Why current systems fail
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              QR codes on certificates link to centralized databases. Copy the
              UI, change the URL, and you have a convincing fake — there is no
              independent source of truth.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Link2,
                title: "Spoofable QR Codes",
                desc: "QR codes point to URLs. Clone the website, change the link, and the QR verifies against a fake database.",
              },
              {
                icon: Globe,
                title: "Single Point of Failure",
                desc: "Server goes down, verification fails. Centralized databases create fragile, unreliable trust chains.",
              },
              {
                icon: Shield,
                title: "No Cryptographic Proof",
                desc: "Visual inspection and watermarks can be replicated. Without digital signatures, authenticity is just an assumption.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-destructive/10 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-[0_8px_32px_rgba(220,38,38,0.08)] hover:-translate-y-0.5"
              >
                {/* corner accent */}
                <span className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-destructive/[0.04] transition-all duration-300 group-hover:bg-destructive/[0.08]" />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/15">
                  <Icon className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ HOW IT WORKS ════════════ */}
      <section className="relative isolate overflow-hidden py-24 sm:py-32">
        {/* background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(58,91,142,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge
              variant="secondary"
              className="mb-4 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"
            >
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl leading-tight">
              Three layers of trust
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We move verification from &ldquo;trust this website&rdquo; to
              &ldquo;trust the blockchain registry.&rdquo;
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                n: 1,
                icon: Fingerprint,
                title: "Cryptographic Hash",
                desc: "Every certificate gets a unique SHA-256 hash computed from its metadata. Any modification — even a single character — produces a completely different hash.",
              },
              {
                n: 2,
                icon: Lock,
                title: "On-Chain Registry",
                desc: "The hash is recorded on Polygon's blockchain via a smart contract. The issuer's wallet address is permanently linked to each hash. No one can insert a hash without the issuer's private key.",
              },
              {
                n: 3,
                icon: FileCheck,
                title: "Independent Verification",
                desc: "Anyone can verify by checking the hash against the on-chain registry. Even if this entire website is cloned, the Polygonscan link proves whether the hash exists in the real contract.",
              },
            ].map(({ n, icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-primary/10 bg-white/70 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-[0_8px_40px_rgba(58,91,142,0.12)] hover:-translate-y-1"
              >
                {/* top row */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/15 transition-all group-hover:from-primary/25 group-hover:to-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <StepBadge n={n} />
                </div>
                <h3 className="mb-3 text-base font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
                {/* bottom progress line */}
                <div className="mt-6 h-0.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/40 transition-all duration-500 group-hover:w-full"
                    style={{ width: `${n * 33}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════ CTA ════════════ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#2e4a78] to-[#1a3060] px-8 py-16 text-center shadow-[0_24px_80px_rgba(58,91,142,0.35)] sm:px-16">
            {/* orbs */}
            <GradientOrb className="left-[-5%] top-[-20%] h-72 w-72 bg-white/10" />
            <GradientOrb className="right-[-5%] bottom-[-20%] h-72 w-72 bg-accent/20" />
            {/* grid */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative">
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
                <Zap className="h-3 w-3" /> Free &amp; Open Source
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl leading-tight">
                Ready to verify a certificate?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/70 leading-relaxed">
                Enter a certificate hash or scan the QR code to check
                authenticity instantly — no account required.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link href="/verify">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full bg-white px-8 text-base font-bold text-primary shadow-lg hover:bg-white/95 hover:shadow-xl hover:-translate-y-px transition-all"
                  >
                    <Search className="h-4 w-4" />
                    Verify Now
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="gap-2 rounded-full border border-white/25 px-8 text-base font-semibold text-white hover:border-white/50 hover:bg-white/10"
                  >
                    Issuer Portal
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
