"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import {
  projectToMap,
  reports,
  severityStyles,
  type Severity,
} from "@/lib/data";
import { SeverityBadge, StatusBadge } from "@/components/Badges";

const LEGEND: { label: Severity; dot: string }[] = [
  { label: "Critical", dot: "bg-red-500" },
  { label: "High", dot: "bg-orange-500" },
  { label: "Medium", dot: "bg-amber-500" },
  { label: "Low", dot: "bg-emerald-500" },
];

export default function MapPage() {
  return (
    <AuthGate allowedRoles={["agency", "admin"]}>
      <MapContent />
    </AuthGate>
  );
}

function MapContent() {
  const [selectedId, setSelectedId] = useState(reports[0].id);
  const selected = reports.find((r) => r.id === selectedId)!;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Map view</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">Open reports across the city, plotted by location and severity.</p>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-2.5">
          {LEGEND.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
              <span className={`h-[9px] w-[9px] rounded-full ${l.dot}`} />
              {l.label}
              <span className="text-slate-400">{reports.filter((r) => r.severity === l.label).length}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[360px_1fr]">
        {/* List */}
        <div className="flex max-h-[620px] flex-col gap-2.5 overflow-auto pr-1">
          {reports.map((r) => {
            const active = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                  active ? "border-[#E0BB9E] bg-[#FCF6F1]" : "border-slate-100 bg-white hover:border-slate-300"
                }`}
              >
                <span className={`mt-[5px] h-[9px] w-[9px] flex-none rounded-full ${severityStyles[r.severity].dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-semibold text-ink">{r.title}</span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-slate-400">{r.location}</span>
                  <span className="mt-2 inline-flex items-center gap-2">
                    <SeverityBadge severity={r.severity} />
                    <span className="text-xs font-bold text-ink">P{r.priority}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Map canvas */}
        <div className="relative h-[620px] overflow-hidden rounded-[18px] border border-line bg-[#E7EEEC]">
          <div className="absolute inset-0 bg-[linear-gradient(#D7E2DF_1px,transparent_1px),linear-gradient(90deg,#D7E2DF_1px,transparent_1px)] bg-[length:54px_54px] opacity-70" />
          <div className="absolute -left-[5%] top-[34%] h-[18px] w-[110%] -rotate-[5deg] rounded-[10px] bg-[#CFDCD8]" />
          <div className="absolute left-[22%] -top-[10%] h-[120%] w-4 rotate-[8deg] rounded-[10px] bg-[#CFDCD8]" />
          <div className="absolute bottom-[8%] right-[6%] h-[150px] w-[240px] rounded-[30px] bg-[#CFE0E6]/80" />
          <div className="absolute bottom-[10%] left-[8%] h-[110px] w-[160px] rounded-3xl bg-[#D6E6D2]/80" />

          {reports.map((r) => {
            const { x, y } = projectToMap(r.lat, r.lng);
            const active = r.id === selectedId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                title={r.title}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%`, zIndex: active ? 6 : 2 }}
              >
                <span
                  className={`block rounded-full border-[3px] border-white ${severityStyles[r.severity].dot}`}
                  style={{
                    width: active ? 30 : 20,
                    height: active ? 30 : 20,
                    boxShadow: active
                      ? "0 0 0 5px rgba(0,0,0,0.04), 0 4px 10px rgba(16,34,45,0.35)"
                      : "0 3px 8px rgba(16,34,45,0.3)",
                  }}
                />
              </button>
            );
          })}

          {/* Selected card */}
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
            <Link href={`/reports/${selected.id}`} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-primary py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-dark">
              Open full report <ArrowRight className="h-[15px] w-[15px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
