"use client";

import { useQuery } from "@tanstack/react-query";
import { MousePointerClick, Pointer, Repeat } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { KpiCard } from "@/components/admin/dash-cards";
import type { ClickRow, Overview } from "@/components/admin/dash-types";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { PERIOD_COMPARE, readPreset } from "@/lib/admin/period";
import { trackLabel, trackWhere } from "@/lib/admin/sections";
import { formatNumber, formatOneDecimal, formatPct } from "@/lib/format";

const COLS = "40px minmax(200px,1.5fr) minmax(130px,1fr) minmax(70px,.5fr) minmax(120px,.7fr) minmax(200px,1.4fr)";

export default function AdminClicksPage() {
  const qs = useStatsSearchParams({ compare: true });
  const preset = readPreset(useSearchParams());
  const cmp = PERIOD_COMPARE[preset];

  const overview = useQuery({
    queryKey: ["admin", "stats", "overview", qs],
    queryFn: () => apiFetch<Overview>(`/v1/admin/stats/overview?${qs}`),
  });
  const clicks = useQuery({
    queryKey: ["admin", "stats", "clicks", qs],
    queryFn: () => apiFetch<ClickRow[]>(`/v1/admin/stats/clicks?${qs}`),
  });

  const cur = overview.data?.current;
  const chg = overview.data?.change;
  const rows = clicks.data ?? [];

  return (
    <AdminShell title="Clics" subtitle="Quels boutons retiennent l’attention">
      <div className="dash-kpis">
        <KpiCard
          index={0}
          label="Total des clics"
          icon={MousePointerClick}
          value={cur ? formatNumber(cur.clicks) : "…"}
          change={chg?.clicks}
          compare={cmp}
        />
        <KpiCard
          index={1}
          label="Clics par visite"
          icon={Repeat}
          value={cur ? formatOneDecimal(cur.clicksPerVisit) : "…"}
          change={chg?.clicksPerVisit}
          compare={cmp}
        />
        <KpiCard
          index={2}
          label="Visites avec au moins un clic"
          icon={Pointer}
          value={cur ? formatPct(cur.visitsWithClickPct) : "…"}
          change={chg?.visitsWithClickPct}
          compare={cmp}
        />
      </div>

      <section className="rw-card dash-tablecard" data-anim="" style={{ ["--i" as string]: 3 }}>
        <div className="dash-tablecard__head">
          <div>
            <h2 className="dash-card__title">Tous les boutons suivis</h2>
            <p className="dash-card__sub">Classés par nombre de clics sur la période</p>
          </div>
        </div>
        <div className="dash-tablewrap">
          <div className="dash-table">
            <div className="dash-table__head" style={{ gridTemplateColumns: COLS }}>
              <span>N°</span>
              <span>Bouton</span>
              <span>Emplacement</span>
              <span>Clics</span>
              <span>Visiteurs uniques</span>
              <span>Taux de clic</span>
            </div>
            {clicks.data && rows.length === 0 ? (
              <div className="dash-empty">Aucun clic enregistré sur cette période.</div>
            ) : (
              rows.map((r, i) => (
                <div
                  key={r.name}
                  className="dash-table__row dash-table__row--static"
                  style={{ gridTemplateColumns: COLS }}
                >
                  <span className="dash-table__mono" style={{ color: "var(--rw-copper-text)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontWeight: 500 }}>{trackLabel(r.name, r.label)}</span>
                  <span className="dash-table__muted">{trackWhere(r.name, r.section)}</span>
                  <span>{formatNumber(r.clicks)}</span>
                  <span>{formatNumber(r.distinctVisitors)}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="dash-bar" style={{ flex: 1 }} aria-hidden="true">
                      <span
                        className="dash-bar__fill"
                        style={{ display: "block", width: `${Math.min(100, r.pctOfVisits)}%` }}
                      />
                    </span>
                    <span style={{ width: 44, textAlign: "right", fontWeight: 500 }}>
                      {formatPct(r.pctOfVisits)}
                    </span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
