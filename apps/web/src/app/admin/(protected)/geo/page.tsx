"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChartCard } from "@/components/admin/chart-card";
import { GeoMap } from "@/components/admin/geo-map";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";

export default function AdminGeoPage() {
  const qs = useStatsSearchParams();
  const { data: cities } = useQuery({
    queryKey: ["geo", "city", qs],
    queryFn: () =>
      apiFetch<Array<{ city: string | null; visits: number; latitude: number | null; longitude: number | null }>>(
        `/v1/admin/stats/geo?level=city&${qs}`,
      ),
  });
  const { data: countries } = useQuery({
    queryKey: ["geo", "country", qs],
    queryFn: () =>
      apiFetch<Array<{ country: string | null; countryCode: string | null; visits: number }>>(
        `/v1/admin/stats/geo?level=country&${qs}`,
      ),
  });

  const mapPoints = (cities ?? [])
    .filter((c) => c.latitude != null && c.longitude != null)
    .map((c) => ({
      lat: c.latitude as number,
      lng: c.longitude as number,
      label: c.city ?? "Ville inconnue",
      visits: c.visits,
    }));

  return (
    <AdminShell title="Géographie">
      <ChartCard
        title="Précision des IP en RDC"
        hint="La ville déduite d'une IP est approximative. Les opérateurs mobiles peuvent localiser à Kinshasa ou Lubumbashi même si le visiteur est ailleurs."
      >
        <p style={{ margin: 0, color: "var(--rw-text-muted)", fontSize: 14 }}>
          Le rayon de précision MaxMind est affiché sur la fiche de chaque visite. « Ville inconnue »
          lorsque la base ne fournit pas de ville.
        </p>
      </ChartCard>
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <GeoMap points={mapPoints} />
      </div>
      <div className="admin-cards">
        <ChartCard title="Pays">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(countries ?? []).map((c) => (
              <li key={String(c.countryCode)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{c.country ?? c.countryCode}</span>
                <span>{formatNumber(c.visits)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Villes">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(cities ?? []).slice(0, 20).map((c) => (
              <li key={String(c.city)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{c.city ?? "Ville inconnue"}</span>
                <span>{formatNumber(c.visits)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </AdminShell>
  );
}
