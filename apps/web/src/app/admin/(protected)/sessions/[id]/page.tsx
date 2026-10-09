"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { GeoMap } from "@/components/admin/geo-map";
import { apiFetch } from "@/lib/api";
import { formatDateTime, formatDuration } from "@/lib/format";

export default function SessionDetailPage() {
  const params = useParams<{ id: string }>();

  const { data } = useQuery({
    queryKey: ["session", params.id],
    queryFn: () =>
      apiFetch<{
        session: Record<string, unknown>;
        timeline: Array<{ at: string; label: string; kind: string }>;
      }>(`/v1/admin/sessions/${params.id}`),
  });

  const s = data?.session;
  const lat = s?.latitude != null ? Number(s.latitude) : null;
  const lng = s?.longitude != null ? Number(s.longitude) : null;

  return (
    <AdminShell title="Détail de la visite">
      {!s ? (
        <p>Chargement…</p>
      ) : (
        <>
          <div className="rw-card" style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", fontSize: 14 }}>
              <div><strong>IP</strong><div style={{ fontFamily: "var(--font-mono)" }}>{String(s.ip)}</div></div>
              <div><strong>Ville</strong><div>{String(s.city ?? "Ville inconnue")}</div></div>
              <div><strong>Pays</strong><div>{String(s.country ?? s.countryCode ?? "—")}</div></div>
              <div><strong>Précision</strong><div>{s.accuracyKm != null ? `${s.accuracyKm} km` : "—"}</div></div>
              <div><strong>Appareil</strong><div>{String(s.deviceType)} · {String(s.browser)} · {String(s.os)}</div></div>
              <div><strong>Source</strong><div>{String(s.sourceCategory)}</div></div>
              <div><strong>Début</strong><div>{formatDateTime(String(s.startedAt))}</div></div>
              <div><strong>Durée active</strong><div>{formatDuration(Number(s.activeSeconds))}</div></div>
            </div>
            {s.visitorId ? (
              <p style={{ marginTop: 16 }}>
                <Link href={`/admin/visitors/${String(s.visitorId)}`}>Profil visiteur</Link>
              </p>
            ) : null}
          </div>

          {lat != null && lng != null ? (
            <div style={{ marginBottom: 16 }}>
              <GeoMap
                points={[
                  {
                    lat,
                    lng,
                    label: String(s.city ?? "Position approximative"),
                    visits: 1,
                    radius: s.accuracyKm ? Number(s.accuracyKm) : 8,
                  },
                ]}
              />
            </div>
          ) : null}

          <div className="rw-card">
            <h2 style={{ font: "600 16px var(--font-sans)", marginTop: 0 }}>Chronologie</h2>
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {(data?.timeline ?? []).map((item, i) => (
                <li key={`${item.at}-${i}`} style={{ marginBottom: 10 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--rw-text-muted)" }}>
                    {formatDateTime(item.at)}
                  </span>
                  <div>{item.label}</div>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </AdminShell>
  );
}
