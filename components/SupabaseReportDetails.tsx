"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/SeverityBadge";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import type { Severity } from "@/lib/mockReports";

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
      <section className="panel px-6 py-6">
        <p className="text-sm text-ink/65">Loading report...</p>
      </section>
    );
  }

  if (errorMessage || !report) {
    return (
      <section className="panel px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
          Report details
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Unable to load report
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink/72">
          {errorMessage ??
            "This report could not be found or is not available to the current user."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="panel overflow-hidden">
        <div className="h-72 bg-tide">
          {report.media_url ? (
            <img
              src={report.media_url}
              alt="Submitted infrastructure issue"
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
                Report details
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                {report.issue_type ?? "Submitted infrastructure report"}
              </h1>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                User description
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/72">
                {report.short_description}
              </p>
            </div>
            <SeverityBadge severity={report.severity} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Issue type"
              value={report.issue_type ?? "Pending AI review"}
            />
            <DetailCard label="Severity" value={report.severity} />
            <DetailCard label="Location" value={report.location_text} />
            <DetailCard
              label="Authenticity score"
              value={`${report.authenticity_score}/100`}
            />
            <DetailCard
              label="Priority score"
              value={`${report.priority_score}/100`}
            />
            <DetailCard label="Status" value={report.status} />
            <DetailCard
              label="Created"
              value={new Date(report.created_at).toLocaleDateString()}
            />
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            AI-generated maintenance report
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            {report.ai_summary ?? "Pending AI summary."}
          </p>
        </section>

        <section className="panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            Recommended action
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            {report.recommended_action ?? "Pending recommended action."}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Back to dashboard
          </Link>
        </section>
      </aside>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-medium capitalize text-ink">{value}</p>
    </div>
  );
}
