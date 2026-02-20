import Link from "next/link";
import { Shield, LayoutDashboard, FilePlus, ShieldCheck, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavAuthSection } from "./nav-auth-section";
import { NavMobile } from "./nav-mobile";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="sticky top-0 z-50 px-4 pt-3 pb-1">
      <header className="w-full rounded-2xl border border-border/60 bg-white/90 backdrop-blur-md shadow-[0_2px_20px_rgba(58,91,142,0.08)] px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-bold text-base tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span>Certitrust</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium flex-wrap">
            <NavLink href="/verify" icon={<ShieldCheck className="h-3.5 w-3.5" />}>
              Verify
            </NavLink>
            {user && (
              <>
                <NavLink href="/dashboard" icon={<LayoutDashboard className="h-3.5 w-3.5" />}>
                  Dashboard
                </NavLink>
                <NavLink href="/issue" icon={<FilePlus className="h-3.5 w-3.5" />}>
                  Issue
                </NavLink>
                <NavLink href="/issue/bulk" icon={<span className="text-[10px] font-bold">CSV</span>}>
                  Bulk
                </NavLink>
                <NavLink href="/settings" icon={<Settings className="h-3.5 w-3.5" />}>
                  Settings
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <NavAuthSection user={user} />
            {/* Mobile menu */}
            <NavMobile user={user} />
          </div>
        </div>
      </header>
    </div>
  );
}

function NavLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-all duration-150 text-sm"
    >
      {icon}
      {children}
    </Link>
  );
}
