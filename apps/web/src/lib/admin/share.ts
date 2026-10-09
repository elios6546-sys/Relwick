import { SharePlatform } from "@relwick/shared";

export const TARGET_PAGES: Array<{ value: string; label: string }> = [
  { value: "/", label: "Accueil" },
  { value: "/#services", label: "Services" },
  { value: "/#realisations", label: "Réalisations" },
  { value: "/#apropos", label: "À propos" },
  { value: "/#contact", label: "Contact (formulaire)" },
];

export function targetLabel(path: string): string {
  return TARGET_PAGES.find((p) => p.value === path)?.label ?? path;
}

/** Message d'accompagnement proposé par défaut. */
export function defaultMessage(url: string): string {
  return `Relwick crée des sites web et des applications à Kolwezi. Découvrez nos réalisations et réservez un appel gratuit : ${url}`;
}

/**
 * URL d'intention de partage propre à chaque plateforme.
 * Renvoie null quand la plateforme n'a pas de lien de partage direct
 * (Instagram, TikTok, YouTube, QR) : on copie alors le lien.
 */
export function shareIntent(platform: SharePlatform, url: string, text: string): string | null {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case SharePlatform.WHATSAPP:
      return `https://wa.me/?text=${encodeURIComponent(`${text}`)}`;
    case SharePlatform.FACEBOOK:
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case SharePlatform.X:
      return `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(text.replace(url, "").trim())}`;
    case SharePlatform.LINKEDIN:
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case SharePlatform.TELEGRAM:
      return `https://t.me/share/url?url=${u}&text=${encodeURIComponent(text.replace(url, "").trim())}`;
    case SharePlatform.EMAIL:
      return `mailto:?subject=${encodeURIComponent("Relwick — sites web et applications à Kolwezi")}&body=${t}`;
    case SharePlatform.SMS:
      return `sms:?body=${t}`;
    default:
      return null;
  }
}
