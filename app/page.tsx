import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck,
  Gauge,
  Map as MapIcon,
  MapPin,
  Radio,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { sortByPriority, reports, severityStyles } from "@/lib/data";

const steps = [
  { n: "1", icon: Camera, title: "Snap a photo", desc: "Capture the pothole, the dead streetlight, the flooded drain — whatever you see." },
  { n: "2", icon: MapPin, title: "Drop a pin", desc: "Pin the exact spot on the map or let GPS place it for you automatically." },
  { n: "3", icon: Sparkles, title: "We do the rest", desc: "CivicLens classifies, scores, de-duplicates and routes it to the right agency." },
];

const features = [
  { icon: ScanSearch, title: "Issue detection", desc: "Identifies the type of infrastructure issue straight from the photo you upload." },
  { icon: ShieldCheck, title: "Authenticity scoring", desc: "Every report gets an authenticity score to filter out false or spam submissions." },
  { icon: Gauge, title: "Severity assessment", desc: "Grades how serious the issue is and whether it needs immediate action." },
  { icon: Copy, title: "Duplicate detection", desc: "Spots when the same issue has already been reported nearby and merges it." },
  { icon: Target, title: "Priority scoring", desc: "Ranks every report so agencies always work the highest-impact issues first." },
  { icon: FileCheck, title: "Agency-ready reports", desc: "Generates a structured maintenance ticket teams can act on immediately." },
];

const statCards = [
  { label: "Total reports", value: "1,247", icon: BarChart3, color: "bg-primary-soft text-primary" },
  { label: "Critical", value: "23", icon: ClipboardCheck, color: "bg-red-50 text-red-600" },
  { label: "In progress", value: "156", icon: Gauge, color: "bg-amber-50 text-amber-600" },
  { label: "Resolved", value: "891", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
];

export default function HomePage() {
  const preview = sortByPriority(reports).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-[#FCF6F1] to-canvas">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-[72px] text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F0D7C3] bg-primary-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-primary-dark">
            <Radio className="h-3.5 w-3.5" />
            Built for cities · SummerBuild 2026
          </span>
          <h1 className="mx-auto max-w-[880px] text-[clamp(40px,6vw,66px)] font-extrabold leading-[1.04] tracking-tight text-ink">
            Report civic issues in{" "}
            <span className="text-primary">under 30 seconds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-slate-500 sm:text-xl">
            Snap a photo, drop a pin, write one sentence. CivicLens turns a simple
            citizen report into a structured, agency-ready maintenance ticket —
            routed, scored, and ready to act on.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/report" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark">
              Report an Issue <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-slate-100">
              <BarChart3 className="h-[18px] w-[18px]" /> View Dashboard
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap justify-center gap-7 text-sm font-medium text-slate-500">
            {["1,247 reports filed", "891 resolved", "2.3 day avg resolution"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {t}
              </span>
            ))}
          </div>

          {/* Steps */}
          <div className="mx-auto mt-14 grid max-w-[920px] grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="relative rounded-2xl border border-line bg-white p-7 shadow-sm">
                  <span className="absolute -top-3 left-6 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-ink text-[13px] font-bold text-white">
                    {s.n}
                  </span>
                  <span className="mb-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-[17px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-[76px]">
          <div className="max-w-[620px]">
            <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-primary">Under the hood</p>
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-ink">
              Smarter triage from the very first photo
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-500">
              Every report is analyzed the moment it lands — so agencies open a
              clean, prioritized queue instead of a flood of raw tips.
            </p>
          </div>
          <div className="mt-11 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-line bg-[#FBFCFD] p-[26px] transition-colors hover:border-[#D7C3B4] hover:bg-white">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-[16.5px] font-bold text-ink">{f.title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="bg-canvas">
        <div className="mx-auto max-w-6xl px-6 py-[76px]">
          <div className="mx-auto mb-10 max-w-[600px] text-center">
            <p className="mb-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-primary">Agency dashboard</p>
            <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight text-ink">
              One queue. Ranked by what matters.
            </h2>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-2xl shadow-slate-300/40">
            <div className="flex items-center gap-2.5 border-b border-line bg-[#FBFCFD] px-[18px] py-3">
              <span className="h-[11px] w-[11px] rounded-full bg-red-400" />
              <span className="h-[11px] w-[11px] rounded-full bg-amber-400" />
              <span className="h-[11px] w-[11px] rounded-full bg-emerald-400" />
              <span className="ml-2 text-[12.5px] font-medium text-slate-400">civiclens.gov · Agency Dashboard</span>
            </div>
            <div className="p-[26px]">
              <div className="mb-[22px] grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                {statCards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="rounded-[13px] border border-line bg-[#FBFCFD] p-4">
                      <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-[9px] ${c.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="text-2xl font-extrabold tracking-tight text-ink">{c.value}</div>
                      <div className="mt-0.5 text-[12.5px] text-slate-500">{c.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-2.5">
                {preview.map((r) => (
                  <Link key={r.id} href={`/reports/${r.id}`} className="flex items-center justify-between gap-4 rounded-[11px] border border-line bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-[#FBFCFD]">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className={`h-2.5 w-2.5 flex-none rounded-full ${severityStyles[r.severity].dot}`} />
                      <span className="whitespace-nowrap text-[14.5px] font-semibold text-ink">{r.issueType}</span>
                      <span className="truncate text-[13px] text-slate-400">{r.location}</span>
                    </div>
                    <div className="flex flex-none items-center gap-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-bold ring-1 ring-inset ${severityStyles[r.severity].badge}`}>{r.severity}</span>
                      <span className="w-[30px] text-right text-[15px] font-extrabold text-ink">{r.priority}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-[76px]">
          <div className="relative overflow-hidden rounded-[22px] bg-ink px-10 py-14 text-center">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_280px_at_50%_-40%,rgba(195,96,34,0.22),transparent)]" />
            <div className="relative">
              <h2 className="text-[clamp(26px,3.6vw,38px)] font-extrabold leading-tight tracking-tight text-white">
                Make your city work better — one report at a time
              </h2>
              <p className="mx-auto mt-4 max-w-[540px] text-[17px] leading-relaxed text-white/70">
                Spot a pothole, a dead streetlight, a fallen tree? It takes 30
                seconds to put it in front of the people who can fix it.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link href="/report" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-primary-dark">
                  Start a Report <ArrowRight className="h-[18px] w-[18px]" />
                </Link>
                <Link href="/map" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/15">
                  <MapIcon className="h-[18px] w-[18px]" /> Explore the Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
