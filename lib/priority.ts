import type { Severity } from "@/lib/reports";

export type PriorityInput = {
  severity: Severity;
  authenticityScore: number;
  duplicateCount: number;
  description?: string | null;
  locationText?: string | null;
  category?: string | null;
  congestionImpact?: string | null;
};

type LocationImpactLevel = "critical" | "high" | "medium" | "low" | "unknown";

type LocationImpactResult = {
  level: LocationImpactLevel;
  score: number;
  label: string;
  matchedKeywords: string[];
};

export type PriorityScoreBreakdown = {
  severityScore: number;
  authenticityContribution: number;
  duplicateContribution: number;
  locationImpactContribution: number;
  finalScore: number;
  matchedLocationKeywords: string[];
  locationImpactLabel: string;
  explanation: string;
};

const severityScores: Record<Severity, number> = {
  low: 10,
  medium: 25,
  high: 45,
  critical: 60
};

const locationKeywordLevels: Array<{
  level: LocationImpactLevel;
  score: number;
  label: string;
  keywords: string[];
}> = [
  {
    level: "critical",
    score: 10,
    label: "Critical Location Impact",
    keywords: [
      "mrt",
      "train station",
      "hospital",
      "expressway",
      "highway",
      "major road",
      "school zone",
      "emergency",
      "evacuation route"
    ]
  },
  {
    level: "high",
    score: 8,
    label: "High Location Impact",
    keywords: [
      "bus stop",
      "traffic light",
      "pedestrian crossing",
      "zebra crossing",
      "shopping mall",
      "mall",
      "market",
      "main road",
      "school",
      "station",
      "interchange",
      "town centre",
      "crowded"
    ]
  },
  {
    level: "medium",
    score: 5,
    label: "Medium Location Impact",
    keywords: [
      "hdb",
      "carpark",
      "park",
      "playground",
      "community centre",
      "neighborhood",
      "neighbourhood",
      "walkway",
      "residential block"
    ]
  },
  {
    level: "low",
    score: 2,
    label: "Low Location Impact",
    keywords: ["small lane", "quiet residential", "minor path", "back alley", "side road"]
  }
];

const explicitLocationLabels: Record<string, LocationImpactResult> = {
  "critical location impact": {
    level: "critical",
    score: 10,
    label: "Critical Location Impact",
    matchedKeywords: []
  },
  "high location impact": {
    level: "high",
    score: 8,
    label: "High Location Impact",
    matchedKeywords: []
  },
  "medium location impact": {
    level: "medium",
    score: 5,
    label: "Medium Location Impact",
    matchedKeywords: []
  },
  "low location impact": {
    level: "low",
    score: 2,
    label: "Low Location Impact",
    matchedKeywords: []
  },
  "unknown location impact": {
    level: "unknown",
    score: 0,
    label: "Unknown Location Impact",
    matchedKeywords: []
  }
};

export function estimateLocationImpact(input: PriorityInput): LocationImpactResult {
  const congestionText = normalize(input.congestionImpact);
  const explicitMatch = explicitLocationLabels[congestionText];

  if (explicitMatch) {
    return explicitMatch;
  }

  const searchableText = normalize(
    [
      input.description,
      input.locationText,
      input.category,
      isPendingLocationImpact(input.congestionImpact) ? null : input.congestionImpact
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (const group of locationKeywordLevels) {
    const matchedKeywords = group.keywords.filter((keyword) =>
      searchableText.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      return {
        level: group.level,
        score: group.score,
        label: group.label,
        matchedKeywords
      };
    }
  }

  return {
    level: "unknown",
    score: 0,
    label: "Unknown Location Impact",
    matchedKeywords: []
  };
}

export function calculatePriorityScore(input: PriorityInput) {
  return getPriorityScoreBreakdown(input).finalScore;
}

export function getPriorityScoreBreakdown(input: PriorityInput): PriorityScoreBreakdown {
  const severityScore = severityScores[input.severity] ?? 10;
  const authenticityContribution = roundOneDecimal(
    clampNumber(input.authenticityScore, 0, 100) * 0.15
  );
  const duplicateContribution = Math.min(
    Math.max(0, Math.round(input.duplicateCount)) * 3,
    15
  );
  const locationImpact = estimateLocationImpact(input);
  const rawScore =
    severityScore +
    authenticityContribution +
    duplicateContribution +
    locationImpact.score;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  return {
    severityScore,
    authenticityContribution,
    duplicateContribution,
    locationImpactContribution: locationImpact.score,
    finalScore,
    matchedLocationKeywords: locationImpact.matchedKeywords,
    locationImpactLabel: locationImpact.label,
    explanation:
      "Priority is calculated from severity, authenticity, duplicate reports, and location impact."
  };
}

export function isPendingLocationImpact(value?: string | null) {
  const normalized = normalize(value);

  return (
    !normalized ||
    normalized === "pending" ||
    normalized === "pending analysis" ||
    normalized === "unknown" ||
    normalized === "n/a" ||
    normalized === "na"
  );
}

function normalize(value?: string | null) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
