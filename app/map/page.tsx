"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  normalizeSupabaseReport,
  projectToMap,
  reportSelect,
  severityStyles,
  severityToDisplay,
  type CivicReport,
  type Severity
} from "@/lib/reports";

const LEGEND: { label: Severity; dot: string }[] = [
  { label: "critical", dot: "bg-red-500" },
  { label: "high", dot: "bg-orange-500" },
  { label: "medium", dot: "bg-amber-500" },
  { label: "low", dot: "bg-emerald-500" }
];

export default function MapPage() {
  return (
    <AuthGate allowedRoles={["agency", "admin"]}>
      <MapContent />
    </AuthGate>
  );
}

function MapContent() {
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("reports")
          .select(reportSelect)
          .order("priority_score", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        const normalized = (data ?? []).map(normalizeSupabaseReport);

        if (isActive) {
          setReports(normalized);
          setSelectedId(normalized[0]?.id ?? null);
        }
      } catch (error) {
        if (isActive) {
          setMessage(error instanceof Error ? error.message : "Unable to load map reports.");
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
  }, []);

  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Map view</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Open reports across the city, plotted by location and severity.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-2.5">
          {LEGEND.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
              <span className={`h-[9px] w-[9px] rounded-full ${item.dot}`} />
              {severityToDisplay[item.label]}
              <span className="text-slate-400">{reports.filter((report) => report.severity === item.label).length}</span>
            </span>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading map reports...
        </div>
      ) : message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {message}
        </div>
      ) : !selected ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          No reports are available yet.
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
          <div className="flex max-h-[620px] flex-col gap-2.5 overflow-auto pr-1">
            {reports.map((report) => {
              const active = report.id === selected.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                    active ? "border-[#E0BB9E] bg-[#FCF6F1]" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className={`mt-[5px] h-[9px] w-[9px] flex-none rounded-full ${severityStyles[report.severity].dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-semibold text-ink">{report.title}</span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-slate-400">{report.location}</span>
                    <span className="mt-2 inline-flex items-center gap-2">
                      <SeverityBadge severity={report.severity} />
                      <span className="text-xs font-bold text-ink">P{report.priority}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative h-[620px] overflow-hidden rounded-[18px] border border-line bg-[#E7EEEC]">
            <div className="absolute inset-0 bg-[linear-gradient(#D7E2DF_1px,transparent_1px),linear-gradient(90deg,#D7E2DF_1px,transparent_1px)] bg-[length:54px_54px] opacity-70" />
            <div className="absolute -left-[5%] top-[34%] h-[18px] w-[110%] -rotate-[5deg] rounded-[10px] bg-[#CFDCD8]" />
            <div className="absolute left-[22%] -top-[10%] h-[120%] w-4 rotate-[8deg] rounded-[10px] bg-[#CFDCD8]" />
            <div className="absolute bottom-[8%] right-[6%] h-[150px] w-[240px] rounded-[30px] bg-[#CFE0E6]/80" />
            <div className="absolute bottom-[10%] left-[8%] h-[110px] w-[160px] rounded-3xl bg-[#D6E6D2]/80" />

            {reports.map((report) => {
              const { x, y } = projectToMap(report.lat, report.lng);
              const active = report.id === selected.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  title={report.title}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%`, zIndex: active ? 6 : 2 }}
                >
                  <span
                    className={`block rounded-full border-[3px] border-white ${severityStyles[report.severity].dot}`}
                    style={{
                      width: active ? 30 : 20,
                      height: active ? 30 : 20,
                      boxShadow: active
                        ? "0 0 0 5px rgba(0,0,0,0.04), 0 4px 10px rgba(16,34,45,0.35)"
                        : "0 3px 8px rgba(16,34,45,0.3)"
                    }}
                  />
                </button>
              );
            })}

            <div className="absolute bottom-[18px] left-[18px] w-[330px] max-w-[calc(100%-36px)] rounded-2xl border border-line bg-white p-4 shadow-2xl shadow-slate-400/40">
              <div className="mb-2.5 flex items-center gap-2.5">
                <SeverityBadge severity={selected.severity} />
                <StatusBadge status={selected.status} />
              </div>
              <h3 className="text-base font-bold text-ink">{selected.title}</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selected.location}
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-400">Priority {selected.priority}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className={`block h-full rounded-full ${severityStyles[selected.severity].dot}`} style={{ width: `${selected.priority}%` }} />
                </span>
              </div>
              <Link href={`/report/${selected.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark">
                Open full report <ArrowRight className="h-[15px] w-[15px]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
