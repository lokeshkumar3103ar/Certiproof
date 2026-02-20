"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";

export function NavAuthSection({ user }: { user: User | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (user) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="hidden lg:inline text-xs text-muted-foreground max-w-[160px] truncate">
          {user.email}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-foreground/60 hover:text-foreground hover:bg-muted transition-all"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button size="sm" className="rounded-lg btn-primary-shine">
        Sign In
      </Button>
    </Link>
  );
}
