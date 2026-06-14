"use client";

import { useEffect, useMemo, useState } from "react";
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
  User
} from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SeverityBadge } from "@/components/Badges";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  displayToSupabaseStatus,
  formatDate,
  formatDateTime,
  normalizeSupabaseReport,
  reportSelect,
  severityStyles,
  statusStyles,
  STATUS_ORDER,
  type CivicReport,
  type DisplayStatus,
  type ReportNote
} from "@/lib/reports";

export default function ReportDetailPage({
  params
}: {
  params: { id: string };
}) {
  return (
    <AuthGate>
      <ReportDetail reportId={params.id} />
    </AuthGate>
  );
}

function ReportDetail({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<CivicReport | null>(null);
  const [status, setStatus] = useState<DisplayStatus | null>(null);
  const [extra, setExtra] = useState<ReportNote[]>([]);
  const [draft, setDraft] = useState("");
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

        const normalized = normalizeSupabaseReport(data);

        if (isActive) {
          setReport(normalized);
          setStatus(normalized.status);
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

  const notes = useMemo(
    () => [...(report?.notes ?? []), ...extra].slice().reverse(),
    [extra, report?.notes]
  );

  async function changeStatus(nextStatus: DisplayStatus) {
    if (!report || nextStatus === status) {
      return;
    }

    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("reports")
        .update({ status: displayToSupabaseStatus[nextStatus] })
        .eq("id", report.id);

      if (error) {
        throw error;
      }

      setStatus(nextStatus);
      setReport((current) => (current ? { ...current, status: nextStatus } : current));
      setExtra((prev) => [
        ...prev,
        {
          author: "You",
          text: `Status changed to ${nextStatus}`,
          time: new Date().toISOString()
        }
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update report status."
      );
    }
  }

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    setExtra((prev) => [...prev, { author: "You", text, time: new Date().toISOString() }]);
    setDraft("");
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-sm text-slate-500">
        Loading report...
      </div>
    );
  }

  if (message && !report) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Report not found</h1>
        <p className="mt-3 text-sm text-slate-500">{message}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-primary underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const current = status ?? report.status;
  const analysis = [
    { label: "Authenticity", value: `${report.auth}%`, icon: ShieldCheck, hint: "AI confidence" },
    { label: "Duplicates", value: String(report.dupes), icon: Copy, hint: "merged nearby" },
    { label: "Congestion", value: report.congestion, icon: Activity, hint: "traffic impact" },
    { label: "Priority", value: String(report.priority), icon: Gauge, hint: "of 100" }
  ];

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

      {message ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {message}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="relative h-[380px] overflow-hidden rounded-2xl border border-line bg-[repeating-linear-gradient(135deg,#E4EAF0,#E4EAF0_10px,#EBF0F5_10px,#EBF0F5_20px)]">
            <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
              <Camera className="h-5 w-5" /> citizen media
            </div>
            {report.mediaType === "video" ? (
              <video src={report.media} className="relative h-full w-full object-cover" controls />
            ) : (
              <img src={report.media} alt={report.title} className="relative h-full w-full object-cover" />
            )}
            <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-ink/70 px-3 py-1.5 text-[12.5px] font-semibold text-white backdrop-blur">
              <Camera className="h-3.5 w-3.5" /> Citizen media · {report.issueType}
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
              {analysis.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-line bg-[#FBFCFD] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <Icon className="h-3.5 w-3.5" /> {item.label}
                    </div>
                    <div className="mt-2 text-[22px] font-extrabold tracking-tight text-ink">{item.value}</div>
                    <div className="mt-px text-[11.5px] text-slate-400">{item.hint}</div>
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

        <div className="flex flex-col gap-5">
          <Card>
            <h2 className="mb-3.5 text-[15px] font-bold text-ink">Update status</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {STATUS_ORDER.map((option) => {
                const active = option === current;
                return (
                  <button
                    key={option}
                    onClick={() => changeStatus(option)}
                    className={`flex items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2.5 text-[13px] font-semibold transition ${
                      active ? `border-transparent ${statusStyles[option]}` : "border-line bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: dotFor(option) }} />
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
              Status changes are saved to Supabase and may require agency/admin permissions.
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
              {notes.map((note, index) => {
                const systemNote = note.author === "System";
                const Icon = systemNote ? Cpu : User;
                return (
                  <div key={`${note.time}-${index}`} className="flex gap-2.5">
                    <span className={`flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full ${systemNote ? "bg-slate-100 text-slate-500" : "bg-primary-soft text-primary"}`}>
                      <Icon className="h-[15px] w-[15px]" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] leading-snug text-slate-700">{note.text}</div>
                      <div className="mt-0.5 text-[11.5px] text-slate-400">{note.author} · {formatDateTime(note.time)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line pt-3.5">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an internal note..." className="min-h-[64px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-slate-400" />
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

function dotFor(status: DisplayStatus) {
  const map: Record<DisplayStatus, string> = {
    "Pending Review": "#94a3b8",
    Verified: "#3b82f6",
    "In Progress": "#14b8a6",
    Resolved: "#10b981",
    Rejected: "#ef4444"
  };
  return map[status];
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
