"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, RotateCcw } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { ReportMap, type ReportMapMarker } from "@/components/ReportMap";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  normalizeSupabaseReport,
  reportSelect,
  severityStyles,
  severityToDisplay,
  STATUS_ORDER,
  type CivicReport,
  type DisplayStatus,
  type Severity
} from "@/lib/reports";

const SEVERITY_FILTERS: (Severity | "All")[] = ["All", "critical", "high", "medium", "low"];
const STATUS_FILTERS: (DisplayStatus | "All")[] = ["All", ...STATUS_ORDER];

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
  const [severity, setSeverity] = useState<Severity | "All">("All");
  const [status, setStatus] = useState<DisplayStatus | "All">("All");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setMessage(null);

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
          setSelectedId(normalized.find((report) => report.hasCoordinates)?.id ?? normalized[0]?.id ?? null);
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

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (severity !== "All" && report.severity !== severity) return false;
      if (status !== "All" && report.status !== status) return false;
      return true;
    });
  }, [reports, severity, status]);

  const markers = useMemo<ReportMapMarker[]>(
    () =>
      filteredReports
        .filter((report) => report.hasCoordinates)
        .map((report) => ({
          id: report.id,
          title: report.title,
          lat: report.lat,
          lng: report.lng,
          severity: report.severity
        })),
    [filteredReports]
  );
  const selected =
    filteredReports.find((report) => report.id === selectedId) ??
    filteredReports[0] ??
    null;
  const reportsWithoutCoordinates = filteredReports.filter((report) => !report.hasCoordinates).length;
  const hasFilters = severity !== "All" || status !== "All";

  function resetFilters() {
    setSeverity("All");
    setStatus("All");
  }

  function chip(active: boolean) {
    return `whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] font-semibold transition ${
      active ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
    }`;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Map view</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">
            Real report pins plotted from saved latitude and longitude.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-500">
          {markers.length} pinned · {reportsWithoutCoordinates} without coordinates
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Severity</span>
          {SEVERITY_FILTERS.map((value) => (
            <button key={value} onClick={() => setSeverity(value)} className={chip(severity === value)}>
              {value === "All" ? value : severityToDisplay[value]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate-400">Status</span>
          {STATUS_FILTERS.map((value) => (
            <button key={value} onClick={() => setStatus(value)} className={chip(status === value)}>
              {value}
            </button>
          ))}
          {hasFilters ? (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          ) : null}
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
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          No reports match these filters.
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[380px_1fr]">
          <div className="order-2 flex max-h-[680px] flex-col gap-3 overflow-auto pr-1 lg:order-1">
            {filteredReports.map((report) => {
              const active = report.id === selected?.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedId(report.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    active ? "border-[#E0BB9E] bg-[#FCF6F1]" : "border-slate-100 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-[5px] h-[9px] w-[9px] flex-none rounded-full ${severityStyles[report.severity].dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-semibold text-ink">{report.title}</span>
                      <span className="mt-1 block line-clamp-2 text-[12.5px] leading-relaxed text-slate-500">{report.desc}</span>
                      <span className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {report.location}
                      </span>
                      {!report.hasCoordinates ? (
                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-semibold text-slate-500">
                          No coordinates yet
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={report.severity} />
                    <StatusBadge status={report.status} />
                    <span className="text-xs font-bold text-ink">Priority {report.priority}</span>
                  </div>
                  <div className="mt-2 text-[12.5px] text-slate-500">
                    Location Impact: {report.congestion}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="order-1 overflow-hidden rounded-[18px] border border-line bg-white shadow-sm lg:order-2">
            <ReportMap
              markers={markers}
              selectedId={selected?.hasCoordinates ? selected.id : null}
              onMarkerClick={setSelectedId}
              className="h-[420px] lg:h-[680px]"
              zoom={12}
            />
            {selected ? (
              <div className="border-t border-line p-4">
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={selected.severity} />
                  <StatusBadge status={selected.status} />
                  {!selected.hasCoordinates ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                      No coordinates yet
                    </span>
                  ) : null}
                </div>
                <h3 className="text-base font-bold text-ink">{selected.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">{selected.desc}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selected.location}
                </p>
                <div className="mt-3 flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-400">Priority {selected.priority}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span className={`block h-full rounded-full ${severityStyles[selected.severity].dot}`} style={{ width: `${selected.priority}%` }} />
                  </span>
                </div>
                <p className="mt-2 text-[12.5px] text-slate-500">
                  Location Impact: {selected.congestion}
                </p>
                <Link href={`/report/${selected.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark">
                  Open full report <ArrowRight className="h-[15px] w-[15px]" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
