"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import {
  ensureUserProfile,
  fetchUserProfile,
  redirectForRole
} from "@/lib/auth";
import type { UserRole } from "@/lib/reports";

type AuthGateProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGate({ children, allowedRoles }: AuthGateProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const allowedRolesKey = allowedRoles?.join("|") ?? "";

  useEffect(() => {
    let isActive = true;
    let didTimeOut = false;
    const supabase = getSupabaseBrowserClient();
    const timeoutId = window.setTimeout(() => {
      if (!isActive) {
        return;
      }

      didTimeOut = true;
      setIsAllowed(false);
      setErrorMessage("Auth check timed out. Please try again.");
      setIsLoading(false);
    }, 5000);

    async function checkAuth() {
      setIsLoading(true);
      setIsAllowed(false);
      setErrorMessage(null);

      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (!isActive || didTimeOut) {
          return;
        }

        if (sessionError) {
          console.error("Supabase session fetch failed:", sessionError);
          throw sessionError;
        }

        if (!sessionData.session) {
          router.replace("/login");
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (!isActive || didTimeOut) {
          return;
        }

        if (userError) {
          console.error("Supabase user fetch failed:", userError);
          throw userError;
        }

        if (!userData.user) {
          router.replace("/login");
          return;
        }

        let profile = await fetchUserProfile(supabase, userData.user.id);

        if (!profile) {
          await ensureUserProfile(supabase, userData.user);
          profile = await fetchUserProfile(supabase, userData.user.id);
        }

        const role = profile?.role ?? "citizen";

        if (allowedRoles && !allowedRoles.includes(role)) {
          router.replace(redirectForRole(role));
          return;
        }

        setIsAllowed(true);
      } catch (error) {
        console.error("Unable to resolve auth/profile for protected route:", error);
        setIsAllowed(false);
        setErrorMessage("Unable to verify your access. Please try again.");
      } finally {
        if (isActive && !didTimeOut) {
          window.clearTimeout(timeoutId);
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [allowedRolesKey, router, retryKey]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          Checking your session...
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-xl border border-line bg-white p-6 text-sm text-slate-500 shadow-sm">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return isAllowed ? <>{children}</> : null;
}
