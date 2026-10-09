import { DEVICE_TYPE_LABELS, SOURCE_CATEGORY_LABELS, TRACK_NAMES } from "@relwick/shared";

/** Sections de la landing dans l’ordre d’apparition (identique au design du dashboard). */
export const SECTIONS: Array<{ id: string; label: string }> = [
  { id: "hero", label: "Hero" },
  { id: "services", label: "Services" },
  { id: "realisations", label: "Réalisations" },
  { id: "apropos", label: "À propos" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Footer" },
];

export function sectionIndex(id: string | null | undefined): number {
  if (!id) return 0;
  const i = SECTIONS.findIndex((s) => s.id === id);
  return i < 0 ? 0 : i;
}

export function sectionLabel(id: string | null | undefined): string {
  if (!id) return "Hero";
  return SECTIONS.find((s) => s.id === id)?.label ?? id;
}

/** Libellé court d’un bouton suivi (sans l’emplacement entre parenthèses). */
export function trackLabel(name: string | null | undefined, fallback?: string | null): string {
  if (!name) return fallback ?? "Élément";
  const full = TRACK_NAMES[name];
  if (!full) return fallback ?? name;
  const noParen = full.replace(/\s*\(.*?\)\s*$/, "");
  const dash = noParen.indexOf("—");
  return dash >= 0 ? noParen.slice(dash + 1).trim() : noParen;
}

/** Emplacement d’un bouton suivi déduit de son nom ou de sa section. */
export function trackWhere(name: string | null | undefined, section?: string | null): string {
  if (name?.startsWith("header_")) return "Header";
  if (name?.startsWith("hero_")) return "Hero";
  if (name?.startsWith("services_")) return "Services";
  if (name?.startsWith("realisation")) return "Réalisations";
  if (name?.startsWith("apropos_")) return "À propos";
  if (name?.startsWith("contact_")) return "Contact";
  if (name === "form_submit" || name?.startsWith("dialog_")) return "Formulaire";
  if (name?.startsWith("footer_")) return "Footer";
  if (name === "whatsapp_float") return "Bouton flottant";
  if (name === "privacy_notice_ok") return "Bandeau";
  return section ? sectionLabel(section) : "—";
}

export function sourceLabel(cat: string | null | undefined): string {
  if (!cat) return "Direct";
  return (SOURCE_CATEGORY_LABELS as Record<string, string>)[cat] ?? cat;
}

export function deviceLabel(type: string | null | undefined): string {
  if (!type) return "Inconnu";
  return (DEVICE_TYPE_LABELS as Record<string, string>)[type] ?? type;
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["fr"], { type: "region" })
    : null;

export function countryName(code: string | null | undefined, fallback?: string | null): string {
  if (code === "CD" || fallback === "Congo - Kinshasa" || fallback === "République démocratique du Congo") {
    return "RDC";
  }
  if (fallback) return fallback;
  if (!code) return "—";
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}
