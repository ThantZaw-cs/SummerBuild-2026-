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
  responsible_agency: string;
  agency_reason: string;
  routing_confidence: number;
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
    '  "authenticity_score": 85,',
    '  "congestion_impact": "High Location Impact",',
    '  "responsible_agency": "string",',
    '  "agency_reason": "string",',
    '  "routing_confidence": 85,',
    '  "recommended_action": "string",',
    '  "ai_summary": "string"',
    "}",
    "For responsible_agency, recommend the best Singapore agency or routing owner.",
    "Use agencies such as LTA, PUB, NParks, NEA, HDB / Town Council, SCDF, SPF, or Municipal Services Office.",
    "For congestion_impact, return one of: Critical Location Impact, High Location Impact, Medium Location Impact, Low Location Impact, Unknown Location Impact.",
    "routing_confidence must be a number from 1 to 100. Use 0 only if no responsible agency can be inferred.",
    "Severity guidance: sinkholes, subsidence, ground collapse, bridge collapse, structural collapse, exposed live electrical hazards, gas leaks, fires, and emergency access blockage are critical.",
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
          { type: "image_url", image_url: { url: context.mediaUrl } },
          { type: "text", text: prompt }
        ]
      : [
          { type: "video_url", video_url: context.mediaUrl },
          { type: "text", text: prompt }
        ];

  try {
    const body: Record<string, unknown> = {
      model,
      messages: [
        {
          role: "user",
          content
        }
      ]
    };

    if (model.includes("research")) {
      body.response_format = {
        type: "json_schema",
        json_schema: {
          name: "civiclens_report_analysis",
          schema: reportAnalysisSchema,
          strict: true
        }
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
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
      typeof rawContent === "string" ? parseJsonFromText(rawContent) : rawContent;

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
  const issueType = safeText(value.issue_type, inferIssueType(context), 80);
  const routing = sanitizeAgencyRouting(value, context, issueType);
  const recommendedAction = safeText(
    value.recommended_action,
    "Review and route to the appropriate maintenance team.",
    500
  );
  const aiSummary = safeText(
    value.ai_summary,
    "AI summary unavailable. Agency review is required.",
    900
  );

  const severity = forceCriticalHazard(context, issueType)
    ? "critical"
    : normalizeSeverity(value.severity);

  return {
    issue_type: issueType,
    severity,
    authenticity_score: normalizeAuthenticityScore(value.authenticity_score),
    congestion_impact: normalizeLocationImpactLabel(
      value.congestion_impact,
      estimateLocationImpact({
        severity,
        authenticityScore: normalizeAuthenticityScore(value.authenticity_score),
        duplicateCount: 0,
        description: context.description,
        locationText: context.locationText,
        category: context.category,
        congestionImpact: context.congestionImpact
      }).label
    ),
    responsible_agency: routing.responsible_agency,
    agency_reason: routing.agency_reason,
    routing_confidence: routing.routing_confidence,
    recommended_action: withAgencyRecommendation(recommendedAction, routing),
    ai_summary: withAgencySummary(aiSummary, routing)
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
  const routing = inferAgencyRouting(context, issueType);

  return {
    issue_type: issueType,
    severity,
    authenticity_score: context.mediaUrl ? 82 : 60,
    congestion_impact: locationImpact.label,
    responsible_agency: routing.responsible_agency,
    agency_reason: routing.agency_reason,
    routing_confidence: routing.routing_confidence,
    recommended_action:
      withAgencyRecommendation(
        "Inspect the site, verify the hazard, and route the case to the responsible maintenance team.",
        routing
      ),
    ai_summary: withAgencySummary(
      `Mock AI analysis: ${issueType} reported at ${context.locationText}. The report should be reviewed for safety risk, public access impact, and repair urgency.`,
      routing
    )
  };
}

type AgencyRouting = Pick<
  RekaReportAnalysis,
  "responsible_agency" | "agency_reason" | "routing_confidence"
>;

function sanitizeAgencyRouting(
  value: Partial<RekaReportAnalysis>,
  context: RekaReportContext,
  issueType: string
): AgencyRouting {
  const inferred = inferAgencyRouting(context, issueType);
  const responsibleAgency = safeText(
    value.responsible_agency,
    inferred.responsible_agency,
    80
  );
  const agencyReason = safeText(value.agency_reason, inferred.agency_reason, 220);
  const aiConfidence =
    value.routing_confidence === undefined
      ? inferred.routing_confidence
      : clampScore(value.routing_confidence);
  const routingConfidence = aiConfidence > 0 ? aiConfidence : inferred.routing_confidence;

  return {
    responsible_agency: responsibleAgency,
    agency_reason: agencyReason,
    routing_confidence: routingConfidence
  };
}

function inferAgencyRouting(
  context: RekaReportContext,
  issueType: string
): AgencyRouting {
  const text = `${context.description} ${context.locationText} ${context.category ?? ""} ${issueType}`.toLowerCase();

  if (
    includesAny(text, ["fire", "smoke", "gas leak", "collapse", "emergency", "evacuation"])
  ) {
    return {
      responsible_agency: "SCDF",
      agency_reason: "The report may involve immediate public safety or emergency response.",
      routing_confidence: 88
    };
  }

  if (includesAny(text, ["crime", "vandal", "assault", "theft", "dangerous driving"])) {
    return {
      responsible_agency: "SPF",
      agency_reason: "The issue appears to involve enforcement or public safety concerns.",
      routing_confidence: 82
    };
  }

  if (
    includesAny(text, [
      "drain",
      "drainage",
      "flood",
      "waterway",
      "canal",
      "ponding",
      "sewer"
    ])
  ) {
    return {
      responsible_agency: "PUB",
      agency_reason: "The report relates to drainage, flooding, waterways, or water infrastructure.",
      routing_confidence: 90
    };
  }

  if (
    includesAny(text, ["tree", "branch", "park", "greenery", "grass", "plant", "playground"])
  ) {
    return {
      responsible_agency: "NParks",
      agency_reason: "The report relates to greenery, parks, trees, or park facilities.",
      routing_confidence: 86
    };
  }

  if (
    includesAny(text, ["litter", "trash", "rubbish", "bin", "pest", "mosquito", "cleanliness"])
  ) {
    return {
      responsible_agency: "NEA",
      agency_reason: "The report relates to environmental cleanliness or public health.",
      routing_confidence: 84
    };
  }

  if (
    includesAny(text, [
      "road",
      "pothole",
      "pavement",
      "traffic light",
      "street light",
      "lamp",
      "bus stop",
      "zebra crossing",
      "pedestrian crossing",
      "expressway",
      "highway",
      "signage"
    ])
  ) {
    return {
      responsible_agency: "LTA",
      agency_reason: "The report relates to roads, traffic assets, public transport stops, or street infrastructure.",
      routing_confidence: 89
    };
  }

  if (
    includesAny(text, [
      "hdb",
      "void deck",
      "residential block",
      "town council",
      "lift lobby",
      "common corridor",
      "estate",
      "carpark"
    ])
  ) {
    return {
      responsible_agency: "HDB / Town Council",
      agency_reason: "The report appears to involve residential estate or common-area maintenance.",
      routing_confidence: 78
    };
  }

  return {
    responsible_agency: "Municipal Services Office",
    agency_reason: "The issue needs cross-agency triage before assignment to a specific owner.",
    routing_confidence: 60
  };
}

function withAgencyRecommendation(action: string, routing: AgencyRouting) {
  return safeText(
    `Recommended agency: ${routing.responsible_agency} (${routing.routing_confidence}% confidence). Reason: ${routing.agency_reason} Next action: ${action}`,
    action,
    900
  );
}

function withAgencySummary(summary: string, routing: AgencyRouting) {
  return safeText(
    `${summary}\n\nAgency routing: ${routing.responsible_agency} - ${routing.agency_reason}`,
    summary,
    1200
  );
}

function includesAny(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
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

  if (forceCriticalHazard(context, inferIssueType(context))) {
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

function forceCriticalHazard(context: RekaReportContext, issueType: string) {
  const text = `${context.description} ${context.locationText} ${context.category ?? ""} ${issueType}`.toLowerCase();

  return includesAny(text, [
    "sinkhole",
    "sink hole",
    "subsidence",
    "ground collapse",
    "road collapse",
    "structural collapse",
    "bridge collapse",
    "collapsed road",
    "exposed wire",
    "live wire",
    "electrical hazard",
    "gas leak",
    "fire",
    "smoke",
    "emergency",
    "evacuation"
  ]);
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

  if (
    !normalized ||
    normalized === "string location impact label" ||
    normalized === "text estimate" ||
    normalized === "estimate" ||
    normalized === "unknown"
  ) {
    return fallback;
  }

  if (normalized === "critical") return "Critical Location Impact";
  if (normalized === "high") return "High Location Impact";
  if (normalized === "medium") return "Medium Location Impact";
  if (normalized === "low") return "Low Location Impact";
  if (normalized.includes("critical")) return "Critical Location Impact";
  if (normalized.includes("high")) return "High Location Impact";
  if (normalized.includes("medium")) return "Medium Location Impact";
  if (normalized.includes("low")) return "Low Location Impact";

  return safeText(value, fallback, 80);
}

function parseJsonFromText(value: string) {
  const trimmed = value.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Reka response did not contain JSON.");
    }

    return JSON.parse(jsonMatch[0]);
  }
}

function getRekaEndpoint() {
  const configuredUrl = (
    process.env.REKA_API_URL ?? "https://api.reka.ai/v1"
  ).replace(/\/+$/, "");

  if (configuredUrl.endsWith("/chat/completions")) {
    return configuredUrl;
  }

  return `${configuredUrl}/chat/completions`;
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
    responsible_agency: { type: "string" },
    agency_reason: { type: "string" },
    routing_confidence: {
      type: "number",
      minimum: 0,
      maximum: 100
    },
    recommended_action: { type: "string" },
    ai_summary: { type: "string" }
  },
  required: [
    "issue_type",
    "severity",
    "authenticity_score",
    "congestion_impact",
    "responsible_agency",
    "agency_reason",
    "routing_confidence",
    "recommended_action",
    "ai_summary"
  ]
};
