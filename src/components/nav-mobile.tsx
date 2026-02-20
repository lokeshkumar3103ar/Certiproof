"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Shield, LayoutDashboard, FilePlus, ShieldCheck, Settings, LogOut, FileSpreadsheet } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function NavMobile({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed top-20 left-4 right-4 z-50 rounded-2xl border border-border bg-white shadow-[0_8px_40px_rgba(58,91,142,0.15)] p-4">
            <nav className="flex flex-col gap-1">
              <MobileLink href="/verify" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => setOpen(false)}>
                Verify Certificate
              </MobileLink>
              {user ? (
                <>
                  <MobileLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Dashboard
                  </MobileLink>
                  <MobileLink href="/issue" icon={<FilePlus className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Issue Certificate
                  </MobileLink>
                  <MobileLink href="/issue/bulk" icon={<FileSpreadsheet className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Bulk Issue
                  </MobileLink>
                  <MobileLink href="/settings" icon={<Settings className="h-4 w-4" />} onClick={() => setOpen(false)}>
                    Settings
                  </MobileLink>
                  <div className="border-t border-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <MobileLink href="/login" icon={<Shield className="h-4 w-4" />} onClick={() => setOpen(false)}>
                  Sign In
                </MobileLink>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

function MobileLink({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
    >
      <span className="text-primary">{icon}</span>
      {children}
    </Link>
  );
}
