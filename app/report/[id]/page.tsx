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
import { fetchUserProfile } from "@/lib/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  displayToSupabaseStatus,
  formatDate,
  formatDateTime,
  normalizeActivityLog,
  normalizeSupabaseReport,
  reportSelect,
  severityStyles,
  statusStyles,
  STATUS_ORDER,
  type ActivityLogRow,
  type CivicReport,
  type DisplayStatus,
  type ReportNote,
  type Severity,
  type SupabaseStatus
} from "@/lib/reports";

type ReportEditDraft = {
  severity: Severity;
  priorityScore: string;
  recommendedAction: string;
  aiSummary: string;
  duplicateCount: string;
  congestionImpact: string;
  issueType: string;
  category: string;
  internalNotes: string;
};

const SEVERITY_OPTIONS: Severity[] = ["low", "medium", "high", "critical"];

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
  const [editDraft, setEditDraft] = useState<ReportEditDraft | null>(null);
  const [canEdit, setCanEdit] = useState(false);
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
        const {
          data: { user }
        } = await supabase.auth.getUser();
        const profile = user ? await fetchUserProfile(supabase, user.id) : null;
        const userCanEdit = profile?.role === "agency" || profile?.role === "admin";
        let activityLogs: ActivityLogRow[] = [];

        if (userCanEdit) {
          const { data: logs, error: activityError } = await supabase
            .from("report_activity_logs")
            .select("id, report_id, actor_id, action, old_status, new_status, note, created_at")
            .eq("report_id", reportId)
            .order("created_at", { ascending: true });

          if (activityError) {
            throw activityError;
          }

          activityLogs = logs ?? [];
        }

        if (isActive) {
          setReport(normalized);
          setStatus(normalized.status);
          setEditDraft(createEditDraft(normalized));
          setCanEdit(userCanEdit);
          setExtra((activityLogs ?? []).map(normalizeActivityLog));
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
    if (!report || !canEdit || nextStatus === status) {
      return;
    }

    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const oldStatus = displayToSupabaseStatus[current];
      const newStatus = displayToSupabaseStatus[nextStatus];
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", report.id);

      if (error) {
        throw error;
      }

      setStatus(nextStatus);
      setReport((current) => (current ? { ...current, status: nextStatus } : current));
      const note = `Status changed to ${nextStatus}`;
      await insertActivityLog(report.id, "status_changed", oldStatus, newStatus, note);
      setExtra((prev) => [
        ...prev,
        {
          author: "You",
          text: note,
          time: new Date().toISOString()
        }
      ]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update report status."
      );
    }
  }

  async function addNote() {
    const text = draft.trim();
    if (!text) return;
    if (report) {
      try {
        const existingNotes = editDraft?.internalNotes.trim() ?? "";
        const nextNotes = existingNotes ? `${existingNotes}\n${text}` : text;
        const supabase = getSupabaseBrowserClient();
        const { error } = await supabase
          .from("reports")
          .update({ internal_notes: nextNotes })
          .eq("id", report.id);

        if (error) {
          throw error;
        }

        await insertActivityLog(report.id, "internal_note", null, null, text);
        setEditDraft((current) =>
          current ? { ...current, internalNotes: nextNotes } : current
        );
        setReport((current) =>
          current ? { ...current, internalNotes: nextNotes } : current
        );
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to save internal note."
        );
        return;
      }
    }
    setExtra((prev) => [...prev, { author: "You", text, time: new Date().toISOString() }]);
    setDraft("");
  }

  async function saveReportEdits() {
    if (!report || !editDraft || !canEdit) {
      return;
    }

    setMessage(null);

    const nextPriority = clampNumber(editDraft.priorityScore, 0, 100, report.priority);
    const nextDuplicateCount = clampNumber(editDraft.duplicateCount, 0, 9999, report.dupes);
    const nextInternalNotes = editDraft.internalNotes.trim();
    const nextRecommendedAction =
      editDraft.recommendedAction.trim() || "Awaiting AI analysis";
    const nextAiSummary =
      editDraft.aiSummary.trim() ||
      "AI-generated maintenance report will appear here after analysis.";
    const nextCongestionImpact =
      editDraft.congestionImpact.trim() || "Pending analysis";
    const nextIssueType = editDraft.issueType.trim() || "Analysis pending";
    const nextCategory = editDraft.category.trim() || null;

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("reports")
        .update({
          severity: editDraft.severity,
          priority_score: nextPriority,
          recommended_action: nextRecommendedAction,
          ai_summary: nextAiSummary,
          duplicate_count: nextDuplicateCount,
          congestion_impact: nextCongestionImpact,
          issue_type: nextIssueType,
          category: nextCategory,
          internal_notes: nextInternalNotes || null
        })
        .eq("id", report.id);

      if (error) {
        throw error;
      }

      if (nextInternalNotes !== report.internalNotes) {
        await insertActivityLog(
          report.id,
          "internal_notes_updated",
          null,
          null,
          "Internal notes updated"
        );
        setExtra((prev) => [
          ...prev,
          {
            author: "You",
            text: "Internal notes updated",
            time: new Date().toISOString()
          }
        ]);
      }

      setReport((current) =>
        current
          ? {
              ...current,
              severity: editDraft.severity,
              priority: nextPriority,
              action: nextRecommendedAction,
              summary: nextAiSummary,
              dupes: nextDuplicateCount,
              congestion: nextCongestionImpact,
              issueType: nextIssueType,
              category: nextCategory || "Other",
              internalNotes: nextInternalNotes
            }
          : current
      );
      setEditDraft({
        severity: editDraft.severity,
        priorityScore: String(nextPriority),
        recommendedAction: nextRecommendedAction,
        aiSummary: nextAiSummary,
        duplicateCount: String(nextDuplicateCount),
        congestionImpact: nextCongestionImpact,
        issueType: nextIssueType,
        category: nextCategory ?? "",
        internalNotes: nextInternalNotes
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to save report details."
      );
    }
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
          {canEdit ? (
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
                Status changes are saved to Supabase and logged in activity.
              </p>
            </Card>
          ) : null}

          {canEdit && editDraft ? (
            <Card>
              <h2 className="mb-3.5 text-[15px] font-bold text-ink">Agency fields</h2>
              <div className="flex flex-col gap-3">
                <Field label="Severity">
                  <select
                    value={editDraft.severity}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current
                          ? { ...current, severity: event.target.value as Severity }
                          : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  >
                    {SEVERITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Priority score">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editDraft.priorityScore}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, priorityScore: event.target.value } : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  />
                </Field>
                <Field label="Issue type">
                  <input
                    value={editDraft.issueType}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, issueType: event.target.value } : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={editDraft.category}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, category: event.target.value } : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  />
                </Field>
                <Field label="Duplicate count">
                  <input
                    type="number"
                    min={0}
                    value={editDraft.duplicateCount}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, duplicateCount: event.target.value } : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  />
                </Field>
                <Field label="Congestion impact">
                  <input
                    value={editDraft.congestionImpact}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, congestionImpact: event.target.value } : current
                      )
                    }
                    className="w-full rounded-[10px] border border-slate-300 px-3 py-2 text-[13.5px] text-ink outline-none"
                  />
                </Field>
                <Field label="Recommended action">
                  <textarea
                    value={editDraft.recommendedAction}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, recommendedAction: event.target.value } : current
                      )
                    }
                    className="min-h-[72px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none"
                  />
                </Field>
                <Field label="AI summary">
                  <textarea
                    value={editDraft.aiSummary}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, aiSummary: event.target.value } : current
                      )
                    }
                    className="min-h-[88px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none"
                  />
                </Field>
                <Field label="Internal notes">
                  <textarea
                    value={editDraft.internalNotes}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, internalNotes: event.target.value } : current
                      )
                    }
                    className="min-h-[88px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none"
                  />
                </Field>
                <button
                  onClick={saveReportEdits}
                  className="mt-1 inline-flex w-full items-center justify-center rounded-[10px] bg-primary py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  Save details
                </button>
              </div>
            </Card>
          ) : null}

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
            {canEdit ? (
              <div className="border-t border-line pt-3.5">
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add an internal note..." className="min-h-[64px] w-full resize-y rounded-[10px] border border-slate-300 p-2.5 text-[13.5px] leading-relaxed text-ink outline-none placeholder:text-slate-400" />
                <button onClick={addNote} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-ink py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#0d3460]">
                  <Plus className="h-[15px] w-[15px]" /> Add note
                </button>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}

function dotFor(status: DisplayStatus) {
  const map: Record<DisplayStatus, string> = {
    "Pending Review": "#94a3b8",
    "Under Review": "#06b6d4",
    Verified: "#3b82f6",
    Assigned: "#8b5cf6",
    "In Progress": "#14b8a6",
    Resolved: "#10b981",
    Rejected: "#ef4444"
  };
  return map[status];
}

function createEditDraft(report: CivicReport): ReportEditDraft {
  return {
    severity: report.severity,
    priorityScore: String(report.priority),
    recommendedAction: report.action,
    aiSummary: report.summary,
    duplicateCount: String(report.dupes),
    congestionImpact: report.congestion,
    issueType: report.issueType,
    category: report.category,
    internalNotes: report.internalNotes
  };
}

function clampNumber(value: string, min: number, max: number, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, Math.round(parsed)));
}

async function insertActivityLog(
  reportId: string,
  action: string,
  oldStatus: SupabaseStatus | null,
  newStatus: SupabaseStatus | null,
  note: string
) {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("report_activity_logs").insert({
    report_id: reportId,
    actor_id: user?.id ?? null,
    action,
    old_status: oldStatus,
    new_status: newStatus,
    note
  });

  if (error) {
    throw error;
  }
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}
