"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Loader2,
  Lock,
  Fingerprint,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { loginAction, signupAction } from "./actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleSignup(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await signupAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid lg:grid-cols-2">
      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-primary via-[#2e4a78] to-[#1a3060] p-12">
        {/* grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* orbs */}
        <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

        {/* brand mark */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Certitrust
          </span>
        </div>

        {/* feature list */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold text-white leading-snug">
            Blockchain-anchored
            <br />
            certificate issuance
          </h2>
          <ul className="space-y-4">
            {[
              { icon: Fingerprint, label: "SHA-256 cryptographic hashing" },
              { icon: Lock, label: "Polygon on-chain registry" },
              { icon: FileCheck, label: "Independent, trustless verification" },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-white/80" />
                </div>
                <span className="text-white/80 text-sm">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* footer quote */}
        <p className="relative text-xs text-white/40 leading-relaxed max-w-xs">
          Certificates issued here carry a permanent, immutable proof that no
          cloned website can forge.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex items-center justify-center px-6 py-14 bg-[#fafaf9]">
        <div className="w-full max-w-sm">
          {/* mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground text-lg">
              Certitrust
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Issuer Portal
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Sign in or create an account to manage certificates.
          </p>

          {error && (
            <div className="mb-6 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 rotate-45 text-destructive" />
              {error}
            </div>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-7 rounded-xl bg-muted p-1 h-10">
              <TabsTrigger value="login" className="rounded-lg text-sm font-semibold">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg text-sm font-semibold">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form action={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="admin@university.edu"
                    required
                    className="h-10 rounded-lg border-border bg-white focus-visible:ring-primary/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    required
                    className="h-10 rounded-lg border-border bg-white focus-visible:ring-primary/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="btn-primary-shine w-full h-10 rounded-lg font-semibold mt-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form action={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-orgName" className="text-sm font-medium">
                    Organization Name
                  </Label>
                  <Input
                    id="signup-orgName"
                    name="orgName"
                    placeholder="Indian Institute of Technology Delhi"
                    required
                    className="h-10 rounded-lg border-border bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-orgDomain" className="text-sm font-medium">
                    Domain
                  </Label>
                  <Input
                    id="signup-orgDomain"
                    name="orgDomain"
                    placeholder="iitd.ac.in"
                    required
                    className="h-10 rounded-lg border-border bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="admin@iitd.ac.in"
                    required
                    className="h-10 rounded-lg border-border bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Min 8 chars"
                      required
                      className="h-10 rounded-lg border-border bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-confirmPassword"
                      className="text-sm font-medium"
                    >
                      Confirm
                    </Label>
                    <Input
                      id="signup-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat"
                      required
                      className="h-10 rounded-lg border-border bg-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="btn-primary-shine w-full h-10 rounded-lg font-semibold mt-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By signing up you agree that this is a testnet demo app.
          </p>
        </div>
      </div>
    </div>
  );
}
