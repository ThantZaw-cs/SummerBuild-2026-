"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Copy,
  FileText,
  MapPin,
  MessageSquare,
  Route,
  ScanSearch,
  ShieldCheck,
  User,
  Wrench
} from "lucide-react";
import { useEffect, useState } from "react";
import { PriorityScore } from "@/components/PriorityScore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { Severity } from "@/lib/reports";

type SavedReport = {
  id: string;
  short_description: string;
  location_text: string;
  media_url: string | null;
  issue_type: string | null;
  severity: Severity;
  authenticity_score: number;
  ai_summary: string | null;
  recommended_action: string | null;
  priority_score: number;
  status: string;
  created_at: string;
};

type SupabaseReportDetailsProps = {
  reportId: string;
};

export function SupabaseReportDetails({ reportId }: SupabaseReportDetailsProps) {
  const [report, setReport] = useState<SavedReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadReport() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("reports")
          .select(
            "id, short_description, location_text, media_url, issue_type, severity, authenticity_score, ai_summary, recommended_action, priority_score, status, created_at"
          )
          .eq("id", reportId)
          .single();

        if (error) {
          throw error;
        }

        if (isActive) {
          setReport(data as SavedReport);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this report from Supabase."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isActive = false;
    };
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading report...</p>
        </section>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Report details
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">
            Unable to load report
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            {errorMessage ??
              "This report could not be found or is not available to the current user."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Back to dashboard
          </Link>
        </section>
      </div>
    );
  }

  const title = report.issue_type ?? "Submitted infrastructure report";
  const createdAt = new Date(report.created_at).toLocaleDateString();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{report.id}</p>
          <h1 className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {report.location_text}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={report.severity} size="md" />
          <StatusBadge status={report.status} size="md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-border">
            {report.media_url ? (
              <img
                src={report.media_url}
                alt={title}
                className="h-64 w-full object-cover sm:h-80"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-muted text-sm text-muted-foreground sm:h-80">
                Image storage is not connected yet.
              </div>
            )}
          </div>

          <section className="rounded-xl border border-border bg-white shadow-sm">
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Citizen report
                </span>
                <span className="text-xs text-muted-foreground">{createdAt}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {report.short_description}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white shadow-sm">
            <div className="px-5 pt-5">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <ScanSearch className="h-3.5 w-3.5 text-primary" />
                </span>
                AI Analysis
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <AnalysisCard
                  label="Issue Type"
                  value={report.issue_type ?? "Pending"}
                  icon={<ScanSearch className="h-3.5 w-3.5" />}
                />
                <AnalysisCard
                  label="Authenticity"
                  value={`${report.authenticity_score}%`}
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                />
                <AnalysisCard
                  label="Duplicates"
                  value="0"
                  icon={<Copy className="h-3.5 w-3.5" />}
                />
                <AnalysisCard
                  label="Congestion Impact"
                  value="Pending"
                  icon={<Route className="h-3.5 w-3.5" />}
                />
              </div>
            </div>
          </section>

          <InfoCard
            icon={<FileText className="h-3.5 w-3.5 text-primary" />}
            iconClassName="bg-primary/10"
            label="Generated Maintenance Report"
            text={report.ai_summary ?? "Pending AI summary."}
          />

          <InfoCard
            icon={<Wrench className="h-3.5 w-3.5 text-teal-600" />}
            iconClassName="bg-teal-50"
            label="Recommended Action"
            text={report.recommended_action ?? "Pending recommended action."}
          />
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-white shadow-sm">
            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Priority Score
                </p>
                <PriorityScore score={report.priority_score} size="lg" />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Status
                </p>
                <StatusBadge status={report.status} size="md" />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white shadow-sm">
            <div className="px-5 pt-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                Internal Notes
              </h2>
            </div>
            <div className="p-5">
              <textarea
                placeholder="Add a note..."
                className="h-20 w-full resize-none rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
              <button className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground">
                Add Note
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white shadow-sm">
            <div className="px-5 pt-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Activity Log
              </h2>
            </div>
            <div className="space-y-4 p-5">
              {[
                "Report saved to Supabase",
                "AI analysis pending Reka integration",
                "Awaiting agency review"
              ].map((note) => (
                <div key={note} className="relative pl-5">
                  <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-border bg-white" />
                  <p className="text-xs font-medium text-foreground">System</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AnalysisCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-1 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function InfoCard({
  icon,
  iconClassName,
  label,
  text
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  text: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-white shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
