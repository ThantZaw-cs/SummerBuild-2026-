"use client";

import dynamic from "next/dynamic";
import type { Severity } from "@/lib/reports";

export type ReportMapMarker = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  severity?: Severity;
};

export type ReportMapProps = {
  markers?: ReportMapMarker[];
  selectedId?: string | null;
  selectedPosition?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
  onPick?: (position: { lat: number; lng: number }) => void;
};

const ReportLeafletMap = dynamic(() => import("@/components/ReportMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-xl border border-line bg-slate-100 text-sm text-slate-500">
      Loading map...
    </div>
  )
});

export function ReportMap(props: ReportMapProps) {
  return <ReportLeafletMap {...props} />;
}

export function isValidCoordinate(lat: number | null | undefined, lng: number | null | undefined) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
