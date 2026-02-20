import { Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Shield className="h-5 w-5" strokeWidth={2.25} />
              <span>Certitrust</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Cryptographically secure certificate issuance and verification
              platform with blockchain-anchored proof of authenticity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="/verify"
                    className="hover:text-primary transition-colors"
                  >
                    Verify Certificate
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Issuer Login
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Architecture</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>SHA-256 + ECDSA Signing</li>
                <li>Polygon Amoy Testnet</li>
                <li>DigiLocker-Compatible</li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>Built for Hackathonix&apos;26. Not for production use.</p>
          <p>
            Verification powered by Polygon Amoy Testnet (Chain ID: 80002)
          </p>
        </div>
      </div>
    </footer>
  );
}
