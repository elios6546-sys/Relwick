"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import type { CityRow, SessionRow, SessionsList } from "@/components/admin/dash-types";
import { useStatsSearchParams } from "@/components/admin/use-admin-query";
import { VisitDrawer } from "@/components/admin/visit-drawer";
import { VisitsTable, type SortKey, type SortOrder } from "@/components/admin/visits-table";
import { IconButton } from "@/components/ui/icon-button";
import { apiFetch } from "@/lib/api";
import { formatNumber } from "@/lib/format";

const PAGE = 12;

const DURATIONS: Array<{ value: string; label: string; min?: number; max?: number }> = [
  { value: "", label: "Toutes les durées" },
  { value: "lt30", label: "Moins de 30 s", max: 30 },
  { value: "30-120", label: "30 s à 2 min", min: 30, max: 120 },
  { value: "120-300", label: "2 à 5 min", min: 120, max: 300 },
  { value: "gt300", label: "Plus de 5 min", min: 300 },
];

const DEVICES = [
  ["", "Tous les appareils"],
  ["DESKTOP", "Ordinateur"],
  ["MOBILE", "Mobile"],
  ["TABLET", "Tablette"],
] as const;

const SOURCES = [
  ["", "Toutes les sources"],
  ["DIRECT", "Direct"],
  ["SEARCH", "Recherche"],
  ["SOCIAL", "Réseaux sociaux"],
  ["WHATSAPP", "WhatsApp"],
  ["REFERRAL", "Autre site"],
  ["CAMPAIGN", "Campagne"],
] as const;

export default function AdminVisitorsPage() {
  const qs = useStatsSearchParams();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [city, setCity] = useState("");
  const [device, setDevice] = useState("");
  const [source, setSource] = useState("");
  const [duration, setDuration] = useState("");
  const [sort, setSort] = useState<SortKey>("startedAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ row: SessionRow; n: number } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebounced(q.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(t);
  }, [q]);

  const withReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };
  const changeCity = withReset(setCity);
  const changeDevice = withReset(setDevice);
  const changeSource = withReset(setSource);
  const changeDuration = withReset(setDuration);

  const listQs = useMemo(() => {
    const p = new URLSearchParams(qs);
    if (debounced) p.set("q", debounced);
    if (city) p.set("city", city);
    if (device) p.set("deviceType", device);
    if (source) p.set("sourceCategory", source);
    const d = DURATIONS.find((x) => x.value === duration);
    if (d?.min != null) p.set("minDuration", String(d.min));
    if (d?.max != null) p.set("maxDuration", String(d.max));
    p.set("sort", sort);
    p.set("order", order);
    p.set("page", String(page));
    p.set("pageSize", String(PAGE));
    return p.toString();
  }, [qs, debounced, city, device, source, duration, sort, order, page]);

  const list = useQuery({
    queryKey: ["admin", "sessions", "list", listQs],
    queryFn: () => apiFetch<SessionsList>(`/v1/admin/sessions?${listQs}`),
    placeholderData: (prev) => prev,
  });

  const cities = useQuery({
    queryKey: ["admin", "stats", "geo-city", qs],
    queryFn: () => apiFetch<CityRow[]>(`/v1/admin/stats/geo?${qs}&level=city`),
  });

  const hasFilters = Boolean(q || city || device || source || duration);
  const reset = () => {
    setQ("");
    setCity("");
    setDevice("");
    setSource("");
    setDuration("");
    setSort("startedAt");
    setOrder("desc");
    setPage(1);
  };

  const onSort = (k: SortKey) => {
    if (k === sort) setOrder((o) => (o === "desc" ? "asc" : "desc"));
    else {
      setSort(k);
      setOrder("desc");
    }
    setPage(1);
  };

  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const start = total === 0 ? 0 : (page - 1) * PAGE + 1;
  const end = Math.min(total, page * PAGE);
  const rows = list.data?.items ?? [];

  return (
    <AdminShell title="Visiteurs" subtitle="Toutes les visites, filtrables et triables">
      <section className="rw-card dash-card" data-anim="" style={{ ["--i" as string]: 0 }}>
        <div className="dash-filters">
          <div className="dash-search">
            <span className="dash-search__icon">
              <Search size={16} strokeWidth={2} />
            </span>
            <label className="sr-only" htmlFor="visitors-q">
              Rechercher
            </label>
            <input
              id="visitors-q"
              className="rw-input"
              placeholder="Rechercher une adresse IP ou une ville"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="visitors-city">
              Ville
            </label>
            <select
              id="visitors-city"
              className="rw-input rw-select"
              value={city}
              onChange={(e) => changeCity(e.target.value)}
            >
              <option value="">Toutes les villes</option>
              {(cities.data ?? [])
                .filter((c) => c.city)
                .map((c) => (
                  <option key={`${c.countryCode}-${c.city}`} value={c.city ?? ""}>
                    {c.city}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="visitors-device">
              Appareil
            </label>
            <select
              id="visitors-device"
              className="rw-input rw-select"
              value={device}
              onChange={(e) => changeDevice(e.target.value)}
            >
              {DEVICES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="visitors-source">
              Source
            </label>
            <select
              id="visitors-source"
              className="rw-input rw-select"
              value={source}
              onChange={(e) => changeSource(e.target.value)}
            >
              {SOURCES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="sr-only" htmlFor="visitors-duration">
              Durée
            </label>
            <select
              id="visitors-duration"
              className="rw-input rw-select"
              value={duration}
              onChange={(e) => changeDuration(e.target.value)}
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="rw-btn rw-btn--ghost" onClick={reset} disabled={!hasFilters}>
            <RotateCcw size={16} strokeWidth={2} />
            Réinitialiser
          </button>
        </div>
      </section>

      <section className="rw-card dash-tablecard" data-anim="" style={{ ["--i" as string]: 1 }}>
        <div className="dash-tablecard__head">
          <div>
            <h2 className="dash-card__title">
              {list.data
                ? `${formatNumber(list.data.total)} visites · ${formatNumber(list.data.uniqueIps)} adresses IP`
                : "Chargement…"}
            </h2>
            <p className="dash-card__sub">Cliquez sur une ligne pour ouvrir le détail de la visite</p>
          </div>
        </div>

        {list.data && rows.length === 0 ? (
          <div className="dash-empty">
            <p style={{ margin: 0 }}>Aucune visite ne correspond à ces filtres.</p>
            <button type="button" className="rw-btn rw-btn--secondary" onClick={reset}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <VisitsTable
            rows={rows}
            variant="full"
            sort={sort}
            order={order}
            onSort={onSort}
            onSelect={(row) =>
              setSelected({ row, n: start + rows.findIndex((r) => r.id === row.id) })
            }
          />
        )}

        <div className="dash-table__foot">
          <span>
            {total === 0 ? "0 visite" : `${start}–${end} sur ${formatNumber(total)}`}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <IconButton
              label="Page précédente"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </IconButton>
            <IconButton
              label="Page suivante"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              <ChevronRight size={16} />
            </IconButton>
          </div>
        </div>
      </section>

      {selected ? (
        <VisitDrawer session={selected.row} number={selected.n} onClose={() => setSelected(null)} />
      ) : null}
    </AdminShell>
  );
}
