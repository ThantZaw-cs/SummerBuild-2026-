"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const isSignup = mode === "signup";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // Prototype: no real auth — send agency users to the dashboard.
    router.push("/dashboard");
  }

  const tab = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold transition ${
      active ? "bg-white text-ink shadow-sm" : "text-slate-500"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-12">
      <div className="grid min-h-[520px] overflow-hidden rounded-[20px] border border-line bg-white shadow-2xl shadow-slate-300/40 md:grid-cols-2">
        {/* Brand panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-ink p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_240px_at_20%_0%,rgba(195,96,34,0.28),transparent)]" />
          <div className="relative flex items-center gap-2.5">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-primary text-white">
              <Shield className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[19px] font-extrabold text-white">CivicLens</span>
          </div>
          <div className="relative">
            <h2 className="text-[26px] font-extrabold leading-tight tracking-tight text-white">
              Your city, in better repair.
            </h2>
            <p className="mt-3.5 text-[15px] leading-relaxed text-white/70">
              Every report you file is triaged, scored and routed to the agency
              that can fix it.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {[
                "Report in under 30 seconds",
                "Track every report to resolution",
                "Free for every resident",
              ].map((t) => (
                <span key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-[17px] w-[17px] text-[#5BBEAE]" />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="relative text-[12.5px] text-white/50">
            SummerBuild 2026 · civiclens.gov
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col justify-center px-9 py-10">
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
            <button onClick={() => setMode("login")} className={tab(!isSignup)}>Sign in</button>
            <button onClick={() => setMode("signup")} className={tab(isSignup)}>Create account</button>
          </div>
          <h1 className="text-[23px] font-extrabold tracking-tight text-ink">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-5 mt-1.5 text-sm text-slate-500">
            {isSignup
              ? "Report issues, track progress, and help improve your city."
              : "Sign in to file reports and track their progress."}
          </p>

          <form onSubmit={submit} className="flex flex-col gap-3.5">
            {isSignup && (
              <Field label="Full name" icon={User} placeholder="Jordan Tan" />
            )}
            <Field label="Email" icon={Mail} placeholder="you@email.com" type="email" />
            <Field label="Password" icon={Lock} placeholder="••••••••" type="password" />
            <button
              type="submit"
              className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
            >
              {isSignup ? "Create account" : "Sign in"}
              <ArrowRight className="h-[17px] w-[17px]" />
            </button>
            <div className="my-1 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-xs text-slate-400">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-ink transition-colors hover:bg-slate-100"
            >
              <User className="h-4 w-4" /> Continue as guest
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      <span className="flex items-center gap-2.5 rounded-[10px] border border-slate-300 px-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}
