"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect } from "react";
import type { LatLngExpression } from "leaflet";
import type { ReportMapProps } from "@/components/ReportMap";

const singapore = { lat: 1.3521, lng: 103.8198 };

const severityColors = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981"
} as const;

export default function ReportMapLeaflet({
  markers = [],
  selectedId,
  selectedPosition,
  center = singapore,
  zoom = 12,
  className = "h-[320px]",
  onMarkerClick,
  onPick
}: ReportMapProps) {
  const selectedMarker = markers.find((marker) => marker.id === selectedId);
  const mapCenter: LatLngExpression = selectedMarker
    ? [selectedMarker.lat, selectedMarker.lng]
    : selectedPosition
      ? [selectedPosition.lat, selectedPosition.lng]
      : [center.lat, center.lng];

  return (
    <div className={`overflow-hidden rounded-xl border border-line ${className}`}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenter position={mapCenter} />
        {onPick ? <PickHandler onPick={onPick} /> : null}
        {selectedPosition ? (
          <CircleMarker
            center={[selectedPosition.lat, selectedPosition.lng]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#c36022",
              fillOpacity: 1,
              weight: 3
            }}
          >
            <Popup>Selected location</Popup>
          </CircleMarker>
        ) : null}
        {markers.map((marker) => {
          const active = marker.id === selectedId;
          const color = marker.severity ? severityColors[marker.severity] : "#2563eb";

          return (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={active ? 11 : 8}
              eventHandlers={{ click: () => onMarkerClick?.(marker.id) }}
              pathOptions={{
                color: "#ffffff",
                fillColor: color,
                fillOpacity: 0.95,
                weight: active ? 4 : 3
              }}
            >
              <Popup>{marker.title}</Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function PickHandler({ onPick }: { onPick: (position: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(event) {
      onPick({
        lat: roundCoordinate(event.latlng.lat),
        lng: roundCoordinate(event.latlng.lng)
      });
    }
  });

  return null;
}

function MapCenter({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: false });
  }, [map, position]);

  return null;
}

function roundCoordinate(value: number) {
  return Math.round(value * 1000000) / 1000000;
}
