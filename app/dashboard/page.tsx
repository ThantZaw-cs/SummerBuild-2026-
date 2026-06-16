"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Search,
  SearchX,
  Sparkles,
  Wrench
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SeverityBadge, StatusBadge, PriorityBar } from "@/components/Badges";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  normalizeSupabaseReport,
  reportSelect,
  severityStyles,
  severityToDisplay,
  sortByPriority,
  STATUS_ORDER,
  type CivicReport,
  type DisplayStatus,
  type Severity
} from "@/lib/reports";

const SEV_FILTERS: (Severity | "All")[] = ["All", "critical", "high", "medium", "low"];
const STATUS_FILTERS: (DisplayStatus | "All")[] = ["All", ...STATUS_ORDER];

export default function DashboardPage() {
  return (
    <AuthGate allowedRoles={["agency", "admin"]}>
      <DashboardContent />
    </AuthGate>
  );
}

function DashboardContent() {
  const [query, setQuery] = useState("");
  const [sev, setSev] = useState<Severity | "All">("All");
  const [status, setStatus] = useState<DisplayStatus | "All">("All");
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzingPending, setIsAnalyzingPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setMessage(null);

      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Please log in to view the dashboard.");
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const canReadAll = profile?.role === "agency" || profile?.role === "admin";
        let builder = supabase
          .from("reports")
          .select(reportSelect)
          .order("priority_score", { ascending: false })
          .order("created_at", { ascending: false });

        if (!canReadAll) {
          builder = builder.eq("user_id", user.id);
        }

        const { data, error } = await builder;

        if (error) {
          throw error;
        }

        if (isActive) {
          setReports(sortByPriority((data ?? []).map(normalizeSupabaseReport)));
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error ? error.message : "Unable to load reports."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      isActive = false;
    };
  }, [reloadToken]);

  const rows = useMemo(() => {
    let list = sortByPriority(reports);
    if (sev !== "All") list = list.filter((r) => r.severity === sev);
    if (status !== "All") list = list.filter((r) => r.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        `${r.title} ${r.location} ${r.issueType} ${r.id}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, reports, sev, status]);

  const active = reports.filter((item) => item.status !== "Resolved").length;
  const criticalOrHigh = reports.filter(
    (item) => item.severity === "critical" || item.severity === "high"
  ).length;
  const inProgress = reports.filter((item) => item.status === "In Progress").length;
  const resolved = reports.filter((item) => item.status === "Resolved").length;
  const pendingReview = reports.filter((item) => item.status === "Pending Review").length;

  const statCards = [
    { label: "Total reports", value: String(reports.length), sub: `${active} active`, icon: Inbox, color: "bg-primary-soft text-primary" },
    { label: "Critical / High", value: String(criticalOrHigh), sub: "needs attention", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    { label: "In progress", value: String(inProgress), sub: "being worked", icon: Wrench, color: "bg-amber-50 text-amber-600" },
    { label: "Resolved", value: String(resolved), sub: "completed", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" }
  ];

  const chip = (activeChip: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
      activeChip ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
    }`;

  const GRID = "grid-cols-[104px_1fr_168px_104px_124px_128px_26px]";

  async function analyzePendingReports() {
    setIsAnalyzingPending(true);
    setBulkMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Your session expired. Please log in again.");
      }

      const response = await fetch("/api/reports/analyze-pending", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const payload = (await response.json()) as {
        total?: number;
        analyzed?: number;
        failed?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to analyze pending reports.");
      }

      setBulkMessage(
        payload.total === 0
          ? "No pending reports need AI analysis."
          : `AI analyzed ${payload.analyzed ?? 0} of ${payload.total} pending report${
              payload.total === 1 ? "" : "s"
            }${payload.failed ? `; ${payload.failed} failed` : ""}.`
      );
      setReloadToken((value) => value + 1);
    } catch (error) {
      setBulkMessage(
        error instanceof Error
          ? error.message
          : "Unable to analyze pending reports."
      );
    } finally {
      setIsAnalyzingPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Agency dashboard</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Every citizen report, triaged and ranked by priority.</p>
        </div>
        <button
          type="button"
          onClick={analyzePendingReports}
          disabled={isAnalyzingPending || pendingReview === 0}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Sparkles className="h-4 w-4" />
          {isAnalyzingPending ? "Analyzing pending..." : `Analyze pending (${pendingReview})`}
        </button>
        <div className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px] text-slate-500">
          <span className="h-[7px] w-[7px] animate-pulseSoft rounded-full bg-emerald-500" />
          Live · Supabase
        </div>
      </div>

      {bulkMessage ? (
        <div className="mb-4 rounded-[12px] border border-line bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          {bulkMessage}
        </div>
      ) : null}

      <div className="mb-[22px] grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[15px] border border-line bg-white p-[18px] shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${card.color}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-xs font-semibold text-slate-400">{card.sub}</span>
              </div>
              <div className="mt-3.5 text-[30px] font-extrabold tracking-tight text-ink">{card.value}</div>
              <div className="mt-0.5 text-[13px] text-slate-500">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-3.5 border-b border-line p-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-[280px] max-w-[380px] flex-1 items-center gap-2.5 rounded-[10px] border border-slate-300 px-3.5">
              <Search className="h-[17px] w-[17px] text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by type, location or ID..." className="flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-slate-400" />
            </div>
            <span className="text-[13px] font-medium text-slate-500">{rows.length} reports</span>
          </div>
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Severity</span>
              {SEV_FILTERS.map((value) => (
                <button key={value} onClick={() => setSev(value)} className={chip(sev === value)}>
                  {value === "All" ? value : severityToDisplay[value]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
              {STATUS_FILTERS.map((value) => (
                <button key={value} onClick={() => setStatus(value)} className={chip(status === value)}>{value}</button>
              ))}
            </div>
          </div>
        </div>

        <div className={`grid ${GRID} gap-3.5 border-b border-line bg-[#FBFCFD] px-5 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-400`}>
          <span>ID</span><span>Issue</span><span>Location</span><span>Severity</span><span>Status</span><span>Priority</span><span />
        </div>

        {isLoading ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">Loading reports...</div>
        ) : message ? (
          <div className="px-5 py-16 text-center text-sm text-red-600">{message}</div>
        ) : rows.length > 0 ? (
          rows.map((report) => (
            <Link key={report.id} href={`/report/${report.id}`} className={`grid ${GRID} items-center gap-3.5 border-b border-slate-100 px-5 py-3.5 transition-colors hover:bg-[#FBFCFD]`}>
              <span className="truncate font-mono text-[12.5px] text-slate-500">{report.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold text-ink">{report.title}</span>
                <span className="mt-px block text-[12.5px] text-slate-400">{report.issueType}</span>
              </span>
              <span className="truncate text-[13px] text-slate-500">{report.location}</span>
              <span><SeverityBadge severity={report.severity} /></span>
              <span><StatusBadge status={report.status} /></span>
              <PriorityBar value={report.priority} dotClass={severityStyles[report.severity].dot} />
              <span className="flex justify-end text-slate-300"><ChevronRight className="h-[18px] w-[18px]" /></span>
            </Link>
          ))
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <SearchX className="h-[22px] w-[22px]" />
            </span>
            <p className="text-[15px] font-semibold text-ink">No reports match these filters</p>
            <p className="mt-1 text-[13.5px] text-slate-400">Try clearing the search or submitting a new report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
