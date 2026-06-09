import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/report/new", label: "Submit" },
  { href: "/dashboard", label: "Dashboard" }
];

export function Navbar() {
  return (
    <header className="panel sticky top-4 z-20 px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">
            CL
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-ink/45">
              Civic infrastructure
            </p>
            <p className="text-lg font-semibold tracking-tight text-ink">
              CivicLens
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/72 transition hover:bg-ink/5 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
