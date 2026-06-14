import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary text-white">
            <Shield className="h-4 w-4" />
          </span>
          <span className="text-base font-extrabold text-white">CivicLens</span>
          <span className="ml-1.5 text-[13px] text-white/50">
            Civic infrastructure reporting
          </span>
        </div>
        <nav className="flex gap-6 text-[13.5px] font-medium">
          <Link href="/report" className="hover:text-white">Report</Link>
          <Link href="/map" className="hover:text-white">Map</Link>
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/my-reports" className="hover:text-white">My Reports</Link>
        </nav>
        <div className="text-[12.5px] text-white/45">
          © 2026 CivicLens · SummerBuild prototype
        </div>
      </div>
    </footer>
  );
}
