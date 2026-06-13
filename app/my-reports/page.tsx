"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ExternalLink, FileText, MapPin, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { sampleReports, type CivicReport } from "@/lib/mockReports";
import { loadMyReportsFromSupabase } from "@/lib/reportQueries";

export default function MyReportsPage() {
  const [reports, setReports] = useState<CivicReport[]>(sampleReports.slice(0, 4));

  useEffect(() => {
    let isActive = true;

    loadMyReportsFromSupabase().then((loadedReports) => {
      if (isActive) {
        setReports(loadedReports);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              My Reports
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track the status of your submitted reports.
            </p>
          </div>
          <Link href="/report">
            <Button className="bg-primary text-white hover:bg-primary/90" size="sm">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reports.indexOf(report) * 0.05 }}
              >
                <Card className="border-border shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="h-32 sm:h-auto sm:w-40">
                      {report.mediaType === "video" ? (
                        <video
                          src={report.mediaUrl}
                          className="h-full w-full object-cover sm:rounded-l-xl"
                        />
                      ) : (
                        <img
                          src={report.mediaUrl}
                          alt={report.title}
                          className="h-full w-full object-cover sm:rounded-l-xl"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              {report.id}
                            </p>
                            <StatusBadge status={report.status} />
                          </div>
                          <h3 className="mt-1 font-semibold text-foreground">
                            {report.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{report.location}</span>
                          </div>
                        </div>
                        <Link href={`/report/${report.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-primary"
                            aria-label={`Open ${report.title}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
                        <SeverityBadge severity={report.severity} />
                        <span className="text-xs text-muted-foreground">
                          {report.issueType}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(new Date(report.submittedAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="py-16 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="mb-1 font-heading font-semibold text-foreground">
                No reports yet
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Submit your first infrastructure report to help your community.
              </p>
              <Link href="/report">
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Report an Issue
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
