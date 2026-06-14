"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Plus } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { StatusBadge } from "@/components/Badges";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { fetchUserProfile } from "@/lib/auth";
import {
  formatDate,
  normalizeSupabaseReport,
  reportSelect,
  type CivicReport,
  type DisplayStatus
} from "@/lib/reports";

const STAGES = ["Submitted", "Reviewed", "In progress", "Resolved"];
const statusStage: Record<DisplayStatus, number> = {
  "Pending Review": 0,
  Verified: 1,
  "In Progress": 2,
  Resolved: 3,
  Rejected: 0
};

export default function MyReportsPage() {
  return (
    <AuthGate allowedRoles={["citizen", "agency", "admin"]}>
      <MyReportsContent />
    </AuthGate>
  );
}

function MyReportsContent() {
  const [mine, setMine] = useState<CivicReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

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
          throw new Error("Please log in to view your reports.");
        }

        const profile = await fetchUserProfile(supabase, user.id);
        const canReadAll = profile?.role === "agency" || profile?.role === "admin";
        let builder = supabase
          .from("reports")
          .select(reportSelect)
          .order("created_at", { ascending: false });

        if (!canReadAll) {
          builder = builder.eq("user_id", user.id);
        }

        const { data, error } = await builder;

        if (error) {
          throw error;
        }

        if (isActive) {
          setMine((data ?? []).map(normalizeSupabaseReport));
        }
      } catch (error) {
        if (isActive) {
          setMessage(
            error instanceof Error ? error.message : "Unable to load your reports."
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
  }, []);

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
          href="/submit"
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> New report
        </Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading your reports...
        </div>
      ) : message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {message}
        </div>
      ) : mine.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          You have not submitted any reports yet.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {mine.map((report) => {
            const reached = statusStage[report.status];
            return (
              <div key={report.id} className="flex items-stretch gap-[18px] rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="relative min-h-[120px] w-[150px] flex-none overflow-hidden rounded-xl bg-[repeating-linear-gradient(135deg,#E4EAF0,#E4EAF0_9px,#EBF0F5_9px,#EBF0F5_18px)]">
                  {report.mediaType === "video" ? (
                    <video src={report.media} className="relative h-full w-full object-cover" />
                  ) : (
                    <img src={report.media} alt={report.title} className="relative h-full w-full object-cover" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2.5">
                        <span className="font-mono text-xs text-slate-400">{report.id}</span>
                        <StatusBadge status={report.status} />
                      </div>
                      <h3 className="truncate text-[16.5px] font-bold text-ink">{report.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />
                        {report.location} · {formatDate(report.at)}
                      </p>
                    </div>
                    <Link
                      href={`/reports/${report.id}`}
                      className="inline-flex flex-none items-center gap-1.5 rounded-[9px] border border-slate-300 bg-white px-3 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-slate-100"
                    >
                      View <ChevronRight className="h-[15px] w-[15px]" />
                    </Link>
                  </div>

                  <div className="mt-auto flex items-start pt-[18px]">
                    {STAGES.map((name, index) => {
                      const done = index <= reached;
                      const isLast = index === STAGES.length - 1;
                      return (
                        <div key={name} className="flex flex-1 items-start last:flex-none">
                          <div className="flex flex-none flex-col items-center">
                            <span
                              className={`h-[13px] w-[13px] rounded-full border-2 ${
                                index < reached
                                  ? "border-accent bg-accent"
                                  : index === reached
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
                          {!isLast ? (
                            <span
                              className={`mx-1 mt-[5px] h-0.5 flex-1 ${
                                index < reached ? "bg-accent" : "bg-slate-200"
                              }`}
                            />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
