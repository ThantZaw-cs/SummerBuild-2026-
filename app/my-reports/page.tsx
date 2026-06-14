import Link from "next/link";
import { ChevronRight, MapPin, Plus } from "lucide-react";
import {
  formatDate,
  getReport,
  type CivicReport,
  type Status,
} from "@/lib/data";
import { StatusBadge } from "@/components/Badges";

// Reports this citizen has submitted (subset of the sample data).
const MY_IDS = ["RPT-2026-006", "RPT-2026-002", "RPT-2026-001", "RPT-2026-005"];

const STAGES = ["Submitted", "Reviewed", "In progress", "Resolved"];
const statusStage: Record<Status, number> = {
  "Pending Review": 0,
  Verified: 1,
  "In Progress": 2,
  Resolved: 3,
  Rejected: 0,
};

export default function MyReportsPage() {
  const mine = MY_IDS.map((id) => getReport(id)).filter(Boolean) as CivicReport[];
  const active = mine.filter((r) => r.status !== "Resolved").length;
  const resolved = mine.filter((r) => r.status === "Resolved").length;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-20 pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3.5">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-ink">My reports</h1>
          <p className="mt-1.5 text-[15px] text-slate-500">
            <span className="font-semibold text-ink">{active} active</span> ·{" "}
            {resolved} resolved · {mine.length} total
          </p>
        </div>
        <Link
          href="/report"
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New report
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {mine.map((r) => {
          const reached = statusStage[r.status];
          return (
            <div key={r.id} className="flex items-stretch gap-[18px] rounded-2xl border border-line bg-white p-4 shadow-sm">
              {/* Thumbnail (placeholder behind, image on top) */}
              <div className="relative min-h-[120px] w-[150px] flex-none overflow-hidden rounded-xl bg-[repeating-linear-gradient(135deg,#E4EAF0,#E4EAF0_9px,#EBF0F5_9px,#EBF0F5_18px)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.media}
                  alt={r.title}
                  className="relative h-full w-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2.5">
                      <span className="font-mono text-xs text-slate-400">{r.id}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <h3 className="truncate text-[16.5px] font-bold text-ink">{r.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {r.location} · {formatDate(r.at)}
                    </p>
                  </div>
                  <Link
                    href={`/reports/${r.id}`}
                    className="inline-flex flex-none items-center gap-1.5 rounded-[9px] border border-slate-300 bg-white px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-slate-100"
                  >
                    View <ChevronRight className="h-[15px] w-[15px]" />
                  </Link>
                </div>

                {/* Stage tracker */}
                <div className="mt-auto flex items-start pt-[18px]">
                  {STAGES.map((name, i) => {
                    const done = i <= reached;
                    const isLast = i === STAGES.length - 1;
                    return (
                      <div key={name} className="flex flex-1 items-start last:flex-none">
                        <div className="flex flex-none flex-col items-center">
                          <span
                            className={`h-[13px] w-[13px] rounded-full border-2 ${
                              i < reached
                                ? "border-accent bg-accent"
                                : i === reached
                                  ? "border-accent bg-white shadow-[0_0_0_3px_#D6F2EC]"
                                  : "border-slate-300 bg-white"
                            }`}
                          />
                          <span
                            className={`mt-1.5 whitespace-nowrap text-[11px] font-semibold ${
                              done ? "text-accent" : "text-slate-400"
                            }`}
                          >
                            {name}
                          </span>
                        </div>
                        {!isLast && (
                          <span
                            className={`mx-1 mt-[5px] h-0.5 flex-1 ${
                              i < reached ? "bg-accent" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
