import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/auth";
import type { Database } from "@/lib/supabaseTypes";

type ReportRequest = {
  description?: string;
  location_text?: string;
  media_url?: string;
  media_type?: "image" | "video";
  category?: string | null;
};

type RekaAnalysis = {
  issue_type: string;
  severity: Database["public"]["Enums"]["report_severity"];
  authenticity_score: number;
  ai_summary: string;
  recommended_action: string;
  priority_score: number;
  congestion_impact: string;
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

    const analysis = await analyzeWithReka({
      description,
      locationText,
      mediaUrl,
      mediaType,
      categoryHint: category
    });

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
        priority_score: analysis.priority_score,
        congestion_impact: analysis.congestion_impact,
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

async function analyzeWithReka({
  description,
  locationText,
  mediaUrl,
  mediaType,
  categoryHint
}: {
  description: string;
  locationText: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  categoryHint: string | null;
}): Promise<RekaAnalysis> {
  const apiKey = process.env.REKA_API_KEY;
  const apiUrl = process.env.REKA_API_URL ?? "https://api.reka.ai/v1/chat/completions";
  const model = process.env.REKA_MODEL ?? "reka-flash";

  if (!apiKey) {
    throw new Error("Missing REKA_API_KEY environment variable.");
  }

  const prompt = [
    "Analyze this civic infrastructure report and return JSON only.",
    "The JSON shape must be:",
    "{\"issue_type\":\"string\",\"severity\":\"low|medium|high|critical\",\"authenticity_score\":0-100,\"ai_summary\":\"string\",\"recommended_action\":\"string\",\"priority_score\":0-100,\"congestion_impact\":\"string\"}",
    `Description: ${description}`,
    `Location: ${locationText}`,
    categoryHint ? `Citizen category hint: ${categoryHint}` : null,
    `Media type: ${mediaType}`
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: mediaUrl } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Reka API request failed: ${errorText || response.statusText}`);
  }

  const payload = await response.json();
  const content =
    payload?.choices?.[0]?.message?.content ??
    payload?.output_text ??
    payload?.text ??
    payload;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return normalizeRekaAnalysis(parsed);
}

function normalizeRekaAnalysis(value: Partial<RekaAnalysis>): RekaAnalysis {
  return {
    issue_type: String(value.issue_type ?? "Submitted Report"),
    severity: normalizeSeverity(value.severity),
    authenticity_score: clampScore(value.authenticity_score),
    ai_summary: String(value.ai_summary ?? "AI summary unavailable."),
    recommended_action: String(value.recommended_action ?? "Review and route to the appropriate maintenance team."),
    priority_score: clampScore(value.priority_score),
    congestion_impact: String(value.congestion_impact ?? "Pending analysis")
  };
}

function normalizeSeverity(value: unknown): RekaAnalysis["severity"] {
  const normalized = String(value ?? "").toLowerCase();

  if (
    normalized === "critical" ||
    normalized === "high" ||
    normalized === "medium" ||
    normalized === "low"
  ) {
    return normalized;
  }

  return "low";
}

function clampScore(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}
