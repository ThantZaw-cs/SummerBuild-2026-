"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Copy,
  FileText,
  Gauge,
  PlusCircle,
  Route,
  ScanSearch,
  ShieldCheck,
  Target,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityScore } from "@/components/PriorityScore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  sampleReports,
  type CivicReport
} from "@/lib/mockReports";
import { loadReportFromSupabase } from "@/lib/reportQueries";

export default function ReportResultPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<CivicReport>(sampleReports[0]);

  useEffect(() => {
    let isActive = true;

    loadReportFromSupabase(reportId).then((loadedReport) => {
      if (isActive && loadedReport) {
        setReport(loadedReport);
      }
    });

    return () => {
      isActive = false;
    };
  }, [reportId]);

  const analysisItems = [
    { label: "Issue Type", value: report.issueType, icon: ScanSearch },
    {
      label: "Severity",
      value: null,
      icon: Gauge,
      custom: <SeverityBadge severity={report.severity} />
    },
    {
      label: "Authenticity Score",
      value: `${report.authenticityScore}%`,
      icon: ShieldCheck
    },
    {
      label: "Duplicate Reports",
      value: report.duplicateCount.toString(),
      icon: Copy
    },
    { label: "Congestion Impact", value: report.congestionImpact, icon: Route },
    {
      label: "Priority Score",
      value: null,
      icon: Target,
      custom: <PriorityScore score={report.priorityScore} />
    }
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {reportId ?? report.id}
            </p>
            <h1 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
              {report.title}
            </h1>
          </div>
          <StatusBadge status={report.status} size="md" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-border">
            {report.mediaType === "video" ? (
              <video src={report.mediaUrl} className="h-52 w-full object-cover" controls />
            ) : (
              <img
                src={report.mediaUrl}
                alt={report.title}
                className="h-52 w-full object-cover"
              />
            )}
          </div>
          <Card className="border-border shadow-sm">
            <CardContent className="p-5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Citizen Description
              </p>
              <p className="text-sm leading-relaxed text-foreground">
                {report.description}
              </p>
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Location
                </p>
                <p className="text-sm text-foreground">{report.location}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 border-border shadow-sm">
          <CardHeader className="px-5 pb-0 pt-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <ScanSearch className="h-3.5 w-3.5 text-primary" />
              </div>
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {analysisItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      {item.custom ? (
                        <div className="mt-1">{item.custom}</div>
                      ) : (
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <InfoCard
          icon={<Wrench className="h-3.5 w-3.5 text-teal-600" />}
          iconClassName="bg-teal-50"
          label="Recommended Action"
          text={report.recommendedAction}
        />

        <InfoCard
          icon={<FileText className="h-3.5 w-3.5 text-primary" />}
          iconClassName="bg-primary/10"
          label="Generated Maintenance Report"
          text={report.generatedReport}
          className="mb-8 mt-6"
        />

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full">
              <BarChart3 className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/report" className="w-full sm:w-auto">
            <Button className="w-full bg-primary text-white hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Another Report
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({
  icon,
  iconClassName,
  label,
  text,
  className = ""
}: {
  icon: React.ReactNode;
  iconClassName: string;
  label: string;
  text: string;
  className?: string;
}) {
  return (
    <Card className={`border-border shadow-sm ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {label}
            </p>
            <p className="text-sm leading-relaxed text-foreground">{text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
