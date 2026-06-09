export type Severity = "Low" | "Medium" | "High" | "Critical";

export type MockReport = {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  issueType: string;
  severity: Severity;
  authenticityScore: number;
  priorityScore: number;
  status: string;
  aiSummary: string;
  recommendedAction: string;
  createdAt: string;
};

export const mockReports: MockReport[] = [
  {
    id: "rpt-001",
    title: "Large pothole near bus stop",
    description:
      "A deep pothole has opened beside the bus stop. Vehicles are swerving around it during peak hours.",
    location: "Clementi Ave 3, near Block 427",
    imageUrl:
      "https://images.unsplash.com/photo-1619468129361-605ebea04b44?auto=format&fit=crop&w=1200&q=80",
    issueType: "Road surface damage",
    severity: "Critical",
    authenticityScore: 94,
    priorityScore: 97,
    status: "Needs urgent review",
    aiSummary:
      "The report suggests a road hazard in an active traffic area. The pothole appears large enough to create safety risks for cars, cyclists, and pedestrians near the bus stop.",
    recommendedAction:
      "Dispatch a road maintenance crew for temporary patching within 24 hours and schedule a full resurfacing inspection.",
    createdAt: "2026-06-08"
  },
  {
    id: "rpt-002",
    title: "Broken streetlight at pedestrian crossing",
    description:
      "The streetlight above the crossing has been off for several nights, making it difficult for drivers to see pedestrians.",
    location: "Tampines Street 21 crossing",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    issueType: "Street lighting",
    severity: "High",
    authenticityScore: 89,
    priorityScore: 88,
    status: "Assigned",
    aiSummary:
      "A non-functioning streetlight at a pedestrian crossing can reduce visibility and increase collision risk, especially at night or during rain.",
    recommendedAction:
      "Send an electrical maintenance team to inspect the lamp, wiring, and power supply before the next evening peak period.",
    createdAt: "2026-06-07"
  },
  {
    id: "rpt-003",
    title: "Clogged drain after heavy rain",
    description:
      "Water is pooling around the drain and flowing onto the walkway after rain. Leaves and trash seem to be blocking it.",
    location: "Bukit Batok Central walkway",
    imageUrl:
      "https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80",
    issueType: "Drainage blockage",
    severity: "High",
    authenticityScore: 91,
    priorityScore: 84,
    status: "Under review",
    aiSummary:
      "The blocked drain is likely causing localized flooding on a pedestrian route. Continued rain could expand the affected area and create slip hazards.",
    recommendedAction:
      "Clear debris from the drain, inspect downstream flow, and add the area to the post-rainfall monitoring route.",
    createdAt: "2026-06-06"
  },
  {
    id: "rpt-004",
    title: "Cracked pavement by school gate",
    description:
      "The pavement has uneven cracks near the school entrance. Students often walk through this path in the morning.",
    location: "Ang Mo Kio Ave 6 school entrance",
    imageUrl:
      "https://images.unsplash.com/photo-1572247315156-ef91dd2b941a?auto=format&fit=crop&w=1200&q=80",
    issueType: "Sidewalk damage",
    severity: "Medium",
    authenticityScore: 86,
    priorityScore: 68,
    status: "Queued",
    aiSummary:
      "The sidewalk damage appears moderate but is located near a school entrance, increasing the chance of trips during busy arrival and dismissal times.",
    recommendedAction:
      "Mark the uneven section, smooth the raised edge, and schedule pavement repair during off-peak school hours.",
    createdAt: "2026-06-05"
  },
  {
    id: "rpt-005",
    title: "Faded lane marking",
    description:
      "The lane marking is very faded and drivers are drifting between lanes near the junction.",
    location: "Jurong East Street 13 junction",
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
    issueType: "Road marking",
    severity: "Medium",
    authenticityScore: 82,
    priorityScore: 61,
    status: "Queued",
    aiSummary:
      "The faded marking may reduce lane discipline near a junction, but the risk can likely be managed through scheduled repainting.",
    recommendedAction:
      "Add the junction to the next road marking repainting batch and monitor for complaints or near-miss reports.",
    createdAt: "2026-06-04"
  },
  {
    id: "rpt-006",
    title: "Loose park bench plank",
    description:
      "One wooden plank on the bench is loose. It moves when someone sits down.",
    location: "Bishan-Ang Mo Kio Park, Pond Gardens",
    imageUrl:
      "https://images.unsplash.com/photo-1532465614-6cc8d45f647f?auto=format&fit=crop&w=1200&q=80",
    issueType: "Public furniture",
    severity: "Low",
    authenticityScore: 78,
    priorityScore: 42,
    status: "Queued",
    aiSummary:
      "The damaged bench is a localized comfort and minor safety issue. It does not appear to affect surrounding infrastructure.",
    recommendedAction:
      "Inspect the bench during routine park maintenance and secure or replace the loose plank.",
    createdAt: "2026-06-03"
  }
];

export function getSortedMockReports() {
  return [...mockReports].sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getMockReportById(id: string) {
  return mockReports.find((report) => report.id === id);
}
