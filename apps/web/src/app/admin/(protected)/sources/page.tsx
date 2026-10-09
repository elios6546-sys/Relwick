"use client";

import { useQuery } from "@tanstack/react-query";
import { SOURCE_CATEGORY_LABELS, type SourceCategory } from "@relwick/shared";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChartCard } from "@/components/admin/chart-card";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";

export default function AdminSourcesPage() {
  const qs = useStatsSearchParams();
  const { data } = useQuery({
    queryKey: ["sources", qs],
    queryFn: () =>
      apiFetch<{
        categories: Array<{ sourceCategory: SourceCategory; _count: { _all: number } }>;
        referrers: Array<{ referrerDomain: string | null; _count: { _all: number } }>;
        campaigns: Array<{ utmCampaign: string | null; utmSource: string | null; _count: { _all: number } }>;
        isps: Array<{ isp: string | null; _count: { _all: number } }>;
      }>(`/v1/admin/stats/sources?${qs}`),
  });

  return (
    <AdminShell title="Sources">
      <div className="admin-cards">
        <ChartCard title="Catégories">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.categories ?? []).map((c) => (
              <li key={c.sourceCategory} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{SOURCE_CATEGORY_LABELS[c.sourceCategory] ?? c.sourceCategory}</span>
                <span>{formatNumber(c._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Domaines referrers">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.referrers ?? []).map((r) => (
              <li key={String(r.referrerDomain)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{r.referrerDomain}</span>
                <span>{formatNumber(r._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Campagnes UTM">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.campaigns ?? []).map((c) => (
              <li key={`${c.utmCampaign}-${c.utmSource}`} style={{ padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                {c.utmCampaign} ({c.utmSource}) — {formatNumber(c._count._all)}
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Opérateurs">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.isps ?? []).map((i) => (
              <li key={String(i.isp)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{i.isp}</span>
                <span>{formatNumber(i._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </AdminShell>
  );
}
