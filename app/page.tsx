"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  CheckCircle,
  Copy,
  FileCheck,
  Gauge,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "1",
    icon: Camera,
    title: "Upload Photo or Video",
    desc: "Snap a quick photo of the infrastructure issue"
  },
  {
    step: "2",
    icon: MapPin,
    title: "Select Location",
    desc: "Pin the exact spot on the map or use GPS"
  },
  {
    step: "3",
    icon: Zap,
    title: "AI Generates Report",
    desc: "Get a full maintenance report in seconds"
  }
];

const features = [
  {
    icon: ScanSearch,
    title: "Issue Detection",
    description:
      "AI automatically identifies the type of infrastructure issue from your photo."
  },
  {
    icon: ShieldCheck,
    title: "Authenticity Verification",
    description:
      "Each report is scored for authenticity to prevent false or duplicate submissions."
  },
  {
    icon: Gauge,
    title: "Severity Assessment",
    description:
      "AI evaluates how severe the issue is and whether immediate action is needed."
  },
  {
    icon: Copy,
    title: "Duplicate Detection",
    description:
      "Automatically detects if the same issue has been reported nearby by others."
  },
  {
    icon: Target,
    title: "Priority Scoring",
    description:
      "Every report gets a priority score so agencies can focus on what matters most."
  },
  {
    icon: FileCheck,
    title: "Agency-Ready Reports",
    description:
      "AI generates structured, professional reports that agencies can act on immediately."
  }
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              SummerBuild 2026 / AI-Powered
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Report civic issues{" "}
              <span className="text-primary">in under 30 seconds</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Snap a photo, drop a pin, write one sentence. Our AI turns your
              simple citizen report into a structured maintenance report - ready
              for agencies to act on.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/report">
                <Button
                  size="lg"
                  className="h-12 bg-primary px-8 text-base text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                >
                  Report an Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 border-border px-8 text-base"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-20 max-w-4xl"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.step}
                    className="group relative rounded-xl border border-border bg-white p-6 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-md"
                  >
                    <div className="absolute -top-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {item.step}
                    </div>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1.5 font-heading font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <p className="mb-2 text-sm font-medium text-primary">
              AI-Powered Analysis
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Smarter infrastructure reporting
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Every report is analyzed by AI to extract actionable insights for
              maintenance agencies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: features.indexOf(feature) * 0.08 }}
                  className="group rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-2 font-heading font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <p className="mb-2 text-sm font-medium text-primary">
              Agency Dashboard
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Real-time visibility for agencies
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Agencies get a centralized dashboard to view, filter, and
              prioritize all citizen reports.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg"
          >
            <div className="flex items-center gap-2 border-b border-border p-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs text-muted-foreground">
                CivicLens Agency Dashboard
              </span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  {
                    label: "Total Reports",
                    value: "1,247",
                    icon: BarChart3,
                    color: "text-primary bg-primary/10"
                  },
                  {
                    label: "Critical Issues",
                    value: "23",
                    icon: AlertTriangle,
                    color: "text-red-600 bg-red-50"
                  },
                  {
                    label: "In Progress",
                    value: "156",
                    icon: TrendingUp,
                    color: "text-amber-600 bg-amber-50"
                  },
                  {
                    label: "Resolved",
                    value: "891",
                    icon: CheckCircle,
                    color: "text-emerald-600 bg-emerald-50"
                  }
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-background p-4"
                    >
                      <div
                        className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3">
                {[
                  ["Road Damage", "Orchard Road", "Critical", 96],
                  ["Drainage Issue", "Clementi Ave 1", "High", 85],
                  ["Lighting Failure", "Bishan Park", "Medium", 71]
                ].map(([type, location, severity, score]) => (
                  <div
                    key={String(type)}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">
                        {type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {location}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          severity === "Critical"
                            ? "bg-red-50 text-red-700"
                            : severity === "High"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {severity}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-foreground p-10 text-center sm:p-14"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
            <div className="relative">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Make your city better, one report at a time
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Join thousands of citizens who are using CivicLens to improve
                public infrastructure.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/report">
                  <Button
                    size="lg"
                    className="h-12 bg-white px-8 text-base text-foreground shadow-lg hover:bg-white/90"
                  >
                    Start Reporting
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 border-white/20 px-8 text-base text-white hover:bg-white/10"
                  >
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
