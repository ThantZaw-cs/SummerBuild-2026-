import { NextResponse } from "next/server";
import { fetchUserProfile } from "@/lib/auth";
import { reportSelect } from "@/lib/reports";
import { createSupabaseClient } from "@/lib/supabase";

const batchSize = 3;

type AnalyzeResult = {
  id: string;
  ok: boolean;
  note?: string;
  error?: string;
};

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const supabase = createSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const profile = await fetchUserProfile(supabase, user.id);

    if (profile?.role !== "agency" && profile?.role !== "admin") {
      return NextResponse.json({ error: "Agency or admin access required." }, { status: 403 });
    }

    const { data: reports, error } = await supabase
      .from("reports")
      .select(reportSelect)
      .eq("status", "pending_review")
      .not("media_url", "is", null)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const results: AnalyzeResult[] = [];
    const pendingReports = reports ?? [];

    for (let index = 0; index < pendingReports.length; index += batchSize) {
      const batch = pendingReports.slice(index, index + batchSize);
      const batchResults = await Promise.all(
        batch.map((report) => analyzeOneReport(request, accessToken, report.id))
      );
      results.push(...batchResults);
    }

    return NextResponse.json({
      total: pendingReports.length,
      analyzed: results.filter((result) => result.ok).length,
      failed: results.filter((result) => !result.ok).length,
      results
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to analyze pending reports."
      },
      { status: 500 }
    );
  }
}

async function analyzeOneReport(
  request: Request,
  accessToken: string,
  reportId: string
): Promise<AnalyzeResult> {
  try {
    const response = await fetch(new URL(`/api/reports/${reportId}/analyze`, request.url), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const payload = (await response.json()) as { note?: string; error?: string };

    if (!response.ok) {
      return {
        id: reportId,
        ok: false,
        error: payload.error ?? "AI analysis failed."
      };
    }

    return {
      id: reportId,
      ok: true,
      note: payload.note
    };
  } catch (error) {
    return {
      id: reportId,
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "AI analysis failed."
    };
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice("bearer ".length).trim();
}
