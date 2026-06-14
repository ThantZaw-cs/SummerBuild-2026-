"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Crosshair,
  FileText,
  Gauge,
  Image as ImageIcon,
  MapPin,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { categories, issueTypes } from "@/lib/data";

const STEP_META = [
  { num: 1, label: "Upload media", icon: Camera },
  { num: 2, label: "Location", icon: MapPin },
  { num: 3, label: "Details", icon: FileText },
];

export default function ReportPage() {
  const [step, setStep] = useState(1); // 1-3 form, 4 = success
  const [hasFile, setHasFile] = useState(false);
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");

  const canContinue =
    step === 1 ? hasFile :
    step === 2 ? !!loc :
    step === 3 ? !!cat && !!type && !!desc :
    true;

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  if (step === 4) return <Success onReset={() => { setStep(1); setHasFile(false); setLoc(""); setCat(""); setType(""); setDesc(""); }} />;

  return (
    <div className="mx-auto max-w-[740px] px-6 pb-20 pt-10">
      <Link href="/" className="mb-[18px] inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <h1 className="text-[30px] font-extrabold tracking-tight text-ink">Report an issue</h1>
      <p className="mt-2 text-base text-slate-500">Three quick steps. Most reports take under a minute.</p>

      {/* Stepper */}
      <div className="my-7 flex items-start">
        {STEP_META.map((m, i) => {
          const done = step > m.num;
          const active = step === m.num;
          const Icon = m.icon;
          return (
            <div key={m.num} className="flex flex-1 items-start last:flex-none">
              <div className="flex w-[88px] flex-none flex-col items-center">
                <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full border-[1.5px] shadow-sm ${
                  done ? "border-transparent bg-accent text-white"
                    : active ? "border-transparent bg-primary text-white"
                    : "border-slate-300 bg-white text-slate-400"
                }`}>
                  <Icon className="h-[17px] w-[17px]" />
                </span>
                <span className={`mt-2.5 text-center text-[12.5px] font-semibold ${
                  active ? "text-ink" : done ? "text-accent" : "text-slate-400"
                }`}>{m.label}</span>
              </div>
              {i < STEP_META.length - 1 && (
                <span className={`mt-[18px] h-0.5 flex-1 rounded ${done ? "bg-accent" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-[18px] border border-line bg-white p-[30px] shadow-sm">
        {step === 1 && (
          <div>
            <h2 className="mb-1 text-[19px] font-bold text-ink">Upload a photo or video</h2>
            <p className="mb-5 text-[14.5px] text-slate-500">A clear shot of the issue helps us classify it accurately.</p>
            {hasFile && (
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-[#FBFCFD] p-3.5">
                <div className="flex h-[90px] w-[120px] flex-none items-center justify-center rounded-[10px] bg-[repeating-linear-gradient(135deg,#E9EEF3,#E9EEF3_9px,#F1F5F8_9px,#F1F5F8_18px)] text-slate-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-[14.5px] font-semibold text-ink">pothole_orchard.jpg</div>
                  <div className="mt-0.5 text-[13px] text-slate-400">2.4 MB · JPEG · uploaded</div>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-[12.5px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
                    <Check className="h-3 w-3" /> Ready to analyze
                  </span>
                </div>
                <button onClick={() => setHasFile(false)} className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] border border-line bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            <button onClick={() => setHasFile(true)} className="mt-3.5 flex w-full flex-col items-center gap-2.5 rounded-2xl border-[1.5px] border-dashed border-slate-300 bg-[#FBFCFD] p-[34px] transition-colors hover:border-primary hover:bg-[#FCF6F1]">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-slate-100 text-primary">
                <Upload className="h-6 w-6" />
              </span>
              <span className="text-[15px] font-semibold text-ink">{hasFile ? "Replace the" : "Tap to add a"} photo or video</span>
              <span className="text-[13px] text-slate-400">PNG, JPG or MP4 · up to 25 MB</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-1 text-[19px] font-bold text-ink">Where is it?</h2>
            <p className="mb-5 text-[14.5px] text-slate-500">Drop a pin or use your current location.</p>
            <div className="flex gap-2.5">
              <div className="flex flex-1 items-center gap-2.5 rounded-[11px] border border-slate-300 px-3.5">
                <MapPin className="h-[17px] w-[17px] text-slate-400" />
                <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Search an address or landmark" className="flex-1 bg-transparent py-3 text-[14.5px] text-ink outline-none placeholder:text-slate-400" />
              </div>
              <button onClick={() => setLoc("1.3048, 103.8318 — Orchard Road (via GPS)")} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[11px] border border-slate-300 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-slate-100">
                <Crosshair className="h-4 w-4 text-primary" /> Use GPS
              </button>
            </div>
            <div className="relative mt-3.5 h-80 overflow-hidden rounded-2xl border border-line bg-[#EAF0F0]">
              <div className="absolute inset-0 bg-[linear-gradient(#DCE6E4_1px,transparent_1px),linear-gradient(90deg,#DCE6E4_1px,transparent_1px)] bg-[length:40px_40px] opacity-70" />
              <div className="absolute left-[18%] top-[30%] h-2.5 w-[62%] -rotate-6 rounded bg-[#D4DEDC]" />
              <div className="absolute left-[8%] top-[62%] h-2 w-[80%] rotate-6 rounded bg-[#D4DEDC]" />
              <div className="absolute left-1/2 top-[48%] flex -translate-x-1/2 -translate-y-full flex-col items-center">
                <MapPin className="h-10 w-10 text-primary drop-shadow-md" />
              </div>
              <div className="absolute bottom-3.5 left-3.5 rounded-md border border-line bg-white/85 px-2 py-1 font-mono text-[11.5px] text-slate-500">
                interactive map placeholder
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-1 text-[19px] font-bold text-ink">Add a few details</h2>
            <p className="mb-5 text-[14.5px] text-slate-500">Just the basics — our triage engine fills in the rest.</p>
            <div className="flex flex-col gap-[18px]">
              <div className="grid grid-cols-2 gap-3.5">
                <Select label="Category" value={cat} onChange={setCat} placeholder="Select a category…" options={categories} />
                <Select label="Issue type" value={type} onChange={setType} placeholder="Select a type…" options={issueTypes} />
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">What&apos;s going on?</span>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="One or two sentences describing the issue…" className="min-h-[120px] w-full resize-y rounded-[11px] border border-slate-300 p-3.5 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-slate-400" />
              </label>
              <div className="flex items-start gap-2.5 rounded-xl border border-[#F0D7C3] bg-[#FCF6F1] px-3.5 py-3">
                <Sparkles className="mt-0.5 h-[18px] w-[18px] flex-none text-primary" />
                <p className="text-[13.5px] leading-relaxed text-[#8A5A33]">
                  On submit, CivicLens scores severity, checks for duplicates nearby, and routes this to the right agency automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-[26px] flex items-center justify-between gap-3 border-t border-line pt-[22px]">
          <button onClick={prev} disabled={step === 1} className="inline-flex items-center gap-1.5 rounded-[11px] border border-slate-300 bg-white px-5 py-3 text-[14.5px] font-semibold text-ink transition-colors hover:bg-slate-100 disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {step === 3 ? (
            <button onClick={next} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-[11px] bg-primary px-6 py-3 text-[14.5px] font-semibold text-white shadow-md shadow-primary/30 transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-45">
              <Send className="h-4 w-4" /> Submit report
            </button>
          ) : (
            <button onClick={next} disabled={!canContinue} className="inline-flex items-center gap-2 rounded-[11px] bg-primary px-6 py-3 text-[14.5px] font-semibold text-white shadow-md shadow-primary/30 transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-45">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  label, value, onChange, placeholder, options,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer rounded-[11px] border border-slate-300 bg-white px-3 py-3 text-[14.5px] text-ink outline-none">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Success({ onReset }: { onReset: () => void }) {
  return (
    <div className="mx-auto max-w-[740px] px-6 pb-20 pt-12 text-center">
      <span className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
        <Check className="h-8 w-8" />
      </span>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Report submitted</h1>
      <p className="mx-auto mt-2.5 max-w-[460px] text-base text-slate-500">
        Thanks for helping out. We&apos;ve generated a structured ticket and routed it to the right team. Track its progress anytime under My Reports.
      </p>
      <div className="mx-auto mt-7 max-w-[520px] overflow-hidden rounded-2xl border border-line bg-white text-left shadow-sm">
        <div className="flex items-center justify-between border-b border-line bg-[#FBFCFD] px-[18px] py-3.5">
          <span className="font-mono text-[13px] font-semibold text-ink">RPT-2026-009</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11.5px] font-bold text-slate-600 ring-1 ring-inset ring-slate-200">Pending Review</span>
        </div>
        <div className="flex items-center gap-3.5 p-[18px]">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Gauge className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[13px] text-slate-500">Priority score</div>
            <div className="text-lg font-extrabold text-ink">74 <span className="text-xs font-semibold text-slate-400">/ 100</span></div>
          </div>
          <span className="ml-auto rounded-full bg-orange-50 px-2.5 py-1 text-[11.5px] font-bold text-orange-700">High severity</span>
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/my-reports" className="inline-flex items-center gap-2 rounded-[11px] bg-primary px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-dark">
          <CheckCircle2 className="h-4 w-4" /> Track my reports
        </Link>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-[11px] border border-slate-300 bg-white px-5 py-3 text-[14.5px] font-semibold text-ink transition-colors hover:bg-slate-100">
          Report another
        </button>
      </div>
    </div>
  );
}
