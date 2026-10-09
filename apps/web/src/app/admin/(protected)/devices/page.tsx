"use client";

import { useQuery } from "@tanstack/react-query";
import { DEVICE_TYPE_LABELS, type DeviceType } from "@relwick/shared";
import { AdminShell } from "@/components/admin/admin-shell";
import { ChartCard } from "@/components/admin/chart-card";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";

export default function AdminDevicesPage() {
  const qs = useStatsSearchParams();
  const { data } = useQuery({
    queryKey: ["devices", qs],
    queryFn: () =>
      apiFetch<{
        deviceTypes: Array<{ deviceType: DeviceType; _count: { _all: number } }>;
        browsers: Array<{ browser: string | null; _count: { _all: number } }>;
        operatingSystems: Array<{ os: string | null; _count: { _all: number } }>;
        screenSizes: Array<{ label: string; count: number }>;
      }>(`/v1/admin/stats/devices?${qs}`),
  });

  return (
    <AdminShell title="Appareils">
      <div className="admin-cards">
        <ChartCard title="Types">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.deviceTypes ?? []).map((d) => (
              <li key={d.deviceType} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{DEVICE_TYPE_LABELS[d.deviceType]}</span>
                <span>{formatNumber(d._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Navigateurs">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.browsers ?? []).map((b) => (
              <li key={String(b.browser)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{b.browser}</span>
                <span>{formatNumber(b._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Systèmes">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.operatingSystems ?? []).map((o) => (
              <li key={String(o.os)} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{o.os}</span>
                <span>{formatNumber(o._count._all)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
        <ChartCard title="Tailles d'écran">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(data?.screenSizes ?? []).map((s) => (
              <li key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rw-line)" }}>
                <span>{s.label}</span>
                <span>{formatNumber(s.count)}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>
    </AdminShell>
  );
}
