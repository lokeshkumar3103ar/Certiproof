"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon } from "lucide-react";

interface IssuerProfile {
  org_name: string;
}

export function NavAuthSection({ user }: { user: User | null }) {
  const router = useRouter();
  const [issuer, setIssuer] = useState<IssuerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchIssuerProfile();
    }
  }, [user, isOpen]);

  const fetchIssuerProfile = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("issuers")
        .select("org_name")
        .eq("id", user?.id)
        .single();

      if (!error) {
        setIssuer(data as IssuerProfile);
      }
    } catch (err) {
      console.error("Error fetching issuer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (user) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-all"
            title="Profile"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-semibold">
            Profile Information
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-2 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Email Address
              </p>
              <p className="text-sm text-foreground break-all">{user.email}</p>
            </div>
            {issuer && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Institution Name
                </p>
                <p className="text-sm text-foreground">{issuer.org_name}</p>
              </div>
            )}
            {loading && (
              <p className="text-xs text-muted-foreground">Loading...</p>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-foreground/70 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
