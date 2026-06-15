"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ClipboardCheck,
  Copy,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  normalizeSupabaseReport,
  reportSelect,
  type CivicReport
} from "@/lib/reports";

export default function ReportResultPage({
  params
}: {
  params: { id: string };
}) {
  return (
    <AuthGate allowedRoles={["citizen", "agency", "admin"]}>
      <ReportResult reportId={params.id} />
    </AuthGate>
  );
}

function ReportResult({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<CivicReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadReport() {
      setIsLoading(true);
      setMessage(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("reports")
          .select(reportSelect)
          .eq("id", reportId)
          .single();

        if (error) {
          throw error;
        }

        if (isActive) {
          setReport(normalizeSupabaseReport(data));
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error ? error.message : "Unable to load this report."
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
      <div className="mx-auto max-w-4xl px-6 py-20 text-sm text-slate-500">
        Loading report result...
      </div>
    );
  }

  if (message || !report) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Report not found</h1>
        <p className="mt-3 text-sm text-slate-500">
          {message ?? "Unable to load this report."}
        </p>
        <Link href="/report" className="mt-4 inline-block text-primary underline">
          Submit another report
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-9">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold text-slate-400">
            Report ID: {report.id}
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-ink">
            Report submitted
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <SeverityBadge severity={report.severity} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-[10px] border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/report"
            className="inline-flex items-center rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Submit Another Report
          </Link>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {report.mediaType === "video" ? (
              <video src={report.media} className="h-80 w-full object-cover" controls />
            ) : (
              <img src={report.media} alt={report.title} className="h-80 w-full object-cover" />
            )}
          </div>

          <Card>
            <h2 className="mb-2 text-base font-bold text-ink">Description</h2>
            <p className="text-[15px] leading-relaxed text-slate-700">{report.desc}</p>
          </Card>

          <Card>
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-ink">
              <Sparkles className="h-4 w-4 text-primary" />
              AI summary / generated maintenance report
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-700">{report.summary}</p>
          </Card>

          <Card>
            <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-ink">
              <ClipboardCheck className="h-4 w-4 text-[#8A4D1E]" />
              Recommended action
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-700">{report.action}</p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <div className="space-y-4">
              <Fact icon={MapPin} label="Location" value={report.location} />
              <Fact icon={Tag} label="Issue type" value={report.issueType} />
              <Fact icon={ShieldCheck} label="Authenticity score" value={`${report.auth}%`} />
              <Fact icon={Copy} label="Duplicate count" value={String(report.dupes)} />
              <Fact icon={Activity} label="Congestion / Location Impact" value={report.congestion} />
              <Fact icon={Gauge} label="Priority score" value={`${report.priority} / 100`} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">{children}</div>;
}

function Fact({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 flex-none text-slate-400" />
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-medium text-ink">{value}</div>
      </div>
    </div>
  );
}
