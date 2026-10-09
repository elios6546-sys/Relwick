const TZ = "Africa/Lubumbashi";

export interface PeriodRange {
  from: string;
  to: string;
}

export type PeriodPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "month"
  | "12m"
  | "custom";

function lubumbashiParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("fr-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, day] = fmt.format(d).split("-").map(Number);
  return { y, m, day };
}

function toUtcIso(y: number, m: number, day: number, end: boolean): string {
  const h = end ? 23 : 0;
  const min = end ? 59 : 0;
  const s = end ? 59 : 0;
  const ms = end ? 999 : 0;
  // Lubumbashi UTC+2 (no DST)
  return new Date(Date.UTC(y, m - 1, day, h - 2, min, s, ms)).toISOString();
}

export function presetToRange(preset: PeriodPreset, custom?: PeriodRange): PeriodRange {
  const now = new Date();
  const { y, m, day } = lubumbashiParts(now);

  switch (preset) {
    case "today":
      return { from: toUtcIso(y, m, day, false), to: toUtcIso(y, m, day, true) };
    case "yesterday": {
      const d = new Date(Date.UTC(y, m - 1, day));
      d.setUTCDate(d.getUTCDate() - 1);
      const p = lubumbashiParts(d);
      return {
        from: toUtcIso(p.y, p.m, p.day, false),
        to: toUtcIso(p.y, p.m, p.day, true),
      };
    }
    case "7d": {
      const d = new Date(Date.UTC(y, m - 1, day));
      d.setUTCDate(d.getUTCDate() - 6);
      const p = lubumbashiParts(d);
      return { from: toUtcIso(p.y, p.m, p.day, false), to: toUtcIso(y, m, day, true) };
    }
    case "30d": {
      const d = new Date(Date.UTC(y, m - 1, day));
      d.setUTCDate(d.getUTCDate() - 29);
      const p = lubumbashiParts(d);
      return { from: toUtcIso(p.y, p.m, p.day, false), to: toUtcIso(y, m, day, true) };
    }
    case "month":
      return { from: toUtcIso(y, m, 1, false), to: toUtcIso(y, m, day, true) };
    case "12m": {
      const d = new Date(Date.UTC(y, m - 1, day));
      d.setUTCMonth(d.getUTCMonth() - 11);
      d.setUTCDate(1);
      const p = lubumbashiParts(d);
      return { from: toUtcIso(p.y, p.m, p.day, false), to: toUtcIso(y, m, day, true) };
    }
    case "custom":
    default:
      return custom ?? presetToRange("7d");
  }
}

/** Préréglages affichés dans la barre du haut (design « Dashboard Admin Relwick »). */
export const DASH_PERIODS: Array<{ value: PeriodPreset; label: string }> = [
  { value: "today", label: "Aujourd’hui" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
];

export const PERIOD_LABEL: Record<PeriodPreset, string> = {
  today: "aujourd’hui",
  yesterday: "hier",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  month: "ce mois-ci",
  "12m": "12 derniers mois",
  custom: "période personnalisée",
};

export const PERIOD_COMPARE: Record<PeriodPreset, string> = {
  today: "vs hier à la même heure",
  yesterday: "vs avant-hier",
  "7d": "vs 7 jours précédents",
  "30d": "vs 30 jours précédents",
  month: "vs mois précédent",
  "12m": "vs 12 mois précédents",
  custom: "vs période précédente",
};

export function previousRange(range: PeriodRange): PeriodRange {
  const from = new Date(range.from).getTime();
  const to = new Date(range.to).getTime();
  const len = to - from;
  return {
    from: new Date(from - len).toISOString(),
    to: new Date(from).toISOString(),
  };
}

export function readPreset(params: URLSearchParams): PeriodPreset {
  const p = params.get("preset");
  return p === "today" || p === "30d" || p === "yesterday" || p === "month" || p === "12m"
    ? p
    : "7d";
}

export function buildStatsQuery(params: URLSearchParams): Record<string, string> {
  const q: Record<string, string> = {};
  ["from", "to", "compare", "countryCode", "city", "deviceType", "sourceCategory", "browser", "os", "path", "includeBots"].forEach(
    (k) => {
      const v = params.get(k);
      if (v) q[k] = v;
    },
  );
  return q;
}

export function statsQueryString(params: URLSearchParams): string {
  const q = buildStatsQuery(params);
  return new URLSearchParams(q).toString();
}
