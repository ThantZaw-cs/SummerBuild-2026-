"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera,
  ClipboardCheck,
  Clock,
  Copy,
  Cpu,
  Gauge,
  Layers,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import {
  formatDate,
  formatDateTime,
  getReport,
  severityStyles,
  statusStyles,
  STATUS_ORDER,
  type ReportNote,
  type Status,
} from "@/lib/data";
import { SeverityBadge } from "@/components/Badges";

export default function ReportDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const report = getReport(params.id);
  const [status, setStatus] = useState<Status | null>(null);
  const [extra, setExtra] = useState<ReportNote[]>([]);
  const [draft, setDraft] = useState("");

  if (!report) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Report not found</h1>
        <Link href="/dashboard" className="mt-4 inline-block text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const current = status ?? report.status;

  const analysis = [
    { label: "Authenticity", value: `${report.auth}%`, icon: ShieldCheck, hint: "AI confidence" },
    { label: "Duplicates", value: String(report.dupes), icon: Copy, hint: "merged nearby" },
    { label: "Congestion", value: report.congestion, icon: Activity, hint: "traffic impact" },
    { label: "Priority", value: String(report.priority), icon: Gauge, hint: "of 100" },
  ];

  const notes = useMemo(
    () => [...report.notes, ...extra].slice().reverse(),
    [report.notes, extra],
  );

  function changeStatus(s: Status) {
    if (s === current) return;
    setStatus(s);
    setExtra((prev) => [
      ...prev,
      { author: "You (Agency)", text: `Status changed to ${s}`, time: new Date().toISOString() },
    ]);
  }

  function addNote() {
    const t = draft.trim();
    if (!t) return;
    setExtra((prev) => [...prev, { author: "You (Agency)", text: t, time: new Date().toISOString() }]);
    setDraft("");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-20 pt-8">
      <Link href="/dashboard" className="mb-[18px] inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-[22px]">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="font-mono text-[13px] font-semibold text-slate-400">{report.id}</span>
          <SeverityBadge severity={report.severity} />
          <span className={`rounded-full px-3 py-[5px] text-[13px] font-bold ring-1 ring-inset ${statusStyles[current]}`}>{current}</span>
        </div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">{report.title}</h1>
        <div className="mt-2.5 flex flex-wrap gap-[18px] text-[13.5px] text-slate-500">
          <span className="inline-flex items-center gap-1.5"><User className="h-[15px] w-[15px] text-slate-400" />{report.by}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-[15px] w-[15px] text-slate-400" />{formatDate(report.at)}</span>
          <span className="inline-flex items-center gap-1.5"><Tag className="h-[15px] w-[15px] text-slate-400" />{report.category}</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="relative h-[380px] overflow-hidden rounded-2xl border border-line bg-[repeating-linear-gradient(135deg,#E4EAF0,#E4EAF0_10px,#EBF0F5_10px,#EBF0F5_20px)]">
            <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
              <Camera className="h-5 w-5" /> citizen photo
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={report.media} alt={report.title} className="relative h-full w-full object-cover" />
            <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
              <Camera className="h-3.5 w-3.5" /> Citizen photo · {report.issueType}
            </span>
          </div>

          <Card>
            <H2 icon={MessageSquare}>What the citizen reported</H2>
            <p className="text-[15.5px] leading-relaxed text-slate-700">{report.desc}</p>
          </Card>

          <Card>
            <h2 className="mb-1.5 flex items-center gap-2 text-base font-bold text-ink">
              <Sparkles className="h-[17px] w-[17px] text-primary" /> Automated analysis
            </h2>
            <p className="mb-[18px] text-[14.5px] leading-relaxed text-slate-500">{report.summary}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {analysis.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.label} className="rounded-xl border border-line bg-[#FBFCFD] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Icon className="h-3.5 w-3.5" /> {a.label}
                    </div>
                    <div className="mt-2 text-[22px] font-extrabold tracking-tight text-ink">{a.value}</div>
                    <div className="mt-px text-[11.5px] text-slate-400">{a.hint}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[12.5px] font-semibold text-slate-500">
                <span>Priority score</span><span className="text-ink">{report.priority} / 100</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${severityStyles[report.severity].dot}`} style={{ width: `${report.priority}%` }} />
              </div>
            </div>
          </Card>

          <div className="rounded-2xl border border-[#F0D7C3] bg-[#FCF6F1] p-6">
            <h2 className="mb-2.5 flex items-center gap-2 text-base font-bold text-[#8A4D1E]">
              <ClipboardCheck className="h-[17px] w-[17px]" /> Recommended action
            </h2>
            <p className="text-[15px] leading-relaxed text-[#7a5230]">{report.action}</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="mb-3.5 text-[15px] font-bold text-ink">Update status</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {STATUS_ORDER.map((s) => {
                const active = s === current;
                return (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className={`flex items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold transition ${
                      active ? `border-transparent ${statusStyles[s]}` : "border-line bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${severityStyles.Low.dot}`} style={{ background: dotFor(s) }} />
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
              Changing status notifies the citizen and is logged to the activity feed below.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3.5 text-[15px] font-bold text-ink">Details</h2>
            <div className="flex flex-col gap-3.5">
              <Fact icon={MapPin} label="Location" value={report.location} />
              <Fact icon={Layers} label="Category" value={report.category} />
              <Fact icon={User} label="Reported by" value={report.by} />
              <Fact icon={Clock} label="Submitted" value={formatDate(report.at)} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-[15px] font-bold text-ink">Activity</h2>
            <div className="mb-[18px] flex flex-col gap-4">
              {notes.map((n, i) => {
                const sys = n.author === "System";
                const Icon = sys ? Cpu : User;
                return (
                  <div key={i} className="flex gap-2.5">
                    <span className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full ${sys ? "bg-slate-100 text-slate-500" : "bg-primary-soft text-primary"}`}>
                      <Icon className="h-[15px] w-[15px]" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] leading-snug text-slate-700">{n.text}</div>
                      <div className="mt-0.5 text-[11.5px] text-slate-400">{n.author} · {formatDateTime(n.time)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line pt-3.5">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an internal note…" className="min-h-[64px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-slate-400" />
              <button onClick={addNote} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-ink py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0d3460]">
                <Plus className="h-[15px] w-[15px]" /> Add note
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function dotFor(s: Status) {
  const map: Record<Status, string> = {
    "Pending Review": "#94a3b8",
    Verified: "#3b82f6",
    "In Progress": "#14b8a6",
    Resolved: "#10b981",
    Rejected: "#ef4444",
  };
  return map[s];
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">{children}</div>;
}

function H2({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink">
      <Icon className="h-[17px] w-[17px] text-slate-400" /> {children}
    </h2>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
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
