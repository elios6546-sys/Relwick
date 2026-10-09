"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface VisitorProfileResponse {
  visitor: {
    firstSeenAt: string;
    lastSeenAt: string;
    sessions: Array<{ id: string; startedAt: string; city: string | null }>;
  };
  ips: string[];
  cities: string[];
}

export default function VisitorProfilePage() {
  const params = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ["visitor", params.id],
    queryFn: () => apiFetch<VisitorProfileResponse>(`/v1/admin/visitors/${params.id}`),
  });

  const visitor = data?.visitor;

  return (
    <AdminShell title="Profil visiteur">
      {!visitor ? (
        <p>Chargement…</p>
      ) : (
        <>
          <div className="rw-card" style={{ marginBottom: 16 }}>
            <p>
              <strong>Première visite :</strong> {formatDateTime(visitor.firstSeenAt)}
            </p>
            <p>
              <strong>Dernière visite :</strong> {formatDateTime(visitor.lastSeenAt)}
            </p>
            <p>
              <strong>IP utilisées :</strong> {data?.ips.join(", ") || "—"}
            </p>
            <p>
              <strong>Villes :</strong> {data?.cities.join(", ") || "—"}
            </p>
          </div>
          <div className="rw-card">
            <h2 style={{ marginTop: 0, font: "600 16px var(--font-sans)" }}>Sessions</h2>
            <ul>
              {visitor.sessions.map((s) => (
                <li key={s.id} style={{ marginBottom: 8 }}>
                  <Link href={`/admin/sessions/${s.id}`}>{formatDateTime(s.startedAt)}</Link>
                  {s.city ? ` — ${s.city}` : null}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </AdminShell>
  );
}
