import { NextResponse } from "next/server";
import { fetchUserProfile } from "@/lib/auth";
import {
  calculatePriorityScore,
  estimateLocationImpact,
  isPendingLocationImpact
} from "@/lib/priority";
import { analyzeReportWithReka } from "@/lib/reka";
import {
  normalizeSupabaseReport,
  reportSelect,
  type ReportRow,
  type SupabaseStatus
} from "@/lib/reports";
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
    const basePriorityInput = {
      severity: analysis.severity,
      authenticityScore: analysis.authenticity_score,
      duplicateCount: 0,
      description: report.description || report.short_description,
      locationText: report.location_text,
      category: report.category,
      congestionImpact: analysis.congestion_impact
    };
    const congestionImpact = isPendingLocationImpact(analysis.congestion_impact)
      ? estimateLocationImpact(basePriorityInput).label
      : analysis.congestion_impact;
    const duplicateSync = await syncDuplicateReports(supabase, {
      report,
      issueType: analysis.issue_type,
      severity: analysis.severity,
      authenticityScore: analysis.authenticity_score,
      congestionImpact
    });
    const priorityScore = calculatePriorityScore({
      ...basePriorityInput,
      duplicateCount: duplicateSync.duplicateCount,
      congestionImpact
    });
    const nextStatus = getPostAnalysisStatus(report.status);

    const { data: updatedReport, error: updateError } = await supabase
      .from("reports")
      .update({
        issue_type: analysis.issue_type,
        severity: analysis.severity,
        authenticity_score: analysis.authenticity_score,
        congestion_impact: congestionImpact,
        recommended_action: analysis.recommended_action,
        ai_summary: analysis.ai_summary,
        priority_score: priorityScore,
        duplicate_count: duplicateSync.duplicateCount,
        status: nextStatus
      })
      .eq("id", id)
      .select(reportSelect)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    const duplicateNote =
      duplicateSync.duplicateCount > 0
        ? `, found ${duplicateSync.duplicateCount} likely duplicate${
            duplicateSync.duplicateCount === 1 ? "" : "s"
          }`
        : "";
    const statusNote = nextStatus !== report.status ? ", marked as verified" : "";
    const note = `AI set ${analysis.issue_type}, ${analysis.severity} severity, priority ${priorityScore}/100, routed to ${analysis.responsible_agency}${duplicateNote}${statusNote}${
      analysis.usedFallback ? " using mock fallback" : ""
    }.`;
    const { error: logError } = await supabase.from("report_activity_logs").insert({
      report_id: id,
      actor_id: user.id,
      action: "AI analysis generated",
      old_status: report.status,
      new_status: nextStatus,
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

type SupabaseServerClient = ReturnType<typeof createSupabaseClient>;

type DuplicateSyncInput = {
  report: ReportRow;
  issueType: string;
  severity: ReportRow["severity"];
  authenticityScore: number;
  congestionImpact: string;
};

type DuplicateCandidate = Pick<
  ReportRow,
  | "id"
  | "short_description"
  | "description"
  | "category"
  | "issue_type"
  | "location_text"
  | "latitude"
  | "longitude"
  | "severity"
  | "authenticity_score"
  | "duplicate_count"
  | "congestion_impact"
>;

async function syncDuplicateReports(
  supabase: SupabaseServerClient,
  input: DuplicateSyncInput
) {
  const current = withAnalysisFields(input);
  const { data, error } = await supabase
    .from("reports")
    .select(reportSelect)
    .neq("id", input.report.id)
    .limit(250);

  if (error) {
    console.error("Duplicate check failed", error);
    return { duplicateCount: input.report.duplicate_count };
  }

  const matches = (data ?? [])
    .map((candidate) => ({
      report: candidate,
      score: scoreDuplicate(current, candidate)
    }))
    .filter((match) => match.score >= 45);

  if (matches.length === 0) {
    return { duplicateCount: 0 };
  }

  const duplicateGroup = [current, ...matches.map((match) => match.report)];
  const duplicateCount = duplicateGroup.length - 1;

  await Promise.all(
    duplicateGroup.map((report) =>
      supabase
        .from("reports")
        .update({
          duplicate_count: duplicateCount,
          priority_score: calculatePriorityScore({
            severity: report.severity,
            authenticityScore: report.authenticity_score,
            duplicateCount,
            description: report.description || report.short_description,
            locationText: report.location_text,
            category: report.category,
            congestionImpact: report.congestion_impact
          })
        })
        .eq("id", report.id)
    )
  );

  const duplicateRows = createDuplicateRows(duplicateGroup);

  if (duplicateRows.length > 0) {
    const { error: duplicateError } = await supabase
      .from("report_duplicates")
      .upsert(duplicateRows, {
        onConflict: "report_id,duplicate_of_report_id",
        ignoreDuplicates: true
      });

    if (duplicateError) {
      console.error("Duplicate pair insert failed", duplicateError);
    }
  }

  return { duplicateCount };
}

function withAnalysisFields(input: DuplicateSyncInput): DuplicateCandidate {
  return {
    id: input.report.id,
    short_description: input.report.short_description,
    description: input.report.description,
    category: input.report.category,
    issue_type: input.issueType,
    location_text: input.report.location_text,
    latitude: input.report.latitude,
    longitude: input.report.longitude,
    severity: input.severity,
    authenticity_score: input.authenticityScore,
    duplicate_count: input.report.duplicate_count,
    congestion_impact: input.congestionImpact
  };
}

function createDuplicateRows(group: DuplicateCandidate[]) {
  const rows: Array<{
    report_id: string;
    duplicate_of_report_id: string;
    similarity_score: number;
  }> = [];

  for (const report of group) {
    for (const other of group) {
      if (report.id === other.id) {
        continue;
      }

      rows.push({
        report_id: report.id,
        duplicate_of_report_id: other.id,
        similarity_score: scoreDuplicate(report, other)
      });
    }
  }

  return rows;
}

function scoreDuplicate(a: DuplicateCandidate, b: DuplicateCandidate) {
  const locationOverlap = jaccard(tokenize(a.location_text), tokenize(b.location_text));
  const descriptionOverlap = jaccard(
    tokenize(`${a.description || a.short_description} ${a.issue_type}`),
    tokenize(`${b.description || b.short_description} ${b.issue_type}`)
  );
  const categoryScore = a.category && b.category && a.category === b.category ? 10 : 0;
  const issueScore =
    !isPendingIssue(a.issue_type) &&
    !isPendingIssue(b.issue_type) &&
    normalizeText(a.issue_type) === normalizeText(b.issue_type)
      ? 15
      : 0;
  const distanceScore = getDistanceScore(a, b);
  const score = Math.round(
    Math.min(
      100,
      locationOverlap * 40 +
        descriptionOverlap * 30 +
        categoryScore +
        issueScore +
        distanceScore
    )
  );

  if (
    score >= 45 ||
    (locationOverlap >= 0.5 && descriptionOverlap >= 0.12) ||
    (distanceScore >= 25 && descriptionOverlap >= 0.15)
  ) {
    return score;
  }

  return 0;
}

function getDistanceScore(a: DuplicateCandidate, b: DuplicateCandidate) {
  if (
    a.latitude === null ||
    a.longitude === null ||
    b.latitude === null ||
    b.longitude === null
  ) {
    return 0;
  }

  const distance = distanceInMeters(a.latitude, a.longitude, b.latitude, b.longitude);

  if (distance <= 100) return 35;
  if (distance <= 250) return 24;
  if (distance <= 500) return 12;

  return 0;
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function jaccard(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const aSet = new Set(a);
  const bSet = new Set(b);
  const intersection = [...aSet].filter((token) => bSet.has(token)).length;
  const union = new Set([...aSet, ...bSet]).size;

  return union === 0 ? 0 : intersection / union;
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isPendingIssue(issueType: string) {
  return normalizeText(issueType).includes("pending ai analysis");
}

function getPostAnalysisStatus(current: SupabaseStatus): SupabaseStatus {
  if (current === "pending_review" || current === "under_review") {
    return "verified";
  }

  return current;
}

const stopWords = new Set([
  "the",
  "and",
  "for",
  "with",
  "near",
  "this",
  "that",
  "there",
  "here",
  "issue",
  "report",
  "road",
  "street",
  "avenue",
  "block",
  "singapore"
]);

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice("bearer ".length).trim();
}
