import "server-only";

import { estimateLocationImpact } from "@/lib/priority";
import type { Database } from "@/lib/supabaseTypes";

export type RekaReportContext = {
  mediaUrl: string;
  mediaType: Database["public"]["Enums"]["report_media_type"];
  description: string;
  locationText: string;
  category: string | null;
  congestionImpact?: string | null;
};

export type RekaReportAnalysis = {
  issue_type: string;
  severity: Database["public"]["Enums"]["report_severity"];
  authenticity_score: number;
  congestion_impact: string;
  recommended_action: string;
  ai_summary: string;
  usedFallback: boolean;
  fallbackReason: "missing_key" | "request_failed" | "invalid_response" | null;
};

export async function analyzeReportWithReka(
  context: RekaReportContext
): Promise<RekaReportAnalysis> {
  const apiKey = process.env.REKA_API_KEY;
  const endpoint = getRekaEndpoint();

  if (!apiKey) {
    return {
      ...createMockAnalysis(context),
      usedFallback: true,
      fallbackReason: "missing_key"
    };
  }

  const model = process.env.REKA_MODEL ?? "reka-flash";
  const prompt = [
    "You are analyzing a civic infrastructure report for an agency dashboard.",
    "Return strict JSON only. Do not include markdown.",
    "The JSON object must contain exactly these fields:",
    "{",
    '  "issue_type": "string",',
    '  "severity": "low | medium | high | critical",',
    '  "authenticity_score": 0,',
    '  "congestion_impact": "string location impact label",',
    '  "recommended_action": "string",',
    '  "ai_summary": "string"',
    "}",
    `Description: ${context.description}`,
    `Location: ${context.locationText}`,
    context.category ? `Citizen category hint: ${context.category}` : null,
    `Media type: ${context.mediaType}`
  ]
    .filter(Boolean)
    .join("\n");

  const content =
    context.mediaType === "image"
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: context.mediaUrl } }
        ]
      : [{ type: "text", text: `${prompt}\nVideo URL: ${context.mediaUrl}` }];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "civiclens_report_analysis",
            schema: reportAnalysisSchema,
            strict: true
          }
        }
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      logRekaFailure(endpoint, response.status, responseText);
      return {
        ...createMockAnalysis(context),
        usedFallback: true,
        fallbackReason: "request_failed"
      };
    }

    const payload = JSON.parse(responseText);
    const rawContent =
      payload?.choices?.[0]?.message?.content ??
      payload?.output_text ??
      payload?.text ??
      payload;
    const parsed =
      typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;

    return {
      ...sanitizeRekaAnalysis(parsed, context),
      usedFallback: false,
      fallbackReason: null
    };
  } catch (error) {
    console.error("Reka API analysis failed; using mock fallback.", {
      endpoint,
      error: error instanceof Error ? error.message : error
    });

    return {
      ...createMockAnalysis(context),
      usedFallback: true,
      fallbackReason: "invalid_response"
    };
  }
}

export function sanitizeRekaAnalysis(
  value: Partial<RekaReportAnalysis>,
  context: RekaReportContext
): Omit<RekaReportAnalysis, "usedFallback" | "fallbackReason"> {
  return {
    issue_type: safeText(value.issue_type, inferIssueType(context), 80),
    severity: normalizeSeverity(value.severity),
    authenticity_score: normalizeAuthenticityScore(value.authenticity_score),
    congestion_impact: normalizeLocationImpactLabel(
      value.congestion_impact,
      estimateLocationImpact({
        severity: normalizeSeverity(value.severity),
        authenticityScore: normalizeAuthenticityScore(value.authenticity_score),
        duplicateCount: 0,
        description: context.description,
        locationText: context.locationText,
        category: context.category,
        congestionImpact: context.congestionImpact
      }).label
    ),
    recommended_action: safeText(
      value.recommended_action,
      "Review and route to the appropriate maintenance team.",
      500
    ),
    ai_summary: safeText(
      value.ai_summary,
      "AI summary unavailable. Agency review is required.",
      900
    )
  };
}

function createMockAnalysis(
  context: RekaReportContext
): Omit<RekaReportAnalysis, "usedFallback" | "fallbackReason"> {
  const issueType = inferIssueType(context);
  const severity = inferSeverity(context);
  const locationImpact = estimateLocationImpact({
    severity,
    authenticityScore: 82,
    duplicateCount: 0,
    description: context.description,
    locationText: context.locationText,
    category: context.category,
    congestionImpact: context.congestionImpact
  });

  return {
    issue_type: issueType,
    severity,
    authenticity_score: context.mediaUrl ? 82 : 60,
    congestion_impact: locationImpact.label,
    recommended_action:
      "Inspect the site, verify the hazard, and route the case to the responsible maintenance team.",
    ai_summary: `Mock AI analysis: ${issueType} reported at ${context.locationText}. The report should be reviewed for safety risk, public access impact, and repair urgency.`
  };
}

function inferIssueType(context: RekaReportContext) {
  const text = `${context.description} ${context.category ?? ""}`.toLowerCase();

  if (text.includes("light") || text.includes("lamp")) return "Lighting Failure";
  if (text.includes("drain") || text.includes("flood")) return "Drainage Issue";
  if (text.includes("tree") || text.includes("branch")) return "Fallen Tree";
  if (text.includes("sign")) return "Signage Damage";
  if (text.includes("road") || text.includes("pothole")) return "Road Damage";
  if (text.includes("crack") || text.includes("pavement")) return "Pavement Damage";

  return "Infrastructure Issue";
}

function inferSeverity(
  context: RekaReportContext
): Database["public"]["Enums"]["report_severity"] {
  const text = `${context.description} ${context.locationText} ${context.category ?? ""}`.toLowerCase();

  if (
    text.includes("danger") ||
    text.includes("emergency") ||
    text.includes("hospital") ||
    text.includes("expressway")
  ) {
    return "critical";
  }

  if (
    text.includes("blocked") ||
    text.includes("major") ||
    text.includes("school") ||
    text.includes("traffic")
  ) {
    return "high";
  }

  if (text.includes("walkway") || text.includes("bus stop") || text.includes("park")) {
    return "medium";
  }

  return "low";
}

function normalizeSeverity(
  value: unknown
): Database["public"]["Enums"]["report_severity"] {
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

function safeText(value: unknown, fallback: string, maxLength: number) {
  const text = String(value ?? "").trim();
  const safeValue = text || fallback;

  return safeValue.slice(0, maxLength);
}

function clampScore(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function normalizeAuthenticityScore(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  if (numberValue > 0 && numberValue <= 1) {
    return clampScore(numberValue * 100);
  }

  return clampScore(numberValue);
}

function normalizeLocationImpactLabel(value: unknown, fallback: string) {
  const normalized = String(value ?? "")
    .toLowerCase()
    .trim();

  if (normalized === "critical") return "Critical Location Impact";
  if (normalized === "high") return "High Location Impact";
  if (normalized === "medium") return "Medium Location Impact";
  if (normalized === "low") return "Low Location Impact";

  return safeText(value, fallback, 80);
}

function getRekaEndpoint() {
  const baseUrl = (process.env.REKA_API_URL ?? "https://api.reka.ai/v1").replace(
    /\/+$/,
    ""
  );

  return `${baseUrl}/chat/completions`;
}

function logRekaFailure(endpoint: string, status: number, body: string) {
  console.error("Reka API request failed; using mock fallback.", {
    endpoint,
    status,
    body
  });
}

const reportAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    issue_type: { type: "string" },
    severity: {
      type: "string",
      enum: ["low", "medium", "high", "critical"]
    },
    authenticity_score: {
      type: "number",
      minimum: 0,
      maximum: 100
    },
    congestion_impact: { type: "string" },
    recommended_action: { type: "string" },
    ai_summary: { type: "string" }
  },
  required: [
    "issue_type",
    "severity",
    "authenticity_score",
    "congestion_impact",
    "recommended_action",
    "ai_summary"
  ]
};
