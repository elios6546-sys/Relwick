"use client";

import dynamic from "next/dynamic";

export const GeoMap = dynamic(
  () => import("./geo-map-inner").then((m) => m.GeoMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="rw-card rw-card--sunken" style={{ height: 360, display: "grid", placeItems: "center" }}>
        Chargement de la carte…
      </div>
    ),
  },
);
