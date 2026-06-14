"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Shield,
  User,
} from "lucide-react";

const links = [
  { label: "Home", href: "/", icon: Shield },
  { label: "Report", href: "/report", icon: PlusCircle },
  { label: "Map", href: "/map", icon: MapPin },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Reports", href: "/my-reports", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();

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
          {links.map(({ label, href, icon: Icon }) => {
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
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
          <Link
            href="/report"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            <PlusCircle className="h-4 w-4" />
            Report Issue
          </Link>
        </div>
      </div>
    </header>
  );
}
