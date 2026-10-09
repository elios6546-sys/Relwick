"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LEAD_STATUS_LABELS, LeadStatus } from "@relwick/shared";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getApiUrl, apiFetch } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface LeadRow {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  projectType: string;
  callSlot: string;
  city: string | null;
  status: LeadStatus;
  createdAt: string;
  notes: string | null;
  sessionId: string | null;
}

export default function AdminLeadsPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as LeadStatus | null;
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["leads", status],
    queryFn: () => {
      const q = status ? `&status=${status}` : "";
      return apiFetch<{ items: LeadRow[]; total: number }>(`/v1/admin/leads?page=1&pageSize=50${q}`);
    },
  });

  const patchLead = useMutation({
    mutationFn: (payload: { id: string; status?: LeadStatus; notes?: string }) =>
      apiFetch(`/v1/admin/leads/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: payload.status, notes: payload.notes }),
      }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const deleteLead = useMutation({
    mutationFn: (id: string) => apiFetch(`/v1/admin/leads/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setDeleteId(null);
      setSelected(null);
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const tone = (s: LeadStatus) => {
    if (s === LeadStatus.NEW) return "primary";
    if (s === LeadStatus.CONTACTED) return "warning";
    if (s === LeadStatus.CONVERTED) return "success";
    if (s === LeadStatus.LOST) return "neutral";
    return "primary";
  };

  return (
    <AdminShell title="Demandes d'appel">
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button type="button" className="rw-btn rw-btn--secondary rw-btn--sm" onClick={() => window.open(`${getApiUrl()}/v1/admin/leads/export.csv`, "_blank")}>
          Exporter en CSV
        </button>
      </div>
      <div className="admin-split">
        <div className="rw-card table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rw-line)", textAlign: "left" }}>
                {["Date", "Nom", "Téléphone", "Projet", "Statut"].map((h) => (
                  <th key={h} style={{ padding: 8, color: "var(--rw-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((lead) => (
                <tr
                  key={lead.id}
                  style={{ borderBottom: "1px solid var(--rw-line)", cursor: "pointer" }}
                  onClick={() => setSelected(lead)}
                >
                  <td style={{ padding: 8 }}>{formatDateTime(lead.createdAt)}</td>
                  <td style={{ padding: 8 }}>{lead.fullName}</td>
                  <td style={{ padding: 8 }}>
                    <a href={`tel:${lead.phone}`} onClick={(e) => e.stopPropagation()}>
                      {lead.phone}
                    </a>
                  </td>
                  <td style={{ padding: 8 }}>{lead.projectType}</td>
                  <td style={{ padding: 8 }}>
                    <Badge tone={tone(lead.status)}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="rw-card">
          {selected ? (
            <>
              <h2 style={{ marginTop: 0, font: "600 18px var(--font-sans)" }}>{selected.fullName}</h2>
              <p style={{ color: "var(--rw-text-muted)", fontSize: 14 }}>{formatDateTime(selected.createdAt)}</p>
              <label className="rw-field" style={{ marginTop: 16 }}>
                <span className="rw-field__label">Statut</span>
                <select
                  className="rw-input rw-select"
                  value={selected.status}
                  onChange={(e) => {
                    const status = e.target.value as LeadStatus;
                    setSelected({ ...selected, status });
                    patchLead.mutate({ id: selected.id, status });
                  }}
                >
                  {Object.values(LeadStatus).map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="rw-field" style={{ marginTop: 12 }}>
                <span className="rw-field__label">Notes</span>
                <textarea
                  className="rw-input"
                  rows={5}
                  defaultValue={selected.notes ?? ""}
                  onBlur={(e) => patchLead.mutate({ id: selected.id, notes: e.target.value })}
                />
              </label>
              {selected.sessionId ? (
                <p style={{ marginTop: 12 }}>
                  <a href={`/admin/sessions/${selected.sessionId}`}>Voir la visite associée</a>
                </p>
              ) : null}
              <Button variant="danger" size="sm" style={{ marginTop: 16 }} onClick={() => setDeleteId(selected.id)}>
                Supprimer
              </Button>
            </>
          ) : (
            <p style={{ color: "var(--rw-text-muted)" }}>Sélectionnez une demande pour afficher le détail.</p>
          )}
        </aside>
      </div>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Supprimer cette demande ?"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={() => deleteId && deleteLead.mutate(deleteId)}>
              Supprimer
            </Button>
          </>
        }
      >
        Cette action est définitive.
      </Dialog>
    </AdminShell>
  );
}
