"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Copy,
  FileText,
  MapPin,
  MessageSquare,
  Route,
  ScanSearch,
  ShieldCheck,
  User,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PriorityScore } from "@/components/PriorityScore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  type CivicReport,
  type DisplayStatus
} from "@/lib/reports";
import { loadReportFromSupabase, updateReportStatus } from "@/lib/reportQueries";

const statusOptions: DisplayStatus[] = [
  "Pending Review",
  "Under Review",
  "Verified",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected"
];

export function ReportDetailClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<CivicReport | null>(null);
  const [status, setStatus] = useState<DisplayStatus>(
    report?.status ?? "Pending Review"
  );
  const [newNote, setNewNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    loadReportFromSupabase(reportId).then((loadedReport) => {
      if (!isActive) {
        return;
      }

      setReport(loadedReport);
      if (loadedReport) {
        setStatus(loadedReport.status);
      }
    });

    return () => {
      isActive = false;
    };
  }, [reportId]);

  async function saveStatus() {
    setMessage(null);

    try {
      await updateReportStatus(reportId, status);
      setReport((current) => (current ? { ...current, status } : current));
      setMessage("Status saved.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save status in Supabase."
      );
    }
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              This report could not be found.
            </p>
            <Link href="/dashboard">
              <Button className="mt-5 bg-primary text-white hover:bg-primary/90">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {report.id}
            </p>
            <h1 className="mt-1 font-heading text-xl font-bold text-foreground sm:text-2xl">
              {report.title}
            </h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {report.location}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SeverityBadge severity={report.severity} size="md" />
            <StatusBadge status={status} size="md" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-border">
              {report.mediaType === "video" ? (
                <video
                  src={report.media}
                  className="h-64 w-full object-cover sm:h-80"
                  controls
                />
              ) : (
                <img
                  src={report.media}
                  alt={report.title}
                  className="h-64 w-full object-cover sm:h-80"
                />
              )}
            </div>

            <Card className="border-border shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {report.by}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(report.at), "MMM d, yyyy 'at' HH:mm")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {report.desc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="px-5 pb-0 pt-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <ScanSearch className="h-3.5 w-3.5 text-primary" />
                  </div>
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Issue Type", value: report.issueType, icon: ScanSearch },
                    {
                      label: "Authenticity",
                      value: `${report.auth}%`,
                      icon: ShieldCheck
                    },
                    {
                      label: "Duplicates",
                      value: report.dupes.toString(),
                      icon: Copy
                    },
                    {
                      label: "Congestion Impact",
                      value: report.congestion,
                      icon: Route
                    }
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-lg border border-border bg-background p-3"
                      >
                        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <InfoCard
              icon={<FileText className="h-3.5 w-3.5 text-primary" />}
              iconClassName="bg-primary/10"
              label="Generated Maintenance Report"
              text={report.summary}
            />

            <InfoCard
              icon={<Wrench className="h-3.5 w-3.5 text-teal-600" />}
              iconClassName="bg-teal-50"
              label="Recommended Action"
              text={report.action}
            />
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="space-y-5 p-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Priority Score
                  </p>
                  <PriorityScore score={report.priority} size="lg" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Update Status
                  </p>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as DisplayStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-primary text-white hover:bg-primary/90"
                  size="sm"
                  onClick={saveStatus}
                >
                  Save Changes
                </Button>
                {message ? (
                  <p className="text-xs text-muted-foreground">{message}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="px-5 pb-0 pt-5">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Internal Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="mb-4 space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    className="h-20 resize-none text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={!newNote.trim()}
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="px-5 pb-0 pt-5">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {report.notes.map((note) => (
                    <div key={`${note.time}-${note.text}`} className="relative pl-5">
                      <div className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-border bg-white" />
                      <p className="text-xs font-medium text-foreground">
                        {note.author}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {note.text}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {format(new Date(note.time), "MMM d, HH:mm")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({
  icon,
  iconClassName,
  label,
  text
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  text: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
