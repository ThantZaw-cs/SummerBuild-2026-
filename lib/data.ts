// ---------------------------------------------------------------------------
// CivicLens sample data + domain helpers
// Local-only mock data. Swap `reports` for a real fetch when wiring a backend.
// ---------------------------------------------------------------------------

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type Status =
  | "Pending Review"
  | "Verified"
  | "In Progress"
  | "Resolved"
  | "Rejected";

export type ReportNote = {
  author: string;
  text: string;
  time: string; // ISO
};

export type CivicReport = {
  id: string;
  title: string;
  desc: string; // citizen description
  issueType: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  severity: Severity;
  status: Status;
  auth: number; // authenticity score 0-100
  dupes: number; // merged duplicate count
  congestion: string;
  priority: number; // 0-100
  action: string; // recommended action
  summary: string; // automated analysis
  media: string;
  by: string; // reporter name
  at: string; // submitted ISO
  updated: string; // ISO
  notes: ReportNote[];
};

export const categories = [
  "Roads & Pavements",
  "Street Lighting",
  "Drainage & Waterways",
  "Signage & Furniture",
  "Parks & Greenery",
  "Public Property",
  "Other",
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
  "Other",
];

export const reports: CivicReport[] = [
  {
    id: "RPT-2026-003",
    title: "Pothole on main road",
    desc: "Deep pothole on the left lane, cars swerving to avoid it. Already saw one motorbike nearly lose control.",
    issueType: "Road Damage",
    category: "Roads & Pavements",
    location: "Orchard Road, near ION junction",
    lat: 1.304,
    lng: 103.8318,
    severity: "Critical",
    status: "Verified",
    auth: 99,
    dupes: 12,
    congestion: "Severe",
    priority: 96,
    action:
      "Emergency road repair required. Deploy traffic management immediately, close the affected lane and reroute traffic. Temporary patch within 4–6 hours; full repair in 2 days.",
    summary:
      "Critical road failure on Orchard Road arterial, left lane approaching ION junction. Pothole ~45cm diameter, 8–10cm deep, causing active lane deviation. One of the city's highest-traffic corridors — immediate vehicle-damage and accident risk.",
    media:
      "https://images.unsplash.com/photo-1568626449169-e7e1dfca27f6?w=900&h=600&fit=crop",
    by: "David T.",
    at: "2026-01-16T07:45:00Z",
    updated: "2026-01-16T08:00:00Z",
    notes: [
      { author: "System", text: "CRITICAL: auto-escalated due to severity + congestion impact", time: "2026-01-16T07:45:08Z" },
      { author: "System", text: "12 duplicate reports aggregated", time: "2026-01-16T07:50:00Z" },
      { author: "Agency Officer", text: "Emergency team alerted. Traffic police notified.", time: "2026-01-16T08:00:00Z" },
    ],
  },
  {
    id: "RPT-2026-008",
    title: "Exposed electrical wiring at park",
    desc: "Wires sticking out from a damaged lamp post base at the park. Very dangerous, kids play right here!",
    issueType: "Electrical Hazard",
    category: "Street Lighting",
    location: "Jurong Lake Gardens, near Pavilion 3",
    lat: 1.338,
    lng: 103.729,
    severity: "Critical",
    status: "In Progress",
    auth: 95,
    dupes: 4,
    congestion: "Moderate",
    priority: 98,
    action:
      "URGENT: isolate power supply immediately. Deploy safety barriers and dispatch a licensed electrician for emergency repair. Keep area closed until cleared.",
    summary:
      "Exposed wiring at a lamp post base near Pavilion 3. Insulation damage reveals live conductors accessible at ground level — immediate electrocution risk, heightened by wet conditions after recent rain.",
    media:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&h=600&fit=crop",
    by: "Kevin M.",
    at: "2026-01-16T10:00:00Z",
    updated: "2026-01-16T10:15:00Z",
    notes: [
      { author: "System", text: "CRITICAL: electrical hazard auto-escalated to emergency queue", time: "2026-01-16T10:00:03Z" },
      { author: "Agency Officer", text: "Power isolated remotely. Safety team en route.", time: "2026-01-16T10:15:00Z" },
    ],
  },
  {
    id: "RPT-2026-004",
    title: "Flooded drain near school",
    desc: "Drain is overflowing onto the pavement near the school entrance. Kids have to walk through the water.",
    issueType: "Drainage Issue",
    category: "Drainage & Waterways",
    location: "Clementi Ave 1, near Nan Hua Primary",
    lat: 1.315,
    lng: 103.765,
    severity: "High",
    status: "In Progress",
    auth: 91,
    dupes: 2,
    congestion: "Moderate",
    priority: 85,
    action:
      "Clear blocked drain immediately. Inspect upstream drainage for debris, install temporary barriers to redirect flow away from the pedestrian path, and coordinate with school admin.",
    summary:
      "Surface flooding at the walkway by Nan Hua Primary entrance. Drain capacity exceeded, likely debris blockage. Water 5–8cm deep; proximity to school entrance elevates priority during school hours.",
    media:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=900&h=600&fit=crop",
    by: "Michelle K.",
    at: "2026-01-16T06:30:00Z",
    updated: "2026-01-16T09:15:00Z",
    notes: [
      { author: "System", text: "School-proximity flag triggered — priority elevated", time: "2026-01-16T06:30:12Z" },
      { author: "Agency Officer", text: "Drainage crew dispatched. School admin notified.", time: "2026-01-16T09:15:00Z" },
    ],
  },
  {
    id: "RPT-2026-001",
    title: "Cracked pavement near bus stop",
    desc: "Large crack running along the pavement near the bus interchange, a real trip hazard for pedestrians.",
    issueType: "Pavement Damage",
    category: "Roads & Pavements",
    location: "Tampines Ave 4, Bus Stop 75219",
    lat: 1.3535,
    lng: 103.9453,
    severity: "High",
    status: "Pending Review",
    auth: 94,
    dupes: 3,
    congestion: "Moderate",
    priority: 82,
    action:
      "Schedule pavement repair. Cordon off the area and place warning signs. Estimated repair time: 2–3 days.",
    summary:
      "Class-B pavement fracture spanning ~1.2m along the walkway next to bus stop 75219. Depth ~3–5cm. High foot-traffic area (2,000+ daily). Elevated trip risk for elderly and mobility-impaired pedestrians.",
    media:
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=900&h=600&fit=crop",
    by: "Ahmad R.",
    at: "2026-01-15T09:23:00Z",
    updated: "2026-01-15T10:45:00Z",
    notes: [
      { author: "System", text: "Report auto-classified by triage engine v2.1", time: "2026-01-15T09:23:05Z" },
      { author: "Agency Officer", text: "Forwarded to roads maintenance team", time: "2026-01-15T10:45:00Z" },
    ],
  },
  {
    id: "RPT-2026-006",
    title: "Fallen tree blocking footpath",
    desc: "A medium-sized tree has fallen across the footpath after last night's storm. Completely blocked.",
    issueType: "Fallen Tree",
    category: "Parks & Greenery",
    location: "East Coast Park, Area D near BBQ Pit 42",
    lat: 1.301,
    lng: 103.912,
    severity: "High",
    status: "Resolved",
    auth: 96,
    dupes: 7,
    congestion: "Moderate",
    priority: 78,
    action:
      "Deploy arborist team for tree removal. Clear footpath debris and inspect adjacent trees for storm damage. Restore path accessibility.",
    summary:
      "Medium rain tree fallen across the primary footpath at East Coast Park Area D. Full path blockage confirmed by multiple reports. Storm-damage pattern evident in a high-recreation area.",
    media:
      "https://images.unsplash.com/photo-1542601098-8fc114e148e2?w=900&h=600&fit=crop",
    by: "Rachel N.",
    at: "2026-01-13T08:00:00Z",
    updated: "2026-01-14T16:00:00Z",
    notes: [
      { author: "System", text: "Storm-damage flag — multiple tree reports in area", time: "2026-01-13T08:00:08Z" },
      { author: "Agency Officer", text: "Arborist team deployed", time: "2026-01-13T10:00:00Z" },
      { author: "Agency Officer", text: "Tree removed. Path cleared and reopened.", time: "2026-01-14T16:00:00Z" },
    ],
  },
  {
    id: "RPT-2026-002",
    title: "Broken streetlight along walkway",
    desc: "Streetlight not working for 3 nights. Very dark and unsafe for evening joggers and cyclists.",
    issueType: "Lighting Failure",
    category: "Street Lighting",
    location: "Bishan Park Connector, Lamp Post LP-4421",
    lat: 1.351,
    lng: 103.835,
    severity: "Medium",
    status: "In Progress",
    auth: 97,
    dupes: 5,
    congestion: "Low",
    priority: 71,
    action:
      "Dispatch electrical maintenance crew. Check lamp post wiring and replace the bulb/fixture if needed. Estimated repair time: 1 day.",
    summary:
      "Street lamp LP-4421 non-operational across 3 consecutive nights — likely an electrical fault rather than a timer issue. Primary pedestrian connector with high evening usage; reduced visibility in a busy zone.",
    media:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=600&fit=crop",
    by: "Sarah L.",
    at: "2026-01-14T20:15:00Z",
    updated: "2026-01-16T08:30:00Z",
    notes: [
      { author: "System", text: "5 duplicate reports detected in a 500m radius", time: "2026-01-14T20:15:10Z" },
      { author: "Agency Officer", text: "Maintenance crew dispatched — ETA Jan 17", time: "2026-01-16T08:30:00Z" },
    ],
  },
  {
    id: "RPT-2026-005",
    title: "Damaged signboard near MRT station",
    desc: "Direction signboard is bent and unreadable, probably hit by a vehicle. Confusing for tourists.",
    issueType: "Signage Damage",
    category: "Signage & Furniture",
    location: "Ang Mo Kio Ave 8, near AMK MRT Exit B",
    lat: 1.37,
    lng: 103.8495,
    severity: "Low",
    status: "Pending Review",
    auth: 88,
    dupes: 0,
    congestion: "Low",
    priority: 35,
    action:
      "Schedule signboard replacement during the next maintenance cycle. No immediate safety risk but it affects wayfinding for commuters and tourists.",
    summary:
      "Directional signboard near AMK MRT Exit B has structural damage rendering text partially illegible — damage consistent with vehicle impact. No sharp edges or falling hazard detected.",
    media:
      "https://images.unsplash.com/photo-1566837945700-30057527ade0?w=900&h=600&fit=crop",
    by: "James W.",
    at: "2026-01-15T14:20:00Z",
    updated: "2026-01-15T14:20:00Z",
    notes: [
      { author: "System", text: "Report auto-classified by triage engine v2.1", time: "2026-01-15T14:20:05Z" },
    ],
  },
  {
    id: "RPT-2026-007",
    title: "Graffiti on void deck wall",
    desc: "Someone spray-painted vulgar words on the void deck wall overnight. Needs cleaning.",
    issueType: "Vandalism",
    category: "Public Property",
    location: "Blk 123 Toa Payoh Lor 1",
    lat: 1.334,
    lng: 103.85,
    severity: "Low",
    status: "Pending Review",
    auth: 92,
    dupes: 1,
    congestion: "None",
    priority: 28,
    action:
      "Schedule a cleaning crew to remove graffiti. Check CCTV footage for identification and apply anti-graffiti coating after cleaning.",
    summary:
      "Spray-paint graffiti on a void deck wall at Block 123, classified as offensive. ~2 sqm affected, no structural damage. Aesthetic degradation of a shared community space.",
    media:
      "https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=900&h=600&fit=crop",
    by: "Lisa C.",
    at: "2026-01-16T06:45:00Z",
    updated: "2026-01-16T06:45:00Z",
    notes: [
      { author: "System", text: "Report auto-classified by triage engine v2.1", time: "2026-01-16T06:45:05Z" },
    ],
  },
];

// ---- lookups & helpers -----------------------------------------------------

export const severityStyles: Record<
  Severity,
  { badge: string; dot: string; soft: string }
> = {
  Low: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500", soft: "bg-emerald-50" },
  Medium: { badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500", soft: "bg-amber-50" },
  High: { badge: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500", soft: "bg-orange-50" },
  Critical: { badge: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500", soft: "bg-red-50" },
};

export const statusStyles: Record<Status, string> = {
  "Pending Review": "bg-slate-100 text-slate-600 ring-slate-200",
  Verified: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-teal-50 text-teal-700 ring-teal-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-red-50 text-red-700 ring-red-200",
};

export const STATUS_ORDER: Status[] = [
  "Pending Review",
  "Verified",
  "In Progress",
  "Resolved",
  "Rejected",
];

export function sortByPriority(list: CivicReport[]) {
  return [...list].sort((a, b) => b.priority - a.priority);
}

export function getReport(id: string) {
  return reports.find((r) => r.id === id);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

// Project a lat/lng into a 0-100% box for the schematic map view.
export function projectToMap(lat: number, lng: number) {
  const x = Math.max(6, Math.min(94, ((lng - 103.7) / (103.96 - 103.7)) * 84 + 8));
  const y = Math.max(8, Math.min(88, ((1.375 - lat) / (1.375 - 1.295)) * 78 + 12));
  return { x, y };
}
