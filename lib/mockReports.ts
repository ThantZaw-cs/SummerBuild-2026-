import type { Database } from "@/lib/supabaseTypes";

export type Severity = "Low" | "Medium" | "High" | "Critical";
export type DisplayStatus =
  | "Pending Review"
  | "Verified"
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
  description: string;
  issueType: string;
  category: string;
  location: string;
  lat: number | null;
  lng: number | null;
  severity: Severity;
  status: DisplayStatus;
  authenticityScore: number;
  duplicateCount: number;
  congestionImpact: string;
  priorityScore: number;
  recommendedAction: string;
  generatedReport: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  updatedAt: string;
  notes: ReportNote[];
};

export type MockReport = CivicReport;

type SupabaseReportRow = Database["public"]["Tables"]["reports"]["Row"];
export type SupabaseStatus = Database["public"]["Enums"]["report_status"];

export const sampleReports: CivicReport[] = [
  {
    id: "RPT-2026-001",
    title: "Cracked pavement near bus stop",
    description:
      "Large crack running along the pavement near Tampines Bus Interchange, posing trip hazard for pedestrians.",
    issueType: "Pavement Damage",
    category: "Roads & Pavements",
    location: "Tampines Ave 4, Bus Stop 75219",
    lat: 1.3535,
    lng: 103.9453,
    severity: "High",
    status: "Pending Review",
    authenticityScore: 94,
    duplicateCount: 3,
    congestionImpact: "Moderate",
    priorityScore: 82,
    recommendedAction:
      "Schedule immediate pavement repair. Cordon off area and place warning signs. Estimated repair time: 2-3 days.",
    generatedReport:
      "Infrastructure damage detected: Class B pavement fracture spanning approximately 1.2 meters along pedestrian walkway adjacent to bus stop 75219. Fracture depth estimated at 3-5cm based on visual analysis. High foot traffic area with estimated 2,000+ daily pedestrians. Risk classification: Trip hazard - elevated risk for elderly and mobility-impaired individuals. Recommend priority scheduling within 48 hours.",
    mediaUrl:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_01",
    submittedByName: "Ahmad R.",
    submittedAt: "2026-01-15T09:23:00Z",
    updatedAt: "2026-01-15T10:45:00Z",
    notes: [
      {
        author: "System",
        text: "Report auto-classified by AI engine v2.1",
        time: "2026-01-15T09:23:05Z"
      },
      {
        author: "Agency Officer",
        text: "Forwarded to roads maintenance team",
        time: "2026-01-15T10:45:00Z"
      }
    ]
  },
  {
    id: "RPT-2026-002",
    title: "Broken streetlight along walkway",
    description:
      "Streetlight not working for 3 nights. Very dark and unsafe for evening joggers.",
    issueType: "Lighting Failure",
    category: "Street Lighting",
    location: "Bishan Park Connector, Lamp Post #LP-4421",
    lat: 1.351,
    lng: 103.835,
    severity: "Medium",
    status: "In Progress",
    authenticityScore: 97,
    duplicateCount: 5,
    congestionImpact: "Low",
    priorityScore: 71,
    recommendedAction:
      "Dispatch electrical maintenance crew. Check lamp post wiring and replace bulb/fixture if needed. Estimated repair time: 1 day.",
    generatedReport:
      "Lighting infrastructure failure confirmed: Street lamp LP-4421 non-operational. Based on multiple citizen reports spanning 3 consecutive nights, likely electrical fault rather than timer malfunction. Location serves as primary pedestrian connector with high evening usage. Safety classification: Moderate risk - reduced visibility in high-activity zone.",
    mediaUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_02",
    submittedByName: "Sarah L.",
    submittedAt: "2026-01-14T20:15:00Z",
    updatedAt: "2026-01-16T08:30:00Z",
    notes: [
      {
        author: "System",
        text: "5 duplicate reports detected in 500m radius",
        time: "2026-01-14T20:15:10Z"
      },
      {
        author: "Agency Officer",
        text: "Maintenance crew dispatched - ETA Jan 17",
        time: "2026-01-16T08:30:00Z"
      }
    ]
  },
  {
    id: "RPT-2026-003",
    title: "Pothole on main road",
    description: "Deep pothole on the left lane, cars swerving to avoid it.",
    issueType: "Road Damage",
    category: "Roads & Pavements",
    location: "Orchard Road, near ION junction",
    lat: 1.304,
    lng: 103.8318,
    severity: "Critical",
    status: "Verified",
    authenticityScore: 99,
    duplicateCount: 12,
    congestionImpact: "Severe",
    priorityScore: 96,
    recommendedAction:
      "Emergency road repair required. Deploy traffic management immediately. Close affected lane and reroute traffic. Estimated repair time: 4-6 hours for temporary patch, 2 days for full repair.",
    generatedReport:
      "Critical road infrastructure failure: Pothole detected on Orchard Road arterial, left lane approaching ION Orchard junction. Estimated dimensions: 45cm diameter, 8-10cm depth. Causing active lane deviation by vehicles. Congestion impact: Severe - affecting one of Singapore's highest-traffic corridors. Risk classification: Critical - immediate vehicle damage risk and potential accident hazard.",
    mediaUrl:
      "https://images.unsplash.com/photo-1568626449169-e7e1dfca27f6?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_03",
    submittedByName: "David T.",
    submittedAt: "2026-01-16T07:45:00Z",
    updatedAt: "2026-01-16T08:00:00Z",
    notes: [
      {
        author: "System",
        text: "CRITICAL: Auto-escalated due to severity + congestion impact",
        time: "2026-01-16T07:45:08Z"
      },
      {
        author: "System",
        text: "12 duplicate reports aggregated",
        time: "2026-01-16T07:50:00Z"
      },
      {
        author: "Agency Officer",
        text: "Emergency team alerted. Traffic police notified.",
        time: "2026-01-16T08:00:00Z"
      }
    ]
  },
  {
    id: "RPT-2026-004",
    title: "Flooded drain near school",
    description:
      "Drain is overflowing onto the pavement near the school entrance. Kids have to walk through the water.",
    issueType: "Drainage Issue",
    category: "Drainage & Waterways",
    location: "Clementi Ave 1, near Nan Hua Primary",
    lat: 1.315,
    lng: 103.765,
    severity: "High",
    status: "In Progress",
    authenticityScore: 91,
    duplicateCount: 2,
    congestionImpact: "Moderate",
    priorityScore: 85,
    recommendedAction:
      "Clear blocked drain immediately. Inspect upstream drainage for debris accumulation. Install temporary barriers to redirect water flow away from pedestrian path. Coordinate with school admin for student safety.",
    generatedReport:
      "Drainage overflow detected: Surface flooding at pedestrian walkway adjacent to Nan Hua Primary School entrance on Clementi Ave 1. Drain capacity exceeded, likely due to debris blockage. Proximity to school entrance elevates priority. Water depth estimated at 5-8cm. Risk classification: High - child safety concern during school hours.",
    mediaUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_04",
    submittedByName: "Michelle K.",
    submittedAt: "2026-01-16T06:30:00Z",
    updatedAt: "2026-01-16T09:15:00Z",
    notes: [
      {
        author: "System",
        text: "School proximity flag triggered - priority elevated",
        time: "2026-01-16T06:30:12Z"
      },
      {
        author: "Agency Officer",
        text: "Drainage crew dispatched. School admin notified.",
        time: "2026-01-16T09:15:00Z"
      }
    ]
  },
  {
    id: "RPT-2026-005",
    title: "Damaged signboard near MRT station",
    description:
      "Direction signboard is bent and unreadable. Probably hit by a vehicle.",
    issueType: "Signage Damage",
    category: "Signage & Furniture",
    location: "Ang Mo Kio Ave 8, near AMK MRT Exit B",
    lat: 1.37,
    lng: 103.8495,
    severity: "Low",
    status: "Pending Review",
    authenticityScore: 88,
    duplicateCount: 0,
    congestionImpact: "Low",
    priorityScore: 35,
    recommendedAction:
      "Schedule signboard replacement during next maintenance cycle. No immediate safety risk but affects wayfinding for commuters and tourists.",
    generatedReport:
      "Signage damage detected: Directional signboard near Ang Mo Kio MRT Station Exit B has sustained structural damage, rendering text partially illegible. Damage pattern consistent with vehicle impact. No sharp edges or falling hazard detected. Risk classification: Low - no immediate safety hazard.",
    mediaUrl:
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_05",
    submittedByName: "James W.",
    submittedAt: "2026-01-15T14:20:00Z",
    updatedAt: "2026-01-15T14:20:00Z",
    notes: [
      {
        author: "System",
        text: "Report auto-classified by AI engine v2.1",
        time: "2026-01-15T14:20:05Z"
      }
    ]
  },
  {
    id: "RPT-2026-006",
    title: "Fallen tree blocking footpath",
    description:
      "A medium-sized tree has fallen across the footpath after last night's storm.",
    issueType: "Fallen Tree",
    category: "Parks & Greenery",
    location: "East Coast Park, Area D near BBQ Pit 42",
    lat: 1.301,
    lng: 103.912,
    severity: "High",
    status: "Resolved",
    authenticityScore: 96,
    duplicateCount: 7,
    congestionImpact: "Moderate",
    priorityScore: 78,
    recommendedAction:
      "Deploy arborist team for tree removal. Clear footpath debris. Inspect adjacent trees for storm damage. Restore path accessibility.",
    generatedReport:
      "Fallen tree obstruction: Medium-sized rain tree has fallen across primary pedestrian footpath at East Coast Park Area D. Full path blockage confirmed. Storm damage pattern evident. Multiple reports confirm continued obstruction. Risk classification: High - complete path blockage in high-recreation area.",
    mediaUrl:
      "https://images.unsplash.com/photo-1542601098-8fc114e148e2?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_06",
    submittedByName: "Rachel N.",
    submittedAt: "2026-01-13T08:00:00Z",
    updatedAt: "2026-01-14T16:00:00Z",
    notes: [
      {
        author: "System",
        text: "Storm damage flag - multiple tree reports in area",
        time: "2026-01-13T08:00:08Z"
      },
      {
        author: "Agency Officer",
        text: "NParks arborist team deployed",
        time: "2026-01-13T10:00:00Z"
      },
      {
        author: "Agency Officer",
        text: "Tree removed. Path cleared and reopened.",
        time: "2026-01-14T16:00:00Z"
      }
    ]
  },
  {
    id: "RPT-2026-007",
    title: "Graffiti on HDB void deck wall",
    description:
      "Someone spray-painted vulgar words on the void deck wall overnight.",
    issueType: "Vandalism",
    category: "Public Property",
    location: "Blk 123 Toa Payoh Lor 1",
    lat: 1.334,
    lng: 103.85,
    severity: "Low",
    status: "Pending Review",
    authenticityScore: 92,
    duplicateCount: 1,
    congestionImpact: "None",
    priorityScore: 28,
    recommendedAction:
      "Schedule cleaning crew to remove graffiti. Check CCTV footage for vandalism identification. Apply anti-graffiti coating after cleaning.",
    generatedReport:
      "Vandalism detected: Spray paint graffiti on HDB void deck wall at Block 123 Toa Payoh Lorong 1. Content classified as offensive/vulgar. Wall area affected: approximately 2 sqm. No structural damage. Community impact: Aesthetic degradation of public space. Risk classification: Low - no safety hazard but affects community wellbeing.",
    mediaUrl:
      "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_07",
    submittedByName: "Lisa C.",
    submittedAt: "2026-01-16T06:45:00Z",
    updatedAt: "2026-01-16T06:45:00Z",
    notes: [
      {
        author: "System",
        text: "Report auto-classified by AI engine v2.1",
        time: "2026-01-16T06:45:05Z"
      }
    ]
  },
  {
    id: "RPT-2026-008",
    title: "Exposed electrical wiring at park",
    description:
      "Wires sticking out from a damaged lamp post base at the park. Very dangerous!",
    issueType: "Electrical Hazard",
    category: "Street Lighting",
    location: "Jurong Lake Gardens, near Pavilion 3",
    lat: 1.338,
    lng: 103.729,
    severity: "Critical",
    status: "In Progress",
    authenticityScore: 95,
    duplicateCount: 4,
    congestionImpact: "Moderate",
    priorityScore: 98,
    recommendedAction:
      "URGENT: Isolate power supply immediately. Deploy safety barriers. Dispatch licensed electrician for emergency repair. Close affected area until cleared.",
    generatedReport:
      "CRITICAL ELECTRICAL HAZARD: Exposed wiring detected at lamp post base, Jurong Lake Gardens near Pavilion 3. Insulation damage reveals live conductors accessible at ground level. Immediate electrocution risk to public, especially children. Wet conditions after recent rain increase hazard severity. Risk classification: Critical - immediate danger to life.",
    mediaUrl:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop",
    mediaType: "image",
    submittedBy: "citizen_user_08",
    submittedByName: "Kevin M.",
    submittedAt: "2026-01-16T10:00:00Z",
    updatedAt: "2026-01-16T10:15:00Z",
    notes: [
      {
        author: "System",
        text: "CRITICAL: Electrical hazard auto-escalated to emergency queue",
        time: "2026-01-16T10:00:03Z"
      },
      {
        author: "System",
        text: "Emergency notification sent to SP Group + NParks",
        time: "2026-01-16T10:00:05Z"
      },
      {
        author: "Agency Officer",
        text: "Power isolated remotely. Safety team en route.",
        time: "2026-01-16T10:15:00Z"
      }
    ]
  }
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

export const categories = [
  "Roads & Pavements",
  "Street Lighting",
  "Drainage & Waterways",
  "Signage & Furniture",
  "Parks & Greenery",
  "Public Property",
  "Other"
];

export const severityColors = {
  Low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500"
  },
  Medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500"
  },
  High: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500"
  },
  Critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500"
  }
} as const;

export const statusColors: Record<DisplayStatus, string> = {
  "Pending Review": "bg-slate-100 text-slate-600 border-slate-200",
  Verified: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-teal-50 text-teal-700 border-teal-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200"
};

export const supabaseToDisplayStatus: Record<SupabaseStatus, DisplayStatus> = {
  submitted: "Pending Review",
  under_review: "Pending Review",
  assigned: "Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected"
};

export const displayToSupabaseStatus: Record<DisplayStatus, SupabaseStatus> = {
  "Pending Review": "under_review",
  Verified: "assigned",
  "In Progress": "in_progress",
  Resolved: "resolved",
  Rejected: "rejected"
};

const fallbackImage =
  "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop";

export function normalizeSupabaseReport(row: SupabaseReportRow): CivicReport {
  const issueType = row.issue_type || "Submitted Report";
  const submittedAt = row.created_at;

  return {
    id: row.id,
    title: issueType === "Submitted Report" ? "Submitted infrastructure report" : issueType,
    description: row.short_description,
    issueType,
    category: inferCategory(issueType),
    location: row.location_text,
    lat: row.latitude,
    lng: row.longitude,
    severity: row.severity,
    status: supabaseToDisplayStatus[row.status],
    authenticityScore: Math.round(Number(row.authenticity_score ?? 0)),
    duplicateCount: row.duplicate_count,
    congestionImpact: "Pending",
    priorityScore: row.priority_score,
    recommendedAction: row.recommended_action || "Pending recommended action.",
    generatedReport: row.ai_summary || "Pending AI-generated maintenance report.",
    mediaUrl: row.media_url || fallbackImage,
    mediaType: row.media_type || "image",
    submittedBy: row.user_id,
    submittedByName: "Supabase User",
    submittedAt,
    updatedAt: row.updated_at,
    notes: [
      {
        author: "System",
        text: "Report saved to Supabase",
        time: submittedAt
      },
      {
        author: "System",
        text: row.ai_summary ? "AI summary loaded from report row" : "AI analysis pending",
        time: row.updated_at
      }
    ]
  };
}

export function getSortedMockReports() {
  return [...sampleReports].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function sortReportsByPriority(reports: CivicReport[]) {
  return [...reports].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getMockReportById(id: string) {
  return sampleReports.find((report) => report.id === id);
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

  return "Other";
}
