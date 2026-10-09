const TZ = "Africa/Lubumbashi";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value / 100);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

const MONTHS_FR = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const DOW_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

function lbParts(iso: string | number | Date) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    weekday: "short",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  const dow = new Date(
    new Date(d).toLocaleString("en-US", { timeZone: TZ }),
  ).getDay();
  return {
    day: Number(parts.day),
    month: Number(parts.month) - 1,
    hour: Number(parts.hour) % 24,
    minute: parts.minute,
    dow,
  };
}

/** « 8 oct. · 14 h 02 » */
export function formatDateShort(iso: string | number | Date): string {
  const p = lbParts(iso);
  return `${p.day} ${MONTHS_FR[p.month]} · ${p.hour} h ${p.minute}`;
}

/** « lun. 6 » */
export function formatDowDay(iso: string | number | Date): string {
  const p = lbParts(iso);
  return `${DOW_FR[p.dow]} ${p.day}`;
}

/** « lun. 6 oct. » */
export function formatDowDayMonth(iso: string | number | Date): string {
  const p = lbParts(iso);
  return `${DOW_FR[p.dow]} ${p.day} ${MONTHS_FR[p.month]}`;
}

/** « 6 oct. » */
export function formatDayMonth(iso: string | number | Date): string {
  const p = lbParts(iso);
  return `${p.day} ${MONTHS_FR[p.month]}`;
}

/** « à l’instant », « il y a 3 min », « il y a 2 h », sinon date courte. */
export function formatRelative(iso: string | number | Date): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l’instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return formatDateShort(iso);
}

/** Variante en secondes pour le flux « En direct ». */
export function formatRelativeSeconds(iso: string | number | Date): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 10) return "à l’instant";
  if (s < 60) return `il y a ${Math.round(s)} s`;
  return `il y a ${Math.round(s / 60)} min`;
}

/** « 12 s » · « 2 min 05 s » (format du design). */
export function formatDur(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s} s`;
  return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

/** « 1:05 » */
export function formatClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** « 42 % » (arrondi, espace fine insécable). */
export function formatPct(value: number): string {
  return `${Math.round(value)}\u202f%`;
}

/** « 2,4 » */
export function formatOneDecimal(value: number): string {
  return value.toFixed(1).replace(".", ",");
}

/** « +12 % » / « −4 % » */
export function formatDelta(change: number | null | undefined): string {
  if (change == null || !Number.isFinite(change)) return "—";
  const v = Math.abs(Math.round(change));
  return `${change >= 0 ? "+" : "−"}${v}\u202f%`;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}
