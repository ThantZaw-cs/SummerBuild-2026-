"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  PlusCircle,
  Shield,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", path: "/", icon: Shield },
  { label: "Report Issue", path: "/report", icon: PlusCircle },
  { label: "Map", path: "/map", icon: MapPin },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "My Reports", path: "/my-reports", icon: FileText }
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-foreground">
              CivicLens
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={`${link.label}-${link.path}`}
                  href={link.path}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <User className="mr-1.5 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Link href="/report">
              <Button size="sm" className="bg-primary text-white shadow-sm hover:bg-primary/90">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Report Issue
              </Button>
            </Link>
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                      <Shield className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-heading font-bold text-foreground">
                      CivicLens
                    </span>
                  </div>
                </div>
                <nav className="flex flex-col gap-1 p-3">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.path;
                    return (
                      <Link
                        key={`${link.label}-${link.path}`}
                        href={link.path}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto space-y-2 border-t p-4">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/report" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-primary text-white hover:bg-primary/90" size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
