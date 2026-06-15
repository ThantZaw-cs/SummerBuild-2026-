import type { Database } from "@/lib/supabaseTypes";

export type Severity = Database["public"]["Enums"]["report_severity"];
export type SupabaseStatus = Database["public"]["Enums"]["report_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type MediaType = Database["public"]["Enums"]["report_media_type"];

export type DisplayStatus =
  | "Pending Review"
  | "Under Review"
  | "Verified"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export type ReportNote = {
  author: string;
  text: string;
  time: string;
};

export type CivicReport = {
  id: string;
  title: string;
  desc: string;
  issueType: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  status: DisplayStatus;
  auth: number;
  dupes: number;
  congestion: string;
  priority: number;
  action: string;
  summary: string;
  media: string;
  mediaType: MediaType;
  by: string;
  at: string;
  updated: string;
  internalNotes: string;
  notes: ReportNote[];
};

export type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type ActivityLogRow = Database["public"]["Tables"]["report_activity_logs"]["Row"];

export const reportSelect =
  "id, user_id, submitted_by_name, title, short_description, description, category, issue_type, location_text, latitude, longitude, media_url, media_type, severity, authenticity_score, ai_summary, recommended_action, priority_score, duplicate_count, congestion_impact, status, internal_notes, created_at, updated_at";

export const categories = [
  "Roads & Pavements",
  "Street Lighting",
  "Drainage & Waterways",
  "Signage & Furniture",
  "Parks & Greenery",
  "Public Property",
  "Other"
];

export const issueTypes = [
  "Pavement Damage",
  "Road Damage",
  "Lighting Failure",
  "Drainage Issue",
  "Signage Damage",
  "Fallen Tree",
  "Vandalism",
  "Electrical Hazard",
  "Other"
];

export const severityStyles: Record<
  Severity,
  { badge: string; dot: string; soft: string }
> = {
  low: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50"
  },
  medium: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
    soft: "bg-amber-50"
  },
  high: {
    badge: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
    soft: "bg-orange-50"
  },
  critical: {
    badge: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
    soft: "bg-red-50"
  }
};

export const statusStyles: Record<DisplayStatus, string> = {
  "Pending Review": "bg-slate-100 text-slate-600 ring-slate-200",
  "Under Review": "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Verified: "bg-blue-50 text-blue-700 ring-blue-200",
  Assigned: "bg-violet-50 text-violet-700 ring-violet-200",
  "In Progress": "bg-teal-50 text-teal-700 ring-teal-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200"
};

export const statusColors: Record<DisplayStatus, string> = {
  "Pending Review": "bg-slate-100 text-slate-600 border-slate-200",
  "Under Review": "bg-cyan-50 text-cyan-700 border-cyan-200",
  Verified: "bg-blue-50 text-blue-700 border-blue-200",
  Assigned: "bg-violet-50 text-violet-700 border-violet-200",
  "In Progress": "bg-teal-50 text-teal-700 border-teal-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200"
};

export const STATUS_ORDER: DisplayStatus[] = [
  "Pending Review",
  "Under Review",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected"
];

export const supabaseToDisplayStatus: Record<SupabaseStatus, DisplayStatus> = {
  pending_review: "Pending Review",
  under_review: "Under Review",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected"
};

export const displayToSupabaseStatus: Record<DisplayStatus, SupabaseStatus> = {
  "Pending Review": "pending_review",
  "Under Review": "under_review",
  Verified: "verified",
  Assigned: "assigned",
  "In Progress": "in_progress",
  Resolved: "resolved",
  Rejected: "rejected"
};

export const severityToDisplay: Record<Severity, "Low" | "Medium" | "High" | "Critical"> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

const fallbackImage =
  "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=900&h=600&fit=crop";

export function normalizeSupabaseReport(row: ReportRow): CivicReport {
  const issueType = row.issue_type || "Analysis pending";

  return {
    id: row.id,
    title: row.title || (issueType === "Analysis pending" ? "Submitted infrastructure report" : issueType),
    desc: row.description || row.short_description,
    issueType,
    category: row.category || inferCategory(issueType),
    location: row.location_text,
    lat: row.latitude ?? 1.304,
    lng: row.longitude ?? 103.8318,
    severity: row.severity,
    status: supabaseToDisplayStatus[row.status],
    auth: Math.round(Number(row.authenticity_score ?? 0)),
    dupes: row.duplicate_count,
    congestion: row.congestion_impact || "Pending analysis",
    priority: row.priority_score,
    action: row.recommended_action || "Awaiting AI analysis",
    summary: row.ai_summary || "AI-generated maintenance report will appear here after analysis.",
    media: row.media_url || fallbackImage,
    mediaType: row.media_type || "image",
    by: row.submitted_by_name || row.user_id,
    at: row.created_at,
    updated: row.updated_at,
    internalNotes: row.internal_notes || "",
    notes: [
      {
        author: "System",
        text: "Report saved to Supabase",
        time: row.created_at
      },
      {
        author: "System",
        text: row.ai_summary ? "AI analysis completed" : "AI analysis pending",
        time: row.updated_at
      }
    ]
  };
}

export function normalizeActivityLog(row: ActivityLogRow): ReportNote {
  return {
    author: row.actor_id ? "Agency" : "System",
    text: row.note || row.action,
    time: row.created_at
  };
}

export function sortByPriority(list: CivicReport[]) {
  return [...list].sort((a, b) => b.priority - a.priority);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

export function projectToMap(lat: number, lng: number) {
  const x = Math.max(6, Math.min(94, ((lng - 103.7) / (103.96 - 103.7)) * 84 + 8));
  const y = Math.max(8, Math.min(88, ((1.375 - lat) / (1.375 - 1.295)) * 78 + 12));
  return { x, y };
}

function inferCategory(issueType: string) {
  if (issueType.includes("Road") || issueType.includes("Pavement")) {
    return "Roads & Pavements";
  }

  if (issueType.includes("Lighting") || issueType.includes("Electrical")) {
    return "Street Lighting";
  }

  if (issueType.includes("Drainage")) {
    return "Drainage & Waterways";
  }

  if (issueType.includes("Signage")) {
    return "Signage & Furniture";
  }

  if (issueType.includes("Tree")) {
    return "Parks & Greenery";
  }

  if (issueType.includes("Graffiti") || issueType.includes("Vandalism")) {
    return "Public Property";
  }

  return "Other";
}
