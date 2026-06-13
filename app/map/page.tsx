"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Filter, Layers, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { PriorityScore } from "@/components/PriorityScore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  sampleReports,
  severityColors,
  type CivicReport,
  type Severity
} from "@/lib/mockReports";
import { loadReportsFromSupabase } from "@/lib/reportQueries";

export default function MapViewPage() {
  const [reports, setReports] = useState<CivicReport[]>(sampleReports);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");

  useEffect(() => {
    let isActive = true;

    loadReportsFromSupabase().then((loadedReports) => {
      if (isActive) {
        setReports(loadedReports);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredReports = useMemo(() => {
    return severityFilter === "all"
      ? reports
      : reports.filter((report) => report.severity === severityFilter);
  }, [reports, severityFilter]);

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      <div className="relative flex-1 bg-muted">
        <div className="absolute left-4 right-4 top-4 z-10 flex items-center gap-2 lg:right-auto">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-md">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={severityFilter}
              onValueChange={(value) => setSeverityFilter(value as Severity | "all")}
            >
              <SelectTrigger className="h-auto w-32 border-0 p-0 text-sm shadow-none">
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground shadow-md">
            <Layers className="h-3.5 w-3.5" />
            {filteredReports.length} reports
          </div>
        </div>

        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-teal-50/50" />
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 800 600">
              <path
                d="M100,300 Q200,100 400,250 T700,200"
                stroke="currentColor"
                fill="none"
                strokeWidth="1"
                className="text-primary"
              />
              <path
                d="M50,400 Q300,350 500,400 T750,350"
                stroke="currentColor"
                fill="none"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
              <path
                d="M150,500 Q350,450 550,500 T800,480"
                stroke="currentColor"
                fill="none"
                strokeWidth="0.5"
                className="text-muted-foreground"
              />
            </svg>
          </div>

          {filteredReports.map((report, index) => {
            const colors = severityColors[report.severity];
            const posX = 15 + (index * 11) % 70;
            const posY = 20 + ((index * 17 + 5) % 60);

            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${posX}%`, top: `${posY}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-md transition-transform group-hover:scale-110 ${colors.bg} ${colors.border}`}
                  >
                    <MapPin className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  {report.duplicateCount > 1 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                      {report.duplicateCount}
                    </span>
                  ) : null}
                </div>
                <div className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-white px-2 py-1 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  <p className="text-xs font-medium text-foreground">
                    {report.issueType}
                  </p>
                </div>
              </button>
            );
          })}

          <div className="relative z-0 text-center">
            <MapPin className="mx-auto mb-3 h-16 w-16 text-primary/20" />
            <p className="text-sm text-muted-foreground">Interactive map view</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click pins to view report details
            </p>
          </div>
        </div>
      </div>

      <div className="w-full overflow-y-auto border-t border-border bg-white lg:w-96 lg:border-l lg:border-t-0">
        <div className="border-b border-border p-4">
          <h2 className="font-heading font-semibold text-foreground">
            {selectedReport ? "Report Details" : "Nearby Reports"}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {selectedReport
              ? selectedReport.id
              : `${filteredReports.length} reports in view`}
          </p>
        </div>

        {selectedReport ? (
          <div className="space-y-4 p-4">
            {selectedReport.mediaType === "video" ? (
              <video
                src={selectedReport.mediaUrl}
                className="h-40 w-full rounded-lg border border-border object-cover"
                controls
              />
            ) : (
              <img
                src={selectedReport.mediaUrl}
                alt={selectedReport.title}
                className="h-40 w-full rounded-lg border border-border object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {selectedReport.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedReport.description}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {selectedReport.location}
            </div>
            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={selectedReport.severity} />
              <StatusBadge status={selectedReport.status} />
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-xs text-muted-foreground">Priority Score</p>
                <PriorityScore score={selectedReport.priorityScore} />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Authenticity</p>
                <p className="text-sm font-semibold">
                  {selectedReport.authenticityScore}%
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href={`/report/${selectedReport.id}`} className="flex-1">
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  size="sm"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View Full Report
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="w-full p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {report.title}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <SeverityBadge severity={report.severity} />
                      {report.duplicateCount > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {report.duplicateCount} dupes
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <PriorityScore score={report.priorityScore} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
