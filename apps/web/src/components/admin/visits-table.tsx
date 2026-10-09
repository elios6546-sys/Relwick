"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { countryName, deviceLabel, sectionIndex, sectionLabel, sourceLabel } from "@/lib/admin/sections";
import { formatDur, formatRelative } from "@/lib/format";
import { DepthSegments } from "./dash-cards";
import type { SessionRow } from "./dash-types";

export type SortKey = "startedAt" | "duration" | "depth" | "clicks";
export type SortOrder = "asc" | "desc";

const COLS_SHORT =
  "minmax(150px,1.3fr) minmax(130px,1.1fr) minmax(140px,1.1fr) minmax(90px,.7fr) minmax(130px,1fr) minmax(110px,.9fr)";
const COLS_FULL =
  "minmax(150px,1.3fr) minmax(130px,1.1fr) minmax(140px,1.1fr) minmax(90px,.8fr) minmax(130px,1fr) minmax(90px,.7fr) minmax(130px,1fr) minmax(56px,.4fr)";

function SortHead({
  label,
  k,
  sort,
  order,
  onSort,
}: {
  label: string;
  k: SortKey;
  sort: SortKey;
  order: SortOrder;
  onSort: (k: SortKey) => void;
}) {
  const active = sort === k;
  return (
    <button
      type="button"
      className="dash-table__sort"
      aria-pressed={active}
      onClick={() => onSort(k)}
      aria-label={`Trier par ${label.toLowerCase()}`}
    >
      {label}
      {active ? (
        order === "desc" ? (
          <ArrowDown size={14} />
        ) : (
          <ArrowUp size={14} />
        )
      ) : (
        <ChevronsUpDown size={14} />
      )}
    </button>
  );
}

export function VisitsTable({
  rows,
  variant,
  onSelect,
  sort,
  order,
  onSort,
}: {
  rows: SessionRow[];
  variant: "short" | "full";
  onSelect: (row: SessionRow) => void;
  sort?: SortKey;
  order?: SortOrder;
  onSort?: (k: SortKey) => void;
}) {
  const cols = variant === "full" ? COLS_FULL : COLS_SHORT;
  const sortable = variant === "full" && sort && order && onSort;

  return (
    <div className="dash-tablewrap">
      <div className={variant === "full" ? "dash-table dash-table--visitors" : "dash-table"}>
        <div className="dash-table__head" style={{ gridTemplateColumns: cols }} role="row">
          <span>Adresse IP</span>
          <span>Ville</span>
          <span>Appareil</span>
          {variant === "full" ? <span>Source</span> : null}
          {sortable ? (
            <>
              <SortHead label="Arrivée" k="startedAt" sort={sort} order={order} onSort={onSort} />
              <SortHead label="Durée" k="duration" sort={sort} order={order} onSort={onSort} />
              <SortHead label="Arrêt" k="depth" sort={sort} order={order} onSort={onSort} />
              <SortHead label="Clics" k="clicks" sort={sort} order={order} onSort={onSort} />
            </>
          ) : (
            <>
              <span>Durée</span>
              <span>Arrêt</span>
              <span>Arrivée</span>
            </>
          )}
        </div>

        {rows.map((r) => {
          const stop = sectionIndex(r.lastSection);
          const cells = {
            ip: (
              <div key="ip">
                <div className="dash-table__mono">{r.ip}</div>
                <div className="dash-table__sub">
                  {r.ipVisitCount > 1 ? `${r.ipVisitCount} visites` : "Première visite"}
                </div>
              </div>
            ),
            city: (
              <div key="city">
                <div style={{ fontWeight: 500 }}>{r.city ?? "Ville inconnue"}</div>
                <div className="dash-table__sub">{countryName(r.countryCode, r.country)}</div>
              </div>
            ),
            device: (
              <div key="device">
                <div>{r.os ?? "—"}</div>
                <div className="dash-table__sub">
                  {deviceLabel(r.deviceType)} · {r.browser ?? "—"}
                </div>
              </div>
            ),
            source: <div key="source">{sourceLabel(r.sourceCategory)}</div>,
            dur: <div key="dur">{formatDur(r.activeSeconds)}</div>,
            stop: (
              <div key="stop">
                <div>{sectionLabel(r.lastSection)}</div>
                <DepthSegments reached={stop} />
              </div>
            ),
            rel: (
              <div key="rel" className="dash-table__muted">
                {formatRelative(r.startedAt)}
              </div>
            ),
            clicks: <div key="clicks">{r.clickCount}</div>,
          };

          return (
            <button
              key={r.id}
              type="button"
              className="dash-table__row"
              style={{ gridTemplateColumns: cols }}
              onClick={() => onSelect(r)}
              aria-label={`Détail de la visite ${r.ip}`}
            >
              {cells.ip}
              {cells.city}
              {cells.device}
              {variant === "full" ? (
                <>
                  {cells.source}
                  {cells.rel}
                  {cells.dur}
                  {cells.stop}
                  {cells.clicks}
                </>
              ) : (
                <>
                  {cells.dur}
                  {cells.stop}
                  {cells.rel}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
