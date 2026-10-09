"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { formatDelta } from "@/lib/format";

/* —— Carte indicateur —— */
export function KpiCard({
  label,
  value,
  icon: Icon,
  change,
  compare,
  invert,
  index = 0,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  change: number | null | undefined;
  compare: string;
  /** Vrai si une baisse est une bonne nouvelle (ex. départs dès le Hero). */
  invert?: boolean;
  index?: number;
}) {
  const hasChange = change != null && Number.isFinite(change);
  const good = hasChange ? (invert ? change <= 0 : change >= 0) : true;
  return (
    <div className="rw-card dash-kpi" data-anim="" style={{ ["--i" as string]: index }}>
      <div className="dash-kpi__head">
        <span className="dash-kpi__label">{label}</span>
        <span className="dash-kpi__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <div className="dash-kpi__value">{value}</div>
      <div className="dash-kpi__foot">
        <Badge tone={good ? "success" : "danger"}>{formatDelta(change)}</Badge>
        <span className="dash-kpi__cmp">{compare}</span>
      </div>
    </div>
  );
}

/* —— Carte générique —— */
export function DashCard({
  title,
  subtitle,
  right,
  children,
  className,
  style,
  index,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  index?: number;
}) {
  return (
    <section
      className={cn("rw-card dash-card", className)}
      data-anim=""
      style={{ ...style, ["--i" as string]: index ?? 0 }}
    >
      {title ? (
        <div className="dash-card__head">
          <div>
            <h2 className="dash-card__title">{title}</h2>
            {subtitle ? <p className="dash-card__sub">{subtitle}</p> : null}
          </div>
          {right}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* —— Liste à barres de progression —— */
export interface ProgressItem {
  key: string;
  name: string;
  sub?: string;
  value: string;
  pct: number;
  copper?: boolean;
}

export function ProgressList({ items, empty }: { items: ProgressItem[]; empty?: string }) {
  if (items.length === 0) {
    return <p className="dash-card__sub">{empty ?? "Aucune donnée sur cette période."}</p>;
  }
  return (
    <div className="dash-plist">
      {items.map((it) => (
        <div key={it.key} className="dash-plist__row">
          <div className="dash-plist__line">
            <span className="dash-plist__name">
              {it.name}
              {it.sub ? <span className="dash-plist__sub">{it.sub}</span> : null}
            </span>
            <span className="dash-plist__value">{it.value}</span>
          </div>
          <div className="dash-bar" aria-hidden="true">
            <div
              className={cn("dash-bar__fill", it.copper && "dash-bar__fill--copper")}
              style={{ width: `${Math.max(0, Math.min(100, it.pct))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressListCard({
  title,
  subtitle,
  items,
  empty,
  index,
}: {
  title: string;
  subtitle: string;
  items: ProgressItem[];
  empty?: string;
  index?: number;
}) {
  return (
    <DashCard title={title} subtitle={subtitle} index={index}>
      <ProgressList items={items} empty={empty} />
    </DashCard>
  );
}

/* —— Segments de profondeur (6 sections) —— */
export function DepthSegments({ reached, total = 6 }: { reached: number; total?: number }) {
  return (
    <span className="dash-segs" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("dash-seg", i <= reached && "dash-seg--on")} />
      ))}
    </span>
  );
}
