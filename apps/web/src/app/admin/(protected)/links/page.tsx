"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Link2,
  MousePointerClick,
  PhoneCall,
  Plus,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  SHARE_PLATFORM_LABELS,
  SharePlatform,
  type ShareLinkDto,
} from "@relwick/shared";
import { AdminShell } from "@/components/admin/admin-shell";
import { KpiCard } from "@/components/admin/dash-cards";
import { PlatformIcon } from "@/components/admin/platform-icon";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Field, Input, Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { apiFetch, ApiError } from "@/lib/api";
import { PERIOD_LABEL, readPreset } from "@/lib/admin/period";
import { TARGET_PAGES, defaultMessage, shareIntent, targetLabel } from "@/lib/admin/share";
import { formatDateShort, formatDur, formatNumber } from "@/lib/format";

interface LinksResponse {
  items: ShareLinkDto[];
  totals: {
    links: number;
    active: number;
    opens: number;
    visits: number;
    leads: number;
    contacts: number;
  };
}

const COLS =
  "minmax(260px,2fr) minmax(120px,.9fr) minmax(90px,.6fr) minmax(90px,.6fr) minmax(100px,.7fr) minmax(90px,.6fr) minmax(90px,.6fr) 150px";

const PLATFORM_ORDER: SharePlatform[] = [
  SharePlatform.WHATSAPP,
  SharePlatform.FACEBOOK,
  SharePlatform.INSTAGRAM,
  SharePlatform.TIKTOK,
  SharePlatform.LINKEDIN,
  SharePlatform.X,
  SharePlatform.YOUTUBE,
  SharePlatform.TELEGRAM,
  SharePlatform.EMAIL,
  SharePlatform.SMS,
  SharePlatform.QR,
  SharePlatform.OTHER,
];

export default function AdminLinksPage() {
  const qs = useStatsSearchParams();
  const preset = readPreset(useSearchParams());
  const toast = useToast();
  const client = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [created, setCreated] = useState<ShareLinkDto | null>(null);
  const [toDelete, setToDelete] = useState<ShareLinkDto | null>(null);

  const list = useQuery({
    queryKey: ["admin", "links", qs],
    queryFn: () => apiFetch<LinksResponse>(`/v1/admin/links?${qs}`),
  });

  const invalidate = () => client.invalidateQueries({ queryKey: ["admin", "links"] });

  const toggle = useMutation({
    mutationFn: (l: ShareLinkDto) =>
      apiFetch<ShareLinkDto>(`/v1/admin/links/${l.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !l.isActive }),
      }),
    onSuccess: (l) => {
      void invalidate();
      toast.show(l.isActive ? "Lien activé" : "Lien désactivé", l.name);
    },
    onError: () => toast.show("Modification impossible", "Veuillez réessayer."),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/v1/admin/links/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void invalidate();
      setToDelete(null);
      toast.show("Lien supprimé", "Les visites déjà enregistrées sont conservées.");
    },
    onError: () => toast.show("Suppression impossible", "Veuillez réessayer."),
  });

  const copy = async (text: string, label = "Lien copié") => {
    try {
      await navigator.clipboard.writeText(text);
      toast.show(label, text.length > 60 ? `${text.slice(0, 57)}…` : text);
    } catch {
      toast.show("Copie impossible", "Votre navigateur a refusé l’accès au presse-papiers.");
    }
  };

  const share = async (l: ShareLinkDto) => {
    const text = defaultMessage(l.shortUrl);
    const intent = shareIntent(l.platform, l.shortUrl, text);
    if (intent) {
      window.open(intent, "_blank", "noopener,noreferrer");
      return;
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Relwick", text, url: l.shortUrl });
        return;
      } catch {
        // annulé par l’utilisateur : on retombe sur la copie
      }
    }
    await copy(l.shortUrl);
  };

  const items = list.data?.items ?? [];
  const totals = list.data?.totals;

  return (
    <AdminShell
      title="Liens de partage"
      subtitle="Un lien par canal pour savoir d’où viennent vos visiteurs et vos demandes"
    >
      <div className="dash-kpis">
        <KpiCard
          index={0}
          label="Liens actifs"
          icon={Link2}
          value={totals ? `${totals.active} sur ${totals.links}` : "…"}
          change={null}
          compare="créés depuis le dashboard"
        />
        <KpiCard
          index={1}
          label="Ouvertures"
          icon={MousePointerClick}
          value={totals ? formatNumber(totals.opens) : "…"}
          change={null}
          compare="depuis la création des liens"
        />
        <KpiCard
          index={2}
          label="Visites via les liens"
          icon={Users}
          value={totals ? formatNumber(totals.visits) : "…"}
          change={null}
          compare={PERIOD_LABEL[preset]}
        />
        <KpiCard
          index={3}
          label="Prises de contact"
          icon={PhoneCall}
          value={totals ? formatNumber(totals.contacts) : "…"}
          change={null}
          compare={PERIOD_LABEL[preset]}
        />
      </div>

      <section className="rw-card dash-tablecard" data-anim="" style={{ ["--i" as string]: 4 }}>
        <div className="dash-tablecard__head">
          <div>
            <h2 className="dash-card__title">Vos liens</h2>
            <p className="dash-card__sub">
              Partagez le lien court ; chaque visite qui en provient est rattachée au canal.
            </p>
          </div>
          <button type="button" className="rw-btn rw-btn--primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} strokeWidth={2} />
            Créer un lien
          </button>
        </div>

        {list.data && items.length === 0 ? (
          <div className="dash-empty">
            <p style={{ margin: 0 }}>
              Aucun lien pour le moment. Créez votre premier lien pour WhatsApp ou Facebook.
            </p>
          </div>
        ) : (
          <div className="dash-tablewrap">
            <div className="dash-table" style={{ minWidth: 1080 }}>
              <div className="dash-table__head" style={{ gridTemplateColumns: COLS }}>
                <span>Lien</span>
                <span>Page cible</span>
                <span>Ouvertures</span>
                <span>Visites</span>
                <span>Visiteurs uniques</span>
                <span>Contacts</span>
                <span>Durée moy.</span>
                <span>Actions</span>
              </div>
              {items.map((l) => (
                <div
                  key={l.id}
                  className="dash-table__row dash-table__row--static"
                  style={{ gridTemplateColumns: COLS, opacity: l.isActive ? 1 : 0.6 }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span className="dash-kpi__icon" style={{ width: 28, height: 28 }}>
                        <PlatformIcon platform={l.platform} size={14} />
                      </span>
                      <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.name}
                      </span>
                      <Badge tone={l.isActive ? "neutral" : "warning"}>
                        {l.isActive ? SHARE_PLATFORM_LABELS[l.platform] : "Désactivé"}
                      </Badge>
                    </div>
                    <div
                      className="dash-table__sub dash-table__mono"
                      style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {l.shortUrl.replace(/^https?:\/\//, "")}
                      </span>
                      <span className="dash-table__muted" style={{ fontFamily: "var(--font-sans)" }}>
                        · créé le {formatDateShort(l.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div>{targetLabel(l.targetPath)}</div>
                    <div className="dash-table__sub">Campagne : {l.campaign}</div>
                  </div>
                  <div>{formatNumber(l.openCount)}</div>
                  <div>{formatNumber(l.stats.visits)}</div>
                  <div>{formatNumber(l.stats.uniqueVisitors)}</div>
                  <div>
                    {formatNumber(l.stats.contacts)}
                    {l.stats.leads ? (
                      <div className="dash-table__sub">{l.stats.leads} demande{l.stats.leads > 1 ? "s" : ""}</div>
                    ) : null}
                  </div>
                  <div>{l.stats.visits ? formatDur(l.stats.avgDurationSec) : "—"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton label="Copier le lien" size="sm" onClick={() => void copy(l.shortUrl)}>
                      <Copy size={16} />
                    </IconButton>
                    <IconButton label="Partager" size="sm" onClick={() => void share(l)}>
                      <Share2 size={16} />
                    </IconButton>
                    <Switch
                      label={l.isActive ? "Désactiver le lien" : "Activer le lien"}
                      checked={l.isActive}
                      onChange={() => toggle.mutate(l)}
                      className="dash-switch-compact"
                    />
                    <IconButton label="Supprimer" size="sm" onClick={() => setToDelete(l)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <CreateLinkDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(l) => {
          setCreateOpen(false);
          setCreated(l);
          void invalidate();
        }}
      />

      {created ? (
        <CreatedLinkDialog
          link={created}
          onClose={() => setCreated(null)}
          onCopy={copy}
          onShare={share}
        />
      ) : null}

      <Dialog
        open={Boolean(toDelete)}
        title="Supprimer ce lien ?"
        onClose={() => setToDelete(null)}
        actions={
          <>
            <button type="button" className="rw-btn rw-btn--ghost" onClick={() => setToDelete(null)}>
              Annuler
            </button>
            <button
              type="button"
              className="rw-btn rw-btn--danger"
              disabled={remove.isPending}
              onClick={() => toDelete && remove.mutate(toDelete.id)}
            >
              Supprimer
            </button>
          </>
        }
      >
        {toDelete ? (
          <p style={{ margin: 0 }}>
            « {toDelete.name} » ne redirigera plus personne. Les visites déjà enregistrées
            restent dans vos statistiques. Si vous souhaitez seulement mettre le lien en pause,
            désactivez-le plutôt.
          </p>
        ) : null}
      </Dialog>
    </AdminShell>
  );
}

/* —— Création —— */
function CreateLinkDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (l: ShareLinkDto) => void;
}) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<SharePlatform>(SharePlatform.WHATSAPP);
  const [campaign, setCampaign] = useState("");
  const [targetPath, setTargetPath] = useState("/");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setPlatform(SharePlatform.WHATSAPP);
    setCampaign("");
    setTargetPath("/");
    setNote("");
    setError(null);
  };

  const create = useMutation({
    mutationFn: () =>
      apiFetch<ShareLinkDto>("/v1/admin/links", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          platform,
          campaign: campaign.trim() || undefined,
          targetPath,
          note: note.trim() || undefined,
        }),
      }),
    onSuccess: (l) => {
      reset();
      onCreated(l);
    },
    onError: (e) => {
      setError(e instanceof ApiError ? e.message : "Création impossible. Veuillez réessayer.");
    },
  });

  const valid = name.trim().length >= 2;

  return (
    <Dialog
      open={open}
      title="Créer un lien de partage"
      onClose={() => {
        reset();
        onClose();
      }}
      actions={
        <>
          <button
            type="button"
            className="rw-btn rw-btn--ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            className="rw-btn rw-btn--primary"
            disabled={!valid || create.isPending}
            onClick={() => create.mutate()}
          >
            Créer le lien
          </button>
        </>
      }
    >
      <form
        style={{ display: "grid", gap: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !create.isPending) create.mutate();
        }}
      >
        <Field label="Nom du lien" hint="Pour vous y retrouver : « Statut WhatsApp octobre », « Groupe Facebook Kolwezi »…">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Statut WhatsApp octobre"
            maxLength={120}
            required
            autoFocus
          />
        </Field>
        <Field label="Plateforme" hint="Détermine la source affichée dans vos statistiques.">
          <Select value={platform} onChange={(e) => setPlatform(e.target.value as SharePlatform)}>
            {PLATFORM_ORDER.map((p) => (
              <option key={p} value={p}>
                {SHARE_PLATFORM_LABELS[p]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Page cible">
          <Select value={targetPath} onChange={(e) => setTargetPath(e.target.value)}>
            {TARGET_PAGES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Campagne (facultatif)" hint="Regroupe plusieurs liens sous un même nom, par exemple « rentree-2026 ».">
          <Input
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder={name.trim() || "Identique au nom du lien"}
            maxLength={120}
          />
        </Field>
        <Field label="Note (facultatif)">
          <Input
            multiline
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Où et quand ce lien est diffusé"
            maxLength={2000}
          />
        </Field>
        {error ? (
          <p className="rw-field__hint rw-field__hint--error" role="alert" style={{ margin: 0 }}>
            {error}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}

/* —— Lien créé : copie et partage —— */
function CreatedLinkDialog({
  link,
  onClose,
  onCopy,
  onShare,
}: {
  link: ShareLinkDto;
  onClose: () => void;
  onCopy: (text: string, label?: string) => Promise<void>;
  onShare: (l: ShareLinkDto) => Promise<void>;
}) {
  const message = useMemo(() => defaultMessage(link.shortUrl), [link.shortUrl]);
  const [text, setText] = useState(message);
  const hasIntent = shareIntent(link.platform, link.shortUrl, text) !== null;

  return (
    <Dialog
      open
      title="Votre lien est prêt"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="rw-btn rw-btn--ghost" onClick={onClose}>
            Fermer
          </button>
          <button
            type="button"
            className="rw-btn rw-btn--primary"
            onClick={() => void onShare({ ...link })}
          >
            <Share2 size={16} strokeWidth={2} />
            {hasIntent ? `Partager sur ${SHARE_PLATFORM_LABELS[link.platform]}` : "Partager"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--rw-surface-sunken)",
          }}
        >
          <span className="dash-kpi__icon" style={{ width: 28, height: 28 }}>
            <PlatformIcon platform={link.platform} size={14} />
          </span>
          <span
            className="dash-table__mono"
            style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--rw-text)" }}
          >
            {link.shortUrl}
          </span>
          <IconButton label="Copier le lien" size="sm" onClick={() => void onCopy(link.shortUrl)}>
            <Copy size={16} />
          </IconButton>
        </div>

        <Field
          label="Message prêt à coller"
          hint="Modifiez-le librement ; le lien court doit rester dedans pour que la visite soit comptée."
        >
          <Input multiline rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>

        <button
          type="button"
          className="rw-btn rw-btn--secondary"
          onClick={() => void onCopy(text, "Message copié")}
          style={{ justifySelf: "start" }}
        >
          <Check size={16} strokeWidth={2} />
          Copier le message
        </button>

        <p style={{ margin: 0, fontSize: 13 }}>
          Les visiteurs arrivent sur « {targetLabel(link.targetPath)} ». Vous retrouverez les
          visites, le temps passé et les demandes d’appel issues de ce lien dans la colonne
          dédiée, et la source « {SHARE_PLATFORM_LABELS[link.platform]} » dans vos statistiques.
        </p>
      </div>
    </Dialog>
  );
}
