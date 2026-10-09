"use client";

import { useQuery } from "@tanstack/react-query";
import { Copy, X } from "lucide-react";
import { useEffect } from "react";
import { Tag } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import {
  SECTIONS,
  countryName,
  deviceLabel,
  sectionIndex,
  sectionLabel,
  sourceLabel,
  trackLabel,
} from "@/lib/admin/sections";
import { formatClock, formatDateShort, formatDur } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { SessionDetail, SessionRow, TimelineItem } from "./dash-types";

function timelineText(item: TimelineItem): { text: string; sub?: string } {
  const d = item.data;
  if (item.kind === "pageview") {
    return { text: "Arrivée sur le site", sub: d?.path ?? undefined };
  }
  switch (d?.type) {
    case "SECTION_VIEW":
      return { text: `Section ${sectionLabel(d.section)}`, sub: "Défilement" };
    case "SCROLL_DEPTH":
      return { text: `Défilement ${d.value ?? 0}\u202f%` };
    case "CLICK":
    case "CTA_CLICK":
    case "CONTACT_CLICK":
    case "OUTBOUND_CLICK":
      return {
        text: `Clic · ${trackLabel(d.name, d.label)}`,
        sub: d.section ? sectionLabel(d.section) : undefined,
      };
    case "FORM_START":
      return { text: "Formulaire commencé", sub: "Contact" };
    case "FORM_SUBMIT":
      return { text: "Formulaire envoyé", sub: "Contact" };
    default:
      return { text: item.label };
  }
}

export function VisitDrawer({
  session: initial,
  number,
  onClose,
}: {
  session: SessionRow;
  number: number;
  onClose: () => void;
}) {
  const toast = useToast();
  const { data } = useQuery({
    queryKey: ["admin", "session", initial.id],
    queryFn: () => apiFetch<SessionDetail>(`/v1/admin/sessions/${initial.id}`),
  });

  const s: SessionRow = data?.session ?? initial;
  const stop = sectionIndex(s.lastSection);
  const stopPct = Math.round(((stop + 1) / SECTIONS.length) * 100);
  const clicks = Array.from(
    new Set(
      (data?.session.events ?? [])
        .filter((e) => ["CLICK", "CTA_CLICK", "CONTACT_CLICK", "OUTBOUND_CLICK"].includes(e.type))
        .map((e) => trackLabel(e.name, e.label)),
    ),
  );
  const started = new Date(s.startedAt).getTime();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const copyIp = async () => {
    try {
      await navigator.clipboard.writeText(s.ip);
      toast.show("Adresse copiée", s.ip);
    } catch {
      toast.show("Copie impossible", "Votre navigateur a refusé l’accès au presse-papiers.");
    }
  };

  return (
    <>
      <button type="button" className="dash-overlay" aria-label="Fermer le détail" onClick={onClose} />
      <aside
        className="dash-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-drawer-title"
      >
        <div className="dash-drawer__head">
          <div style={{ minWidth: 0 }}>
            <div className="dash-drawer__eyebrow">Visite n° {number}</div>
            <div className="dash-drawer__ip" id="visit-drawer-title">
              {s.ip}
            </div>
            <div className="dash-drawer__place">
              {s.city ?? "Ville inconnue"} · {countryName(s.countryCode, s.country)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flex: "none" }}>
            <IconButton label="Copier l’adresse IP" size="sm" onClick={() => void copyIp()}>
              <Copy size={16} />
            </IconButton>
            <IconButton label="Fermer" size="sm" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        </div>

        <div className="dash-drawer__body">
          <div className="dash-info">
            <Info k="Ville" v={s.city ?? "Ville inconnue"} />
            <Info k="Pays" v={countryName(s.countryCode, s.country)} />
            <Info k="Appareil" v={`${deviceLabel(s.deviceType)} · ${s.os ?? "—"}`} />
            <Info k="Navigateur" v={s.browser ?? "—"} />
            <Info
              k="Source"
              v={
                s.shareLink
                  ? `${sourceLabel(s.sourceCategory)} · lien « ${s.shareLink.name} »`
                  : sourceLabel(s.sourceCategory)
              }
            />
            <Info k="Arrivée" v={formatDateShort(s.startedAt)} />
            <Info k="Temps passé" v={formatDur(s.activeSeconds)} />
            <Info
              k="Visites de cette IP"
              v={s.ipVisitCount > 1 ? `${s.ipVisitCount} visites` : "Première visite"}
            />
          </div>

          <div>
            <h3 className="dash-drawer__h">Profondeur de défilement</h3>
            <div className="dash-depth" aria-hidden="true">
              {SECTIONS.map((sec, i) => (
                <span key={sec.id} className={cn("dash-depth__seg", i <= stop && "dash-depth__seg--on")} />
              ))}
            </div>
            <div className="dash-depth__names" aria-hidden="true">
              {SECTIONS.map((sec, i) => (
                <span
                  key={sec.id}
                  className={cn("dash-depth__name", i === stop && "dash-depth__name--stop")}
                >
                  {sec.label}
                </span>
              ))}
            </div>
            <p className="dash-depth__stop">
              S’est arrêté à la section {sectionLabel(s.lastSection)}, soit {stopPct}
              {"\u202f"}% de la page.
            </p>
          </div>

          <div>
            <h3 className="dash-drawer__h">Boutons cliqués</h3>
            {clicks.length === 0 ? (
              <p className="dash-card__sub" style={{ fontSize: 14 }}>
                Aucun clic pendant cette visite.
              </p>
            ) : (
              <div className="dash-tags">
                {clicks.map((c) => (
                  <Tag key={c} tone="primary">
                    {c}
                  </Tag>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="dash-drawer__h">Parcours</h3>
            {!data ? (
              <p className="dash-card__sub">Chargement…</p>
            ) : (
              <div className="dash-timeline">
                {data.timeline
                  .filter((item) => !(item.kind === "event" && item.data?.type === "PAGEVIEW"))
                  .map((item, i) => {
                  const t = timelineText(item);
                  const sec = Math.max(0, (new Date(item.at).getTime() - started) / 1000);
                  return (
                    <TimelineRow key={`${item.at}-${i}`} time={formatClock(sec)} text={t.text} sub={t.sub} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="dash-info__k">{k}</div>
      <div className="dash-info__v">{v}</div>
    </div>
  );
}

function TimelineRow({ time, text, sub }: { time: string; text: string; sub?: string }) {
  return (
    <>
      <div className="dash-timeline__time">{time}</div>
      <div className="dash-timeline__rail">
        <span className="dash-timeline__dot" />
      </div>
      <div className="dash-timeline__text">
        {text}
        {sub ? <div className="dash-timeline__sub">{sub}</div> : null}
      </div>
    </>
  );
}
