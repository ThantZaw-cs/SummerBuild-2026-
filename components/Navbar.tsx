"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  PlusCircle,
  Shield,
  User,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ensureUserProfile, fetchUserProfile } from "@/lib/auth";
import type { UserRole } from "@/lib/reports";

const links = [
  { label: "Map", href: "/map", icon: MapPin, roles: ["agency", "admin"] },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["agency", "admin"] },
  { label: "My Reports", href: "/my-reports", icon: FileText, roles: ["citizen", "agency", "admin"] },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let isActive = true;
    const supabase = getSupabaseBrowserClient();
    const timeoutId = window.setTimeout(() => {
      if (isActive) {
        console.error("Navbar auth check timed out.");
        setRole(null);
      }
    }, 5000);

    async function loadRole() {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (!isActive) {
          return;
        }

        if (sessionError) {
          console.error("Navbar session fetch failed:", sessionError);
          setRole(null);
          return;
        }

        if (!sessionData.session) {
          setRole(null);
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (!isActive) {
          return;
        }

        if (userError || !userData.user) {
          console.error("Navbar user fetch failed:", userError);
          setRole(null);
          return;
        }

        let profile = await fetchUserProfile(supabase, userData.user.id);

        if (!profile) {
          await ensureUserProfile(supabase, userData.user);
          profile = await fetchUserProfile(supabase, userData.user.id);
        }

        if (isActive) {
          setRole(profile?.role ?? "citizen");
        }
      } catch (error) {
        console.error("Unable to resolve navbar auth state:", error);
        setRole(null);
      } finally {
        window.clearTimeout(timeoutId);
      }
    }

    loadRole();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setRole(null);
        return;
      }

      window.setTimeout(() => {
        if (!isActive) {
          return;
        }

        loadRole();
      }, 0);
    });

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink">
            CivicLens
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links
            .filter((link) => role && link.roles.includes(role))
            .map(({ label, href, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary-soft text-primary-dark"
                    : "text-slate-500 hover:bg-slate-100 hover:text-ink"
                }`}
              >
                <Icon className="h-[15px] w-[15px]" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {role ? (
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
          {role ? (
            <Link
              href="/submit"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              <PlusCircle className="h-4 w-4" />
              Report Issue
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
