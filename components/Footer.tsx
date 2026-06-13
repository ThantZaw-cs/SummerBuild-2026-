import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="font-heading text-sm font-semibold text-foreground">
              CivicLens
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            SummerBuild 2026 / AI-Powered Civic Infrastructure Reporting
          </p>
        </div>
      </div>
    </footer>
  );
}
