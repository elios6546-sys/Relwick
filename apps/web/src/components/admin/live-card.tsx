"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { sectionLabel } from "@/lib/admin/sections";
import { formatRelativeSeconds } from "@/lib/format";
import { DashCard } from "./dash-cards";
import type { LiveResponse, LiveVisitor } from "./dash-types";

type Kind = "arrivee" | "defilement" | "clic" | "depart";

const KIND: Record<Kind, { label: string; color: string }> = {
  arrivee: { label: "Arrivée", color: "var(--rw-primary)" },
  defilement: { label: "Défilement", color: "var(--rw-line-strong)" },
  clic: { label: "Clic", color: "var(--rw-copper)" },
  depart: { label: "Départ", color: "var(--rw-text-muted)" },
};

function kindOf(v: LiveVisitor): Kind {
  const active = new Date(v.lastActivityAt).getTime() - new Date(v.startedAt).getTime();
  if (v.sinceSeconds > 240) return "depart";
  if (active < 15_000) return "arrivee";
  if (v.clickCount > 0) return "clic";
  return "defilement";
}

export function LiveCard({ index, limit = 8 }: { index?: number; limit?: number }) {
  const { data } = useQuery({
    queryKey: ["admin", "live", "list"],
    queryFn: () => apiFetch<LiveResponse>("/v1/admin/stats/live"),
    refetchInterval: 15_000,
  });

  const items = (data?.visitors ?? []).slice(0, limit);

  return (
    <DashCard
      title="En direct"
      subtitle="Dernières actions sur le site"
      index={index}
      style={{ flex: "1 1 300px" }}
    >
      <div className="dash-live">
        {items.length === 0 ? (
          <p className="dash-card__sub">Personne sur le site pour le moment.</p>
        ) : (
          items.map((v) => {
            const k = kindOf(v);
            return (
              <div key={v.sessionId} className="dash-live__item">
                <span
                  className="dash-live__dot"
                  style={{ background: KIND[k].color }}
                  aria-hidden="true"
                />
                <div className="dash-live__text">
                  {KIND[k].label} · {sectionLabel(v.section)}
                  <div className="dash-live__meta">
                    <span className="dash-table__mono" style={{ fontSize: 12 }}>
                      {v.ip}
                    </span>{" "}
                    · {v.city ?? "Ville inconnue"}
                  </div>
                </div>
                <span className="dash-live__rel">{formatRelativeSeconds(v.lastActivityAt)}</span>
              </div>
            );
          })
        )}
      </div>
      <div className="dash-legend" aria-hidden="true">
        {(Object.keys(KIND) as Kind[]).map((k) => (
          <span key={k} className="dash-legend__item">
            <span className="dash-live__dot" style={{ background: KIND[k].color }} />
            {KIND[k].label}
          </span>
        ))}
      </div>
    </DashCard>
  );
}
