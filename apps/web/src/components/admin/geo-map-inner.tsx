"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

export function GeoMapInner({
  points,
}: {
  points: Array<{
    lat: number;
    lng: number;
    label: string;
    visits: number;
    radius?: number;
  }>;
}) {
  const center: [number, number] = points[0]
    ? [points[0].lat, points[0].lng]
    : [-10.7167, 25.4667];

  return (
    <MapContainer center={center} zoom={5} style={{ height: 360, width: "100%", borderRadius: 10 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={`${p.lat}-${p.lng}-${p.label}`}
          center={[p.lat, p.lng]}
          radius={Math.max(6, Math.min(28, p.radius ?? Math.sqrt(p.visits) * 3))}
          pathOptions={{ color: "var(--rw-primary)", fillColor: "var(--rw-primary)", fillOpacity: 0.35 }}
        >
          <Tooltip>
            {p.label} — {p.visits} visites
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
