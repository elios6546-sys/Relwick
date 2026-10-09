"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Eye, PhoneCall, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { BarChart, type BarPoint } from "@/components/admin/bar-chart";
import { DashCard, KpiCard, ProgressListCard } from "@/components/admin/dash-cards";
import type {
  CityRow,
  ClickRow,
  Overview,
  SectionRow,
  SessionRow,
  SessionsList,
  Timeseries,
} from "@/components/admin/dash-types";
import { LiveCard } from "@/components/admin/live-card";
import { VisitDrawer } from "@/components/admin/visit-drawer";
import { VisitsTable } from "@/components/admin/visits-table";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { PERIOD_COMPARE, readPreset } from "@/lib/admin/period";
import { sectionLabel, trackLabel, trackWhere } from "@/lib/admin/sections";
import { formatDowDay, formatDowDayMonth, formatDur, formatNumber, formatPct } from "@/lib/format";

export default function AdminOverviewPage() {
  const qs = useStatsSearchParams({ compare: true });
  const searchParams = useSearchParams();
  const router = useRouter();
  const preset = readPreset(searchParams);
  const [hover, setHover] = useState<BarPoint | null>(null);
  const [selected, setSelected] = useState<{ row: SessionRow; n: number } | null>(null);

  const overview = useQuery({
    queryKey: ["admin", "stats", "overview", qs],
    queryFn: () => apiFetch<Overview>(`/v1/admin/stats/overview?${qs}`),
  });
  const series = useQuery({
    queryKey: ["admin", "stats", "timeseries", qs],
    queryFn: () => apiFetch<Timeseries>(`/v1/admin/stats/timeseries?${qs}`),
  });
  const cities = useQuery({
    queryKey: ["admin", "stats", "geo-city", qs],
    queryFn: () => apiFetch<CityRow[]>(`/v1/admin/stats/geo?${qs}&level=city`),
  });
  const clicks = useQuery({
    queryKey: ["admin", "stats", "clicks", qs],
    queryFn: () => apiFetch<ClickRow[]>(`/v1/admin/stats/clicks?${qs}`),
  });
  const sections = useQuery({
    queryKey: ["admin", "stats", "sections", qs],
    queryFn: () => apiFetch<SectionRow[]>(`/v1/admin/stats/sections?${qs}`),
  });
  const recent = useQuery({
    queryKey: ["admin", "sessions", "recent", qs],
    queryFn: () => apiFetch<SessionsList>(`/v1/admin/sessions?${qs}&page=1&pageSize=8`),
  });

  const cur = overview.data?.current;
  const chg = overview.data?.change;
  const cmp = PERIOD_COMPARE[preset];
  const totalVisits = cur?.visits ?? 0;

  const points: BarPoint[] = useMemo(() => {
    const pts = series.data?.points ?? [];
    const interval = series.data?.interval ?? "day";
    return pts.map((p) => {
      if (interval === "hour") {
        const h = new Date(p.date).toLocaleString("fr-FR", {
          timeZone: "Africa/Lubumbashi",
          hour: "numeric",
          hour12: false,
        });
        const hh = Number(h) % 24;
        return { key: p.date, label: `${hh} h`, title: `${hh} h`, value: p.visits };
      }
      return {
        key: p.date,
        label: interval === "day" ? formatDowDay(p.date) : formatDowDayMonth(p.date),
        title: formatDowDayMonth(p.date),
        value: p.visits,
      };
    });
  }, [series.data]);

  const chartSub =
    preset === "today" ? "Par heure, aujourd’hui" : preset === "30d" ? "Par jour, 30 derniers jours" : "Par jour, 7 derniers jours";

  const cityItems = (cities.data ?? []).slice(0, 6).map((c, i) => ({
    key: `${c.city ?? "?"}-${i}`,
    name: c.city ?? "Ville inconnue",
    sub: c.countryCode ?? undefined,
    value: formatNumber(c.visits),
    pct: totalVisits ? (c.visits / totalVisits) * 100 : 0,
  }));

  const clickItems = (clicks.data ?? []).slice(0, 6).map((c) => ({
    key: c.name,
    name: trackLabel(c.name, c.label),
    sub: trackWhere(c.name, c.section),
    value: formatNumber(c.clicks),
    pct: c.pctOfVisits,
  }));

  const sectionItems = (sections.data ?? []).map((s) => ({
    key: s.section,
    name: sectionLabel(s.section),
    value: formatPct(s.reachPct),
    pct: s.reachPct,
  }));

  const open = (row: SessionRow, idx: number) => setSelected({ row, n: idx + 1 });

  return (
    <AdminShell title="Vue d’ensemble">
      <div className="dash-kpis dash-kpis--4">
        <KpiCard
          index={0}
          label="Visites totales"
          icon={Eye}
          value={cur ? formatNumber(cur.visits) : "…"}
          change={chg?.visits}
          compare={cmp}
        />
        <KpiCard
          index={1}
          label="Visiteurs uniques"
          icon={Users}
          value={cur ? formatNumber(cur.uniqueVisitors) : "…"}
          change={chg?.uniqueVisitors}
          compare={cmp}
        />
        <KpiCard
          index={2}
          label="Durée moyenne"
          icon={Clock}
          value={cur ? formatDur(cur.avgDurationSec) : "…"}
          change={chg?.avgDurationSec}
          compare={cmp}
        />
        <KpiCard
          index={3}
          label="Prises de contact"
          icon={PhoneCall}
          value={cur ? formatNumber(cur.contacts) : "…"}
          change={chg?.contacts}
          compare={cmp}
        />
      </div>

      <div className="dash-row">
        <DashCard
          index={4}
          title="Visites"
          subtitle={chartSub}
          style={{ flex: "2 1 560px" }}
          right={
            <div>
              <div className="dash-card__big">
                {formatNumber(hover ? hover.value : totalVisits)} visites
              </div>
              <div className="dash-card__bigsub">{hover ? hover.title : "Total sur la période"}</div>
            </div>
          }
        >
          {points.length === 0 ? (
            <p className="dash-card__sub">Aucune visite sur cette période.</p>
          ) : (
            <BarChart points={points} gap={points.length <= 7 ? 12 : 4} onHover={setHover} />
          )}
        </DashCard>
        <LiveCard index={5} />
      </div>

      <div className="dash-grid-320">
        <ProgressListCard
          index={6}
          title="Villes"
          subtitle="D’où viennent vos visiteurs"
          items={cityItems}
        />
        <ProgressListCard
          index={7}
          title="Boutons les plus cliqués"
          subtitle="Nombre de visites avec un clic"
          items={clickItems}
        />
        <ProgressListCard
          index={8}
          title="Où ils s’arrêtent"
          subtitle="Part des visites ayant atteint chaque section"
          items={sectionItems}
        />
      </div>

      <section className="rw-card dash-tablecard" data-anim="" style={{ ["--i" as string]: 9 }}>
        <div className="dash-tablecard__head">
          <div>
            <h2 className="dash-card__title">Visiteurs récents</h2>
            <p className="dash-card__sub">Cliquez sur une ligne pour voir le parcours complet.</p>
          </div>
          <button
            type="button"
            className="rw-btn rw-btn--ghost"
            onClick={() => router.push(`/admin/sessions?${searchParams.toString()}`)}
          >
            Tous les visiteurs
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
        {recent.data && recent.data.items.length === 0 ? (
          <div className="dash-empty">Aucune visite sur cette période.</div>
        ) : (
          <VisitsTable
            rows={recent.data?.items ?? []}
            variant="short"
            onSelect={(row) => open(row, (recent.data?.items ?? []).findIndex((r) => r.id === row.id))}
          />
        )}
      </section>

      {selected ? (
        <VisitDrawer session={selected.row} number={selected.n} onClose={() => setSelected(null)} />
      ) : null}
    </AdminShell>
  );
}
