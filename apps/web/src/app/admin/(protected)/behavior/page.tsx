"use client";

import { useQuery } from "@tanstack/react-query";
import { Layers, LogOut, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { KpiCard, ProgressListCard } from "@/components/admin/dash-cards";
import type {
  DevicesResponse,
  DurationsResponse,
  Overview,
  SectionRow,
  SourcesResponse,
} from "@/components/admin/dash-types";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { PERIOD_COMPARE, readPreset } from "@/lib/admin/period";
import { SECTIONS, sectionLabel, sourceLabel } from "@/lib/admin/sections";
import { formatNumber, formatOneDecimal, formatPct } from "@/lib/format";

export default function AdminBehaviorPage() {
  const qs = useStatsSearchParams({ compare: true });
  const preset = readPreset(useSearchParams());
  const cmp = PERIOD_COMPARE[preset];

  const overview = useQuery({
    queryKey: ["admin", "stats", "overview", qs],
    queryFn: () => apiFetch<Overview>(`/v1/admin/stats/overview?${qs}`),
  });
  const sections = useQuery({
    queryKey: ["admin", "stats", "sections", qs],
    queryFn: () => apiFetch<SectionRow[]>(`/v1/admin/stats/sections?${qs}`),
  });
  const durations = useQuery({
    queryKey: ["admin", "stats", "durations", qs],
    queryFn: () => apiFetch<DurationsResponse>(`/v1/admin/stats/durations?${qs}`),
  });
  const sources = useQuery({
    queryKey: ["admin", "stats", "sources", qs],
    queryFn: () => apiFetch<SourcesResponse>(`/v1/admin/stats/sources?${qs}`),
  });
  const devices = useQuery({
    queryKey: ["admin", "stats", "devices", qs],
    queryFn: () => apiFetch<DevicesResponse>(`/v1/admin/stats/devices?${qs}`),
  });

  const cur = overview.data?.current;
  const chg = overview.data?.change;
  const visits = cur?.visits ?? 0;

  const funnel = (sections.data ?? []).map((s) => ({
    key: s.section,
    name: sectionLabel(s.section),
    sub: s.exitCount ? `${formatNumber(s.exitCount)} sorties` : undefined,
    value: formatPct(s.reachPct),
    pct: s.reachPct,
  }));

  const durTotal = durations.data?.total ?? 0;
  const durItems = (durations.data?.buckets ?? []).map((b) => ({
    key: b.label,
    name: b.label,
    value: formatNumber(b.count),
    pct: durTotal ? (b.count / durTotal) * 100 : 0,
  }));

  const srcTotal = (sources.data?.categories ?? []).reduce((a, c) => a + c._count._all, 0);
  const srcItems = (sources.data?.categories ?? [])
    .slice()
    .sort((a, b) => b._count._all - a._count._all)
    .map((c) => ({
      key: c.sourceCategory,
      name: sourceLabel(c.sourceCategory),
      value: formatNumber(c._count._all),
      pct: srcTotal ? (c._count._all / srcTotal) * 100 : 0,
    }));

  const devTotal = (devices.data?.operatingSystems ?? []).reduce((a, c) => a + c._count._all, 0);
  const devItems = (devices.data?.operatingSystems ?? [])
    .slice()
    .sort((a, b) => b._count._all - a._count._all)
    .map((o) => {
      const pct = devTotal ? (o._count._all / devTotal) * 100 : 0;
      const os = o.os ?? "Inconnu";
      const type = /android|ios|iphone/i.test(os) ? "Mobile" : /ipad/i.test(os) ? "Tablette" : "Ordinateur";
      return {
        key: os,
        name: os,
        sub: `${type} · ${formatPct(pct)}`,
        value: formatNumber(o._count._all),
        pct,
      };
    });

  return (
    <AdminShell title="Comportement" subtitle="Jusqu’où vont-ils et où décrochent-ils">
      <div className="dash-kpis">
        <KpiCard
          index={0}
          label="Sections vues en moyenne"
          icon={Layers}
          value={cur ? `${formatOneDecimal(cur.avgSectionDepth)} sur ${SECTIONS.length}` : "…"}
          change={chg?.avgSectionDepth}
          compare={cmp}
        />
        <KpiCard
          index={1}
          label="Ont atteint Contact"
          icon={MapPin}
          value={cur ? formatPct(cur.reachedContactPct) : "…"}
          change={chg?.reachedContactPct}
          compare={cmp}
        />
        <KpiCard
          index={2}
          label="Partis dès le Hero"
          icon={LogOut}
          value={cur ? formatPct(cur.heroExitPct) : "…"}
          change={chg?.heroExitPct}
          compare={cmp}
          invert
        />
      </div>

      <div className="dash-grid-420">
        <ProgressListCard
          index={3}
          title="Défilement et sorties"
          subtitle="Part des visites ayant atteint chaque section"
          items={funnel}
        />
        <ProgressListCard
          index={4}
          title="Temps passé sur le site"
          subtitle={`Répartition des ${formatNumber(visits)} visites`}
          items={durItems}
        />
        <ProgressListCard
          index={5}
          title="Sources"
          subtitle="Comment ils sont arrivés"
          items={srcItems}
        />
        <ProgressListCard
          index={6}
          title="Appareils"
          subtitle="Systèmes d’exploitation des visiteurs"
          items={devItems}
        />
      </div>
    </AdminShell>
  );
}
