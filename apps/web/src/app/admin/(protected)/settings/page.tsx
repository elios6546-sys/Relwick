"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

interface Settings {
  excludedIps: string[];
  retentionDays: number;
  showBotsByDefault: boolean;
  sessionTimeoutMin: number;
}

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const [newIp, setNewIp] = useState("");
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "" });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<Settings>("/v1/admin/settings"),
  });

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiFetch<{ status: string; db: string; geo: string }>("/health"),
  });

  const saveSettings = useMutation({
    mutationFn: (body: Partial<Settings>) =>
      apiFetch("/v1/admin/settings", { method: "PUT", body: JSON.stringify(body) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const excludeMyIp = useMutation({
    mutationFn: () => apiFetch("/v1/admin/settings/exclude-my-ip", { method: "POST" }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const purge = useMutation({
    mutationFn: () => apiFetch<{ deleted: number }>("/v1/admin/maintenance/purge", { method: "POST" }),
    onSuccess: () => setPurgeOpen(false),
  });

  const changePassword = useMutation({
    mutationFn: () =>
      apiFetch("/v1/auth/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.next }),
      }),
    onSuccess: () => setPwd({ current: "", next: "" }),
  });

  return (
    <AdminShell title="Paramètres">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 16, maxWidth: 720 }}>
        <section className="rw-card">
          <h2 style={{ marginTop: 0, font: "600 16px var(--font-sans)" }}>Mot de passe</h2>
          <Field label="Mot de passe actuel">
            <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          </Field>
          <Field label="Nouveau mot de passe (12 caractères min.)">
            <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          </Field>
          <Button style={{ marginTop: 12 }} onClick={() => changePassword.mutate()}>
            Enregistrer
          </Button>
        </section>

        <section className="rw-card">
          <h2 style={{ marginTop: 0, font: "600 16px var(--font-sans)" }}>IP exclues</h2>
          <ul>
            {(settings?.excludedIps ?? []).map((ip) => (
              <li key={ip} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                {ip}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <Input
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="IP ou CIDR"
              style={{ flex: "1 1 180px", width: "auto" }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                if (!newIp.trim()) return;
                saveSettings.mutate({ excludedIps: [...(settings?.excludedIps ?? []), newIp.trim()] });
                setNewIp("");
              }}
            >
              Ajouter
            </Button>
            <Button variant="ghost" onClick={() => excludeMyIp.mutate()}>
              Exclure mon IP actuelle
            </Button>
          </div>
        </section>

        <section className="rw-card">
          <h2 style={{ marginTop: 0, font: "600 16px var(--font-sans)" }}>Mesure et rétention</h2>
          <Field label="Rétention (jours)">
            <Input
              type="number"
              value={settings?.retentionDays ?? 395}
              onChange={(e) => saveSettings.mutate({ retentionDays: Number(e.target.value) })}
            />
          </Field>
          <Switch
            label="Afficher les robots par défaut"
            checked={settings?.showBotsByDefault ?? false}
            onChange={(v) => saveSettings.mutate({ showBotsByDefault: v })}
          />
          <Button variant="danger" style={{ marginTop: 16 }} onClick={() => setPurgeOpen(true)}>
            Purger les données selon la rétention
          </Button>
        </section>

        <section className="rw-card">
          <h2 style={{ marginTop: 0, font: "600 16px var(--font-sans)" }}>État du service</h2>
          <p style={{ margin: 0, fontSize: 14 }}>
            API : {health?.status ?? "…"} · Base : {health?.db ?? "…"} · GeoLite2 : {health?.geo ?? "…"}
          </p>
        </section>
      </div>

      <Dialog
        open={purgeOpen}
        onClose={() => setPurgeOpen(false)}
        title="Confirmer la purge"
        actions={
          <>
            <Button variant="secondary" onClick={() => setPurgeOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={() => purge.mutate()}>
              Purger
            </Button>
          </>
        }
      >
        Les événements plus anciens que la rétention configurée seront supprimés.
      </Dialog>
    </AdminShell>
  );
}
