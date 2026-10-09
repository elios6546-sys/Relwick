"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { apiFetch } from "@/lib/api";
import { formatDuration } from "@/lib/format";

export default function AdminLivePage() {
  const { data } = useQuery({
    queryKey: ["stats", "live"],
    queryFn: () =>
      apiFetch<{
        count: number;
        visitors: Array<{
          sessionId: string;
          city: string | null;
          countryCode: string | null;
          page: string;
          section: string | null;
          deviceType: string;
          sourceCategory: string;
          sinceSeconds: number;
        }>;
      }>("/v1/admin/stats/live"),
    refetchInterval: 5000,
  });

  return (
    <AdminShell title="En direct">
      <p style={{ color: "var(--rw-text-muted)", marginTop: 0 }}>
        {data?.count ?? 0} visiteur{(data?.count ?? 0) > 1 ? "s" : ""} actif{(data?.count ?? 0) > 1 ? "s" : ""}
      </p>
      <div className="rw-card table-scroll">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rw-line)", textAlign: "left" }}>
              {["Ville", "Pays", "Page", "Section", "Appareil", "Source", "Durée", ""].map((h) => (
                <th key={h} style={{ padding: "10px 8px", color: "var(--rw-text-muted)", fontWeight: 500 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data?.visitors ?? []).map((v) => (
              <tr key={v.sessionId} style={{ borderBottom: "1px solid var(--rw-line)" }}>
                <td style={{ padding: "10px 8px" }}>{v.city ?? "Ville inconnue"}</td>
                <td style={{ padding: "10px 8px" }}>{v.countryCode ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{v.page}</td>
                <td style={{ padding: "10px 8px" }}>{v.section ?? "—"}</td>
                <td style={{ padding: "10px 8px" }}>{v.deviceType}</td>
                <td style={{ padding: "10px 8px" }}>{v.sourceCategory}</td>
                <td style={{ padding: "10px 8px" }}>{formatDuration(v.sinceSeconds)}</td>
                <td style={{ padding: "10px 8px" }}>
                  <Link href={`/admin/sessions/${v.sessionId}`}>Détail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
