"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  RotateCcw,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { PriorityScore } from "@/components/PriorityScore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  issueTypes,
  sampleReports,
  sortReportsByPriority,
  type CivicReport
} from "@/lib/mockReports";
import { loadReportsFromSupabase } from "@/lib/reportQueries";

const defaultFilters = {
  search: "",
  severity: "all",
  status: "all",
  issueType: "all"
};

export default function DashboardPage() {
  const [reports, setReports] = useState<CivicReport[]>(sortReportsByPriority(sampleReports));
  const [filters, setFilters] = useState(defaultFilters);

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
    return reports
      .filter((report) => {
        const search = filters.search.toLowerCase();
        const matchSearch =
          search === "" ||
          report.title.toLowerCase().includes(search) ||
          report.location.toLowerCase().includes(search) ||
          report.issueType.toLowerCase().includes(search);
        const matchSeverity =
          filters.severity === "all" || report.severity === filters.severity;
        const matchStatus =
          filters.status === "all" || report.status === filters.status;
        const matchType =
          filters.issueType === "all" || report.issueType === filters.issueType;

        return matchSearch && matchSeverity && matchStatus && matchType;
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);
  }, [filters, reports]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Agency Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Monitor and prioritize infrastructure reports across the city.
          </p>
        </div>

        <div className="mb-6">
          <StatsGrid reports={reports} />
        </div>

        <div className="mb-5">
          <DashboardFilters
            filters={filters}
            setFilters={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredReports.length} report
            {filteredReports.length !== 1 ? "s" : ""} / Sorted by priority
          </p>
        </div>

        <ReportTable reports={filteredReports} />
      </motion.div>
    </div>
  );
}

function StatsGrid({ reports }: { reports: CivicReport[] }) {
  const stats = [
    {
      label: "Total Reports",
      value: reports.length,
      icon: BarChart3,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Critical Issues",
      value: reports.filter((report) => report.severity === "Critical").length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      label: "Pending Review",
      value: reports.filter((report) => report.status === "Pending Review").length,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "Resolved",
      value: reports.filter((report) => report.status === "Resolved").length,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-white p-5 transition-shadow hover:shadow-sm"
          >
            <div
              className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}
            >
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function DashboardFilters({
  filters,
  setFilters,
  onReset
}: {
  filters: typeof defaultFilters;
  setFilters: React.Dispatch<React.SetStateAction<typeof defaultFilters>>;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search reports..."
          value={filters.search}
          onChange={(event) =>
            setFilters((current) => ({ ...current, search: event.target.value }))
          }
          className="bg-white pl-10"
        />
      </div>

      <Select
        value={filters.severity}
        onValueChange={(value) =>
          setFilters((current) => ({ ...current, severity: value }))
        }
      >
        <SelectTrigger className="w-full bg-white sm:w-36">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) =>
          setFilters((current) => ({ ...current, status: value }))
        }
      >
        <SelectTrigger className="w-full bg-white sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Pending Review">Pending Review</SelectItem>
          <SelectItem value="Verified">Verified</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.issueType}
        onValueChange={(value) =>
          setFilters((current) => ({ ...current, issueType: value }))
        }
      >
        <SelectTrigger className="w-full bg-white sm:w-44">
          <SelectValue placeholder="Issue Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          {issueTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Reset filters"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ReportTable({ reports }: { reports: CivicReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white py-16 text-center">
        <p className="text-muted-foreground">No reports match your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <TableHead>Issue</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Auth.</TableHead>
              <TableHead>Dupes</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/30"
              >
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">
                    {report.issueType}
                  </p>
                  <p className="mt-0.5 max-w-[180px] truncate text-xs text-muted-foreground">
                    {report.title}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex max-w-[160px] items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <SeverityBadge severity={report.severity} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium text-foreground">
                    {report.authenticityScore}%
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-foreground">
                    {report.duplicateCount}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <PriorityScore score={report.priorityScore} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={report.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                  {format(new Date(report.submittedAt), "MMM d, HH:mm")}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/report/${report.id}`}
                    className="text-primary transition-colors hover:text-primary/80"
                    aria-label={`Open ${report.title}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHead({ children }: { children?: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-muted-foreground">
      {children}
    </th>
  );
}
