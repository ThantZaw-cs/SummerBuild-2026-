"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Inbox,
  Search,
  SearchX,
  Wrench,
} from "lucide-react";
import {
  reports,
  severityStyles,
  sortByPriority,
  type Severity,
  type Status,
} from "@/lib/data";
import { SeverityBadge, StatusBadge, PriorityBar } from "@/components/Badges";

const STAT_CARDS = [
  { label: "Total reports", value: "1,247", sub: "+38 today", icon: Inbox, color: "bg-primary-soft text-primary" },
  { label: "Critical / High", value: "47", sub: "needs attention", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  { label: "In progress", value: "156", sub: "being worked", icon: Wrench, color: "bg-amber-50 text-amber-600" },
  { label: "Resolved", value: "891", sub: "2.3d avg", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
];

const SEV_FILTERS: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];
const STATUS_FILTERS: (Status | "All")[] = ["All", "Pending Review", "Verified", "In Progress", "Resolved"];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [sev, setSev] = useState<Severity | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");

  const rows = useMemo(() => {
    let list = sortByPriority(reports);
    if (sev !== "All") list = list.filter((r) => r.severity === sev);
    if (status !== "All") list = list.filter((r) => r.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) =>
        `${r.title} ${r.location} ${r.issueType} ${r.id}`.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query, sev, status]);

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
      active ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
    }`;

  const GRID = "grid-cols-[104px_1fr_168px_104px_124px_128px_26px]";

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Agency dashboard</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Every citizen report, triaged and ranked by priority.</p>
        </div>
        <div className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 py-2 text-[13px] text-slate-500">
          <span className="h-[7px] w-[7px] animate-pulseSoft rounded-full bg-emerald-500" />
          Live · updated just now
        </div>
      </div>

      {/* Stats */}
      <div className="mb-[22px] grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-[15px] border border-line bg-white p-[18px] shadow-sm">
              <div className="flex items-center justify-between">
                <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] ${c.color}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-xs font-semibold text-slate-400">{c.sub}</span>
              </div>
              <div className="mt-3.5 text-[30px] font-extrabold tracking-tight text-ink">{c.value}</div>
              <div className="mt-0.5 text-[13px] text-slate-500">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-3.5 border-b border-line p-[18px]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-[280px] max-w-[380px] flex-1 items-center gap-2.5 rounded-[10px] border border-slate-300 px-3.5">
              <Search className="h-[17px] w-[17px] text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by type, location or ID…" className="flex-1 bg-transparent py-2.5 text-sm text-ink outline-none placeholder:text-slate-400" />
            </div>
            <span className="text-[13px] font-medium text-slate-500">{rows.length} reports</span>
          </div>
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Severity</span>
              {SEV_FILTERS.map((s) => (
                <button key={s} onClick={() => setSev(s)} className={chip(sev === s)}>{s}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
              {STATUS_FILTERS.map((s) => (
                <button key={s} onClick={() => setStatus(s)} className={chip(status === s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Header row */}
        <div className={`grid ${GRID} gap-3.5 border-b border-line bg-[#FBFCFD] px-5 py-3 text-[11.5px] font-bold uppercase tracking-wider text-slate-400`}>
          <span>ID</span><span>Issue</span><span>Location</span><span>Severity</span><span>Status</span><span>Priority</span><span />
        </div>

        {rows.length > 0 ? (
          rows.map((r) => (
            <Link key={r.id} href={`/reports/${r.id}`} className={`grid ${GRID} items-center gap-3.5 border-b border-slate-100 px-5 py-3.5 transition-colors hover:bg-[#FBFCFD]`}>
              <span className="font-mono text-[12.5px] text-slate-500">{r.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-[14.5px] font-semibold text-ink">{r.title}</span>
                <span className="mt-px block text-[12.5px] text-slate-400">{r.issueType}</span>
              </span>
              <span className="truncate text-[13px] text-slate-500">{r.location}</span>
              <span><SeverityBadge severity={r.severity} /></span>
              <span><StatusBadge status={r.status} /></span>
              <PriorityBar value={r.priority} dotClass={severityStyles[r.severity].dot} />
              <span className="flex justify-end text-slate-300"><ChevronRight className="h-[18px] w-[18px]" /></span>
            </Link>
          ))
        ) : (
          <div className="px-5 py-16 text-center">
            <span className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <SearchX className="h-[22px] w-[22px]" />
            </span>
            <p className="text-[15px] font-semibold text-ink">No reports match these filters</p>
            <p className="mt-1 text-[13.5px] text-slate-400">Try clearing the search or choosing a different severity.</p>
          </div>
        )}
      </div>
    </div>
  );
}
