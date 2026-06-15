import { NextResponse } from "next/server";
import { fetchUserProfile } from "@/lib/auth";
import {
  calculatePriorityScore,
  estimateLocationImpact,
  isPendingLocationImpact
} from "@/lib/priority";
import { analyzeReportWithReka } from "@/lib/reka";
import { normalizeSupabaseReport, reportSelect } from "@/lib/reports";
import { createSupabaseClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select(reportSelect)
      .eq("id", id)
      .single();

    if (reportError) {
      return NextResponse.json({ error: reportError.message }, { status: 404 });
    }

    if (!report.media_url) {
      return NextResponse.json(
        { error: "This report does not have media for AI analysis." },
        { status: 400 }
      );
    }

    const analysis = await analyzeReportWithReka({
      mediaUrl: report.media_url,
      mediaType: report.media_type ?? "image",
      description: report.description || report.short_description,
      locationText: report.location_text,
      category: report.category,
      congestionImpact: report.congestion_impact
    });
    const priorityInput = {
      severity: analysis.severity,
      authenticityScore: analysis.authenticity_score,
      duplicateCount: report.duplicate_count,
      description: report.description || report.short_description,
      locationText: report.location_text,
      category: report.category,
      congestionImpact: analysis.congestion_impact
    };
    const priorityScore = calculatePriorityScore(priorityInput);
    const congestionImpact = isPendingLocationImpact(analysis.congestion_impact)
      ? estimateLocationImpact(priorityInput).label
      : analysis.congestion_impact;

    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({
        issue_type: analysis.issue_type,
        severity: analysis.severity,
        authenticity_score: analysis.authenticity_score,
        congestion_impact: congestionImpact,
        recommended_action: analysis.recommended_action,
        ai_summary: analysis.ai_summary,
        priority_score: priorityScore
      })
      .eq("id", id)
      .select(reportSelect)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const note = `AI set ${analysis.issue_type}, ${analysis.severity} severity, priority ${priorityScore}/100${
      analysis.usedFallback ? " using mock fallback" : ""
    }.`;
    const { error: logError } = await supabase.from("report_activity_logs").insert({
      report_id: id,
      actor_id: user.id,
      action: "AI analysis generated",
      note
    });

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 400 });
    }

    return NextResponse.json({
      report: updatedReport,
      normalizedReport: normalizeSupabaseReport(updatedReport),
      usedFallback: analysis.usedFallback,
      fallbackReason: analysis.fallbackReason,
      note
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to run AI analysis."
      },
      { status: 500 }
    );
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice("bearer ".length).trim();
}
