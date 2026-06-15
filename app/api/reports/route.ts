import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth";
import {
  getPriorityScoreBreakdown,
  isPendingLocationImpact
} from "@/lib/priority";
import { analyzeReportWithReka } from "@/lib/reka";

type ReportRequest = {
  description?: string;
  location_text?: string;
  media_url?: string;
  media_type?: "image" | "video";
  category?: string | null;
};

export async function POST(request: Request) {
  try {
    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json({ error: "Missing authorization token." }, { status: 401 });
    }

    const body = (await request.json()) as ReportRequest;
    const description = body.description?.trim();
    const locationText = body.location_text?.trim();
    const mediaUrl = body.media_url?.trim();
    const mediaType = body.media_type ?? "image";
    const category = body.category?.trim() || null;

    if (!description || !locationText || !mediaUrl) {
      return NextResponse.json(
        { error: "description, location_text, and media_url are required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient(accessToken);
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const profile = await ensureUserProfile(supabase, user);

    const analysis = await analyzeReportWithReka({
      description,
      locationText,
      mediaUrl,
      mediaType,
      category,
      congestionImpact: null
    });
    const priorityBreakdown = getPriorityScoreBreakdown({
      severity: analysis.severity,
      authenticityScore: analysis.authenticity_score,
      duplicateCount: 0,
      description,
      locationText,
      category,
      congestionImpact: analysis.congestion_impact
    });
    const congestionImpact = isPendingLocationImpact(analysis.congestion_impact)
      ? priorityBreakdown.locationImpactLabel
      : analysis.congestion_impact;

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        submitted_by_name: profile.full_name ?? user.email ?? "Citizen",
        title: analysis.issue_type,
        short_description: description,
        description,
        category,
        location_text: locationText,
        media_url: mediaUrl,
        media_type: mediaType,
        issue_type: analysis.issue_type,
        severity: analysis.severity,
        authenticity_score: analysis.authenticity_score,
        ai_summary: analysis.ai_summary,
        recommended_action: analysis.recommended_action,
        priority_score: priorityBreakdown.finalScore,
        congestion_impact: congestionImpact,
        duplicate_count: 0,
        status: "pending_review"
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ id: data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create report."
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
