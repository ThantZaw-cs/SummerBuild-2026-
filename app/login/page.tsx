"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  User
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { ensureUserProfile, redirectForRole } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const supabase = getSupabaseBrowserClient();

      if (isSignup) {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || null
              }
            }
          }),
          "Signup timed out. Please refresh and try again."
        );

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error("Sign up succeeded but no user was returned.");
        }

        const profile = await withTimeout(
          ensureUserProfile(supabase, data.user, {
            fullName,
            forceCitizenRole: true
          }),
          "Profile creation timed out. Please refresh and try again."
        );

        router.push(redirectForRole(profile.role));
      } else {
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password
          }),
          "Login timed out. Please refresh and try again."
        );

        if (error) {
          throw error;
        }

        if (!data.user) {
          throw new Error("Login succeeded but no user was returned.");
        }

        const profile = await withTimeout(
          ensureUserProfile(supabase, data.user),
          "Profile check timed out. Please refresh and try again."
        );
        router.push(redirectForRole(profile.role));
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to authenticate. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const tab = (active: boolean) =>
    `flex-1 rounded-lg py-2.5 text-[13.5px] font-semibold transition ${
      active ? "bg-white text-ink shadow-sm" : "text-slate-500"
    }`;

  return (
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-12">
      <div className="grid min-h-[520px] overflow-hidden rounded-[20px] border border-line bg-white shadow-2xl shadow-slate-300/40 md:grid-cols-2">
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
                "Free for every resident"
              ].map((text) => (
                <span key={text} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-[17px] w-[17px] text-[#5BBEAE]" />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="relative text-[12.5px] text-white/50">
            SummerBuild 2026 · civiclens.gov
          </div>
        </div>

        <div className="flex flex-col justify-center px-9 py-10">
          <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1">
            <button type="button" onClick={() => setMode("login")} className={tab(!isSignup)}>
              Sign in
            </button>
            <button type="button" onClick={() => setMode("signup")} className={tab(isSignup)}>
              Create account
            </button>
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
            {isSignup ? (
              <Field
                label="Full name"
                icon={User}
                placeholder="Jordan Tan"
                value={fullName}
                onChange={setFullName}
              />
            ) : null}
            <Field
              label="Email"
              icon={Mail}
              placeholder="you@email.com"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              label="Password"
              icon={Lock}
              placeholder="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1.5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
              <ArrowRight className="h-[17px] w-[17px]" />
            </button>
            {message ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

function withTimeout<T>(promise: Promise<T>, message: string, ms = 8000) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), ms);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

function Field({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      <span className="flex items-center gap-2.5 rounded-[10px] border border-slate-300 px-3">
        <Icon className="h-4 w-4 text-slate-400" />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          className="flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}
